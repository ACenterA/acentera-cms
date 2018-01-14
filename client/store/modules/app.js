import * as types from '../mutation-types'
// import Vue from 'vue'

const state = {
  inet: true,
  isLoaded: false,
  default_git_provider: 'bitbucket',
  project: null,
  projectId: null,
  websiteId: null,
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
    hidden: true
  },
  sidebarglobal: {
    opened: false,
    hidden: true
  },
  sidebartwo: {
    opened: false,
    hidden: true,
    json: []
  },
  effect: {
    translate3d: true
  }
}
const origState = JSON.parse(JSON.stringify(state))

const mutations = {
  [types.TOGGLE_DEVICE] (state, device) {
    state.device.isMobile = device === 'mobile'
    state.device.isTablet = device === 'tablet'
  },

  [types.TOGGLE_SIDEBAR] (state, opened) {
    console.error('WILL GOGGLE toggle siebar to ' + opened)

    if (opened) {
      state.sidebar.hidden = false
    }

    if (state.device.isMobile) {
      state.sidebar.opened = false // always false on mobile... opened
    } else {
      state.sidebar.opened = opened
    }
  },

  [types.TOGGLE_SIDEBAR_TWO] (state, opened) {
    if (state.sidebartwo.hidden) {
      if (state.sidebartwo.opened) {
        state.sidebartwo.hidden = false
      }
    }
    state.sidebartwo.opened = opened
  },

  [types.TOGGLE_SIDEBAR_TWO_DATA] (state, data) {
    console.error('SET SIDEBATWO DDATA')
    console.error(data)
    state.sidebartwo.json = data
    /*
    if (data instanceof Array) {
      state.sidebartwo.json = data
    } else {
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      console.error('SET SIDEBATWO DDATA NOT AN ARRAY')
      state.sidebartwo.json = data
    }
    */
  },

  [types.SWITCH_EFFECT] (state, effectItem) {
    for (let name in effectItem) {
      state.effect[name] = effectItem[name]
    }
  },
  [types.LOGOUT] (sate, vueObj) {
    console.error(origState)
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
          vueObj.$store.commit('clearSession', origState)
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
            vueObj.$store.commit('clearSession', origState)
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
      vueObj.$store.commit('clearSession', origState)
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

  [types.REPO_URL_UPDATE] (state, update) {
    var tmpUrl = update
    if (('' + update).indexOf('@') > 0) {
      tmpUrl = update.substring(('' + update).indexOf('@') + 1)
    }
    var origState = state.repoState
    origState.url = tmpUrl
    state.repoState = origState
  },
  [types.SELECT_WEBSITE] (state, item) {
    // var origState = state.repoState
    // origState.url = tmpUrl
    // state.repoState = origState
    // console.error(window.vm.$store.getters)
    console.error('selected website...?')
    console.error(item)
    console.error(state)
    state.projectId = item.projectId
    state.websiteId = item.websiteId

    state.sidebarglobal.opened = false
    state.sidebar.opened = true
    state.sidebar.hidden = false
    // && !sidebarglobal.hidden

    window.localStorage.setItem('selectedWebsite', state.websiteId)
    window.localStorage.setItem('selectedProject', state.projectId)
    /*  if we watn to refresh the website data..
    console.error('vue obj')
    console.error(item)
    console.error(window.vm.$store.getters.session)
    var session = window.vm.$store.getters.session
    // var self = vueObj
    // console.error(self)
    // console.log(self.$store.state.session)
    // var vueObjState = self.$store.state

    console.error('Selected project of' + item.projectId + ' and ' + item.websiteId)
    console.error('state is')
    console.error(state)
    console.error(self)
    var getSiteInfoUrl = window.websiteapiUrl + '/sites/v1/websites/' + item.projectId + '/' + item.websiteId
    var h = { 'authorization': 'Bearer ' + session.token }
    window.vm.$http.get(getSiteInfoUrl, {
      headers: h
    }).then((response) => {
      window.vm.$notify({
        title: 'Website ready.',
        message: 'Your website has been created.',
        type: 'success'
      })
    }).catch((e) => {
      window.vm.$notify({
        title: 'Connection error',
        message: 'We could not retreive your website informations.',
        type: 'danger'
      })
    })
    */
  }
}

export default {
  state,
  mutations
}
