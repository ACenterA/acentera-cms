import Vue from 'vue'
import axios from 'axios'
import NProgress from 'vue-nprogress'
import { sync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import * as filters from './filters'
import { TOGGLE_SIDEBAR, TOGGLE_SIDEBAR_TWO } from 'vuex-store/mutation-types'
import Notification from 'vue-bulma-notification'
import Message from 'vue-bulma-message'
import hljs from 'highlight.js'

Vue.prototype.$http = axios
Vue.axios = axios
Vue.use(NProgress)

window.apiUrl = window.apiUrl || 'http://localhost:8081/api'
window.apiHost = window.apiHost || 'http://localhost:8081'
window.goHostUrl = window.goHostUrl || 'http://localhost:8081'

import GitHubAPI from './GitHubAPI'
Vue.use(GitHubAPI, { http: axios, token: 'app.js provided token' })

const githubapi = Vue.prototype.GitHubAPI
Vue.prototype.$GitHub = githubapi

// Enable devtools
Vue.config.devtools = true

sync(store, router)

const nprogress = new NProgress({ parent: '.nprogress-container' })

const { state } = store

Vue.prototype.$checkInet = function () {
  axios.get(
    'https://api.github.com/',
  ).then((response) => {
    console.log('got response')
    console.log(response)
    store.commit('setInet', true)
  }, (error) => {
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
  })
}
Vue.prototype.$checkInet()

router.beforeEach((route, redirect, next) => {
  console.log('test route a')
  console.log(route)
  /*
  //TODO: Find a better way, in case user is offline...
  if (!(route.name === 'Home')) {
    if (state.app.repoState.updating === -1) {
      window.location.href = '/'
    }
  }
  */
  if (state.app.device.isMobile && state.app.sidebar.opened) {
    store.commit(TOGGLE_SIDEBAR, false)
  }
  store.commit(TOGGLE_SIDEBAR_TWO, false)
  next()
})

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

const app = new Vue({
  router,
  store,
  nprogress,
  githubapi,
  ...App
})

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
