import Vue from 'vue'
import Vuex from 'vuex'
import pkg from 'package'
import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

import app from './modules/app'
import menu from './modules/menu'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,  // process.env.NODE_ENV !== 'production',
  actions,
  getters,
  modules: {
    app,
    menu
  },
  state: {
    pkg,
    github: window.localStorage.getItem('github') || {},
    bitbucket: window.localStorage.getItem('bitbucket') || {},
    session: JSON.parse(window.localStorage.getItem('session')) || null,
    website: false,
    projectSelected: false
  },
  mutations
})

export default store
