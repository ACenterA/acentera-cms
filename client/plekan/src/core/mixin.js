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
      console.error('this me... here')
      console.error('test return orwa')
      console.error(this.store.state.rows[this.index])
      console.error('lang test')
      console.error(this.displayLanguage)
      // this.processRows
      return this.store.state.rows[this.index]
    },
    _content () {
      console.error('WWW')
      console.error(this)
      console.error(this.getData())
      const c = this.me.contents[this.displayLanguage].html
      console.error('ffff')
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
    console.error('SET MOUNTED HERE A')
    // var componentName = this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1)

    var se = this

    var parents = $(this.$el).parents()
    window.currentParents = parents
    Object.keys(ct).map((e) => {
      console.error('set content editable here aaaa')
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
      console.error('mounted done here 01')
      return true
    })
    */

    /**
    * Editable arena event set
    */
    console.error(' THIS SET EDITABLE... MAYBE TOO FAST??')
    // this._setEditable()
    /*
    * Reletad target
    * Source : http://stackoverflow.com/questions/11544554/get-the-clicked-object-that-triggered-jquery-blur-event
    * The childOf function getting from helpers files in project.
    */
    document.addEventListener('mousedown', (e) => {
      console.error('mouse down of here')
      const target = e.target
      console.error(target)
      const isModalElement = !!hasParent(target, 'plekan-modal')

      this._updatable =
        childOf(target, window.editorElement) ||
        isModalElement ||
        target.className === 'editor'
    })

    document.addEventListener('mouseup', () => {
      console.error('MOUSTe up test')
      this._updatable = null
    })

    // this.attachEvent()
    this.$bus.$on('domupdated', () => {
      console.error('DOM UPDATED TEST??')
      this._updateHTML()
    })

    // if (!found) {

    // }

    console.error(parents)
    console.error(this)
    console.error('a self')
    console.error(this.$el)
    // var found = false
/*
    if (parents.length >= 1) {
      var doc = parents[parents.length - 1]
      // console.error(doc) // $(document.documentElement))// $(this.$el).parents())
      console.error('FID OF #placeholder-' + componentName)
      // document.getElementsByTagName('iframe')[0].contentWindow.document
      // console.error($(doc).find('#placeholder-' + componentName))

      var findElem = $(doc).find('#placeholder-' + componentName)
      if (findElem.length === 1) {
        var theElJq = $(this.$el)
        // var theEl = this.$el)
        $(doc).ready(function () {
          console.error('detaching of')
          theElJq.detach()
          var counter = 0
          // $.each(theElJq, function (index, item) {
          // if (counter++ === 0) {
              // setTimeout(function () {
              // found = true
              $(doc).find('#placeholder-' + componentName)[0].replaceWith(theElJq[0])
              // }, 5000)
            } else {
              console.error('IGNORED OF')
              console.error(theElJq[counter])
            }
          })
        })
      }

    }
    */

    console.error(se)
    console.error(se.$el)
    // se.$bus.$emit('updateElementToEditable', { data: $(se.$el).find('[editor=true]'), component: componentName, obj: se.$el })

    // setTimeout(function () {
    console.error('HAS PROCESSED TEST A')
    // if (window.hasProcessed) {
    //  console.error('HAS PROCESSED TEST YES')
    se.exec_body_scripts(se.$el, 'CMSEDITOR', function () {
      console.error('ok lets update elements... gg')
      // setTimeout(function () {
      // }, 3000)
      console.error('emiting updateElementToEditable for')
      console.error(se.IS_EDITABLE())
      console.error(se)
      if (!se.IS_EDITABLE()) {

      }
    })
    // } else {
    // console.error('HAS PROCESSED TEST NO ' + componentName)
    // this.updateElementToEditable(componentName) // this.$el)
    // this.$bus.$emit('updateElementToEditable', { data: $(this.$el).find('[editor=true]'), component: componentName, obj: this.$el })
    // }
    // }, 1200)
/*
    console.error($(this.$el).find('[editor=true]'))
    console.error($(this.$el).find('[editor=true]').length)
    console.error('emit for editable objects of')
    console.error($(this.$el))
    console.error($(this.$el).find('[editor=true]'))
    */
/*
    setTimeout(function() {

    }, 30000);
*/
    /*
    document.addEventListener(
      'domupdated',
      () => {
        this._updateHTML();
      },
      false,
    );
    */
  },
  /* eslint-enable */
  updated () {
    try {
      console.error('SET EDITABLE... B')

      this._triggerMoveElement()
    } catch (exx) {
      console.error('GOT EXCEPTION SETTING set editable..')
      console.error(this)
      console.error(exx.stack)
    }
    /*
        * Error an image
        *@TODO : Check image
        */
    // var els = document.querySelectorAll("img");

    // Object.keys(els).map(e => {
    //     els[e].addEventListener('error',function () {
    //         els[e].src = "http://www.pressedfortimelincoln.co.uk/wp-content/uploads/2013/05/placeholder1-1024x768.png"
    //     },false);
    // })
  },
  methods: {
    /* eslint-disable */
    _triggerMoveElement: function () {
      console.error(this.$el)
      // console.error(this.$el)
      // return (this.element.attributes.hasOwnProperty('parameditable'))
      // this._setEditable()


      // console.error(.find('[editor-placeholder]'))
      var self = this
      // if (window.hasProcessed) {
      console.error('finding a of')
      console.error(self.$el)
        var fct = function () {

          console.error(self.$el)
          var parents = window.currentParents // $(self.$el).parents()
          var rootHtml = $(parents[parents.length - 1])
          var componentName = self.$vnode.tag.substr(self.$vnode.tag.indexOf('-awesome') + 1)

          var findElem = $(rootHtml).find('#placeholder-' + componentName)
          console.error('finding b')
          if (findElem.length === 1) {
            console.error('FOUND B')
            var theElJq = $(self.$el)
            var theElJqA = $(rootHtml).find('[editor-name=' + componentName +']')
            console.error('detaching of ...')
            console.error(theElJqA)
            theElJqA.detach()
            theElJq.detach()
            $(rootHtml).find('#placeholder-' + componentName)[0].replaceWith(theElJq[0])
          }
        }
        // setTimeout(function () {
        fct()
        //}, 2000)
      // }
    },
    updateElementToEditable: function (mainComponentName) {

      // var data = busData.data
      // var mainComponentName = busData.component
      // var $elObj = busData.obj

      var self = window.vm
      /*
      if (data === undefined || data === null) {
        console.error('received updateElemet of data - failsafe empty')
      }
      if (data.length === 0) {
        console.error('received updateElemet of data - failsafe no data')
      }
      */
      // if (window.hasProcessed) {
      //  console.error('received updateElemet of data - failsafe')
      //  return
      // }
      // window.hasProcessed = true // untill next delete..

      console.error('received updateElemet of data')
      // console.error(data)

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
      console.error('FIND NEW ELEMENTS using')

      var kkA = null

      console.error(window.componentObj[mainComponentName].data())
      if (FindElems.length <= 0) {
        console.error('NO MORE ELEMENTS')
        //Ok lets re-attach objects at their right location...
        // editor-placeholder
        // console.error(this.$el)
        // var parents = $(this.$el).parents()
        // var rootHtml = $(parents[parents.length - 1])
        // console.error('TTTA')
        // console.error($(rootHtml).innerHTML)
        // setTimeout(function () {
          // console.error($(rootHtml).find('[editor-placeholder]'))
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
        // this._triggerMoveElement()
        // }, 2000)
      }

      var componentName = 'awesomecomponentBody' +  window.ctr++

      if (FindElems.length > 0) {
        console.error('FOUND NEW ELEMENTS')
        var item = FindElems[0]
        console.error('replacing of ')
        console.error(item)

        var parent = $(item).parent()
        var itm = $(item)
        itm.removeAttr('editor')
        if (itm.attr('parameditable')) {
          itm.attr('contenteditable', 'false')
        } else {
          itm.attr('contenteditable', 'true')
        }
        console.error('parent test')
        console.error(parent)

        var htmlContent = itm.outerHTMLEditor()

        console.error('adding component of ' + componentName)
        itm.attr('tmpName', componentName)
        console.error('aa replacing of ')
        console.error(item)
        var ka = $('<div editor-placeholder=true id="placeholder-' + componentName +'"></div>' )
        ka.insertBefore(itm)
        // itm.replaceWith('<div id="placeholder-' + componentName +'"></div>' );
        // remove item
        item.remove()

        var mainContentHtml = mainComponentObj.outerHTMLEditor()

        console.error('replacing main component..')
        var mainHtmlObj = $('<div>').append(mainComponentObj.clone()).html()
        console.error(mainHtmlObj)
        window.componentObj[mainComponentName].tmpData = mainHtmlObj
        console.error(mainContentHtml)
        console.error('zz finding of.. ' + componentName)
        console.error(parent.find('#placeholder-' + componentName))
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

                methods: {
                  isHead: function () {
                    return false
                  },
                  getData: function () {
                    return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                  },
                  editable: function () {
                    return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].editable()
                  },
                  isEditable: function () {
                    console.error('isEditable..test')
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
          // console.error(htmlContent)

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

                console.error('geez test new context F ??')
                console.error(m)
                try {
                  if (m && m.newContext.hasOwnProperty('methods')) {
                    if (m.newContext.methods) {
                      for (var k in m.newContext.methods) {
                        if (m.newContext.methods && m.newContext.methods.hasOwnProperty[k]) {
                          console.error('test new context ??')
                          console.error(tt)
                          console.error(tt.methods)
                          console.error('test new context ?? (m)')
                          console.error(m)
                          console.error('test new context ?? (m) a')
                          console.error(m.newContext)
                          console.error('test new context ?? (m) b')
                          console.error(m.newContext.methods)
                          console.error('test new context ?? (m) c')
                          console.error(' tt is 9 a')
                          console.error(tt)
                          console.error(dynamicObjClone)
                          tt.methods[k] = m.newContext.methods[k]
                          console.error('test new context ?? (m) dd')
                          console.error('test new context ?? (m) A')
                          console.error(tt)
                          console.error('test new context ?? (m) F')
                          console.error(m.newContext)
                          tt[k] = m.newContext.methods[k]
                        }
                      }
                    }
                  }
                } catch (ze) {
                  console.error(ze.stack)
                }
                m['name'] = componentName
                Vue.component(m.name, tt)
              } else {
                console.error('A2 - REGISTER NAME A OF ' + m.name)
                Vue.component(m.name, Object.assign({}, m.context))
              }
            } catch (f) {
              console.error(f.stack)
            }

            delete m.context
            return m
          })

          console.error('olist is')
          console.error(oList)
          oList.forEach((e) => {
            // this.$store.commit('addModuleList', e) // weird ?
            // this.store.state.moduleList[0]
            // const tmprow = this.list[rowindex]
            // if (window.ctr <= 2) {
              self.$store.commit('addRow', e, 0)
            // }
          })
      }
    },
    _setEditable () {
      this.$el.onfocus = () => {
        if (window.editorElementStable) {
          window.editorElementStable.classList.add('active')
        }
      }
      /*
      this.$el.onblur = () => {
        if (!this._updatable) {
          this._updateHTML()
          window.editorElementDynamic.classList.remove('active')
          // window.editorElementStable.classList.remove('active')
          // Link content
        }
      }
      */
    },
    _updateHTML () {
      console.error('update html nice')
      console.error(this.me)
      console.error(this.me.contents)
      console.error(this.displayLanguage)
      this.me.contents['updated_' + this.displayLanguage].html = this.$el.innerHTML.trim() // here updated HTML.. not really used for us..
    },
    exec_body_scripts (bodyElement, tag, completeFct) {
      // Finds and executes scripts in a newly added element's body.
      // Needed since innerHTML does not run scripts.
      //
      // let i = 0;
      // Argument bodyElement is an element in the dom.

      // main section of function
      // if (tag === undefined) tag = 'tmp';

      const self = this
      console.error(bodyElement)
      const scripts = self.walkChildren(bodyElement)
      console.error(scripts)

      function evalScript (elem, id, callback) {
        console.error('got elem ')
        console.error(elem)
        console.error(id)
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
          console.error('on scrip ready change... callback for ' + elem.src)
          script.onerror = function (ezZ) {
            console.error(ezZ)
          }
          script.onreadystatechange = callback
          script.onload = callback
        } else {
          try {
            // doesn't work on ie...
            console.error('on scrip ready change create text node for ' + data)
            script.appendChild(d.createTextNode(data))
          } catch (e) {
            // IE has funky script nodes
            console.error('on scrip ready change create text ie node for ' + data)
            script.text = data
          }
          console.error('on scrip ready change create text ie appendchild')
          console.error(script)
          head.appendChild(script)
          callback()
        }
      }

      function executeScript (i) {
        console.error(i)
        const script = scripts[i]
        console.error(script)
        /*
        try {
          if (script.parentNode) { script.parentNode.removeChild(script); }
        } catch (f) {
        }
        */
        let tmpTag = (tag || 'tmp')
        tmpTag += '_'
        tmpTag += i
        evalScript(scripts[i], tmpTag, () => {
          if (i < scripts.length - 1) {
            const w = i + 1
            // executeScript(w);
            executeScript(w)
          } else {
            console.error('executed all scripts nice.. lets remove all eventListener and only keep the ones we wants')
            console.error(document.getElementsByTagName('iframe')[0].contentWindow)
            var loadTrigger = "try {if ($ !== undefined) { console.error('execute load first...'); $(window).trigger('load'); } } catch (e) { }"

            const d = document.getElementsByTagName('iframe')[0].contentWindow.document
            const head = d.getElementsByTagName('head')[0] || d.documentElement

            const script = d.createElement('script')
            script.type = 'text/javascript'
            script.setAttribute('id', 'CUSTOM_END')
            script.appendChild(d.createTextNode(loadTrigger))
            console.error(script)
            head.appendChild(script)
            completeFct()
          }
        })
      }

      executeScript(0)
    },
    removeAllEventListeners (bodyElement) {
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
          console.error('HAS DATA TOGGLE')
          console.error(items[i])
          // $(items[i]).attr('data-toggle','afafafa')
          alert('must alter this object... to doo data-togle properly but also...')
          /*
          $(items[i]).off('click');
          $(items[i]).on('click', (e) => {
              e.preventDefault();
              console.error('override');
          });
          items[i].addEventListener('click', (e) => {
              e.preventDefault();
              console.error('clicked on items;');
              console.error(e);
          });
          */
        }
        /*
        if(items.hasOwnProperty('onclick')) {
          console.error('INDEED');
          console.error(items);
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
