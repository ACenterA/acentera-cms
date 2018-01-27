import Vue from 'vue'
import axios from 'axios'
import NProgress from 'vue-nprogress'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import plekan from './plekan/index.js'
import store from './store'
import * as filters from './filters'
import { LOGOUT, TOGGLE_SIDEBAR, TOGGLE_SIDEBAR_TWO } from 'vuex-store/mutation-types'
import Notification from 'vue-bulma-notification'
import Message from 'vue-bulma-message'
import hljs from 'highlight.js'
import cloneDeep from 'lodash/cloneDeep'

if (!window.console) {
  window.console = {
    log: function () {
    },
    error: function () {
    }
  }
}

$.fn.outerHTMLEditor = function (doc) {
  console.error('ignoring of ... and cloning of a')
  console.error(this)
  console.error('ignoring of ... and cloning of b')
  console.error(this.eq(0))
  console.error('ignoring of ... and cloning of c')
  console.error(this.eq(0).clone())
  console.error('ignoring of ... and cloning of d')
  var tmpDiv = $('<div editor-ignore="true"/>')
  var html = tmpDiv.append(this.eq(0).clone()).html()
  tmpDiv.remove()
  return html
}

Vue.prototype.$clone = function (object) {
  console.error('recieved clone of')
  console.error(object)
  return cloneDeep(object)
}
window.currentParents = null
import dynamicObj from './plekan/src/core/modules/dynamic.vue'
window.dynamicObjClone = Vue.prototype.$clone(dynamicObj)

Vue.prototype.$http = axios
Vue.axios = axios
Vue.use(NProgress)
console.error(plekan)
Vue.use(plekan.plekan, {
  defaultLanguage: 'en',
  languages: ['tr', 'en'],
  // customComponents:[newComponent],
  modules: [],
  thumbnailPath: '/static/thumbnails/',
  plekanEvent: {
    onAdd: (evt) => {
      // console.log('on add..')
      // console.log(evt);
      // console.log(store.state);

    },
    onInit: () => {

      // console.log('onInit called')
      // console.log(store);

      // var newComponent = Vue.component('custom',{
      //   mixins:[plekanComponentMixin],
      //    data:function () {
     //       return {
    //         DEFAULT_CONTENT : '<div contenteditable="true" >Hi</div>'
      //     }
//         },
//         template :'#custom'
//       })
//
//       var customComponents = [
//         {
//           info : {
//             "name"      : "awesomecomponent",
//             "group"     : "image",
//             "thumbnail"   : "https://vuejs.org/images/logo.png"
//           },
//           component : newComponent
//         }
//      ];
//      console.error(store)
  //    //store.addRow(customComponents)

    }
  },
  plekan_buttons: {
    // Special buttons
    save: {
      text: 'Show Result',
      class: 'plekan-footer-button save',
      callback (rows) {
        console.log(rows)
      }
    },
    cancel: {
      text: 'Cancel',
      class: 'plekan-footer-button cancel',
      callback (rows) {
        console.table(JSON.parse(JSON.stringify(rows[0].contents)))
      }
    }
  }
})

window.ctr = 1
Vue.prototype.$plekan = plekan

window.goApiUrl = window.goApiUrl || 'http://localhost:1313'
window.apiUrl = window.apiUrl || 'http://localhost:8081/api'
window.apiHost = window.apiHost || 'http://localhost:8081'
window.goHostUrl = window.goHostUrl || 'http://localhost:8081'

window.websiteapiUrl = window.websiteapiUrl || 'http://localhost:8083'

import GitHubAPI from './GitHubAPI'
Vue.use(GitHubAPI, { http: axios, token: 'app.js provided token' })

import BitBucketAPI from './BitBucketAPI'
Vue.use(BitBucketAPI, { http: axios, token: 'app.js provided token' })

import Base64 from './Base64'
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

// if (!window.location.href.indexOf('.com') > 0) {
window.withCredentials = false

// TODO: .. if IS WEBSITE... then
// if (window.location.href + "").indexOf("acentera.com") {

if (window.location.href.indexOf('acentera.com') !== -1) {
  // Enable devtools
  Vue.config.devtools = true
  document.domain = 'acentera.com' // TODO: Use en environment variable ...
  store.commit('setWebsite', true) // weird ?
  window.withCredentials = true
} else {
  // Enable devtools
  // store.commit('isLoaded', true)
  window.withCredentials = false // required
  Vue.config.devtools = true
  store.commit('setWebsite', false) // weird ?
}
// } // end if (hosted version)
// store.commit('setProjectSelected', false)

Vue.prototype.$httpApi = axios.create({
  timeout: 90000,
  withCredentials: window.withCredentials
  // headers: { },
})

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
    console.error('CHECK OF INET')
    $.ajax({
      url: 'https://w3trnpl5z2.execute-api.us-east-1.amazonaws.com/',
      type: 'GET',
      timeout: 5000,
      crossDomain: true,
      // dataType: 'jsonp',
      success: function (response) {
        console.error('CHECK OF INET resp')
        console.log('got response')
        console.log(response)
        store.commit('setInet', true)
        // ready()
      },
      error: function (error) {
        console.error('CHECK OF INET err')
        console.error('got response test of error')
        console.error(error)
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
window.hasProcessed = false

router.beforeEach((route, redirect, next) => {
  $('body').removeClass('overflow-hidden')
  // console.error('befoure route next is')
  store.commit('deleteAllRows', 0, 1)
  window.hasProcessed = false

  // SSH Key Top Missing SSH Key error
  // temporary fixes
  if (store.state && store.state.app && store.state.app.repoState && store.state.app.repoState.updating >= 6) { // ssh key issue
    store.commit('REPO_STATE_UPATE', 0) // all good
  }

  console.error(route)
  console.error(this.a)
  window.currVemTest = this

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

/** EDITOR START **/
// const modules = []

// console.error('plekan test')
// console.error(Plekan)

// const nplekan = new Plekan()
// console.error(nplekan)
/** EDITOR END **/

const app = new Vue({
  router,
  store,
  nprogress,
  githubapi,
  ...App
})

// state.vm = app
window.vm = app
window.VueApp = app
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

Vue.prototype.$github = githubapi
// Vue.prototype.$base64 = base64
Vue.prototype.$bitbucket = bitbucketapi
Vue.prototype.$notify = openNotification

function handleError (error) {
  // if the server gave a response message, print that
  console.log('got error....')
  console.log(error)
  try {
    if (error.response.data.error) {
      openNotification({
        title: 'Error: ' + error.response.status,
        message: error.response.data.error,
        type: 'danger'
      })
      console.log(error.response.data.error)
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
      console.log(error.response.data)
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
/* eslint-enable */

export { app, router, store }
