
import * as types from './mutation-types'

export const toggleSidebar = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR, opened)

export const toggleSidebartwo = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR_TWO, opened)

export const toggleSidebarHtmlData = ({ commit }, json) => commit(types.TOGGLE_SIDEBAR_TWO_DATA, json)

export const toggleRepoState = ({ commit }, newState) => commit(types.REPO_STATE_UPATE, newState)
export const toggleRepo = ({ commit }, newState) => commit(types.REPO_UPATE, newState)
export const toggleRepoUrl = ({ commit }, newState) => commit(types.REPO_URL_UPDATE, newState)

export const selectWebsite = ({ commit }, item) => commit(types.SELECT_WEBSITE, item)

export const saveNewSettings = ({ commit }, item) => commit(types.SITE_SETTING_SAVE, item)

export const toggleDevice = ({ commit }, device) => commit(types.TOGGLE_DEVICE, device)

export const logOut = ({ commit }, vue) => commit(types.LOGOUT, vue)

const refreshSettings = (state) => {
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
}

const refreshConfig = (state) => {
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

        refreshSettings()
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

export const selectPost = ({ commit }, obj) => {
  if (obj.item) {
    obj.item.selected = true
    commit(types.SELECT_POST, obj.item)
    // TOOD: What about :1313/ replacement variables ???
    obj.vue.$bus.$emit('updateEditFrame', obj.item.link.replace('localhost:1313/', 'localhost:8081/'))
  }
}

export const expandMenu = ({ commit }, menuItem) => {
  if (menuItem) {
    menuItem.expanded = menuItem.expanded || false
    commit(types.EXPAND_MENU, menuItem)
  }
}

export const switchEffect = ({ commit }, effectItem) => {
  if (effectItem) {
    commit(types.SWITCH_EFFECT, effectItem)
  }
}

export const refreshUser = ({ commit }, obj) => {
  var vue = obj.vue
  var callback = obj.callback
  var state = vue.$store.state
  var self = vue
  if (!state.app.website) {
    // Local Dev Version
    window.localStorage.removeItem('selectedWebsite')
    window.localStorage.removeItem('selectedProject')

    if (!state.app.isLoaded) {
      let raw = state.github || window.localStorage.getItem('github')
      if (typeof raw === 'string') {
        state.github = JSON.parse(raw)
      } else {
        state.github = raw
      }
      // var $gitobj = this.$github

      state.app.sidebarglobal.opened = false
      state.app.sidebarglobal.hidden = true

      state.app.sidebar.opened = true
      state.app.sidebar.hidden = false
      // self.selectWebsite()
      refreshConfig(state)
      state.app.isLoaded = true
    }
  } else {
    // Hosted Version
    if (state.session && state.session.token) {
      var h = { 'Authorization': 'Bearer ' + state.session.token }
      // request it with headers an param
      vue.$http.get(window.websiteapiUrl + '/customer/v1/websites/me',
        {
          headers: h
        }
      ).then((response) => {
        var lstProjects = response.data.projects
        var defProject = response.data.defaultProject
        if (state.app.project && state.project.app.projectId) {
          if (!(lstProjects.hasOwnProperty(state.app.project.projectId))) {
            state.app.project = null
          }
        }
        if (defProject === null || defProject === undefined) {
          defProject = null
        }
        if (state.app.project == null) {
          if (defProject !== null) {
            // fetch default project...
            vue.$http.get(window.websiteapiUrl + '/api/projects/v1/' + defProject,
              {
                headers: h
              }
            ).then((projectDefinitionResponse) => {
              state.app.project = projectDefinitionResponse.data
              if (state.app.websiteId === null) {
                if (state.app.project.websites.hasOwnProperty(window.localStorage.getItem('selectedWebsite'))) {
                  state.app.websiteId = window.localStorage.getItem('selectedWebsite')
                  state.app.projectId = window.localStorage.getItem('selectedProject')
                  window.vm.$store.commit('SELECT_WEBSITE', {projectId: state.app.projectId, websiteId: state.app.websiteId})
                  // self.$store.commit('selectWebsite')// (state)
                }
              }
              if (state.app.websiteId !== null) {
                if (!state.app.isLoaded) {
                  let raw = state.github || window.localStorage.getItem('github')
                  if (typeof raw === 'string') {
                    state.github = JSON.parse(raw)
                  } else {
                    state.github = raw
                  }
                  state.app.sidebarglobal.opened = false
                  state.app.sidebarglobal.hidden = true

                  state.app.sidebar.opened = true
                  state.app.sidebar.hidden = false
                  setTimeout(function () {
                    refreshConfig(state)
                    state.app.isLoaded = true
                  }, 400)
                }
              }
              if (callback) {
                callback()
              } else {
              }
              state.app.isLoaded = true
            }).catch((error) => {
              var msg = ''
              if (error.response && error.response.data) {
                msg = error.response.data.errorMessage
              }
              self.$notify({
                title: 'error retreiving project.',
                message: msg,
                type: 'danger'
              })
              if (callback) {
                callback()
              } else {
              }
              state.app.isLoaded = true
            })
          } else {
            window.localStorage.removeItem('selectedWebsite')
            window.localStorage.removeItem('selectedProject')
            if (callback) {
              callback()
            } else {
            }
            state.app.isLoaded = true
          }
        } else {
          window.localStorage.removeItem('selectedWebsite')
          window.localStorage.removeItem('selectedProject')

          if (callback) {
            callback()
          }
          state.app.isLoaded = true
        }
      })
      .catch((error) => {
        window.localStorage.removeItem('selectedWebsite')
        window.localStorage.removeItem('selectedProject')
        var msg = ''
        if (error.response && error.response.data) {
          msg = error.response.data.errorMessage
        }
        if (msg.indexOf('Token is invalid') >= 0) {
          this.$store.commit('clearSession')
        } else {
          self.$notify({
            title: 'error retreiving account.',
            message: msg,
            type: 'danger'
          })
        }
        window.localStorage.removeItem('selectedWebsite')
        window.localStorage.removeItem('selectedProject')
        if (callback) {
          callback()
        }
        state.app.isLoaded = true
      })
    }
  }
}
