const uuid = require('uuid')

export const setSession = (state, session) => {
  state.session = session
}

export const clearSession = (state, origState) => {
  this.clearGit(state)

  // website only
  if (state.app.website) {
    var newState = JSON.parse(JSON.stringify(origState))
    for (var key in newState) {
      state.app[key] = newState[key]
    }
    window.localStorage.removeItem('session')
    state.projectSelected = null
    state.session = null
    state.app.project = null
    state.app.projectId = null
    state.app.websiteId = null

    state.app.sidebar.hidden = true
    state.app.sidebar.opened = false
    state.app.sidebartwo.hidden = true
    state.app.sidebartwo.opened = false
    state.app.sidebarglobal.hidden = true
    state.app.sidebarglobal.opened = false

    window.location.href = '/'
  }
  // Send logout of social account ...
  state.app.github = {} // reset ...
  if ((window.vueAuth.getToken())) {
    window.vueAuth.logout()
  }
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
  state.app.projectId = val
}
export const setWebsiteIdForCreation = (state, val) => {
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
  if (state.repoSstate) {
    if (state.repoSstate.updating) {
      state.repoState.updating = 0 // well it will refresh on next login..
    }
  }

  /*
  if (state.github) {
    if (state.github.logininfo) {
      state.github = {}
    }
  }
  */
  state.github = {}
  if ((window.vueAuth.getToken())) {
    window.vueAuth.logout()
  }
}

export const setLanguage = (state, val) => {
  state.languages = val
}

export const toggleViewMenu = (state, val) => {
  if (state.app) {
    state.app.viewMenu = val
  } else {
    state.viewMenu = val
  }
  if ($('.right-click-menu').length > 0) {
    if (val) {
      $('.right-click-menu').show()
      $('.right-click-menu').focus()
    } else {
      $('.right-click-menu').hide()
      // $('.right-click-menu')[0].style.display = 'hidden'
    }
  }
}

export const toggleViewPos = (state, val) => {
  if (state.app) {
    state.app.viewMenuPos = val
  } else {
    state.viewMenuPos = val
  }
}

export const toggleViewMenuType = (state, val) => {
  if (state.app) {
    state.app.viewMenuType = val
  } else {
    state.viewMenuType = val
  }
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

export const resetRow = (state, r, i) => {
  state.rows = []
}

export const addRow = (state, r, i) => {
  const tmp = JSON.parse(JSON.stringify(r))
  tmp.index = uuid.v1()
  if (isNaN(i)) {
    state.rows.push(tmp)
  } else {
    state.rows.splice(i, 0, tmp)
  }
  window.vm.$plekanEvent.onAdd(tmp)
}

export const updateRows = (index, row) => {
  const tmp = JSON.parse(JSON.stringify(this.state.rows))
  tmp[index] = row
  this.state.rows = tmp
  window.vm.$plekanEvent.onUpdate(tmp, index)
}

export const deleteRow = (r, i) => {
  const tmp = this.state.rows.splice(i, 1)
  window.vm.$plekanEvent.onDelete(tmp, i)
}

export const deleteAllRows = (state, r, i) => {
  if (state && state.rows) {
    var tmp = state.rows.shift()
    while (!(tmp === null || tmp === undefined)) {
      window.vm.$plekanEvent.onDelete(tmp, 0)
      tmp = state.rows.shift()
    }
    window.hasProcessed = false
  }
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

  let left
  let top
  let width
  let gb
  let tw
  let th

  const d = document.getElementsByTagName('iframe')[0].contentWindow.document
  window.editorElement = document.querySelector('.plekan-editor')
  window.editorElementDynamic = document.querySelector('.dynamic-editor')
  window.editorElementStable = document.querySelector('.stable-editor')

  if (window.editorElementDynamic) {
    tw = window.editorElementDynamic.clientWidth
    th = window.editorElementDynamic.clientHeight
  }

  state.sel = null
  const bus = this.$bus || window.$bus

  bus.$on('removeSelectionEditor', () => {
    // //console.error('remove selection')
  })

  /* eslint-disable */
  bus.$on('contextMenuEvent', (evtInfo) => {
    evtInfo.detail.preventDefault()
    const el = evtInfo.detail.target // window.selo.selection.focusNode.parentNode

    // Well do not show menu
    var parents = window.tempHelper.getParents($(el))
    var targetEl = $(el)[0]
    var viewMenuType = null
    var attrContentEditableIdx = -1 // el.attributes.indexOf('contenteditable')
    for (var i = targetEl.attributes.length - 1; i >= 0; i--) {
      if (targetEl.attributes[i].name === 'contenteditable') {
        attrContentEditableIdx = i
        break
      } else if (targetEl.attributes[i].name === 'show-editor-menu') {
        attrContentEditableIdx = i
        break
      }
    }

    if (attrContentEditableIdx === -1) {
      // Not found lets find closet parent...
      var findParentObject = $(el).parents('[show-editor-menu]')
      if (findParentObject.length >= 1) {
        targetEl = findParentObject[0]
        for (var i = targetEl.attributes.length - 1; i >= 0; i--) {
          if (targetEl.attributes[i].name === 'show-editor-menu') {
            attrContentEditableIdx = i
            break
          }
        }
      }
    }

    if (attrContentEditableIdx !== -1) {
      // //console.error('THIS WAS A VALID CONTEXT MENU')
    } else {
      // Not a valid contextmenu option
      return
    }

    viewMenuType = {
      el: targetEl,
      type: targetEl.attributes[attrContentEditableIdx].value
    }

    if (('' + viewMenuType.type) !== 'false') {
      window.vm.$store.commit('toggleViewMenu', true)

      var tmpLeft = evtInfo.detail.pageX || 0
      var tmpTop = evtInfo.detail.pageY || 0

      var tmpOffset = $('.plekan-outerdiv')
      tmpOffset = $(el).offset()

      var target_body = $(el).parents('body')

      tmpTop -= target_body.scrollTop()

      // TODO: If position is > than window - 200px compute tmpLeft -= 200 (to mmake sure )
      // context menu doesnt go out of screen
      // if (tmpLeft >= winW-200 ) {
      // }

      window.vm.$store.commit('toggleViewPos', { top: tmpTop, left: tmpLeft })
      window.vm.$store.commit('toggleViewMenuType', viewMenuType)

      // $('.right-click-menu')[0].style.display = 'block'
      $('.right-click-menu')[0].style.top = tmpTop + 'px'
      $('.right-click-menu')[0].style.left = tmpLeft + 'px'
    }
  })
  /* eslint-enable */

  /* eslint-disable */
  bus.$on('selectionEnd', () => {
    if (!window.blogeditor) {
      return
    }

    const el = window.selo.selection.focusNode.parentNode

    var attrContentEditableIdx = -1 // el.attributes.indexOf('contenteditable')
    for (var i = el.attributes.length - 1; i >= 0; i--) {
      if (el.attributes[i].name === 'contenteditable') {
        attrContentEditableIdx = i
      }
    }

    if (attrContentEditableIdx !== -1) {
      if (('' + el.attributes[attrContentEditableIdx].value) === 'false') {
        return
      }
    }

    window.editorElementDynamic.classList.add('active')
    window.editorElementStable.classList.add('active')
    try {
      document.querySelector('.create-link').classList.remove('active')
    } catch (e) {
    }
    // This operation disabled overflow for  out of window

    let _left = left + width / 2 - tw / 2
    let _top = top - th

    _left = _left <= 10 ? 10 : _left
    _top = _top <= 10 ? 10 : _top

    const possibleLeft = window.innerWidth - tw - 10

    _left = _left > possibleLeft ? possibleLeft : _left

    var oldTmpTop = $(d).scrollTop()
    window.editorElementDynamic.style.top = `${_top}px`
    window.editorElementDynamic.attributes['top'] = `${_top}`
    window.editorElementDynamic.attributes['scrolltop'] = `${oldTmpTop}`


    var iframe = $('.arenatest').filter(function () {
      var iframe_body = $(this).contents().find('body')
      return iframe_body.get(0)
    })
    var iframeLeft = $(iframe).offset().left - 30 // - $(d).scrollLeft() + $(oldTarget).offset().left - $(d).scrollLeft()
    var iframeTop= 100 + $(iframe).offset().top
    window.editorElementStable.style.top = `${iframeTop}px`
    window.editorElementStable.style.left = `${iframeLeft}px`
    window.editorElementStable.attributes['top'] = `${_top}`
    window.editorElementStable.attributes['scrolltop'] = `${oldTmpTop}`

    setActiveEditorButtons()
    state.sel = window.selo.saveSelection()
  })
  /* eslint-enable */

  bus.$on('removeSelectionEditor', () => {
    window.editorElementDynamic.classList.remove('active')
    window.editorElementStable.classList.remove('active')
  })

  bus.$on('selectionStart', () => {
    // const d = document.getElementsByTagName('iframe')[0].contentWindow.document
    // gb = d.getBoundingClientRect
    gb = window.selo.getPositionRange().getBoundingClientRect
    // window.editorElementDynamic.style.left = `${calc.width / 2 + calc.left - editButtonWidth / 2}px`
    // aaaa

    left = gb.left
    top = gb.top
    width = gb.width

    if (window.editorElementDynamic.className.indexOf('active') === -1) {
      var tmpOffset = $('.plekan-outerdiv')
      if (tmpOffset && tmpOffset[0]) {
        left += tmpOffset[0].offsetLeft
        top += tmpOffset[0].offsetTop
      }

      window.editorElementDynamic.style.left = `${left + width / 2 - tw / 2}px`
      window.editorElementDynamic.style.top = `${top - th}px`
    }
    state.sel = window.selo.saveSelection()
  })

  bus.$on('selectionBeforeStart', () => {})
}
