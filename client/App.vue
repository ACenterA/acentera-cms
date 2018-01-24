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
      console.error('UPDATE ... updateEditFrame ')
      // self.$store.commit('resetRows')
      self.$store.commit('deleteRowTest', 0, 1)

      // TODO: Find something else better than this...
      self.$bus.$emit('destroyDynamicComponent')

      var currentUrl = window.frameUrl || window.goHostUrl + '/'
      console.error('UPDATE ... updateEditFrame ' + window.frameUrl)
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
        window.ctr++
        console.error('GOT WINDOW CTR' + window.ctr)

        window.componentObj = window.componentObj || {}

        var kkA = {
          data: function () {
            return htmlContent
          }
        }
        window.componentObj['awesomecomponentBody' + window.ctr] = kkA
        var customComponents = [
          {
            'name': 'awesomecomponentBody' + window.ctr,
            'group': 'image',
            'thumbnail': 'https://vuejs.org/images/logo1a.png',
            context: dynamicObj,
            newContext: {
                //this not working so we use getData from the methods below ...
              data () {
                return {
                  DEFAULT_CONTENT: window.ctr++ // htmlContent
                }
              },
              methods: {
                isHead: function () {
                  return false
                },
                getData: function () {
                  console.error('received get data test here A')
                  console.error('RETURNING OF')
                  // console.error(htmlContent)
                  // console.error(this.DEFAULT_CONTENT)
                  console.error(this)
                  console.error(kkA)
                  console.error(this.$vnode.tag.indexOf('-awesome'))
                  console.error('GOT COMP ' + this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1))
                  return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                  // return kkA.data() // window.Body; //htmlContent
                },
                orThisgetData: function () {
                  return htmlContent
                }
              }
            }
          }
        ]

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
