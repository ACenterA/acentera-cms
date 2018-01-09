import * as types from '../mutation-types'
// import Vue from 'vue'

const state = {
  inet: true,
  default_git_provider: 'bitbucket',
  device: {
    isMobile: false,
    isTablet: false
  },
  repoState: {
    updating: -1,
    updatingCount: 0,
    Master: null,
    Branch: null,
    url: null,
    isLoaded: false
  },
  sidebar: {
    opened: false,
    hidden: false
  },
  sidebartwo: {
    opened: false,
    hidden: false,
    json: []
  },
  effect: {
    translate3d: true
  }
}

const mutations = {
  [types.TOGGLE_DEVICE] (state, device) {
    state.device.isMobile = device === 'mobile'
    state.device.isTablet = device === 'tablet'
  },

  [types.TOGGLE_SIDEBAR] (state, opened) {
    console.error('toggle siebar to ' + opened)
    if (state.device.isMobile) {
      state.sidebar.opened = opened
    } else {
      state.sidebar.opened = opened
    }
  },

  [types.TOGGLE_SIDEBAR_TWO] (state, opened) {
    state.sidebartwo.opened = opened
  },

  [types.TOGGLE_SIDEBAR_TWO_DATA] (state, data) {
    state.sidebartwo.json = data
  },

  [types.SWITCH_EFFECT] (state, effectItem) {
    for (let name in effectItem) {
      state.effect[name] = effectItem[name]
    }
  },
  [types.LOGOUT] (sate, vueObj) {
    console.log('sendng loggout')
    var self = vueObj
    console.log(self.$store.state.session)
    var state = self.$store.state

    if (state.website) {
      if (state.session && state.session.token) {
        var h = { 'Authorization': 'Bearer ' + state.session.token }
        // request it with headers an params
        self.$http.post(window.websiteapiUrl + '/customer/v1/websites/logout',
          {},
          {
            headers: h
          }
        ).then((response) => {
          // force cookie timeout
          document.cookie = 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'

          // if (response.data.error !== '') {
          self.$notify({
            title: 'Successfully logged out.',
            message: 'We de-activated your current session.',
            type: 'success'
          })

          // store session data in localstorage
          // window.localStorage.setItem('session', {})
          // vueObj.set(vueObj.parallelData, 'user', {})
          state.repoState = 0
          vueObj.$store.commit('clearSession')
        })
        .catch((error) => {
          console.error(error)
          var msg = ''
          if (error.response && error.response.data) {
            msg = error.response.data.errorMessage
          }
          if (msg.indexOf('Invalid token') > 0) {
            self.$notify({
              title: 'Successfully logged out.',
              message: 'We de-activated your current session.',
              type: 'success'
            })

            // store session data in localstorage
            // window.localStorage.setItem('session', {})
            // vueObj.set(vueObj.parallelData, 'user', {})
            state.repoState = 0
            vueObj.$store.commit('clearSession')
          } else {
            self.$notify({
              title: 'Login failed.',
              message: msg,
              type: 'danger'
            })
          }
        })
      }
    } else {
      document.cookie = 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      // vueObj.set(this.parallelData, 'user', {})
      vueObj.$store.commit('clearSession')
      state.repoState = 0
      self.$notify({
        title: 'Successfully logged out.',
        message: 'We de-activated your current session.',
        type: 'success'
      })
    }
  },
  [types.REPO_STATE_UPATE] (state, update) {
    // console.log('receiged repo update')
    // console.log(state)
    // Vue.set(state.repoState, 'updating', update)
    var origState = state.repoState

    origState.updating = update
    if (update <= 0) {
      // origState.isLoaded = true
    } else {
      // origState.isLoaded = false
    }

    state.repoState = origState
    //  = update
    // console.log(state)
  },
  [types.REPO_UPATE] (state, update) {
    var origState = state.repoState
    origState.Branch = update.Branch
    origState.Master = update.Master

    if (!((update.Branch === '' || update.Branch === undefined) || (update.Master === '' || update.Master === undefined))) {
      origState.isLoaded = true
    } else {
      origState.isLoaded = false
    }

    state.repoState = origState
    //  = update
    // console.log(state)
  },

  [types.REPO_URL_UPATE] (state, update) {
    var tmpUrl = update
    if (('' + update).indexOf('@') > 0) {
      tmpUrl = update.substring(('' + update).indexOf('@') + 1)
    }
    var origState = state.repoState
    origState.url = tmpUrl
    state.repoState = origState
  }
}

export default {
  state,
  mutations
}
