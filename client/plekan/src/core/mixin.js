/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

/**
 * Mixin plekan'a kayıt edilen her component için gereklidir
 * props : mixin izole olduğu için dışardan alınır
 * store eklentideki global store'dur
 * gösterlicek dil'e göre row içindeki html gösterilir
 * yine gösterilecek dile göre update yapılır
 *
*/
import { hasParent, childOf } from '../../src/helper'
// for editor
// import dynamicObj from './modules/dynamic.vue'
import Vue from 'vue'

const DEFAULT_CONTENT = '<div contenteditable="false">DEFAULT</div>'

export default {
  props: ['store', 'index', 'displayLanguage'],
  data () {
    return {
      DEFAULT_CONTENT,
      _updatable: null
    }
  },
  computed: {
/*
    isHead () {
      return false
    },
*/
    _languages () {
      return this.store.state.languages
    },
    // currentLanguge: function() {
    //     return this.store.state.currentLanguge
    // },
    me () {
      // this.processRows
      return this.store.state.rows[this.index]
    },
    _content () {
      const c = this.me.contents[this.displayLanguage].html
      if (!(c === undefined || c === '')) {
        return c
      }
      if (typeof this.DEFAULT_CONTENT === 'function') {
        return this.DEFAULT_CONTENT()
      }
      return c || this.DEFAULT_CONTENT
    }
  },
  mounted () {
    // Enable content editable
    const ct = this.$el.querySelectorAll('[contenteditable]')
    // var componentName = this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1)

    var se = this

    var parents = $(this.$el).parents()
    window.currentParents = parents
    Object.keys(ct).map((e) => {
      // ct[e].contentEditable = true
      return true
    })

    /**
    * Initial html content
    */
    /*
    this._languages.map((l) => {
      try {
        const html = this.me.contents[l].html
        if (typeof this.DEFAULT_CONTENT === 'function') {
          this.me.contents[l].html = html || this.DEFAULT_CONTENT()
        } else {
          this.me.contents[l].html = html || this.DEFAULT_CONTENT
        }
      } catch (e) {
        const tmp = JSON.parse(JSON.stringify(this.me))

        tmp.contents[l] = {}
        if (typeof this.DEFAULT_CONTENT === 'function') {
          tmp.contents[l].html = this.DEFAULT_CONTENT()
        } else {
          tmp.contents[l].html = this.DEFAULT_CONTENT
        }
        tmp.contents[l].fields = {}

        this.store.updateRows(this.index, tmp)
      }
      return true
    })
    */

    /**
    * Editable arena event set
    */
    // this._setEditable()
    /*
    * Reletad target
    * Source : http://stackoverflow.com/questions/11544554/get-the-clicked-object-that-triggered-jquery-blur-event
    * The childOf function getting from helpers files in project.
    */
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
    document.addEventListener('mousedown', (e) => {
      const target = e.target
      const isModalElement = !!hasParent(target, 'plekan-modal')

      this._updatable =
        childOf(target, window.editorElement) ||
        isModalElement ||
        target.className === 'editor'
    })

    document.addEventListener('mouseup', () => {
      this._updatable = null
    })

    // this.attachEvent()
    this.$bus.$on('domupdated', () => {
      this._updateHTML()
    })

    se.exec_body_scripts(se.$el, 'CMSEDITOR', function () {
      if (!se.IS_EDITABLE()) {
      }
    })
  },
  /* eslint-enable */
  updated () {
    try {
      this._triggerMoveElement()
    } catch (exx) {
    }
  },
  methods: {
    /* eslint-disable */
    _triggerMoveElement: function () {
      var self = this
      var customIterMax = 30;
      var fct = function () {
      try {
        var parents = window.currentParents
        var rootHtml = $(parents[parents.length - 1])
        var componentName = self.$vnode.tag.substr(self.$vnode.tag.indexOf('-awesome') + 1)
        var findElem = $(rootHtml).find('#placeholder-' + componentName)
        if (findElem.length === 1) {
          var theElJq = $(self.$el)
          var theElJqA = $(rootHtml).find('[editor-name=' + componentName +']')
          theElJqA.detach()
          theElJq.detach()
          $(rootHtml).find('#placeholder-' + componentName)[0].replaceWith(theElJq[0])
        }
      } catch (ef) {
        if (customIterMax-- >= 0) {
          setTimeout(function() {
            fct()
          }, 200)
        } else {
        }
      }
      }
      fct()
    },
    updateElementToEditable: function (mainComponentName) {

      var self = window.vm
      //somehow mainCompnentName is always the new element..
      // to update a previous one wem ust check something else first..
      var mainComponentName = null //
      for(var k in window.componentObj) {
        if (mainComponentName === null) {
            mainComponentName = k
        }
      }
      var mainComponentObj = $(window.componentObj[mainComponentName].data())
      var FindElems = mainComponentObj.find('[editor=true]')
      var kkA = null

      if (FindElems.length <= 0) {
        //Ok lets re-attach objects at their right location...
        if (! window.hasProcessed ) {
          window.hasProcessed = true
          kkA = {
              tmpData: htmlContent,
              data: function () {
                return this.tmpData
              },
              editable: function () {
                return true
              }
          }
        }
      }

      var componentName = 'awesomecomponentBody' +  window.ctr++

      if (FindElems.length > 0) {
        var item = FindElems[0]
        var parent = $(item).parent()
        var itm = $(item)
        itm.removeAttr('editor')
        if (itm.attr('parameditable')) {
          itm.attr('contenteditable', 'false')
        } else {
          itm.attr('contenteditable', 'true')
        }
        var htmlContent = itm.outerHTMLEditor()
        itm.attr('tmpName', componentName)
        var ka = $('<div editor-placeholder=true id="placeholder-' + componentName +'"></div>' )
        ka.insertBefore(itm)
        item.remove()

        var mainContentHtml = mainComponentObj.outerHTMLEditor()

        var mainHtmlObj = $('<div>').append(mainComponentObj.clone()).html()
        window.componentObj[mainComponentName].tmpData = mainHtmlObj
        window.componentObj = window.componentObj || {}
        kkA = {
            tmpData: htmlContent,
            data: function () {
              return this.tmpData
            },
            editable: function () {
              return true
            }
        }
      }

      if (kkA) {
        window.blogeditor = true
        window.componentObj[componentName] = kkA
        window.ctr++
        var dynamicObjClone = this.$clone(window.dynamicObjClone)
        const customComponents = [
            {
              'name': componentName,
              'group': 'image',
              'thumbnail': 'https://vuejs.org/images/logo1a.png',
              context: dynamicObjClone,
              newContext: {
                data () {
                  return {
                    gg: function () {
                      return 'test'
                    },
                    nm: function () {
                      return this.me.name
                    },
                    IS_EDITABLE: function () {
                      return false // self.editable() // false
                    },
                    DEFAULT_CONTENT: function () {
                      // return kkA.data() // htmlContent // self.getData01()
                      // data() isnt updated as we use the componentObj object instead for now... due to
                      // we couldnt get it work before :)
                      // someone in local mode this DEFAULT_CONTENT function is not being taken, but the one ffrom the mixins is
                      // that is why we created window.componentObj references ....
                      return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                    }
                  }
                },
                methods: {
                  isHead: function () {
                    return false
                  },
                  getData01: function () {
                    return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                  },
                  editable: function () {
                    return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].editable()
                  },
                  isEditable: function () {
                    return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].editable()
                  },
                  orThisgetData: function () {
                    return htmlContent
                  }
                }
              }
            }
          ]
          window.ctr++

          const oList = customComponents.map(m => {
            // Register Component
            m.contents = m.contents || {}

            self.$store.state.languages.map(l => {
              m.contents[l] = {}
              m.contents[l].html = ""
              m.contents[l].fields = {}

              return true
            })

            try {
              var tt = dynamicObjClone
              if (m.hasOwnProperty('newContext')) {

                // Object.assign(tt,m.context);

                if (m.newContext.hasOwnProperty('data')) {
                  tt['data'] = m.newContext['data']
                }

                try {
                  if (m && m.newContext.hasOwnProperty('methods')) {
                    if (m.newContext.methods) {
                      for (var k in m.newContext.methods) {
                        if (m.newContext.methods && m.newContext.methods.hasOwnProperty[k]) {
                          tt.methods[k] = m.newContext.methods[k]
                          tt[k] = m.newContext.methods[k]
                        }
                      }
                    }
                  }
                } catch (ze) {
                }
                m['name'] = componentName
                Vue.component(m.name, tt)
              } else {
                Vue.component(m.name, Object.assign({}, m.context))
              }
            } catch (f) {
            }

            delete m.context
            return m
          })

          oList.forEach((e) => {
              self.$store.commit('addRow', e, 0)
          })
      }
    },
    _setEditable () {
      this.$el.onfocus = () => {
        if (window.editorElementStable) {
          window.editorElementStable.classList.add('active')
        }
      }
    },
    _updateHTML () {
      this.me.contents['updated_' + this.displayLanguage].html = this.$el.innerHTML.trim() // here updated HTML.. not really used for us..
    },
    exec_body_scripts (bodyElement, tag, completeFct) {
      // TODO: Should this be executed only once all rows got loaded ???

      // Finds and executes scripts in a newly added element's body.
      // Needed since innerHTML does not run scripts.
      //
      // let i = 0;
      // Argument bodyElement is an element in the dom.

      // main section of function
      // if (tag === undefined) tag = 'tmp';

      const self = this
      const scripts = self.walkChildren(bodyElement)

      function evalScript (elem, id, callback) {
        if (elem === undefined || elem === null) {
          return callback()
        }
        const data = (elem.text || elem.textContent || elem.innerHTML || '')
        const d = document.getElementsByTagName('iframe')[0].contentWindow.document
        const head = d.getElementsByTagName('head')[0] || d.documentElement

        const script = d.createElement('script')
        script.type = 'text/javascript'
        if (id !== '') {
          script.setAttribute('id', id)
        }

        if (elem.src !== '') {
          script.src = elem.src
          head.appendChild(script)
          // Then bind the event to the callback function.
          // There are several events for cross browser compatibility.
          script.onerror = function (ezZ) {
            // TODO: Log this error ?
          }
          script.onreadystatechange = callback
          script.onload = callback
        } else {
          try {
            // doesn't work on ie...
            script.appendChild(d.createTextNode(data))
          } catch (e) {
            // IE has funky script nodes
            script.text = data
          }
          head.appendChild(script)
          callback()
        }
      }

      function executeScript (i) {
        const script = scripts[i]
        let tmpTag = (tag || 'tmp')
        tmpTag += '_'
        tmpTag += i
        evalScript(scripts[i], tmpTag, () => {
          if (i < scripts.length - 1) {
            const w = i + 1
            executeScript(w)
          } else {
            // Executed all scripts nice.. lets remove all eventListener and only keep the ones we wants
            // This prevent if a user click on a a href link to change the editor page.. (iframe)
            var loadTrigger = "try {if (window.$ !== undefined) { "

            loadTrigger += " $(window).trigger('load'); "

            loadTrigger += " $('a').each(function( index, item ) { "
            loadTrigger += " var data = window.$._data($(this).get(0), 'events');"
            loadTrigger += " var hadClickFct = true; "
            loadTrigger += " if (data === undefined) { "
            loadTrigger += "   hadClickFct = false; "
            loadTrigger += " } else {"
            loadTrigger += "    data = data['click']; "  // TODO: Validate this .. ? <<-- ??
            loadTrigger += "    if (data === undefined || data.length === 0) { "
            loadTrigger += "       hadClickFct = false; "
            loadTrigger += "    } "
            loadTrigger += " }; "

            var tmpurl = window.goHostUrl;
            var tmpIdx = tmpurl.indexOf("://")
            if (tmpIdx >= 3 && tmpIdx <= 7) {
              tmpurl = tmpurl.substring(tmpIdx+1)
            }
            tmpurl += '/'

            // console.error('OK CHEKC OF :' + tmpurl + "/")
            /*
            loadTrigger += " console.error(' test port: ' + $(item).attr('href') + ' vs " + tmpurl + "');"
            loadTrigger += " console.error(' starts? : ' + ('' + $(item).attr('href')).startsWith('" + tmpurl + "'));"
            loadTrigger += " if (('' + $(item).attr('href')).startsWith('" + tmpurl + "')) {"
            loadTrigger += "   console.error('YES IT DID...'); "
            loadTrigger += "   console.error('YES IT DID and now ...' + ('' + $(item).attr('href').replace('" + tmpurl + "',''))); "
            loadTrigger += "   hadClickFct=true;"
            loadTrigger += " }"
            loadTrigger += " if ( hadClickFct === false ) { "
            */

            loadTrigger += "    $(this).off('click').on('click', function(evt) { evt.preventDefault() } );  "
            // loadTrigger += " } else { "
            // loadTrigger += "    $(this).off('click').on('click', function(evt) { evt.preventDefault() } );  "
            //   loadTrigger += " } "
            loadTrigger += " }); "

            loadTrigger += " } } catch (e) { }"

            // Insert the custom JS ...
            const d = document.getElementsByTagName('iframe')[0].contentWindow.document
            const head = d.getElementsByTagName('head')[0] || d.documentElement

            const script = d.createElement('script')
            script.type = 'text/javascript'
            script.setAttribute('id', 'CUSTOM_END')
            script.appendChild(d.createTextNode(loadTrigger))
            head.appendChild(script)
            completeFct()
          }
        })
      }

      executeScript(0)
    },
    removeAllEventListeners (bodyElement) {
      // I dont think this is used anymore ...
      var items = bodyElement.getElementsByTagName('*')
      for (var i = items.length; i--;) {
        // do stuff

        /* eslint-disable */
        $._data(items[i], 'events')
        /* eslint-enable */

        var attr = $(items[i]).attr('data-toggle')

        // For some browsers, `attr` is undefined; for others,
        // `attr` is false.  Check for both.

        if (typeof attr !== typeof undefined && attr !== false) {
          // $(items[i]).attr('data-toggle','afafafa')
          // alert('must alter this object... to doo data-togle properly but also...')
          /*
          $(items[i]).off('click');
          $(items[i]).on('click', (e) => {
              e.preventDefault();
          });
          items[i].addEventListener('click', (e) => {
              e.preventDefault();
              console.error('clicked on items;');
          });
          */
        }
        /*
        if(items.hasOwnProperty('onclick')) {
        }
        */
      }
    },
    nodeName (elem, name) {
      return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase()
    },
    walkChildren (node) {
      const self = this
      const scripts = []
      const childrenNodes = node.childNodes
      let child
      let i
      let j

      if (childrenNodes === undefined) return
      for (i = 0; i < childrenNodes.length; i++) {
        child = childrenNodes[i]
        if (self.nodeName(child, 'script') &&
          (!child.type || child.type.toLowerCase() === 'text/javascript')) {
          scripts.push(child)
        } else {
          var newScripts = self.walkChildren(child)
          for (j = 0; j < newScripts.length; j++) {
            scripts.push(newScripts[j])
          }
        }
      }

      return scripts
    }
  }
}
