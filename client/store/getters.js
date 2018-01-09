const pkg = state => state.pkg
const app = state => state.app
const device = state => state.app.device
const sidebar = state => state.app.sidebar
const sidebartwo = state => state.app.sidebartwo
const effect = state => state.app.effect
const menuitems = state => state.menu.items
const componententry = state => {
  return state.menu.items.filter(c => c.meta && c.meta.label === 'Components')[0]
}
const isWebsite = state => (state.website === true || state.app.website === true)
const session = state => state.session
const repoState = state => state.app.repoState
const github = state => state.github
const websiteAndNotLoggedIn = state => {
  console.log('test a')
  console.log(state.website)
  console.log('testb')
  console.log(state.session)
  return state.website && !state.session
}
const projectSelected = state => {
  return !state.website
}

export {
  pkg,
  app,
  device,
  sidebar,
  sidebartwo,
  websiteAndNotLoggedIn,
  isWebsite,
  projectSelected,
  effect,
  menuitems,
  componententry,
  session,
  github,
  repoState
}
