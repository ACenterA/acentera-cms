
import * as types from './mutation-types'

export const toggleSidebar = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR, opened)

export const toggleSidebartwo = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR_TWO, opened)

export const toggleSidebarHtmlData = ({ commit }, json) => commit(types.TOGGLE_SIDEBAR_TWO_DATA, json)

export const toggleRepoState = ({ commit }, newState) => commit(types.REPO_STATE_UPATE, newState)
export const toggleRepoStatePending = ({ commit }, newState) => commit(types.REPO_STATE_PENDING, newState)
export const toggleRepo = ({ commit }, newState) => commit(types.REPO_UPATE, newState)
export const toggleRepoUrl = ({ commit }, newState) => commit(types.REPO_URL_UPDATE, newState)

export const selectWebsite = ({ commit }, item) => commit(types.SELECT_WEBSITE, item)

export const saveNewSettings = ({ commit }, item) => commit(types.SITE_SETTING_SAVE, item)

export const toggleDevice = ({ commit }, device) => commit(types.TOGGLE_DEVICE, device)

export const logOut = ({ commit }, vue) => commit(types.LOGOUT, vue)

/*
const refreshSettings = (state) => {
  window.vm.$store.commit('REFRESH_SETTINGS', state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})
}
*/

const refreshConfig = (state) => {
  window.vm.$store.commit('REFRESH_CONFIG', state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})
}

export const selectPost = ({ commit }, obj) => {
  if (obj.item) {
    obj.item.selected = true

    window.vm.$store.state.app.selectedItem = null
    if ($('.rightSide').length >= 1) {
      if ($('.rightSide').hasClass('active')) {
        window.vm.$bus.$emit('TOGGLE_ADVANCED_SETTINGS')
      }
    }
    commit(types.SELECT_POST, obj.item)
    // TOOD: What about :1313/ replacement variables ???
    window.vm.$store.state.app.selectedItem = obj

    var selectedLangItem = window.vm.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
    var langPrefix = '/' + selectedLangItem.id
    if (window.vm.$store.state.app.language === window.vm.$store.state.app.languageSelected) {
      langPrefix = '' // no prefix, this is the default site...
    }

    if (obj.item.link.indexOf('localhost:') >= 0 && obj.item.link.indexOf('localhost:') <= 8) {
      if (langPrefix !== '') {
        if (!langPrefix.endsWith('/')) {
          langPrefix += '/'
        }
      }
      obj.vue.$bus.$emit('updateEditFrame', obj.item.link.replace('localhost:1313/', 'localhost:8081/' + langPrefix))
    } else {
      obj.vue.$bus.$emit('updateEditFrame', window.goHostUrl + langPrefix + obj.item.link)
    }
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
      // state.app.isLoaded = true
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
        var hasWebsites = false
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
              if (state.app.project && state.app.project.websites) {
                var websiteLen = Object.keys(state.app.project.websites).length
                if (websiteLen >= 1) {
                  hasWebsites = true
                }
              }

              if (state.app.websiteId === null) {
                if (state.app.project.websites.hasOwnProperty(window.localStorage.getItem('selectedWebsite'))) {
                  state.app.websiteId = window.localStorage.getItem('selectedWebsite')
                  state.app.projectId = window.localStorage.getItem('selectedProject')
                  window.vm.$store.commit('SELECT_WEBSITE', {projectId: state.app.projectId, websiteId: state.app.websiteId})
                  // check for ._router.push({ path }) in case we are in /template ...
                  // We had an error with left sidebar not showing up.. somehow on
                  // a page reload from bookmark
                  if (state.app.websiteId) {
                    if (window.vm._route.path === '/templates') {
                      window.location.href = '/' // vm._router.push({ 'path': '/' })
                      return
                    }
                  }
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
                  // well we are in a selected website (app.websiteId) so lets not show the global menu...
                  state.app.sidebarglobal.opened = false
                  state.app.sidebarglobal.hidden = true

                  state.app.sidebar.opened = true
                  state.app.sidebar.hidden = false
                  refreshConfig(state)
                  // state.app.isLoaded = true
                }
              } else {
                state.app.isLoaded = true
                if (hasWebsites) {
                  // Ok open left menu we got websites..
                  state.app.sidebarglobal.opened = true
                  state.app.sidebarglobal.hidden = false

                  state.app.sidebar.opened = false
                  state.app.sidebar.hidden = true
                } else {
                  state.app.sidebarglobal.opened = false
                  state.app.sidebarglobal.hidden = true
                }
              }
              if (callback) {
                callback()
              }
              /*
              // bad left sidebar... lets reload page instead
              if (state.app.websiteId) {
                if (window.vm._route.path === '/templates') {
                  window.vm._router.push({ 'path': '/' })
                }
              }
              */
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
              refreshConfig(state)
              // state.app.isLoaded = true
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
          // refreshConfig(state)
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
