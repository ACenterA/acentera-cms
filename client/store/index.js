import Vue from 'vue'
import Vuex from 'vuex'
import pkg from 'package'
import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

import app from './modules/app'
import menu from './modules/menu'
import menuglobal from './modules/menuglobal'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: false, // true,  // process.env.NODE_ENV !== 'production',
  actions,
  getters,
  modules: {
    app,
    menu,
    menuglobal
  },
  state: {
    isAuthenticated: false,
    pkg,
    // projectId: null,
    github: window.localStorage.getItem('github') || {},
    bitbucket: window.localStorage.getItem('bitbucket') || {},
    session: JSON.parse(window.localStorage.getItem('session')) || null,
    // project: null,
    website: false,
    projectSelected: false,
    languages: [],
    currentLanguge: '',
    translateLanguage: '',
    moduleList: [],
    rows: [],
    translateMode: false,
    editorStart: null,
    editorElement: null,
    editorElementDynamic: null,
    editorElementStable: null
  },
  mutations
})

export default store
