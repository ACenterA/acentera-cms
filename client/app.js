import Vue from 'vue'
import moment from 'moment'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import NProgress from 'vue-nprogress'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import AppOauth from './AppOauth.vue'
import plekan from './plekan/index.js'
import store from './store'
import * as filters from './filters'
import { LOGOUT, TOGGLE_SIDEBAR, TOGGLE_SIDEBAR_TWO } from 'vuex-store/mutation-types'
import Notification from 'vue-bulma-notification'
import Message from 'vue-bulma-message'
import hljs from 'highlight.js'
import dynamicObj from './plekan/src/core/modules/dynamic.vue'
import cloneDeep from 'lodash/cloneDeep'
import GitHubAPI from './GitHubAPI'
import BitBucketAPI from './BitBucketAPI'
import Base64 from './Base64'
import VueCookie from 'vue-cookie'

import routerImport from './router'
var router = null

Vue.use(VueCookie)

Vue.filter('formatDate', function (value) {
  if (value) {
    return moment(String(value)).format('YYYY/MM/DD hh:mm')
  }
})

var app = null

var isOauthCallback = false

window.goApiUrl = window.goApiUrl || 'http://localhost:1313'
window.apiUrl = window.apiUrl || 'http://localhost:8081/api'
window.apiHost = window.apiHost || 'http://localhost:8081'
window.goHostUrl = window.goHostUrl || 'http://localhost:8081'

window.websiteapiUrl = window.goHostUrl || 'http://localhost:8081'

if ((window.location.href + '').indexOf('/oauth/') !== -1) {
  isOauthCallback = true

  // This was a test but no more required...
  // Issue was with vue-authenticate not working properly
  // Send a message to the parent
  var sendMessage = function (msg) {
    // Make sure you are sending a string, and to stringify JSON
    window.localStorage.setItem('custom_auth_msg', msg) // post message didn't work somehow..
    window.parent.postMessage(msg, '*')
  }

  // Send the message..
  sendMessage('' + window.location.href) // JSON.stringify(authMsg))
}

// For IE: Fix console.XX in case of debug
if (!window.console) {
  window.console = {
    log: function () {
    },
    error: function () {
    }
  }
}

// contextMenuEvent helper to find parents
window.tempHelper = {
  getParents: function getParents (el) {
    var a = el
    var parents = []

    while (a) {
      parents.unshift(a)
      a = a.parentNode
    }
    return parents
  }
}

// Notification object
const NotificationComponent = Vue.extend(Notification)
const openNotification = (propsData = {
  title: '',
  message: '',
  type: '',
  direction: '',
  duration: 4500,
  container: '.notifications'
}) => {
  return new NotificationComponent({
    el: document.createElement('div'),
    propsData
  })
}

function handleError (error) {
  // if the server gave a response message, print that
  try {
    if (error.response && error.response.status === 401) {
      openNotification({
        title: 'Authentication failed.',
        message: 'Please logout, and login again.',
        type: 'danger'
      })
    } else if (error.response.data.error) {
      openNotification({
        title: 'Error: ' + error.response.status,
        message: error.response.data.error,
        type: 'danger'
      })
    } else {
      if (error.response.status === 403) {
        // either user is not logged in, or user's actions were denied by vault
        openNotification({
          title: 'Error: ' + error.response.status.toString(),
          message: 'Invalid CSRF. Please refresh page',
          type: 'danger'
        })
      }
      if (error.response.status === 404) {
        openNotification({
          title: 'Error: 404',
          message: 'Not found',
          type: 'danger'
        })
      } else if (error.response.status === 504) {
      // Gateway timeout means vault is down/unreachable
        openNotification({
          title: 'Error: 504',
          message: 'Goldfish or vault is unreachable',
          type: 'danger'
        })
      } else {
        openNotification({
          title: 'Error: ' + error.response.status.toString(),
          message: '',
          type: 'danger'
        })
      }
    }
  } catch (e) {
    //  if error == Network Error ....
    openNotification({
      title: 'Could not contact local server, please restart the docker application.',
      message: '',
      type: 'danger'
    })
  }
}

// Generic Interceptor..
// This handle to add the authorization from the oauth (for git acces)
// or leave as-is with custom Authorization header already present
var bindRequestInterceptorFct = function () {
  this.$http.interceptors.request.use((config) => {
    // this screw up if we already have a authorization we should not add it again..

    // Check if we need to pass in SSO Token ...
    if (window.vm.$store.state.app.website && config.url.indexOf(window.websiteapiUrl) >= 0) { // quick fix for multi-authorization header only on website mode, locally we do not  have authorization bearer....
        // ignore double Bearer
    } else {
      if (this.isAuthenticated()) {
        if (this.isExpiring()) {
          this.Refresh()
        } else {
            // TODO: Lets do if isExpired function ???
        }
        // well
        config.headers['Authorization'] = [
          this.options.tokenType, this.getToken()
        ].join(' ')
      } else {
        delete config.headers['Authorization']
      }
    }

    if (window.vm.$store.state.app.website) {
      if (window.vm.$store.state.app.sso_token) {
        if (window.goHostUrl) {
          if (config.url.startsWith('' + window.goHostUrl)) {
            delete config.headers['Authorization']
            config.headers['Authorization'] = [
              'Token', window.vm.$store.state.app.sso_token
            ].join(' ')
          }
        }
      }
    }
    return config
  })
}

var bindResponseInterceptorFct = function () {
  this.$http.interceptors.response.use((response) => {
    this.setToken(response)
    return response
  })
}

var authenticateObj = null
if (!isOauthCallback) {
  window.withCredentials = false
  var bitbucketClientId = ''
  var githubClientId = ''
  if (!isOauthCallback) {
    // TODO: Use en environment variable ... build / pipeline tooling
    if (window.location.href.indexOf('.acentera') !== -1) {
      // Enable devtools
      Vue.config.devtools = true
      document.domain = 'acentera.com'
      store.commit('setWebsite', true)
      window.withCredentials = true
      if (window.location.href.indexOf('.acentera.com') !== -1) {
        window.websiteapiUrl = 'https://cms.acentera.com/prod'
      }

      router = routerImport.newRouter('history')

      bitbucketClientId = 'mYJjMLHBCjYn4k9Xu2'
      githubClientId = 'dd64a961127f3392159d'
    } else {
      // Enable devtools
      // Local Dev
      router = routerImport.newRouter('hash')
      Vue.config.devtools = true
      window.withCredentials = false
      bitbucketClientId = '9BGHdNKKcppeXRQSSH'
      githubClientId = '830bd8b7d0520c42508d'

      // Local Dev with Remote
      /*
      Vue.config.devtools = true
      store.commit('setWebsite', true)
      window.withCredentials = true
      */
    }

    // } // end if (hosted version)
    // store.commit('setProjectSelected', false)
    var currentUrl = [location.protocol, '//', location.host, ''].join('')
    authenticateObj = {
      baseUrl: window.websiteapiUrl + '/api/oauth', // Your API domain
      storageType: 'localStorage',
      tokenName: 'access_token',
      providers: {
        bitbucket: {
          clientId: bitbucketClientId,
          responseType: 'code',
          redirectUri: currentUrl + '/admin/oauth/bitbucket/authorize', // http://localhost:8090/oauth/bitbucket/authorize', // 8081:api/oauth/github/authorize' // 8090:/oauth/github/authorize' // Your client app URL
          defaultUrlParams: ['state', 'client_id', 'redirect_uri', 'response_type'],
          state: function () {
            var val = ((Date.now() + Math.random()) * Math.random()).toString().replace('.', '')
            // window.localStorage.setItem('stateCheck', encodeURIComponent(val))
            return encodeURIComponent(val) // window.localStorage.getItem('stateCheck')
          }
        },
        github: {
          clientId: githubClientId, // Iv1.26faaeb37888f8d0',
          redirectUri: currentUrl + '/admin/oauth/github/authorize', // redirectUri: 'http://localhost:8090/oauth/github/authorize', // 8081:api/oauth/github/authorize' // 8090:/oauth/github/authorize' // Your client app URL
          scope: [ 'admin:repo_hook', 'admin:repo_hook', 'delete_repo', 'repo', 'write:public_key', 'admin:public_key' ],
          defaultUrlParams: ['state', 'client_id', 'redirect_uri'],
          state: function () {
            var val = ((Date.now() + Math.random()) * Math.random()).toString().replace('.', '')
            // window.localStorage.setItem('stateCheck', encodeURIComponent(val))
            return encodeURIComponent(val) // window.localStorage.getItem('stateCheck')
          }
        }
      },
      bindRequestInterceptor: bindRequestInterceptorFct,
      bindResponseInterceptor: bindResponseInterceptorFct
    }

    Vue.prototype.$http = axios
    Vue.axios = axios

    Vue.use(VueAxios, axios)
    Vue.use(VueAuthenticate, authenticateObj)

    var vueAuth = VueAuthenticate.factory(Vue.prototype.$http, authenticateObj)
    window.vueAuth = vueAuth
  }

  // DELETE
  // Vue.config.devtools = true
  /*
  // document.domain = 'acentera.com' // TODO: Use en environment variable ...
  store.commit('setWebsite', true) // weird ?
  window.withCredentials = true
  window.websiteapiUrl = 'https://cms.acentera.com/dev'

  bitbucketClientId = 'mYJjMLHBCjYn4k9Xu2'
  githubClientId = 'dd64a961127f3392159d'
  */
  // DELETE

  Vue.prototype.$httpApi = axios.create({
    timeout: 90000,
    withCredentials: window.withCredentials
    // headers: { },
  })

  VueAuthenticate.factory(Vue.prototype.$httpApi, authenticateObj)

  var turndownService = new Turndown()
  window.turndownService = turndownService
  Vue.prototype.turndownService = new Turndown()

  Vue.prototype.turndownService.addRule('preserveIfStyleDefined', {
    filter: (node) => {
      var attributes = ['class', 'style', 'color']
      var attrTest = attributes.some(attr => node.hasAttribute(attr))
      var dataTest = Object.keys(node.dataset).length > 0

      return attrTest || dataTest
    },
    replacement: (innerHTML, node) => node.outerHTML
  })

  // .turndown($('#aa').html())
  $.fn.outerHTMLEditor = function (doc) {
    var tmpDiv = $('<div editor-ignore="true"/>')
    var html = tmpDiv.append(this.eq(0).clone()).html()
    tmpDiv.remove()
    return html
  }

  // Helper used to clone objects
  Vue.prototype.$clone = function (object) {
    return cloneDeep(object)
  }

  window.currentParents = null
  window.dynamicObjClone = Vue.prototype.$clone(dynamicObj)

  Vue.use(NProgress)
  Vue.use(plekan.plekan, {
    defaultLanguage: 'en',
    languages: ['tr', 'en'],
    // customComponents:[newComponent],
    modules: [],
    thumbnailPath: '/static/thumbnails/',
    plekanEvent: {
      onAdd: (evt) => {
      },
      onInit: () => {
      }
    },
    plekan_buttons: {
      /* Special buttons
      save: {
        text: 'Show Result',
        class: 'plekan-footer-button save',
        callback (rows) {
          // debug.log(rows)
        }
      },
      cancel: {
        text: 'Cancel',
        class: 'plekan-footer-button cancel',
        callback (rows) {
          // debug.table(JSON.parse(JSON.stringify(rows[0].contents)))
        }
      }
      */
    }
  })

  window.ctr = 1
  Vue.prototype.$plekan = plekan

  Vue.use(GitHubAPI, { http: axios, token: 'app.js provided token' })

  Vue.use(BitBucketAPI, { http: axios, token: 'app.js provided token' })

  Vue.use(Base64, { http: axios })

  // const base64 = Vue.prototype.Base64
  // Vue.prototype.$Base64 = base64
  // Vue.prototype.$base64 = base64

  const githubapi = Vue.prototype.GitHubAPI
  Vue.prototype.$GitHub = githubapi

  const bitbucketapi = Vue.prototype.BitBucketAPI
  Vue.prototype.$BitBucket = bitbucketapi

  sync(store, router)
  const nprogress = new NProgress({ parent: '.nprogress-container' })

  const { state } = store
  if (!isOauthCallback) {
    if (state.app.website) {
      Vue.prototype.$checkInet = function () {
        store.commit('setInet', true)
      }
    } else {
      // neverdo this : store.commit('isLoaded', true)
      Vue.prototype.$checkInet = function () {
        store.commit('setInet', true)
      }
      Vue.prototype.$checkInetBad = function () {
        $.ajax({
          url: 'https://cms.acentera.com/',
          type: 'GET',
          timeout: 5000,
          crossDomain: true,
          // dataType: 'jsonp',
          success: function (response) {
            store.commit('setInet', true)
          },
          error: function (error) {
            if (error.readyState === 0) {
              return store.commit('setInet', true) // weird ?
            }
            if (error.response.status === 403) {
              // TODO: Should we check if we were supposed to check with bitbucket??
              // all is good.. internet work cred doesnt.. its ok..
              store.commit('setInet', true) // weird ?
            } else {
              if (error.response === undefined || error.response === null) {
                store.commit('setInet', false)
                return
              } else {
                if (error.response.status === 0) {
                  store.commit('setInet', false)
                  return
                }
              }
              store.commit('setInet', false) // weird ?
            }
          }
        })
      }
    }
    Vue.prototype.$checkInet()
  }

  window.hasProcessed = false
  router.beforeEach((route, redirect, next) => {
    // Siebar logic....
    if (store.getters.app.website) {
      if (store.getters.app.websiteId) {
        // Warning, also check where we set it from the localStorage.getItem('selectedWebsite')
        if (route.path === '/templates') {
          router.push({ 'path': '/' }) // modify route.. back to home page..
          // navigator back button fix...
          // window.location.href = '/' // force go back..
          return
        }
      }
      if (!(store.getters.app.websiteId)) {
        if (!(route.path.indexOf('template') >= 0 || route.path === '/')) {
          if (store.getters.app.isLoaded) {
            // THIS IS BAD I KNOW...
            // This is hack, ie end-user click on change site, then hit the back button ...
            // the left menu stay hidden, this fixes that.
            store.getters.app.sidebar.hidden = true
            store.getters.app.sidebar.opened = false
            store.getters.app.sidebartwo.hidden = true
            store.getters.app.sidebartwo.opened = false
            store.getters.app.sidebarglobal.hidden = false
            store.getters.app.sidebarglobal.opened = true
            store.getters.app.repoState.isLoaded = false
            window.location.href = '/' // force go back..
            return
          }
        }
        if (route && route.path === '/') {
          // THIS IS BAD I KNOW...
          // This is hack, ie end-user click on add new template..then hit the back button  or (navigator history which is the most pain)...
          // the left menu stay hidden, I have not investigated...
          // ??? if (store.getters.app.isLoaded) {
          if (store.getters.app.project) {
            if (store.getters.app.sidebarglobal.opened === false) {
              var l = Object.keys(store.getters.app.project.websites).length
              if (l >= 1) {
                store.getters.app.sidebar.hidden = true
                store.getters.app.sidebar.opened = false
                store.getters.app.sidebartwo.hidden = true
                store.getters.app.sidebartwo.opened = false
                store.getters.app.sidebarglobal.hidden = false
                store.getters.app.sidebarglobal.opened = true
                store.getters.app.repoState.isLoaded = false
              }
            }
          }
        }
      }
    }
    $('body').removeClass('overflow-hidden-y')
    $('.app-content').removeClass('app-fixed')
    store.commit('deleteAllRows', 0, 1)
    window.hasProcessed = false
    window.previewWebsiteSent = -1 // -1 required. see Navbar.vue at emit of previewWebsiteSent
    // SSH Key Top Missing SSH Key error
    // temporary fixes
    if (store.state && store.state.app && store.state.app.repoState && store.state.app.repoState.updating === 6) { // ssh key issue
      // repoState of 7 means wrong git account ...or no access..
      store.commit('REPO_STATE_UPATE', 0) // all good
    }

    window.currVemTest = this

    store.state.app.viewMenu = false // reset menu right click
    store.state.app.topbar.show = true
    store.state.app.topbar.selectedPost = {}
    store.state.app.topbar.selectedPost.selected = true

    if (route.path.indexOf('blogs') >= 0) {
      store.state.app.topbar.show = true
    } else {
      store.state.app.topbar.show = false
    }
    // .name === 'Home')) {
    /*
    //TODO: Find a better way, in case user is offline...
    if (!(route.name === 'Home')) {
      if (state.app.repoState.updating === -1) {
        window.location.href = '/'
      }
    }
    */
    if (!state.app.isLoaded) {
      if (state.app.website) {
        store.commit(TOGGLE_SIDEBAR, false)

        if (state.session && window.localStorage.getItem('session') === null) {
          store.commit(LOGOUT, Vue)
        }
      } else {
        if (state.app.device.isMobile && state.app.sidebar.opened) {
          store.commit(TOGGLE_SIDEBAR, false)
        }
        store.commit(TOGGLE_SIDEBAR_TWO, false)
      }
    }
    next()
  })

  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
  })

  app = new Vue({
    router,
    store,
    nprogress,
    githubapi,
    ...App
  })

  // state.vm = app
  window.vm = app
  window.VueApp = app

  Vue.prototype.$github = githubapi
  // Vue.prototype.$base64 = base64
  Vue.prototype.$bitbucket = bitbucketapi
  Vue.prototype.$notify = openNotification

  Vue.prototype.$onError = handleError

  Vue.prototype.$bus = new Vue()
  window.$bus = Vue.prototype.$bus

  const MessageComponent = Vue.extend(Message)
  const openMessage = (propsData = {
    title: '',
    message: '',
    type: '',
    direction: '',
    duration: 1500,
    container: '.messages'
  }) => {
    return new MessageComponent({
      el: document.createElement('div'),
      propsData
    })
  }
  Vue.prototype.$message = openMessage

  Vue.directive('highlightjs', {
    deep: true,
    bind: function (el, binding) {
      // on first bind, highlight all targets
      let targets = el.querySelectorAll('code')
      targets.forEach((target) => {
        // if a value is directly assigned to the directive, use this
        // instead of the element content.
        if (binding.value) {
          target.textContent = binding.value
        }
        hljs.highlightBlock(target)
      })
    },
    componentUpdated: function (el, binding) {
      // after an update, re-fill the content and then highlight
      let targets = el.querySelectorAll('code')
      targets.forEach((target) => {
        if (binding.value) {
          target.textContent = binding.value
          hljs.highlightBlock(target)
        }
      })
    }
  })
  /* eslint-disable */

  /*	This work is licensed under Creative Commons GNU LGPL License.

  	License: http://creativecommons.org/licenses/LGPL/2.1/
     Version: 0.9
  	Author:  Stefan Goessner/2006
  	Web:     http://goessner.net/
  */
  window.xml2json = function (xml, tab) {
     var X = {
        toObj: function(xml) {
           var o = {};
           if (xml.nodeType==1) {   // element node ..
              if (xml.attributes.length)   // element with attributes  ..
                 for (var i=0; i<xml.attributes.length; i++)
                    o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
              if (xml.firstChild) { // element has child nodes ..
                 var textChild=0, cdataChild=0, hasElementChild=false;
                 for (var n=xml.firstChild; n; n=n.nextSibling) {
                    if (n.nodeType==1) hasElementChild = true;
                    else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                    else if (n.nodeType==4) cdataChild++; // cdata section node
                 }
                 if (hasElementChild) {
                    if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                       X.removeWhite(xml);
                       for (var n=xml.firstChild; n; n=n.nextSibling) {
                          if (n.nodeType == 3)  // text node
                             o["#text"] = X.escape(n.nodeValue);
                          else if (n.nodeType == 4)  // cdata node
                             o["#cdata"] = X.escape(n.nodeValue);
                          else if (o[n.nodeName]) {  // multiple occurence of element ..
                             if (o[n.nodeName] instanceof Array)
                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                             else
                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                          }
                          else  // first occurence of element..
                             o[n.nodeName] = X.toObj(n);
                       }
                    }
                    else { // mixed content
                       if (!xml.attributes.length)
                          o = X.escape(X.innerXml(xml));
                       else
                          o["#text"] = X.escape(X.innerXml(xml));
                    }
                 }
                 else if (textChild) { // pure text
                    if (!xml.attributes.length)
                       o = X.escape(X.innerXml(xml));
                    else
                       o["#text"] = X.escape(X.innerXml(xml));
                 }
                 else if (cdataChild) { // cdata
                    if (cdataChild > 1)
                       o = X.escape(X.innerXml(xml));
                    else
                       for (var n=xml.firstChild; n; n=n.nextSibling)
                          o["#cdata"] = X.escape(n.nodeValue);
                 }
              }
              if (!xml.attributes.length && !xml.firstChild) o = null;
           }
           else if (xml.nodeType==9) { // document.node
              o = X.toObj(xml.documentElement);
           }
           else
              alert("unhandled node type: " + xml.nodeType);
           return o;
        },
        toJson: function(o, name, ind) {
           var json = name ? ("\""+name+"\"") : "";
           if (o instanceof Array) {
              for (var i=0,n=o.length; i<n; i++)
                 o[i] = X.toJson(o[i], "", ind+"\t");
              json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
           }
           else if (o == null)
              json += (name&&":") + "null";
           else if (typeof(o) == "object") {
              var arr = [];
              for (var m in o)
                 arr[arr.length] = X.toJson(o[m], m, ind+"\t");
              json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
           }
           else if (typeof(o) == "string")
              json += (name&&":") + "\"" + o.toString() + "\"";
           else
              json += (name&&":") + o.toString();
           return json;
        },
        innerXml: function(node) {
           var s = ""
           if ("innerHTML" in node)
              s = node.innerHTML;
           else {
              var asXml = function(n) {
                 var s = "";
                 if (n.nodeType == 1) {
                    s += "<" + n.nodeName;
                    for (var i=0; i<n.attributes.length;i++)
                       s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                    if (n.firstChild) {
                       s += ">";
                       for (var c=n.firstChild; c; c=c.nextSibling)
                          s += asXml(c);
                       s += "</"+n.nodeName+">";
                    }
                    else
                       s += "/>";
                 }
                 else if (n.nodeType == 3)
                    s += n.nodeValue;
                 else if (n.nodeType == 4)
                    s += "<![CDATA[" + n.nodeValue + "]]>";
                 return s;
              };
              for (var c=node.firstChild; c; c=c.nextSibling)
                 s += asXml(c);
           }
           return s;
        },
        escape: function(txt) {
           return txt.replace(/[\\]/g, "\\\\")
                     .replace(/[\"]/g, '\\"')
                     .replace(/[\n]/g, '\\n')
                     .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
           e.normalize();
           for (var n = e.firstChild; n; ) {
              if (n.nodeType == 3) {  // text node
                 if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                    var nxt = n.nextSibling;
                    e.removeChild(n);
                    n = nxt;
                 }
                 else
                    n = n.nextSibling;
              }
              else if (n.nodeType == 1) {  // element node
                 X.removeWhite(n);
                 n = n.nextSibling;
              }
              else                      // any other node
                 n = n.nextSibling;
           }
           return e;
        }
     };
     if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
     var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
     return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
  }

  /**
   * A function to take a string written in dot notation style, and use it to
   * find a nested object property inside of an object.
   *
   * Useful in a plugin or module that accepts a JSON array of objects, but
   * you want to let the user specify where to find various bits of data
   * inside of each custom object instead of forcing a standardized
   * property list.
   *
   * @param String nested A dot notation style parameter reference (ie "urls.small")
   * @param Object object (optional) The object to search
   *
   * @return the value of the property in question
   */

  window.getEditorProperty = function ( propertyName, object ) {
    var parts = propertyName.split( "." ),
      length = parts.length,
      i,
      property = object || this;

    for ( i = 0; i < length; i++ ) {
      try {
        property = property[parts[i]];
      } catch (err) {

      }
    }

    return property;
  }

  window.updateEditorProperty = function ( propertyName, object, newVal ) {
    var parts = propertyName.split( "." ),
      length = parts.length,
      i,
      property = object || this

    var prevProperty = property
    for ( i = 0; i < length; i++ ) {
      prevProperty = property
      if (!property.hasOwnProperty[parts[i]]) {
        if (i !== length-1) {
          if (!property.hasOwnProperty('' + parts[i])) {
            property[parts[i]] = {}
          }
        } else {
          property[parts[i]] = newVal // set value
        }
      }
      property = property[parts[i]]
    }
    return property;
  }

  /* eslint-enable */
} else {
  app = new Vue({
    router,
    ...AppOauth
  })
}
export { app, router, store }
