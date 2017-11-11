export const setSession = (state, session) => {
  state.session = session
}

export const clearSession = (state) => {
  state.session = null
}

export const setInet = (state, val) => {
  state.app.inet = val
}

export const setGithub = (state, g) => {
  state.github = g
}

export const clearGithub = (state) => {
  state.github = null
}
