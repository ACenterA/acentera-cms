<template>
  <div id="app">
    <nprogress-container></nprogress-container>
    <navbar :notLoggedIn="websiteAndNotLoggedIn" :selectedWebsite="selectedWebsite" :show="true"></navbar>
    <sidebar :notLoggedIn="websiteAndNotLoggedIn" :websiteObject="selectedWebsite" :selectedWebsite="!selectedWebsite" :show="!sidebar.hidden"></sidebar>
    <sidebar-global :hide="sidebarglobal.hidden" :show="sidebarglobal.opened && !sidebarglobal.hidden"></sidebar-global>
    <app-main :notLoggedIn="websiteAndNotLoggedIn" :hasSidebar="(!sidebarglobal.hidden || !sidebar.hidden)" :inBlog="inBlog"></app-main>
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
    this.$bus.$on('updateEditFrame', function (data) {
      var self = window.vm
      if (!($('body').hasClass('overflow-hidden-y'))) {
        $('body').addClass('overflow-hidden-y')
        $('.app-content').addClass('app-fixed')
      }

      self.$store.commit('deleteAllRows', 0, 1)

      // TODO: Find something else better than this...
      self.$bus.$emit('destroyDynamicComponent')

      var currentUrl = data || window.goHostUrl + '/'

      self.$httpApi.get(currentUrl, { headers: { edit: 1 } }).then((res) => {
        if (!res.data.data) {
          // Uh oh no data... found for the requested page...

          // Are we trying to create a new post ? it may have some delay..
          if (self.$store.state.app.selectedItem !== undefined && self.$store.state.app.selectedItem && self.$store.state.app.selectedItem.retry) {
            if (self.$store.state.app.selectedItem.retry >= 0) {
              self.$store.state.app.selectedItem.retry--
              return setTimeout(function () {
                self.selectPost(self.$store.state.app.selectedItem)
              }, 1000)
            }
          }
          // well no more retries or no data..

          self.$store.state.app.nodata = true
          if (self.$store.state.app.createItem) {
            return self.$bus.$emit('NO_DATA_FOUND')
          } else {
            return self.$bus.$emit('CREATE_ITEM')
          }
        }
        var Data = res.data.data.Data
        self.$store.state.app.nodata = false
        self.$store.state.app.createItem = false
        var headStart = Data.indexOf('<head>') + 6
        if (headStart < 7) {
          headStart = Data.toLowerCase().indexOf('<head>') + 6
          if (headStart < 7) {
            headStart = Data.toLowerCase().indexOf('<html>') + 6
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
          if (bodyStartIdx01 > 6) {
            bodyStart = bodyStartIdx01
          } else {
            bodyStart = Data.toLowerCase().indexOf('<body>') + 6
            bodyStartIdx01 = Data.toLowerCase().indexOf('<body>') + 1
          }
        }
        var bodyEndIdxTest = Data.toLowerCase().indexOf('>', bodyStartIdx01)
	var boddyInnerData = ''
	try {
		boddyInnerData = Data.substring(bodyStartIdx01+6,bodyEndIdxTest)
	} catch (noDataExx) {
	}
        // window.TestData = Data
        if (bodyStart < 7) {
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

        head = '<base href="' + currentUrl + '">' + head // TODO: Only when in Development / debugging

        const htmlContent = body
        var headContent = head
        window.Head = headContent
        window.BodyMeta = boddyInnerData
        window.Body = htmlContent
        if (!((document.getElementsByTagName('iframe') && document.getElementsByTagName('iframe')[0]))) {
          return
        }
        var theH = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('head')[0]
        $(theH).append(head)

        var dynamicObjClone = this.$clone(dynamicObj)

        var compName = 'awesomecomponentBody' + window.ctr++
        window.componentObj = window.componentObj || {}

        var kkA = {
            tmpData: htmlContent,
            tmpBodyMeta: boddyInnerData,
            data: function () {
              return this.tmpData
            },
            bodyMeta: function () {
              return this.tmpBodyMeta
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
            context: dynamicObjClone, // dynamocObj
            newContext: {
              // this not working so we use getData from the methods below ...
              data () {
                return {
                  nm: function () {
                    return this.me.name
                  },
                  IS_EDITABLE: function () {
                    return false // self.editable() // false
                  },
                  DEFAULT_CONTENT: function () {
                    // Somehow the hosted version ( distribution use this function, while local version use the mixin's dynamic.vue one... )
                    // That is the reason why we use a window.componentObj for now
                    // not geting updated.... otherwise ... sreturn htmlContent // self.getData01()
                    return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                  }
                }
              },
              methods: {
                isHead: function () {
                  return false
                },
                editable: function () {
                  return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].editable()
                },
                getData01: function () {
                  return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].data()
                  // return kkA.data() // window.Body; //htmlContent  <-- // this is always same object
                },
                getBodyMeta: function () {
                  return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome')+1)].bodyMeta()
                  // return kkA.data() // window.Body; //htmlContent  <-- // this is always same object
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

              Object.assign(tt,m.context); // ? Good or bad  ?

              if (m.newContext.hasOwnProperty('data')) {
                tt['data'] = m.newContext['data']
              }

              if (m.newContext.hasOwnProperty('getData01')) {
                  tt['getData01'] = m.newContext['getData01']
              }
              if (m.newContext.hasOwnProperty('getBodyMeta')) {
                  tt['getBodyMeta'] = m.newContext['getBodyMeta']
              }

              if (m.newContext.hasOwnProperty('methods')) {
                for (var k in m.newContext.methods) {
                    tt.methods[k] = m.newContext.methods[k]
                    tt[k] = m.newContext.methods[k]
                }
              }

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
      }).catch((error) => {
        if (error && error.response && error.response.status === 404) {
          self.$store.state.app.nodata = true
          if (self.$store.state.app.createItem) {
            return self.$bus.$emit('NO_DATA_FOUND')
          } else {
            return self.$bus.$emit('CREATE_ITEM')
          }
        } else {
          this.$onError(error)
        }
      })
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
          this.toggleSidebar(!isMobile)
        }

        // this.toggleSidebartwo(false)
      }
    }

    document.addEventListener('visibilitychange', handler)
    window.addEventListener('DOMContentLoaded', handler)
    window.addEventListener('resize', handler)

    var self = this
    this.refreshUser({ vue: this,
      callback: function (gotdata) {
        if (self.project && self.project.websites) {
          // Only if no project is selected..
          // window.vm.$store.state.app.isLoaded
          if (!self.$store.state.app.isLoaded) {
            self.$store.state.app.sidebarglobal.opened = true
            self.$store.state.app.sidebarglobal.hidden = false
          }
        } else {
          // NO PROJECT YET ??
          if (!self.$store.state.app.isLoaded) {
            self.$store.state.app.sidebarglobal.opened = false
            self.$store.state.app.sidebarglobal.hidden = true
          }
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
    'refreshUser',
    'selectPost'
  ])
}
</script>

<style lang="scss">
@import '~animate.css';
.animated {
  animation-duration: .377s;
}
.calender-div {
  z-index:4;
  background-color: white;
}

@import '~bulma';

// @import '~wysiwyg.css/wysiwyg.sass';

$fa-font-path: '~font-awesome/fonts/';
@import '~font-awesome/scss/font-awesome';

@import '~highlight.js/styles/github.css';

pre > code {
  font-size: 16px;
}


html, body {
  height: 100%;
  background-color: whitesmoke;
  // overflow-y: hidden;
}
body.overflow-hidden-y {
  overflow-y: hidden;
}

.notifications {
   margin-top: 80px !important;
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

.container.is-fluid {
  width: 100%;
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

.is-hidden-not-4k {
  display:none;
}

// For Login name to be shown in navbar only with 4k screens...
@media screen and (max-width: 1200px) {
  .is-hidden-not-4k {
    width: 30%;
  }
}

</style>
