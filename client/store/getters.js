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
const session = state => state.session
const repoState = state => state.app.repoState
const github = state => state.github

export {
  pkg,
  app,
  device,
  sidebar,
  sidebartwo,
  effect,
  menuitems,
  componententry,
  session,
  github,
  repoState
}
