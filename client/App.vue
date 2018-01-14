<template>
  <div id="app">
    <nprogress-container></nprogress-container>
    <navbar :notLoggedIn="websiteAndNotLoggedIn" :selectedWebsite="selectedWebsite" :show="true"></navbar>
    <sidebar :notLoggedIn="websiteAndNotLoggedIn" :selectedWebsite="!selectedWebsite" :show="sidebar.opened && !sidebar.hidden"></sidebar>
    <sidebar-global :hide="sidebarglobal.hidden" :show="sidebarglobal.opened && !sidebarglobal.hidden"></sidebar-global>
    <app-main :notLoggedIn="websiteAndNotLoggedIn" :hasSidebar="sidebar.opened && !sidebar.hidden"></app-main>
    GEEZ: {{selectedWebsite}}
    <footer-bar :show="!sidebartwo.opened"></footer-bar>
  </div>
</template>

<script>
import NprogressContainer from 'vue-nprogress/src/NprogressContainer'
import { Navbar, Sidebar, SidebarGlobal, AppMain, FooterBar } from 'components/layout/'
import { mapGetters, mapActions } from 'vuex'

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
    sidebartwo: 'sidebartwo'
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
