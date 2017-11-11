import * as types from '../mutation-types'
// import Vue from 'vue'

const state = {
  inet: true,
  device: {
    isMobile: false,
    isTablet: false
  },
  repoState: {
    updating: -1,
    url: null
  },
  sidebar: {
    opened: false,
    hidden: false
  },
  sidebartwo: {
    opened: false,
    hidden: false,
    json: []
  },
  effect: {
    translate3d: true
  }
}

const mutations = {
  [types.TOGGLE_DEVICE] (state, device) {
    state.device.isMobile = device === 'mobile'
    state.device.isTablet = device === 'tablet'
  },

  [types.TOGGLE_SIDEBAR] (state, opened) {
    if (state.device.isMobile) {
      state.sidebar.opened = opened
    } else {
      state.sidebar.opened = opened
    }
  },

  [types.TOGGLE_SIDEBAR_TWO] (state, opened) {
    state.sidebartwo.opened = opened
  },

  [types.TOGGLE_SIDEBAR_TWO_DATA] (state, data) {
    state.sidebartwo.json = data
  },

  [types.SWITCH_EFFECT] (state, effectItem) {
    for (let name in effectItem) {
      state.effect[name] = effectItem[name]
    }
  },
  [types.REPO_STATE_UPATE] (state, update) {
    // console.log('receiged repo update')
    // console.log(state)
    // Vue.set(state.repoState, 'updating', update)
    var origState = state.repoState
    origState.updating = update
    state.repoState = origState
    //  = update
    // console.log(state)
  },
  [types.REPO_URL_UPATE] (state, update) {
    var tmpUrl = update
    if (('' + update).indexOf('@') > 0) {
      tmpUrl = update.substring(('' + update).indexOf('@') + 1)
    }
    var origState = state.repoState
    origState.url = tmpUrl
    state.repoState = origState
  }
}

export default {
  state,
  mutations
}
