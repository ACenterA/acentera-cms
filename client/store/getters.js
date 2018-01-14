const pkg = state => state.pkg
const app = state => state.app
const device = state => state.app.device
const sidebar = state => state.app.sidebar
const sidebarglobal = state => state.app.sidebarglobal
const sidebartwo = state => state.app.sidebartwo
const effect = state => state.app.effect
const menuitems = state => state.menu.items
const menuglobalitems = state => state.menuglobal.items
const componententry = state => {
  return state.menu.items.filter(c => c.meta && c.meta.label === 'Components')[0]
}
const isWebsite = state => (state.website === true || state.app.website === true)
const session = state => state.session
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

const selectedWebsite = (state) => {
  console.error('A project selected website?')
  if (state.app.project && state.app.project.websites) {
    if ((state.app.websiteId === 'null' || !state.app.websiteId)) {
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
  repoState
}
