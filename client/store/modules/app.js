import * as types from '../mutation-types'
// import Vue from 'vue'

const state = {
  inet: true,
  isLoaded: false,
  default_git_provider: 'bitbucket',
  project: null,
  projectId: null,
  websiteId: null,
  viewMenu: true,
  viewMenuType: null,
  viewMenuPos: {
    top: 0,
    left: 0
  },
  device: {
    isMobile: false,
    isTablet: false
  },
  settings: {},
  language: null,
  languages: {
    languages: [],
    languagesHash: {}
  },
  topbar: {
    show: false,
    selectedPost: null
  },
  repoState: {
    updating: -1,
    updatingCount: 0,
    Master: null,
    Branch: null,
    pending: false,
    Ref: null,
    Provider: null,
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
  sidebarblogData: {
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
      if (opened) {
        state.sidebartwo.hidden = false
      }
    }
    state.sidebartwo.opened = opened
  },

  [types.TOGGLE_SIDEBAR_BLOGDATA]  (state, opened) {
    if (state.sidebartwo.hidden) {
      if (opened) {
        state.sidebartwo.hidden = false
      }
    }
    state.sidebartwo.opened = opened
  },

  [types.TOGGLE_BLOGDATA] (state, data) {
    state.sidebarblogData.json = data
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
    var self = vueObj
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
  [types.REPO_STATE_PENDING] (state, pending) {
    state.repoState.pending = pending
  },
  [types.REPO_STATE_UPATE] (state, update) {
    var origState = state.repoState
    origState.updating = update

    if (!state.website) { // <== ?? required ?
      if (update === 6) {
        origState.sshKeyMissing = true
      } else {
        // ??
        origState.sshKeyMissing = false
      }
    }
    state.repoState = origState
  },
  [types.REPO_UPATE] (state, update) {
    var origState = state.repoState
    if (!(update && update.Data)) {
      return
    }
    origState.Branch = update.Branch
    origState.Master = update.Master
    origState.Ref = update.Ref
    if (update.Data.indexOf('https://bitbucket.org') >= 0) {
      origState.Provider = 'BitBucket'
    } else if (update.Data.indexOf('https://github.com') >= 0) {
      origState.Provider = 'Github'
    } else {
      origState.Provider = 'Unknown'
    }
    if (!((update.Branch === '' || update.Branch === undefined) || (update.Master === '' || update.Master === undefined))) {
      origState.isLoaded = true
    } else {
      origState.isLoaded = false
    }

    state.repoState = origState
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

  [types.SELECT_INITIAL_WEBSITE] (state, item) {
    var tmp = {
      projectId: item.projectId,
      websites: {
      }
    }
    item.type = 'ready'
    tmp['websites'][item.websiteId] = item

    state.project = tmp
  },
  [types.SELECT_WEBSITE] (state, item) {
    if (item == null) {
      // unselecting websites..
      state.websiteId = null
      window.localStorage.removeItem('selectedWebsite')
      window.localStorage.removeItem('selectedProject')
      state.sidebarglobal.hidden = false
      state.sidebarglobal.opened = true
      state.sidebar.hidden = true
      state.sidebar.opened = false
      window.vm.$router.push({ 'path': '/' })
      return
    }
    state.projectId = item.projectId
    state.websiteId = item.websiteId

    state.sidebarglobal.opened = false
    state.sidebar.opened = true
    state.sidebar.hidden = false
    // && !sidebarglobal.hidden

    window.localStorage.setItem('selectedWebsite', state.websiteId)
    window.localStorage.setItem('selectedProject', state.projectId)
  },
  [types.SELECT_POST] (state, item) {
    if (state.topbar.selectedPost) {
      state.topbar.selectedPost.selected = false
    }
    state.topbar.selectedPost = item
  },
  [types.SITE_SETTINGS] (state, update) {
    state.settings = update
  },
  [types.SITE_SETTING_SAVE] (state, update) {
    var self = window.vm
    self.$httpApi.post(window.apiUrl + '/settings', state.settings, {}).then((response) => {
      // TODO: Set selecte theme in the state...
      // In case they modified theme ?
      if (!state.repoState.pending) {
        // validate if somehting changed, unless we are already in pending mode...
        window.vm.$store.commit('REFRESH_CONFIG', state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})
      } else {
        // Optional ??
        window.vm.$store.commit('REFRESH_SETTINGS', state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})
      }
    })
    .catch((error) => {
      self.$onError(error)
    })
  },
  [types.SITE_LANG_DEFAULT] (state, update) {
    if (state.language === undefined || state.language === null) {
      state.language = update
    }
  },
  [types.SITE_LANG_SELECT] (state, update) {
    state.language = update
  },
  [types.SITE_AVAILABLE_LANG] (state, update) {
    // update.languages
    // update.languagesHash
    state.languages = update
  },
  [types.REFRESH_SETTINGS] (state, update) {
    var self = window.vm
    self.$httpApi.get(window.apiUrl + '/settings').then((response) => {
      let result = response.data

      if (result.hasOwnProperty('languages')) {
        var TempAvailablelanguages = []
        var TempAvailablelanguageshash = {}

        let langkeys = Object.keys(result.languages)
        // self.allSettings = result
        self.$store.commit(types.SITE_SETTINGS, result)

        for (var i = 0; i < langkeys.length; i++) {
          var tmpLang = result.languages[langkeys[i]]
          tmpLang.id = langkeys[i]
          tmpLang.value = langkeys[i]
          TempAvailablelanguageshash[langkeys[i]] = tmpLang
          TempAvailablelanguageshash[result.languages[langkeys[i]].languagename] = tmpLang
          // if (self.selectedLang === undefined) {
            // self.selectedLang = langkeys[i].languagename
          self.$store.commit(types.SITE_LANG_DEFAULT, langkeys[i].languagename)
          // }
          TempAvailablelanguages.push(tmpLang)
        }
        // self.availableLanguages = TempAvailablelanguages
        // self.availableLanguagesHash = TempAvailablelanguageshash
        self.$store.commit(types.SITE_AVAILABLE_LANG, { languages: TempAvailablelanguages, languagesHash: TempAvailablelanguageshash })
      }
    })
    .catch((error) => {
      self.$onError(error)
    })
  },
  [types.REFRESH_CONFIG] (state, update) {
    var self = window.vm
    try {
      window.vm.$httpApi.get(window.apiUrl + '/git?action=config&loc=nav').then((response) => {
        self.$store.commit(types.REPO_URL_UPDATE, response.data.Data)
        if (response !== null && response.data !== null) {
          self.$store.commit(types.REPO_UPATE, response.data)
        }

        if (self.$store.state.app.inet) {
          self.$store.commit(types.REPO_STATE_UPATE, 0) // first set valid
          var basicAuth = self.$store.getters.getBasicAuth
          /*
          if (self.$store.state.github === null || self.$store.state.github.logininfo === null) {
            return
          }
          */
          if (basicAuth !== null) { // TODO: If in Dev
            self.$httpApi.get(window.apiUrl + '/git?action=pull&loc=nav&ts=1', { headers: { 'Authorization': basicAuth } }).then((response) => {
              self.$store.commit(types.REPO_STATE_UPATE, 0) // all good
              if (response.data.Extra === 'pending') {
                self.$store.commit(types.REPO_STATE_PENDING, 1) // all good
              } else {
                self.$store.commit(types.REPO_STATE_PENDING, 0) // all good
              }
            })
            .catch((error) => {
              if (error.response.status === 500) {
                if (error.response.data.Data === 'reference not found') {
                  self.$notify({
                    title: 'Website Version',
                    message: 'This website version does not exists anymore... Please select a new version.',
                    type: 'warning'
                  })
                }
                self.$store.commit(types.REPO_STATE_UPATE, 6) // need to setup SSH Key for the user
              } else {
                self.$onError(error)
              }
            })
          }

          window.vm.$store.commit('REFRESH_SETTINGS', state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})
          // refreshSettings()
        }
      })
      .catch((error) => {
        try {
          if (error.response.status === 500) {
            self.$store.commit(types.REPO_STATE_UPATE, 5) // State 5 = no .git/config file....
          } else {
            self.$onError(error)
          }
        } catch (ee) {
          self.$store.commit(types.REPO_STATE_UPATE, 5) // State 5 = no .git/config file....
        }
      })
    } catch (f) {
    }
  }
}

export default {
  state,
  mutations
}
