const pkg = state => state.pkg
const app = state => state.app
const device = state => state.app.device
const sidebar = state => state.app.sidebar
const sidebarglobal = state => state.app.sidebarglobal
const sidebartwo = state => state.app.sidebartwo
const sidebarblogData = state => state.app.sidebarblogData
const inBlog = state => {
  if (state.app.repoState && state.app.repoState.updating >= 3) {
    return false
  }
  return state.app.topbar.show === true
}

const effect = state => state.app.effect
const menuitems = state => state.menu.items
const menuglobalitems = state => state.menuglobal.items

const selectedPost = state => {
  console.error('get selected post test a')
  console.error(state)
  console.error(state.app.topbar)
  if (state.app.topbar && state.app.topbar.selectedPost) {
    return state.app.topbar.selectedPost
  }
  return null
}

const componententry = state => {
  return state.menu.items.filter(c => c.meta && c.meta.label === 'Components')[0]
}
const isWebsite = state => (state.website === true || state.app.website === true)
const session = state => state.session
const topbar = state => state.app.topbar
const repoState = state => state.app.repoState
const github = state => state.github
const websiteAndNotLoggedIn = state => {
  console.log('test a')
  console.log(state.app.website)
  console.log('testb')
  console.log(state.session)
  console.error('is website? ' + (state.app.website && !state.session))
  return state.app.website && !state.session
}

const loaded = state => {
  return state.app.isLoaded
}

const getBasicAuth = state => {
  console.error('in GET BASIC AUTH A')
  var gitobj = window.vm.$github
  console.error('in GET BASIC AUTH BB')
  console.error(window.vm.$store.state.github)
  if (window.vm.$store.state.github === null || window.vm.$store.state.github === undefined) {
    return null
  }
  if (window.vm.$store.state.github && window.vm.$store.state.github.logininfo && window.vm.$store.state.github.logininfo.type === 'BitBucket') {
    console.error('in GET BASIC AUTH cc')
    gitobj = window.vm.$bitbucket
  }
  console.error('in GET BASIC AUTH cc AAA')
  if (!window.vm.$store.state.github || !window.vm.$store.state.github.logininfo || window.vm.$store.state.github.logininfo.pass === '') {
    console.error('in GET BASIC AUTH cc BBB')
    console.error('GET OF GITHUB GET 09')
    let raw = window.localStorage.getItem('github')
    console.error('KL SET OF PARRALEL DATA TEST OF.... ')
    console.error(typeof raw)
    console.error('in GET BASIC AUTH cc CCC')
    console.error(raw)
    if (typeof raw === 'string') {
      window.vm.$store.state.github = JSON.parse(raw)
    } else {
      window.vm.$store.state.github = raw
    }
  }
  if (window.vm.$store.state.github && window.vm.$store.state.github.logininfo) {
    gitobj.setUserPass(window.vm.$store.state.github.logininfo.username, window.vm.$store.state.github.logininfo.pass)

    console.error('RETURN OF :' + gitobj.getBasicAuth())
    return gitobj.getBasicAuth()
  } else {
    return null
  }
}

const isLoggedIn = state => {
  if (state.app.website) {
    if (window.vm.$store.state.session && window.vm.$store.state.session.display_name !== undefined) {
      if (state.github == null || (!(state.github && state.github.logininfo && state.github.logininfo.pass !== ''))) {
        return false
      }
      console.error('is loggedin true..')
      // UPDATING GIT TEST
      return true
    }
  }
  console.log('is loggedi n test')
  if (state.github == null) {
    return false
  }
  if (state.github.logininfo == null) {
    return false
  }
  if (state.github.logininfo.username == null) {
    return false
  }

  console.log('is loggedi n test3')
  if (!(window.vm.$store.state.session === null || window.vm.$store.state.session === undefined)) {
    if (!(window.vm.$store.state.session.display_name === null || window.vm.$store.state.session.display_name === undefined)) {
      return false
    }
  }
  console.log('is loggedi n test4')
  return true
}

const selectedWebsite = (state) => {
  console.error('A project selected website?')
  if (state.app.project && state.app.project.websites) {
    if ((state.app.websiteId === 'null' || !state.app.websiteId)) {
      return null
    }

    if (state.session && window.localStorage.getItem('session') === null) {
      return null
    }

    console.error('BBC project website updated using : ?' + state.app.websiteId)
    console.error(state.app.project.websites)

    console.error('return of')
    console.error(state.app.project.websites[state.app.websiteId])
    console.error('update API URL to')
    // TODO: Specify which workspace ???
    window.apiUrl = 'http://' + state.app.websiteId + '.workspace.acentera.com/api'
    window.goHostUrl = 'http://' + state.app.websiteId + '.workspace.acentera.com'

    console.error('update API URL to : ' + window.apiUrl)
    return state.app.project.websites[state.app.websiteId]
  }
  // return websiteId if any
  console.error('website id : ' + state.app.websiteId)
  if (state.app.websiteId) {
    console.error('return of website zzzz......')
    return state.app.websiteId
  }
  console.error('return of website zzzz AA......')
  return null
}

const selectedProject = (state) => {
  console.error('A project selected website?')
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
  getBasicAuth
}
