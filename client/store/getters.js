const pkg = state => state.pkg
const app = state => state.app
const device = state => state.app.device
const sidebar = state => state.app.sidebar
const sidebarglobal = state => state.app.sidebarglobal
const sidebartwo = state => state.app.sidebartwo
const sidebarblogData = state => state.app.sidebarblogData

const isAuthenticated = state => {
  return window.vueAuth.isAuthenticated()
}

const inBlog = state => {
  return state.app.topbar.show === true
}

const effect = state => state.app.effect
const menuitems = state => state.menu.items
const menuglobalitems = state => state.menuglobal.items

const selectedPost = state => {
  if (state.app.topbar && state.app.topbar.selectedPost) {
    return state.app.topbar.selectedPost
  }
  return null
}

const componententry = state => {
  return state.menu.items.filter(c => c.meta && c.meta.label === 'Components')[0]
}
const isWebsite = state => (state.app.website === true)
const session = state => state.session
const topbar = state => state.app.topbar
const repoState = state => state.app.repoState
const github = state => {
  if (state.github && state.github.logininfo !== null) {
    var url = null
    if (state.app) {
      if (state.app.repoState) {
        url = state.app.repoState.url
      }
    } else {
      if (state.repoState) {
        url = state.repoState.url
      }
    }
    if (url !== null) {
      if (state.github && state.github.logininfo && url.indexOf(state.github.logininfo.type.toLowerCase()) === -1) {
        // Wrong account logged in...
        window.vm.$store.commit('clearGit')
        window.vm.$notify({
          title: 'Must re-login',
          message: 'We have detected wrong account / git access.',
          type: 'warning'
        })
      }
    }
  }
  if (typeof state.github === 'string') {
    return JSON.parse(state.github)
  } else {
    return state.github
  }
}

const websiteAndNotLoggedIn = state => {
  return state.app.website && !state.session
}

const loaded = state => {
  return state.app.isLoaded
}

const getBasicAuth = state => {
  if (window.vm === undefined) {
    return
  }
  var gitobj = window.vm.$github
  if (window.vm.$store.state.github === null || window.vm.$store.state.github === undefined) {
    return null
  }
  if (window.vm.$store.state.github && window.vm.$store.state.github.logininfo && window.vm.$store.state.github.logininfo.type === 'BitBucket') {
    gitobj = window.vm.$bitbucket
  }
  if (!window.vm.$store.state.github || !window.vm.$store.state.github.logininfo || window.vm.$store.state.github.logininfo.pass === '') {
    let raw = window.localStorage.getItem('github')
    if (typeof raw === 'string') {
      window.vm.$store.state.github = JSON.parse(raw)
    } else {
      window.vm.$store.state.github = raw
    }
  }
  if (window.vm.$store.state.github && window.vm.$store.state.github.logininfo) {
    if (window.vueAuth.getToken()) {
      // validate if window.vueAuth.getToken() is same as this.$store.state.github.logininfo.token ??
      gitobj.setToken(window.vueAuth.getToken())
    } else {
      gitobj.setUserPass(window.vm.$store.state.github.logininfo.username, window.vm.$store.state.github.logininfo.pass)
    }
    return gitobj.getBasicAuth()
  } else {
    return ''
  }
}

const isLoggedIn = state => {
  if (state.app.website) {
    if (window.vm.$store.state.session && window.vm.$store.state.session.display_name !== undefined) {
      if (!this.websiteIsGit(state)) { // ok we are logged in the website isn't a git hosted repo
        return true
      }
    }

    if (window.vm.$store.state.session && window.vm.$store.state.session.display_name !== undefined) {
      if (state.github == null || (!(state.github && state.github.logininfo && state.github.logininfo.pass !== ''))) {
        if (state.github && state.github.logininfo && state.github.logininfo.token) {
          return true
        } else {
          return false
        }
      }
      return true
    }
  }
  if (state.github == null) {
    return false
  }
  if (state.github.logininfo == null) {
    return false
  }

  if (state.github.logininfo.token) { // we have a token, oauth login is valid.
    return true
  }

  if (state.github.logininfo.username == null) {
    return false
  }

  if (!(window.vm.$store.state.session === null || window.vm.$store.state.session === undefined)) {
    if (!(window.vm.$store.state.session.display_name === null || window.vm.$store.state.session.display_name === undefined)) {
      return false
    }
  }
  return true
}

const websiteIsGit = state => {
  var selWebsite = selectedWebsite(state)
  if (selWebsite) {
    if (selWebsite.hasOwnProperty('git') && selWebsite.git === 'false') {
      return false
    }
    return true
  }
  return false
}

const selectedWebsite = (state) => {
  if (state.app.project && state.app.project.websites) {
    if ((state.app.websiteId === 'null' || !state.app.websiteId)) {
      return null
    }
    if (state.session && window.localStorage.getItem('session') === null) {
      return null
    }
    return state.app.project.websites[state.app.websiteId]
  }
  // return websiteId if any
  if (state.app.websiteId) {
    return state.app.websiteId
  }
  return null
}

const selectedProject = (state) => {
  if (state.app.project && state.app.project.websites) {
    return state.app.project
  }
  return null
}

const projectSelected = state => {
  return !state.website
}

export {
  pkg,
  app,
  device,
  sidebar,
  sidebarglobal,
  sidebartwo,
  websiteAndNotLoggedIn,
  isWebsite,
  projectSelected,
  selectedProject,
  selectedWebsite,
  effect,
  menuitems,
  menuglobalitems,
  componententry,
  session,
  github,
  repoState,
  isLoggedIn,
  loaded,
  sidebarblogData,
  topbar,
  inBlog,
  selectedPost,
  isAuthenticated,
  getBasicAuth,
  websiteIsGit
}
