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

if (!window.console) {
  window.console = {
    log: function () {
    },
    error: function () {
    }
  }
}

Vue.prototype.$http = axios
Vue.axios = axios
Vue.use(NProgress)
console.error(plekan)
Vue.use(plekan.plekan, {
  defaultLanguage: 'tr',
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
  Vue.config.devtools = true
  store.commit('setWebsite', true) // weird ?
  window.withCredentials = false
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
  store.commit('isLoaded', true)
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

router.beforeEach((route, redirect, next) => {
  $('body').removeClass('overflow-hidden')
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

export { app, router, store }
