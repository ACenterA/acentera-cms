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

const DEFAULT_CONTENT = '<div contenteditable="true">DEFAULT</div>'

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
    Object.keys(ct).map((e) => {
      ct[e].contentEditable = true
      return true
    })

    /**
    * Initial html content
    */
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

    /**
    * Editable arena event set
    */
    console.error(' THIS SET EDITABLE... MAYBE TOO FAST??')
    this._setEditable()
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

    var se = this
    console.error(se)
    console.error(se.$el)
    se.exec_body_scripts(se.$el, 'CMSEDITOR')
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
  updated () {
    try {
      console.error('SET EDITABLE... A')
      console.error(this)
      this._setEditable()
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
    exec_body_scripts (bodyElement, tag) {
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
            var loadTrigger = "try {if ($ !== undefined) { $(window).trigger('load'); } } catch (e) { }"

            const d = document.getElementsByTagName('iframe')[0].contentWindow.document
            const head = d.getElementsByTagName('head')[0] || d.documentElement

            const script = d.createElement('script')
            script.type = 'text/javascript'
            script.setAttribute('id', 'CUSTOM_END')
            script.appendChild(d.createTextNode(loadTrigger))
            console.error(script)
            head.appendChild(script)
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
