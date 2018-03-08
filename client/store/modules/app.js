import * as types from '../mutation-types'
// import Vue from 'vue'

const state = {
  inet: true,
  isLoaded: false,
  default_git_provider: 'bitbucket',
  account: null,
  project: null,
  projectId: null,
  websiteId: null,
  websiteInCreationMode: false,
  viewMenu: true,
  viewMenuType: null,
  viewMenuPos: {
    top: 0,
    left: 0
  },
  i18nUpdated: {
  },
  device: {
    isMobile: false,
    isTablet: false
  },
  settings: {},
  language: null,
  languageSelected: null,
  nodata: false,
  createItem: false,
  selectedItem: null,
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

    // if (state.website || state.website) {
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

    if (!state.website) {
      // <== ?? required ?
      if (update === 6) {
        origState.sshKeyMissing = true
      }
      /* } else {
        // ??
        origState.sshKeyMissing = false
      }
      */
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
    if (update.Data.indexOf('bitbucket.org') >= 0) {
      origState.Provider = 'BitBucket'
    } else if (update.Data.indexOf('github.com') >= 0) {
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

    if (state.project === null || (state.project && state.project.projectId !== item.projectId)) {
      // In the event of no project & no website we simpply assign the project
      state.project = tmp
    } else {
      // In the event of an existing project... project & no website we simpply assign the project
      if (!state.project['websites']) {
        state.project = tmp
      } else {
        state.project['websites'][item.websiteId] = item
      }
    }
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

      if (state.repoState) {
        state.repoState.Provider = null
        state.repoState.url = null
        state.repoState.isLoaded = false
      }

      window.vm.$router.push({ 'path': '/' })
      return
    }
    state.projectId = item.projectId
    state.websiteId = item.websiteId

    state.sidebarglobal.opened = false
    state.sidebar.opened = true
    state.sidebar.hidden = false
    // && !sidebarglobal.hidden
    console.error('SELECT 03A')
    window.localStorage.setItem('selectedWebsite', state.websiteId)
    window.localStorage.setItem('selectedProject', state.projectId)

    // TODO: Specify which workspace ???
    window.apiUrl = 'http://' + item.websiteId + '.workspace.acentera.com/api'
    window.goHostUrl = 'http://' + item.websiteId + '.workspace.acentera.com'
    console.error('SELECT 03B')
    window.vm.$store.commit('REFRESH_CONFIG', state) // we still want to refresh settings, for offline version...

    console.error('SELECT 03C')
    var self = window.vm
    // Refresh for domains...

    console.error('SELECT 03D')
    console.error(state)
    var h = { 'Authorization': 'Bearer ' + window.vm.$store.state.session.token } // cannot use state.session as state = the $store.state.app
    console.error('SENDING OF ...')
    console.error(h)
    window.vm.$http.get(window.websiteapiUrl + '/sites/v1/websites/' + state.projectId + '/' + state.websiteId, {
      headers: h
    }).then((response) => {
      console.error('received website info')
      console.error(response.data)
      if (response.data && response.data.websiteId === state.websiteId) {
        window.vm.$store.state.app.project['websites'][state.websiteId] = response.data
      }
    }).catch((error) => {
      var msg = ''
      if (error.response && error.response.data) {
        msg = error.response.data.errorMessage
      }
      self.$notify({
        title: 'problem occured while fetching website informations.',
        message: msg,
        type: 'warning'
      })
      // state.app.isLoaded = true
    })
    // window.vm.$store.commit('REFRESH_SETTINGS', state) // we still want to refresh settings, for offline version...
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
    var pendingReload = window.reloadOnSave
    window.reloadOnSave = false

    // Will be called after the i18n updates.
    // This function will also display the Save Success balloon.
    var performSettingUpdate = function () {
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

        // Small Hack to only show it once...
        if (!pendingReload) {
          var uniqueMsg = 'Saved'
          if (!($('.notifications').find('.title.is-5').text() === uniqueMsg)) {
            // only show it once..
            self.$notify({
              title: 'Saved',
              message: 'Changes has been saved locally.',
              type: 'success'
            })
          }
        } else {
          var selectedLangItem = window.vm.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
          // force refresh
          // hack to leave enough time for backend to process the change :)
          setTimeout(function () {
            self.$bus.$emit('LANGUAGE_CHANGE_EVENT', selectedLangItem)

            var uniqueMsg = 'Saved'
            if (!($('.notifications').find('.title.is-5').text() === uniqueMsg)) {
              // only show it once..
              self.$notify({
                title: 'Saved',
                message: 'Changes has been saved locally.',
                type: 'success'
              })
            }
          }, 700)
        }
      })
      .catch((error) => {
        self.$onError(error)
      })
    }

    var tmpObject = self.$store.state.app.i18nUpdated
    self.$store.state.app.i18nUpdated = {}
    var updatedI81nKeys = Object.keys(tmpObject)
    if (updatedI81nKeys && updatedI81nKeys[0]) {
      // Ok we have i18N Updates...

      // LanguageCode match the i18n/{languageCodde}.yml file
      var languageCode = self.$store.state.app.languages.languagesHash[self.$store.state.app.languageSelected].id

      self.$httpApi.post(window.apiUrl + '/i18n/' + languageCode, tmpObject, {}).then((response) => {
        // TODO: Validate response
        performSettingUpdate()
      })
      .catch((error) => {
        self.$onError(error)
      })
    } else {
      performSettingUpdate()
    }
  },
  [types.SITE_LANG_DEFAULT] (state, update) {
    state.language = update
  },
  [types.SITE_SELECT_LANG] (state, update) {
    state.languageSelected = update
    window.localStorage.setItem('languageSelected', update)
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
      self.$store.commit(types.SITE_SETTINGS, result)
      if (result.hasOwnProperty('languages')) {
        var TempAvailablelanguages = []
        var TempAvailablelanguageshash = {}

        let langkeys = Object.keys(result.languages)
        // self.allSettings = result

        var selectedLang = window.localStorage.getItem('languageSelected')
        var selectedLangObj = null
        var setDefaultLang = null
        var firstlang = null
        var disabledLanguagesStr = '' + self.$store.state.app.settings.disablelanguages || ''
        var disabledLanguagesHash = {}
        var disabledLanguagesArr = disabledLanguagesStr.split(' ')

        for (var z = 0; z < disabledLanguagesArr.length; z++) {
          disabledLanguagesHash[disabledLanguagesArr[z]] = true
        }
        for (var i = 0; i < langkeys.length; i++) {
          var tmpLang = result.languages[langkeys[i]]
          if (tmpLang) {
            tmpLang.id = langkeys[i]
            tmpLang.value = langkeys[i]
            TempAvailablelanguageshash[langkeys[i]] = tmpLang
            TempAvailablelanguageshash[result.languages[langkeys[i]].languagename] = tmpLang
            // if (self.selectedLang === undefined) {
              // self.selectedLang = langkeys[i].languagename
            // }
            if (firstlang === null) {
              firstlang = result.languages[langkeys[i]].languagename
            }

            if (disabledLanguagesHash.hasOwnProperty(langkeys[i])) {
              result.languages[langkeys[i]]['enable'] = false
            } else {
              result.languages[langkeys[i]]['enable'] = true
            }

            if (langkeys[i] === result.defaultcontentlanguage) { // result.languages[langkeys[i]].languagename === 'English') {
              setDefaultLang = result.languages[langkeys[i]].languagename
              result.languages[langkeys[i]]['enable'] = true // default language cannot be disabled...
              result.languages[langkeys[i]]['locked'] = true // default language cannot be disabled...
            }

            // In case we changed to french language and refresh browser
            // we take the last localStorage language selected
            if (selectedLang === result.languages[langkeys[i]].languagename) {
              selectedLang = result.languages[langkeys[i]].languagename
              selectedLangObj = result.languages[langkeys[i]].languagename
            }
            TempAvailablelanguages.push(tmpLang)
          }
        }
        if (!setDefaultLang) {
          setDefaultLang = firstlang
        }
        console.error('sellected lang test')
        if (!(selectedLang && selectedLangObj)) {
          selectedLang = null
        } else {
          if (!selectedLangObj.enable) { // this language is not enabled anymore..
            selectedLang = null
          }
        }
        if (!selectedLang) {
          selectedLang = setDefaultLang
        }
        // self.availableLanguages = TempAvailablelanguages
        // self.availableLanguagesHash = TempAvailablelanguageshash
        self.$store.commit(types.SITE_AVAILABLE_LANG, { languages: TempAvailablelanguages, languagesHash: TempAvailablelanguageshash })
        self.$store.commit(types.SITE_LANG_DEFAULT, setDefaultLang)
        self.$store.commit(types.SITE_SELECT_LANG, selectedLang)
      }
    })
    .catch((error) => {
      self.$onError(error)
    })
  },
  [types.REFRESH_CONFIG] (state, update) {
    var self = window.vm
    try {
      window.vm.$httpApi.get(window.apiUrl + '/git?action=config&loc=nav&type=refreshConfig').then((response) => {
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

          var fctRefresh = function () {
            self.$httpApi.get(window.apiUrl + '/git?action=pull&loc=nav&ts=1', {
              headers: {
                'Authorization': basicAuth,
                'Token': window.vueAuth.getToken()
              }
            }).then((response) => {
              self.$store.commit(types.REPO_STATE_UPATE, 0) // all good
              if (response.data.Extra === 'pending') {
                self.$store.commit(types.REPO_STATE_PENDING, 1) // all good
              } else {
                self.$store.commit(types.REPO_STATE_PENDING, 0) // all good
              }
              window.vm.$store.commit('REFRESH_SETTINGS', state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})
              state.isLoaded = true
            })
            .catch((error) => {
              state.isLoaded = true
              window.vm.$store.commit('REFRESH_SETTINGS', state) // Might only be becaise user is not logged in.... still usefull to have latest settings
              if (error.response && error.response.status === 500) {
                self.$store.commit(types.REPO_STATE_UPATE, 6) // need to setup SSH Key for the user, or wrong login ?
                if (error.response.data.Data === 'reference not found') {
                  var uniqueMsg = 'Website Version'
                  if (!(('' + $('.notifications').find('.title.is-5').text()) === ('' + uniqueMsg))) {
                    // only show it once..
                    self.$notify({
                      title: uniqueMsg,
                      message: 'This website version does not exists anymore... Please select a new version.',
                      type: 'warning'
                    })
                  }
                } else if (error.response.data.Data === 'authentication required') {
                  // Ensure user is logged in.
                  if (self.$store.state.github && self.$store.state.github.logininfo) {
                    var uniqueMsgAcc = 'Wrong Account?'
                    if (!(('' + $('.notifications').find('.title.is-5').text()) === ('' + uniqueMsgAcc))) {
                      // only show it once..
                      self.$notify({
                        title: uniqueMsgAcc,
                        message: 'The Git account you are logged with, is not able to perform refresh or updates. Please validate your git account.',
                        type: 'warning'
                      })
                    }
                    self.$store.commit(types.REPO_STATE_UPATE, 7) // need to setup SSH Key for the user, or wrong login ?
                  }
                } else if (error.response.data.Data) {
                  var uniqueMsgErr = 'A problem occured.'
                  if (!(('' + $('.notifications').find('.title.is-5').text()) === ('' + uniqueMsgErr))) {
                    // only show it once..
                    self.$notify({
                      title: uniqueMsgErr,
                      message: error.response.data.Data,
                      type: 'error'
                    })
                  }
                }
              } else {
                self.$onError(error)
              }
            })
          }
          if (basicAuth !== null || window.vueAuth.getToken()) { // TODO: If in Dev
              // OK we got a username / password...
            fctRefresh()
          } else {
              // Not logged in, but maybe we have an ssh key ?
            self.$httpApi.get(window.apiUrl + '/sshkeys?action=test&loc=app').then((response) => {
              if (response.data.Data.indexOf('SSH Is Valid') >= 0) {
                fctRefresh()
                state.repoState.sshKeyMissing = false
              } else {
                state.isLoaded = true
                self.$store.commit(types.REPO_STATE_UPATE, 6) // No SSH Key ?
              }
            })
            .catch((error) => {
              window.vm.$store.commit('REFRESH_SETTINGS', state) // we still want to refresh settings, for offline version...
              state.repoState.sshKeyMissing = true
              if (error && error.response && error.response.status === 504) {
                state.isLoaded = true
                self.$store.commit(types.REPO_STATE_UPATE, 0) // all good
                state.inet = false
              } else {
                state.isLoaded = true
                self.$store.commit(types.REPO_STATE_UPATE, 6) // all good
                state.isLoaded = true
              }
            })
          }
          // refreshSettings()
        }
      })
      .catch((error) => {
        try {
          state.isLoaded = true
          if (error.response && error.response.status === 500) {
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
  origState,
  mutations
}
