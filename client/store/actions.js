
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
    commit(types.SELECT_POST, obj.item)
    // TOOD: What about :1313/ replacement variables ???

    console.error('OBJ ITEM TEST')
    console.error(obj.item)
    console.error(obj.item.link)
    if (obj.item.link.indexOf('localhost:') >= 0 && obj.item.link.indexOf('localhost:') <= 8) {
      obj.vue.$bus.$emit('updateEditFrame', obj.item.link.replace('localhost:1313/', 'localhost:8081/'))
    } else {
      obj.vue.$bus.$emit('updateEditFrame', window.goHostUrl + obj.item.link)
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
    console.error('select website 01')
    if (state.session && state.session.token) {
      var h = { 'Authorization': 'Bearer ' + state.session.token }
      // request it with headers an param
      console.error('select website 02')
      vue.$http.get(window.websiteapiUrl + '/customer/v1/websites/me',
        {
          headers: h
        }
      ).then((response) => {
        console.error('select website 03')
        var lstProjects = response.data.projects
        var defProject = response.data.defaultProject
        if (state.app.project && state.project.app.projectId) {
          if (!(lstProjects.hasOwnProperty(state.app.project.projectId))) {
            state.app.project = null
          }
        }
        console.error('select website 04')
        if (defProject === null || defProject === undefined) {
          defProject = null
        }
        console.error('select website 05')
        if (state.app.project == null) {
          if (defProject !== null) {
            console.error('select website 06')
            // fetch default project...
            vue.$http.get(window.websiteapiUrl + '/api/projects/v1/' + defProject,
              {
                headers: h
              }
            ).then((projectDefinitionResponse) => {
              console.error('select website 07')
              state.app.project = projectDefinitionResponse.data
              if (state.app.websiteId === null) {
                if (state.app.project.websites.hasOwnProperty(window.localStorage.getItem('selectedWebsite'))) {
                  console.error('select website 08')
                  state.app.websiteId = window.localStorage.getItem('selectedWebsite')
                  state.app.projectId = window.localStorage.getItem('selectedProject')
                  console.error('select website 09')
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
                  refreshConfig(state)
                  // state.app.isLoaded = true
                  console.error('gry loaded 2')
                }
              } else {
                state.app.isLoaded = true
              }
              if (callback) {
                callback()
              }
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
              console.error('gry loaded 4?')
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
            console.error('gry loaded 7?')
            state.app.isLoaded = true
          }
        } else {
          window.localStorage.removeItem('selectedWebsite')
          window.localStorage.removeItem('selectedProject')

          if (callback) {
            callback()
          }

          console.error('gry loaded 8?')
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
        console.error('gry loaded 9a?')
        state.app.isLoaded = true
      })
    }
  }
}
