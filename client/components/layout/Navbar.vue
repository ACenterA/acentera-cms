<template>
  <section class="hero is-bold app-navbar animated" :class="{ slideInDown: show, slideOutDown: !show }">
    <div class="hero-head">
      <nav class="nav">
        <div class="nav-left">
          <a class="nav-item is-hidden-tablet" @click="toggleSidebar(!sidebar.opened)">
            <i class="fa fa-bars" aria-hidden="true"></i>
          </a>
          <div v-if="isOffline()">
            <p class="blue">No internet.</p>
          </div>
        </div>
        <div class="nav-center">
          <div v-if="isRepoUpdating()">
            <p class="blue">Updating...</p>
          </div>
          <div v-if="isKeyMissing()">
            <p class="blue">Missng SSH Key.<router-link to="/login" :exact="true"><b>Click here.</b></router-link></p>
          </div>
          <div v-if="isRepoMissing()">
            <p class="blue">Error, no .git/config. Please fix repo</p>
          </div>
          <a class="nav-item hero-brand" href="/">
            <!--
            <img src="~assets/logo.svg" :alt="pkginfo.description">
            <tooltip :label="'v' + pkginfo.version" placement="right" type="success" size="small" :no-animate="true" :always="true" :rounded="true">
              <div class="is-hidden-mobile">
                <span class="vue">Gold</span><strong class="admin">fish</strong>
              </div>
            </tooltip>
            -->
          </a>
        </div>
        <div class="nav-right is-flex">
          <a v-if="session" class="nav-item is-hidden-mobile">
            Logged in as: {{session.display_name}}
          </a>
          <a v-if="isSavePushAvail()" @click="saveAndPushModal()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
              Publish
          </a>
          <a class="nav-item" href="https://github.com/ACenterA/serverless-cms">
            <span class="icon">
              <i class="fa fa-github"></i>
            </span>
            <span class="is-hidden-mobile">
              Source on GitHub
            </span>
          </a>
        </div>
      </nav>
    </div>
  </section>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import { mapGetters, mapActions } from 'vuex'

export default {

  components: {
    Tooltip
  },

  props: {
    show: Boolean
  },

  mounted: function () {
    console.log('nav mounted a')
    // if session cookie is still valid, load session data
    let raw = window.localStorage.getItem('session')
    if (raw) {
      var session = JSON.parse(raw)
      if (Date.now() > Date.parse(session['cookie_expiry'])) {
        window.localStorage.removeItem('session')
        this.$notify({
          title: 'Session expired',
          message: 'Please login again',
          type: 'warning'
        })
        this.$store.commit('clearSession')
      } else {
        this.$store.commit('setSession', session)
      }
    } else {
      this.$store.commit('clearSession')
    }

    let gitraw = window.localStorage.getItem('github')
    if (gitraw) {
      var github = JSON.parse(gitraw)
      /*
      if (Date.now() > Date.parse(session['cookie_expiry'])) {
        window.localStorage.removeItem('session')
        this.$notify({
          title: 'Session expired',
          message: 'Please login again',
          type: 'warning'
        })
        this.$store.commit('clearSession')
      } else {
        this.$store.commit('setSession', session)
      }
      */
      console.log('set of github')
      console.log(github)
      this.$store.commit('setGithub', github)
    } else {
      this.$store.commit('clearGithub')
    }

    // uncomment this to see the details of the session everytime you refresh the page
    // console.log(JSON.stringify(this.session))
  },

  computed: {
    ...mapGetters({
      session: 'session',
      pkginfo: 'pkg',
      sidebar: 'sidebar',
      app: 'app',
      repoState: 'repoState'
    })
  },

  methods: {
    ...mapActions([
      'toggleSidebar'
    ]),
    isRepoUpdating () {
      return (this.repoState.updating === 1)
    },
    isRepoMissing () {
      return (this.repoState.updating === 5)
    },
    isKeyMissing () {
      return (this.repoState.updating === 6)
    },
    isOffline () {
      return (this.app.inet === false)
    },
    isSavePushAvail () {
      if (this.isKeyMissing() || this.isRepoMissing() || this.isRepoUpdating() || this.isOffline()) {
        return false
      }
      return true
    },
    saveAndPushModal () {
      console.log('save and push')
    }
  }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';

.app-navbar {
  position: fixed;
  min-width: 100%;
  z-index: 1024;
  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);

  .container {
    margin: auto 10px;
  }

  .nav-right {
    align-items: stretch;
    align-items: stretch;
    flex: 1;
    justify-content: flex-end;
    overflow: hidden;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.blue {
  color: blue;
}

.navheighfix {
  margin-top:8px;
}

.nav-center {
  line-height: 50px;
}

.hero-brand {
  .vue {
    margin-left: 10px;
    color: #36AC70;
  }
  .admin {
    color: #28374B;
  }
}
</style>
