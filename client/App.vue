<template>
  <div id="app">
    <nprogress-container></nprogress-container>
    <navbar :notLoggedIn="websiteAndNotLoggedIn" :selectedWebsite="selectedWebsite" :show="true"></navbar>
    <sidebar :notLoggedIn="websiteAndNotLoggedIn" :selectedWebsite="!selectedWebsite" :show="sidebar.opened && !sidebar.hidden"></sidebar>
    <sidebar-global :hide="sidebarglobal.hidden" :show="sidebarglobal.opened && !sidebarglobal.hidden"></sidebar-global>    
    <app-main :notLoggedIn="websiteAndNotLoggedIn" :hasSidebar="sidebar.opened && !sidebar.hidden" :inBlog="inBlog"></app-main>
    <footer-bar :show="!sidebartwo.opened"></footer-bar>
  </div>
</template>

<script>
import NprogressContainer from 'vue-nprogress/src/NprogressContainer'
import { Navbar, Sidebar, SidebarGlobal, AppMain, FooterBar } from 'components/layout/'
import { mapGetters, mapActions } from 'vuex'

// for editor
import dynamicObj from './plekan/src/core/modules/dynamic.vue'
import Vue from 'vue'

export default {
  components: {
    Navbar,
    Sidebar,
    SidebarGlobal,
    AppMain,
    FooterBar,
    NprogressContainer
  },
  mounted () {
    /* eslint-disable */
    console.error('bus emit test')
    console.error('a')
    this.$bus.$on('updateEditFrame', function (data) {
      var self = window.vm

      // self.$store.commit('resetRows')

      console.error('TEST DELETE ROWS UPDATE ... updateEditFrame using ' + data)
      self.$store.commit('deleteAllRows', 0, 1)
      console.error('TEST DELETE ROWS DONE')

      // TODO: Find something else better than this...
      self.$bus.$emit('destroyDynamicComponent')

      console.error('UPDATE ... updateEditFrame ' + data)
      var currentUrl = data || window.goHostUrl + '/'
      console.error('UPDATE ... updateEditFrame final url ' + currentUrl)
      // if (window.location.href.indexOf('acentera.com') <= -1) {
      //   currentUrl = 'http://localhost:8081/'
      // }

      self.$httpApi.get(currentUrl, { headers: { edit: 1 } }).then((res) => {
        console.error(window.VueApp.$store.state.moduleList)
        var Data = res.data.data.Data

        // console.error(window.data.Data);
        var headStart = Data.indexOf('<head>') + 6
        if (headStart < 7) {
          headStart = Data.toLowerCase().indexOf('<head>') + 6
          if (headStart < 7) {
            // headStart = window.data.Data.toLowerCase().indexOf("doctype html>");
            // alert(headStart);
            // if (headStart <= 10) {
            headStart = Data.toLowerCase().indexOf('<html>') + 6
            //
          }
        }

        if (headStart < 6) {
          headStart = 0
        }

        var headEnd = Data.indexOf('</head>')
        if (headEnd < 0) {
          headEnd = Data.toLowerCase().indexOf('</head>') + 7
        }

        var bodyStartIdx01 = Data.indexOf('<body')
        var bodyStart = Data.indexOf('<body>') + 6
        if (bodyStart < 7) {
          console.error('FOUND BODY START AT A :' + bodyStart)
          console.error('FOUND BODY START AT A :' + bodyStartIdx01)
          // console.error(Data)
          if (bodyStartIdx01 > 6) {
            bodyStart = bodyStartIdx01
          } else {
            bodyStart = Data.toLowerCase().indexOf('<body>') + 6
            bodyStartIdx01 = Data.toLowerCase().indexOf('<body>') + 1
          }
        }

        window.TestData = Data
        if (bodyStart < 7) {
          console.error('FOUND BODY START AT :' + bodyStart)
          bodyStart = 0
          bodyStartIdx01 = 0
        }

        if (headEnd < headStart) {
          headEnd = bodyStart - 6
        }

        var bodyEnd = Data.lastIndexOf('</body')
        if (bodyEnd < 0) {
          bodyEnd = Data.toLowerCase().lastIndexOf('</body')
        }
        bodyEnd += 7

        var body = Data.substring(bodyStart, bodyEnd) // .replaceAll(" href=\"#"," data-href=\"#").replaceAll(" href=\"/#"," data-href=\"/#")
        var head = Data.substring(headStart, headEnd)

        if (currentUrl === '') {
          console.log('aa')
        }
        head = '<base href="' + currentUrl + '">' + head // TODO: Only when in Development / debugging

        const htmlContent = body
        var headContent = head
        window.Head = headContent
        window.Body = htmlContent
        if (!((document.getElementsByTagName('iframe') && document.getElementsByTagName('iframe')[0]))) {
          return
        }
        var theH = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('head')[0]
        $(theH).append(head)

        /*
        var dynamicObjClone = this.$clone(dynamicObj)
        dynamicObjClone['data'] = () => {
          return {
            DEFAULT_CONTENT: htmlContent
          }
        }
        dynamicObjClone['methods']['getData'] = function () {
          return htmlContent
        }
        // Object.assign(dynamicObjClone,dynamicObj);
        console.error('cl0 a')
        console.error(dynamicObjClone)
        dynamicObjClone['mixins'][0].methods['fff'] = function (e) {
          return 'AAA'
        }
        dynamicObjClone['props']['ff'] = function() {
          return window.ctr
        }
        */

        console.error('cl0 b')
        // console.error(dynamicObjClone['methods'].getData())
        // console.error(dynamicObjClone.mixins[0])
        // console.error(dynamicObjClone.mixins[0].data())
        // dynamicObjClone.mixins[0].data = function () {
        // return { DEFAULT_CONTENT: htmlContent }
        // }
        // console.error(dynamicObjClone.mixins[0].data())
        // window.ctr++
        console.error('GOT WINDOW CTR' + window.ctr)

        var compName = 'awesomecomponentBody' + window.ctr++
        window.componentObj = window.componentObj || {}

        // console.error('TEST EDITORELEM')
        // var EDITORELEM = $(htmlContent).find('[editor=true]')
        // console.error(EDITORELEM)
        // $(se.$el).find('[editor=true]')

        var kkA = {
            tmpData: htmlContent,
            data: function () {
              return this.tmpData
            },
            editable: function () {
              return false
            }
        }
        window.componentObj[compName] = kkA
        var customComponents = [
          {
            'name': compName,
            'group': 'image',
            'thumbnail': 'https://vuejs.org/images/logo1a.png',
            context: dynamicObj,
            newContext: {
              /*
              //this not working so we use getData from the methods below ...
              data () {
                return {
                  DEFAULT_CONTENT: htmlContent // this is always same object
                }
              },
              */
              methods: {
                isHead: function () {
                  return false
                },
                editable: function () {
                  return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].editable()
                },
                getData: function () {
                  console.error('GOT COMP ' + this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1))
                  return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                  // return kkA.data() // window.Body; //htmlContent  <-- // this is always same object
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

        /* eslint-disable */
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

            if (m.hasOwnProperty('newContext')) {
              var tt = {}

              Object.assign(tt,m.context);

              if (m.newContext.hasOwnProperty('data')) {
                tt['data'] = m.newContext['data']
              }

              if (m.newContext.hasOwnProperty('methods')) {
                for (var k in m.newContext.methods) {
                    tt.methods[k] = m.newContext.methods[k]
                    tt[k] = m.newContext.methods[k]
                }
              }

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
      });
    })


    function removeParents(e, root) {
        root = root ? root : document.body;
        var p = e.parentNode;
        while(root != p){
            e = p;
            p = e.parentNode;
        }
        root.removeChild(e);
    }

    this.$bus.$on('updateElementToEditable', function (busData) {

      var data = busData.data
      var mainComponentName = busData.component
      var $elObj = busData.obj

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
      console.error(data)
      var mainComponentObj = $(window.componentObj[mainComponentName].data())
      var FindElems = mainComponentObj.find('[editor=true]')
      if (FindElems.length <= 0) {
        console.error('NO MORE ELEMENTS')
        window.hasProcessed = true
      }
      if (FindElems.length > 0) {
        var item = FindElems[0]
        console.error('replacing of ')
        console.error(item)

        var parent = $(item).parent()
        var itm = $(item)
        itm.removeAttr('editor')
        itm.attr('contenteditable', 'true')
        console.error('parent test')
        console.error(parent)

        var htmlContent = itm.outerHTMLEditor()
        var componentName = 'awesomecomponentBody' +  window.ctr++
        console.error('adding component of ' + componentName)
        itm.attr('tmpName', componentName)
        console.error('aa replacing of ')
        console.error(item)
        var ka = $('<div id="placeholder-' + componentName +'"></div>' )
        ka.insertBefore(itm)
        // itm.replaceWith('<div id="placeholder-' + componentName +'"></div>' );
        // remove item
        item.remove()

        var mainContentHtml = mainComponentObj.outerHTMLEditor()

        console.error('replacing main component..')
        var mainHtmlObj = $('<div>').append(mainComponentObj.clone()).html()
        console.error(mainHtmlObj)
        window.componentObj[mainComponentName].tmpData = mainHtmlObj || mainContentHtml
        console.error(mainContentHtml)
        console.error('a finding of.. ' + componentName)
        console.error(parent.find('#placeholder-' + componentName))
        window.componentObj = window.componentObj || {}

        var kkA = {
            tmpData: htmlContent,
            data: function () {
              return this.tmpData
            },
            editable: function () {
              return true
            }
        }
        window.blogeditor = true

        window.componentObj[componentName] = kkA
        window.ctr++
        var customComponents = [
            {
              'name': componentName,
              'group': 'image',
              'thumbnail': 'https://vuejs.org/images/logo1a.png',
              context: dynamicObj,
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

              if (m.hasOwnProperty('newContext')) {
                var tt = {}

                Object.assign(tt,m.context);

                if (m.newContext.hasOwnProperty('data')) {
                  tt['data'] = m.newContext['data']
                }

                if (m.newContext.hasOwnProperty('methods')) {
                  for (var k in m.newContext.methods) {
                      tt.methods[k] = m.newContext.methods[k]
                      tt[k] = m.newContext.methods[k]
                  }
                }

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

/*

      //TODO: What if the item has anoter editor=true in it ? attributes?
      $.each(data, function(idx, item) {
        console.error('will remove of ... idex: ' + idx)
        console.error(item)
        // console.error(window.vm.$store.state.rows)
        if (window.vm.$store.state.rows.length >= 6) {
          console.error('will remove of failsafe..')
          return
        }
        if ($(item).attr('contenteditable')) {
          return // ignore it failsafe something loops..
        }

        // console.error( $(item) )
        // console.error( $(item).parent() )
        // removeParents(item, $(item).parent()[0])

        // item.
        var parent = $(item).parent()
        var itm = $(item)
        itm.removeAttr('editor')
        itm.attr('contenteditable', 'true')

        var htmlContent = itm.outerHTMLEditor(itm[0].ownerDocument) // $iframe)


        var componentName = 'awesomecomponentBody' +  window.ctr++
        console.error('adding component of ' + componentName)
        itm.attr('tmpName', componentName)
        console.error('aa replacing of ')
        console.error(item)
        var ka = $('<div id="placeholder-' + componentName +'"></div>' )
        ka.insertBefore(itm)
        // itm.replaceWith('<div id="placeholder-' + componentName +'"></div>' );
        // remove item
        item.remove()

        console.error('Z RECEIVED ELOBJ OF')
        console.error($(window.componentObj[mainComponentName].data()))
        console.error('FINDING ITEM')
        console.error($(window.componentObj[mainComponentName].data()).find('[editor=true]')[0])
        // console.error($elObj)
        // var origHTML = $elObj.outerHTMLEditor()
        // console.error('GOT ORIG HTML OF ' + origHTML)

        console.error('with ')
        console.error(ka)

        console.error('b finding of.. ' + componentName)
        console.error(parent.find('#placeholder-' + componentName))
        window.componentObj = window.componentObj || {}

        var kkA = {
            tmpData: htmlContent,
            data: function () {
              return this.tmpData
            },
            editable: function () {
              return true
            }
        }
        window.blogeditor = true

        window.componentObj[componentName] = kkA
        window.ctr++
        var customComponents = [
            {
              'name': componentName,
              'group': 'image',
              'thumbnail': 'https://vuejs.org/images/logo1a.png',
              context: dynamicObj,
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

              if (m.hasOwnProperty('newContext')) {
                var tt = {}

                Object.assign(tt,m.context);

                if (m.newContext.hasOwnProperty('data')) {
                  tt['data'] = m.newContext['data']
                }

                if (m.newContext.hasOwnProperty('methods')) {
                  for (var k in m.newContext.methods) {
                      tt.methods[k] = m.newContext.methods[k]
                      tt[k] = m.newContext.methods[k]
                  }
                }

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
      })
*/


    })
    /* eslint-enable */
  },
  beforeMount () {
    const { body } = document
    const WIDTH = 768
    const RATIO = 3

    const handler = () => {
      if (!document.hidden) {
        let rect = body.getBoundingClientRect()
        let isMobile = rect.width - RATIO < WIDTH
        this.toggleDevice(isMobile ? 'mobile' : 'other')
        if (!this.$store.state.app.website) {
          console.error('are we modbile')
          console.error(!isMobile)
          console.error('NO : ' + (!isMobile))
          this.toggleSidebar(!isMobile)
        }

        // this.toggleSidebartwo(false)
      }
    }

    document.addEventListener('visibilitychange', handler)
    window.addEventListener('DOMContentLoaded', handler)
    window.addEventListener('resize', handler)

    console.log('toggle test')

    var self = this
    this.refreshUser({ vue: this,
      callback: function () {
        console.error('callll back is called 03')
        if (self.project && self.project.websites) {
          // Only if no project is selected..
          console.error('callll back is called 03 A')
          // window.vm.$store.state.app.isLoaded
          if (!self.$store.state.app.isLoaded) {
            console.error('callll back is called 03 AC')
            console.error('callll back is called 03 AD')
            self.$store.state.app.sidebarglobal.opened = true
            self.$store.state.app.sidebarglobal.hidden = false
          }
        } else {
          // NO PROJECT YET ??
          console.error('callll back is called 03 B')
          self.$store.state.app.sidebarglobal.opened = false
          self.$store.state.app.sidebarglobal.hidden = true
        }
      }
    })
  },

  computed: mapGetters({
    sidebar: 'sidebar',
    sidebarglobal: 'sidebarglobal',
    websiteAndNotLoggedIn: 'websiteAndNotLoggedIn',
    selectedWebsite: 'selectedWebsite',
    sidebartwo: 'sidebartwo',
    inBlog: 'inBlog'
  }),

  methods: mapActions([
    'toggleDevice',
    'toggleSidebar',
    'toggleSidebartwo',
    'refreshUser'
  ])
}
</script>

<style lang="scss">
@import '~animate.css';
.animated {
  animation-duration: .377s;
}

@import '~bulma';

@import '~wysiwyg.css/wysiwyg.sass';

$fa-font-path: '~font-awesome/fonts/';
@import '~font-awesome/scss/font-awesome';

@import '~highlight.js/styles/github.css';

pre > code {
  font-size: 16px;
}


html, body {
  height: 100%;
  background-color: whitesmoke;
  overflow-y: hidden;
}
.overflow-hidden {
  overflow: hidden;
}

body.overflow-hidden {
  -ms-overflow-style: none;  // IE 10+
  overflow: -moz-scrollbars-none;  // Firefox
}

body.overflow-hidden::-webkit-scrollbar {
  display: none;  // Safari and Chrome
}

#app {
   height: 100%;
}

.nprogress-container {
  position: fixed !important;
  width: 100%;
  height: 50px;
  z-index: 2048;
  pointer-events: none;

  #nprogress {
    $color: #48e79a;

    .bar {
      background: $color;
    }
    .peg {
      box-shadow: 0 0 10px $color, 0 0 5px $color;
    }

    .spinner-icon {
      border-top-color: $color;
      border-left-color: $color;
    }
  }
}
</style>
