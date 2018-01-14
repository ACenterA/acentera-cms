const uuid = require('uuid')

export const setSession = (state, session) => {
  state.session = session
}

export const clearSession = (state, origState) => {
  console.error('clear session here')
  console.error(state)
  state.projectSelected = null
  state.session = null
  console.error('SET PROJECT ID TO null')
  state.app.project = null
  state.app.projectId = null
  state.app.websiteId = null
  this.clearGit(state)
  window.localStorage.removeItem('session')
//  window.localStorage.removeItem('selectedWebsite')
//  window.localStorage.removeItem('selectedProject')
  var newState = JSON.parse(JSON.stringify(origState))
  console.error('revert to')
  console.error(newState)

  for (var key in newState) {
    console.error('will set ' + key + ' to ' + newState[key])
    state.app[key] = newState[key]
  }

  // state.app.isLoaded = false
  // state.app.isLoaded = false
  console.error('HIDE SIDEBAR')
  state.app.sidebar.hidden = true
  state.app.sidebar.opened = false
  state.app.sidebartwo.hidden = true
  state.app.sidebartwo.opened = false
  state.app.sidebarglobal.hidden = true
  state.app.sidebarglobal.opened = false

  window.location.href = '#/'
}

export const setInet = (state, val) => {
  state.app.inet = val
}

export const isLoaded = (state, val) => {
  state.app.isLoaded = val
}

export const setWebsite = (state, val) => {
  state.app.website = val
}
export const setProjectSelected = (state, val) => {
  state.app.projectSelected = val
  state.app.projectId = val.projectId
}

export const setProjectIdForCreation = (state, val) => {
  console.error(state)
  console.error('SET PROJECT ID TO ' + val)
  state.app.projectId = val
}
export const setWebsiteIdForCreation = (state, val) => {
  console.error('SET WEBSITE ID TO ' + val)
  console.error(state)
  state.app.websiteId = val
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

export const setLanguage = (state, val) => {
  state.languages = val
}

export const setRows = (state, val) => {
  state.rows = val
}

export const moduleList = (state, val) => {
  state.moduleList = val
}

export const addModuleList = (state, val) => {
  state.moduleList.push(val)
}

export const currentLanguge = (state, val) => {
  state.currentLanguge = val
}

export const translateLanguage = (state, val) => {
  state.translateLanguage = val
}

export const init = (type, data) => {
  this.state[type] = data
}

export const addRow = (state, r, i) => {
  console.error('addRow')
  console.error(r)
  console.error(i)

  const tmp = JSON.parse(JSON.stringify(r))
  tmp.index = uuid.v1()
  console.error('add row here 01111')
  if (isNaN(i)) {
    console.error('add row here 01111 a')
    state.rows.push(tmp)
    console.error('add row here 01111 b')
  } else {
    state.rows.splice(i, 0, tmp)
  }

  console.error('add row here 01111 c')
  console.error('addlkjflsdkjflka lrROW')
  console.error(window.vm)
  window.vm.$plekanEvent.onAdd(tmp)
}

export const updateRows = (index, row) => {
  console.error('add row here 01111 GG')
  const tmp = JSON.parse(JSON.stringify(this.state.rows))
  tmp[index] = row
  this.state.rows = tmp
  console.error(window.vm)
  window.vm.$plekanEvent.onUpdate(tmp, index)
}

export const deleteRow = (r, i) => {
  const tmp = this.state.rows.splice(i, 1)
  window.vm.$plekanEvent.onDelete(tmp, i)
}

export const dublicateRow = (r, i) => {
  this.addRow(r, i)
  window.vm.$plekanEvent.onDuplicate(r, i)
}

export const sortRows = (_new, old) => {
  this.state.rows.move(old, _new)
  window.vm.$plekanEvent.onSort(_new, old)
  //
}

export const changeTranslateMode = () => {
  this.state.translateMode = !this.state.translateMode
}

import Selo from 'selo'
import { setActiveEditorButtons } from '../plekan/src/helper'
import store from '../store'

export const editorStart = (state) => {
  console.error('editor Start ....... ')
  console.error(document.getElementsByTagName('iframe')[0].contentWindow)
  console.error('bus is')
  console.error(window.$bus)

  console.error(window.VueApp.$store)
  window.selo = new Selo({
    els: '[contenteditable]', // if you don't set el property, this property set as body by Selo
    iframe: document.getElementsByTagName('iframe')[0].contentDocument,
    window: document.getElementsByTagName('iframe')[0].contentWindow,
    bus: this.$bus || window.$bus,
    log: true // if you don't want to see log you can pass log:true
  })
  if (store !== null) {
    if (Selo !== undefined) {

    }
  }

  console.error('editor Start A....... ')
  let left
  let top
  let width
  let gb
  let tw
  let th

  const d = document.getElementsByTagName('iframe')[0].contentWindow.document
  console.error('aazz3 ')
  console.error(d)
  console.error('editor Start B ....... ')
  window.editorElement = document.querySelector('.plekan-editor')
  window.editorElementDynamic = document.querySelector('.dynamic-editor')
  window.editorElementStable = document.querySelector('.stable-editor')

  if (window.editorElementDynamic) {
    tw = window.editorElementDynamic.clientWidth
    th = window.editorElementDynamic.clientHeight
  }

  state.sel = null
  console.error('document is.... test')
  console.error(document)
  console.error(d)
  const bus = this.$bus || window.$bus

  bus.$on('removeSelectionEditor', () => {
    console.error('remove selection')
  })

  bus.$on('selectionEnd', () => {
    console.error('selectionEND add event.. start')
    window.editorElementDynamic.classList.add('active')

    // This operation disabled overflow for  out of window

    let _left = left + width / 2 - tw / 2
    let _top = top - th

    _left = _left <= 10 ? 10 : _left
    _top = _top <= 10 ? 10 : _top

    const possibleLeft = window.innerWidth - tw - 10

    _left = _left > possibleLeft ? possibleLeft : _left

    window.editorElementDynamic.style.left = `${_left}px`
    window.editorElementDynamic.style.top = `${_top}px`

    setActiveEditorButtons()
    state.sel = window.selo.saveSelection()
  })

  bus.$on('removeSelectionEditor', () => {
    window.editorElementDynamic.classList.remove('active')
  })

  bus.$on('selectionStart', () => {
    console.error('selectionSTart add event.. start')
    gb = window.selo.getPositionRange().getBoundingClientRect

    left = gb.left
    top = gb.top
    width = gb.width

    if (window.editorElementDynamic.className.indexOf('active') === -1) {
      window.editorElementDynamic.style.left = `${left + width / 2 - tw / 2}px`
      window.editorElementDynamic.style.top = `${top - th}px`
    }
    state.sel = window.selo.saveSelection()
  })

  console.error('editor Start CCC ....... ')
  console.error(bus)
  bus.$on('selectionBeforeStart', () => {})
}
