
import * as types from './mutation-types'

export const toggleSidebar = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR, opened)

export const toggleSidebartwo = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR_TWO, opened)

export const toggleSidebarHtmlData = ({ commit }, json) => commit(types.TOGGLE_SIDEBAR_TWO_DATA, json)

export const toggleRepoState = ({ commit }, newState) => commit(types.REPO_STATE_UPATE, newState)
export const toggleRepo = ({ commit }, newState) => commit(types.REPO_UPATE, newState)
export const toggleRepoUrl = ({ commit }, newState) => commit(types.REPO_URL_UPDATE, newState)

export const selectWebsite = ({ commit }, item) => commit(types.SELECT_WEBSITE, item)

export const toggleDevice = ({ commit }, device) => commit(types.TOGGLE_DEVICE, device)

export const logOut = ({ commit }, vue) => commit(types.LOGOUT, vue)

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
  console.log('aaa selfslkajflak')
  var vue = obj.vue
  var callback = obj.callback
  // console.error(vue)
  // console.error(callback)
  console.log(vue.$store.state)
  var state = vue.$store.state
  var self = vue
  if (state.session && state.session.token) {
    console.log('test sesion 1')
    var h = { 'Authorization': 'Bearer ' + state.session.token }
    // request it with headers an param
    vue.$http.get(window.websiteapiUrl + '/customer/v1/websites/me',
      {
        headers: h
      }
    ).then((response) => {
      console.error('REFRESHSED DATA')
      console.error(response.data)
      console.error('afa')
      var lstProjects = response.data.projects
      var defProject = response.data.defaultProject
      if (state.app.project && state.project.app.projectId) {
        if (!(lstProjects.hasOwnProperty(state.app.project.projectId))) {
          console.error('fafag')
          state.app.project = null
        }
      }
      console.error('ggg')
      if (defProject === null || defProject === undefined) {
        defProject = null
      }
      if (state.app.project == null) {
        console.error('kaka')
        if (defProject !== null) {
          // fetch default project...
          console.error('STATE PROJECT B?')
          vue.$http.get(window.websiteapiUrl + '/api/projects/v1/' + defProject,
            {
              headers: h
            }
          ).then((projectDefinitionResponse) => {
            console.error('got projectDefinitionResponse of ')
            state.app.project = projectDefinitionResponse.data
            // this.$store.commit('clearSession')
            // console.error(state.project
            // state.app.sidebarglobal.opened = true
            // state.app.sidebarglobal.hidden = false

            if (state.app.websiteId === null) {
              if (state.app.project.websites.hasOwnProperty(window.localStorage.getItem('selectedWebsite'))) {
                console.error('TEST SELECT WEBSITE AAAAA')
                state.app.websiteId = window.localStorage.getItem('selectedWebsite')
                state.app.projectId = window.localStorage.getItem('selectedProject')
                self.$store.commit('selectWebsite')// (state)
              }
            }
            console.error('TEST LOADED SITE: ' + state.app.isLoaded)
            if (state.app.websiteId !== null) {
              if (!state.app.isLoaded) {
                console.error('WTFA AA')
                state.app.sidebarglobal.opened = false
                state.app.sidebarglobal.hidden = true

                state.app.sidebar.opened = true
                state.app.sidebar.hidden = false
                state.app.isLoaded = true
              }
            }
            if (callback) {
              console.error('calling callback01')
              callback()
            } else {
              console.error('NOT calling callback01')
            }
            console.error('loaded D')
            state.app.isLoaded = true
          }).catch((error) => {
            console.error('loaded C')
            var msg = ''
            if (error.response && error.response.data) {
              msg = error.response.data.errorMessage
            }
            console.error('ERROR ZZ....')
            console.error(error)
            console.error(error.response)
            self.$notify({
              title: 'error retreiving project.',
              message: msg,
              type: 'danger'
            })
            if (callback) {
              console.error('calling callback02')
              callback()
            } else {
              console.error('NOT calling callback02')
            }
            state.app.isLoaded = true
          })
        } else {
          window.localStorage.removeItem('selectedWebsite')
          window.localStorage.removeItem('selectedProject')
          if (callback) {
            console.error('calling callback02')
            callback()
          } else {
            console.error('NOT calling callback02')
          }
          state.app.isLoaded = true
        }
      } else {
        window.localStorage.removeItem('selectedWebsite')
        window.localStorage.removeItem('selectedProject')
        console.error('here refresh 01')

        if (callback) {
          console.error('calling callback02')
          callback()
        } else {
          console.error('NOT calling callback02')
        }
        console.error('loaded B')
        state.app.isLoaded = true
      }
    })
    .catch((error) => {
      window.localStorage.removeItem('selectedWebsite')
      window.localStorage.removeItem('selectedProject')
      console.error(error.stack)
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
        console.error('calling callback03')
        callback()
      } else {
        console.error('NOT calling callback03')
      }
      console.error('loaded A')
      state.app.isLoaded = true
    })
  }
}
