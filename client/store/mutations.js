export const setSession = (state, session) => {
  state.session = session
}

export const clearSession = (state) => {
  state.projectSelected = null
  state.session = null
  this.clearGit(state)
  window.localStorage.removeItem('session')
}

export const setInet = (state, val) => {
  state.app.inet = val
}

export const setWebsite = (state, val) => {
  state.website = val
}
export const setProjectSelected = (state, val) => {
  state.projectSelected = val
}

export const setGit = (state, g) => {
  state.github = g
}

export const setDefaultGitProvider = (state, g) => {
  state.default_git_provider = g
}

export const clearGit = (state) => {
  window.localStorage.removeItem('github')
  state.github = null
}
