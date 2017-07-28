import * as types from './mutation-types'

export const toggleSidebar = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR, opened)

export const toggleSidebartwo = ({ commit }, opened) => commit(types.TOGGLE_SIDEBAR_TWO, opened)

export const toggleSidebarHtmlData = ({ commit }, json) => commit(types.TOGGLE_SIDEBAR_TWO_DATA, json)

export const toggleRepoState = ({ commit }, newState) => commit(types.REPO_STATE_UPATE, newState)
export const toggleRepoUrl = ({ commit }, newState) => commit(types.REPO_URL_UPATE, newState)

export const toggleDevice = ({ commit }, device) => commit(types.TOGGLE_DEVICE, device)

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
