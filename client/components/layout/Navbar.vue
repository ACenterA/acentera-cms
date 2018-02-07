<template>
  <section class="hero is-bold app-navbar animated" :class="{ hidden: notLoggedIn, slideInDown: show, slideOutDown: !show }">

    <!-- Navbar Content -->
    <div class="hero-head">
      <nav class="nav">
        <div class="nav-left">
          <a class="nav-item is-hidden-tablet" @click="toggleSidebar(!sidebar.opened)">
            <i class="fa fa-bars" aria-hidden="true"></i>
          </a>
          <div v-if="isManual()" class="inline-display">
            <router-link :to="{name: backRoute}">
              <i class="fa fa-2x fa-arrow-left back-button"></i>
                  <div class="back-text">{{manual}}</div>
            </router-link>
          </div>
          <!-- Force Refresh -->
          <div v-if="getSelectedWebsiteName" class="nav-item">Editing: {{getSelectedWebsiteName.title }} &nbsp;&nbsp;
              <span v-if="getSelectedWebsite" class="blue" style="cursor:hand;" @click='selectVersion()'>[ {{ repoState.Branch }} ]</span>
            </div>

          <div v-if="isOffline()">
            <p class="blue">No internet.</p>
          </div>
        </div>
        <div class="nav-center">
          <div v-if="!isLoggedIn && isWebsiteSelected() && isKeyMissing()">
            <p class="red">
              You must Login to your 'Git' account first. (Login on the left menu)
            </p>
          </div>
          <div v-else>
            <div v-if="isWebsiteSelected()">
              <!-- TODO:                      -->
              <div v-if="getSelectedWebsite">
                <div v-if="hasSession() && isRepoInError()">
                  <p class="red">Error with repo...</p>
                </div>

                <div v-if="hasSession() && isRepoUpdating()">
                  <p class="blue">Updating...</p>
                </div>

                <div v-if="isWebsite && !isWebsiteSelected()">
                  <div v-if="hasSession() && isKeyMissing()">
                    <p class="blue">Missing GIT Login.<router-link to="/login" :exact="true"><b>Click here.</b></router-link></p>
                  </div>
                </div>

                <div v-if="!isWebsite">
                  <div v-if="hasSession() && isKeyMissing()">
                    <p class="blue">Missing SSH Key.<router-link to="/login" :exact="true"><b>Click here.</b></router-link></p>
                  </div>
                </div>

                <div v-if="isRepoMissing()">
                  <p class="blue">Could not validate Git conenction.</p>
                </div>
              </div>

            </div>
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

          <div v-if="hasSession() && !isWebsite || (hasSession() && isWebsite && isWebsiteSelected())">
            <!--
            <a v-if="hasSession() && isTestMissing()" @click="createPreviewSite()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Create Preview Site
            </a>
            -->

            <!-- this is same .. as Save.. -->
            <a v-if="hasSession() && isSavePushAvail()" @click="saveAndPreviewAndPushModal()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Submit for Review
            </a>

            <a v-if="hasSession() && isSavePushAvailOrisTestMissing()" @click="saveAndPushModal()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Publish
            </a>

            <a v-if="hasSession() && isSavePushAvailOrisTestMissing()" @click="saveModal()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Save
            </a>
          </div>

          <div v-if="isWebsite && isWebsiteSelected()">
            <a v-if="hasSession()" @click="selectWebsite()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                change site
            </a>
          </div>

          <a v-if="hasSession()" @click="executeLogout()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
              Logout
          </a>



          <div style="margin:5px">&nbsp;</div>

        </div>
      </nav>
    </div>
    <modal :visible="showModal" :title="title" :info="selectedItemInfo" @close="closeModalBasic($event)"></modal>
    <modalComment :visible="showModalComment" @close="closeModalSaveBasic($event)"></modalComment>
    <Modalreviewcomment :visible="showModalReviewComment" @close="closeModalSaveReview($event)"></Modalreviewcomment>
    <!-- <modal :visible="showModal" :title="title" :info="selectedItemInfo" @close="closeModalBasic($event)"></modal> -->

    <!-- gitModal :visible="showCreateModal" @nextStep="nextStep($event)" @close="closeCreateSiteModal"></gitModal -->

  </section>

</template>

<script>

// import GitModal from './modals/GitLogin'
import Modal from './modals/InfoModal'
import ModalComment from './modals/SaveModal'
import Modalreviewcomment from './modals/SaveReviewModal'
import Tooltip from 'vue-bulma-tooltip'
import { mapGetters, mapActions } from 'vuex'

// const querystring = require('querystring')

export default {

  components: {
    // GitModal,
    Tooltip,
    Modal,
    ModalComment,
    Modalreviewcomment
  },

  data () {
    return {
      csrf: '',
      showModal: false,
      showModalComment: false,
      showModalReviewComment: false,
      title: 'Title',
      selectedItemInfo: null,
      manual: null,
      backRoute: null,
      showCreateModal: false
    }
  },

  props: {
    show: Boolean,
    notLoggedIn: Boolean,
    selectedWebsite: Object
  },

  mounted: function () {
    this.toggleRepoState(1)
    var self = this

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
      self.toggleRepoState(0) // all good
    }
  },
  computed: {
    ...mapGetters({
      session: 'session',
      pkginfo: 'pkg',
      sidebar: 'sidebar',
      app: 'app',
      repoState: 'repoState',
      isLoggedIn: 'isLoggedIn',
      getBasicAuth: 'getBasicAuth',
      isWebsite: 'isWebsite'
    }),
    getSelectedWebsiteName: function () {
      return this.selectedWebsite
    },
    getSelectedWebsite: function () {
      if (!this.$store.state.app.isLoaded) {
        return
      }
      if (this.$store.state.app.website) {
        return this.selectedWebsite
      } else {
        return true
      }
    }
  },

  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'logOut',
      'toggleRepoUrl',
      'toggleSidebar',
      'selectWebsite',
      'saveNewSettings'
    ]),
    isManual () {
      if ((('' + this.$route.path)).indexOf('/template') >= 0) {
        if ((('' + this.$route.path)).indexOf('/preview') >= 0) {
          this.manual = 'Preview'
          this.backRoute = 'Templates'
        } else {
          this.manual = 'Create a site'
          this.backRoute = 'Home'
        }
        return true
      }
      return false
    },
    hasSession () {
      if (this.$store.state.app.website) {
        if (this.session && this.session.display_name) {
          return true
        }
      } else {
        if (this.$store.state && this.$store.state.github) {
          return (this.$store.state.github.logininfo)
        }
      }
      return false
    },
    isRepoUpdating () {
      return (this.repoState.updating === 1)
    },
    isRepoMissing () {
      return (this.repoState.updating === 5)
    },
    isWebsiteSelected () {
      if (!this.$store.state.app.website) {
        // Self - Hosted version ( dev )
        return true
      }

      // Is local Version
      if (this.$store.state.app.websiteId) {
        return true
      }
      return false
    },
    isRepoInError () {
      if (!this.repoState.isLoaded) {
        return false
      } else {
        if (this.repoState.Master === '' && this.repoState.Branch !== '') {
          return true
        }
      }
      return false
    },
    isTestMissing () {
      if (!this.repoState.isLoaded) {
        return false
      }
      return (this.repoState.isLoaded && (this.repoState.Master === this.repoState.Branch))
    },
    isKeyMissing () {
      return (this.repoState.sshKeyMissing || this.repoState.updating === 6)
    },
    isOffline () {
      return (this.app.inet === false)
    },

    isRepoNotWorking () {
      return (!((this.repoState.Master === undefined || this.repoState.Branch === undefined)))
    },
    isSavePreviewAvail () {
      if (!this.isTestMissing()) {
        return false
      }
    },
    isSavePushAvailOrisTestMissing () {
      if (!this.isLoggedIn) {
        return false
      }
      return (this.isTestMissing() || this.isSavePushAvail())
    },
    isSavePushAvail () {
      if (!this.isLoggedIn) {
        return false
      }
      if (this.isTestMissing()) {
        return false
      }

      if (!this.repoState.isLoaded && (this.isRepoNotWorking() || this.isKeyMissing() || this.isTestMissing() || this.isRepoMissing() || this.isRepoUpdating() || this.isOffline())) {
        return false
      }
      return true
    },
    createPreviewSite () {
      this.showModal = true
    },
    saveAndPreviewAndPushModal () {
      this.showModalReviewComment = true
    },
    saveAndPushModal () {
      this.showModalComment = true
    },
    saveModal () {
      this.showModalComment = false
      this.saveNewSettings()
    },
    closeCreateSiteModal () {
      this.selectedIndex = -1
      this.showCreateModal = false
    },
    nextStep (nextstep) {
    },
    GitLogin () {
    },
    closeModalSaveReview (obj) {
      if (obj === undefined) {
        this.selectedIndex = -1
        this.showModalReviewComment = false
      } else {
        var self = this
        if (self) {
        }
        var fullGitPath = ('' + this.$store.state.app.repoState.url).substring(('' + this.$store.state.app.repoState.url).indexOf('/') + 1)
        fullGitPath = fullGitPath.substring(0, fullGitPath.lastIndexOf('.git'))
        var tmpGit = ('' + this.$store.state.app.repoState.url).substring(('' + this.$store.state.app.repoState.url).lastIndexOf('/') + 1)
        tmpGit = tmpGit.substring(0, tmpGit.lastIndexOf('.git'))
        var userPostPath = 'repos/' + this.$store.state.github.logininfo.username + '/' + tmpGit + '/pulls'
        if (userPostPath) {
        }
        var $gitobj = this.$github

        var pullReqObj = {
          'title': obj.title || 'New Pull Request',
          'body': obj.desc || 'Please pull this in!',
          'head': this.$store.state.app.repoState.Branch,
          'base': this.$store.state.app.repoState.Master
        }
        if (this.$store.state.github && this.$store.state.github.logininfo && this.$store.state.github.logininfo.type === 'BitBucket') {
          $gitobj = this.$bitbucket
          userPostPath = '2.0/repositories/' + this.$store.state.github.logininfo.username + '/' + tmpGit + '/pullrequests'
          pullReqObj = {
            title: obj.title || 'New Pull Request',
            description: obj.desc || 'Desc here',
            source: {
              'branch': {
                'name': this.$store.state.app.repoState.Branch
              },
              'repository': {
                'full_name': fullGitPath
              }
            },
            'destination': {
              'branch': { 'name': this.$store.state.app.repoState.Master }
            },
            'close_source_branch': false
          }
        }

        // 'reviewers": [ { "username": "some other user needed to review changes" } ]

        if (pullReqObj) {
        }
        $gitobj.setUserPass(this.$store.state.github.logininfo.username, this.$store.state.github.logininfo.pass)

        // $gitobj.post(userPostPath, githubPush, function (resp) {
        $gitobj.post(userPostPath, pullReqObj, function (next) {
          // success fully POSTED PULL informations.
          //  {"merge_commit": null, "description": "Desc here", "links": {"decline": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/decline"}, "commits": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/commits"}, "self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3"}, "comments": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/comments"}, "merge": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/merge"}, "html": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website/pull-requests/3"}, "activity": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/activity"}, "diff": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/diff"}, "approve": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/approve"}, "statuses": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/statuses"}}, "title": "a faf 32 f3 2", "close_source_branch": false, "reviewers": [], "destination": {"commit": {"hash": "1addbeecd463", "links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/commit/1addbeecd463"}}}, "repository": {"links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website"}, "html": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website"}, "avatar": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website/avatar/32/"}}, "type": "repository", "name": "test-simple-website", "full_name": "Gizmodo1/test-simple-website", "uuid": "{a1526fe3-4e13-4d6f-bc36-b4eb55e45300}"}, "branch": {"name": "master"}}, "state": "OPEN", "closed_by": null, "source": {"commit": {"hash": "1ad4ff49dd3d", "links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/commit/1ad4ff49dd3d"}}}, "repository": {"links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website"}, "html": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website"}, "avatar": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website/avatar/32/"}}, "type": "repository", "name": "test-simple-website", "full_name": "Gizmodo1/test-simple-website", "uuid": "{a1526fe3-4e13-4d6f-bc36-b4eb55e45300}"}, "branch": {"name": "Demo_Nelify"}}, "comment_count": 0, "author": {"username": "Gizmodo1", "display_name": "francis Lavalliere", "type": "user", "uuid": "{d1f483aa-fb4b-4a10-b7df-e58bd6a7500f}", "links": {"self": {"href": "https://api.bitbucket.org/2.0/users/Gizmodo1"}, "html": {"href": "https://bitbucket.org/Gizmodo1/"}, "avatar": {"href": "https://bitbucket.org/account/Gizmodo1/avatar/32/"}}}, "created_on": "2017-09-15T02:33:43.353448+00:00", "participants": [], "reason": "", "updated_on": "2017-09-15T02:33:43.398141+00:00", "type": "pullrequest", "id": 3, "task_count": 0}
          // debug.log(next)
        }, this.gitError)

        this.selectedIndex = -1
        this.showModalReviewComment = false
      }
    },
    executeLogout () {
      this.logOut(this)
    },
    closeModalSaveBasic (obj) {
      if (!obj) {
        return
      }
      this.$httpApi.post(window.apiUrl + '/git?action=save',
      obj, {
        headers: {
          'Authorization': this.getBasicAuth
        }
      })
      .then((response) => {
        this.$notify({
          title: 'Saving website.',
          message: 'Successfully saved changes',
          type: 'success'
        })

        /*
        this.$message({
          message: 'Your change ID is: ' + response.data.result,
          type: 'success',
          duration: 0,
          showCloseButton: true
        })
        */
        if (response.data.error !== '') {
          /*
          this.$notify({
            title: 'Slack webhook',
            message: response.data.error,
            type: 'warning'
          })
          */
        }
      })

      .catch((error) => {
        this.$onError(error)
      })

      this.selectedIndex = -1
      this.showModalComment = false
    },
    selectVersion () {
    },
    closeModalBasic (obj) {
      // Creating Pull Request Here
      this.$httpApi.post(window.apiUrl + '/git?action=create_pull',
      obj, {
        headers: {
          'Authorization': this.getBasicAuth
        }
      })
      .then((response) => {
        if (response.data.error !== '') {
          this.$notify({
            title: 'Git Request',
            message: response.data.error,
            type: 'warning'
          })
        } else {
          this.$notify({
            title: 'Git Request',
            message: 'Success fully saved.',
            type: 'success'
          })
        }
      })

      .catch((error) => {
        this.$onError(error)
      })

      this.selectedIndex = -1
      this.showModal = false
    }
  }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';

.inline-display {
    display: inline;
}


.back-button {
  height: 100%;
  border-right: 1px solid black;
  float: left;
  padding-top:10px;
  padding-left:20px;
  padding-right:20px;
}

.back-text {
  height: 100%;
  border-right: 1px solid black;
  float: left;
  padding-top:15px;
  padding-left:20px;
  padding-right:20px;
}

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

.red {
  color: red;
}

.navheighfix {
  margin-top:8px;
}

.navheighfix.button {
  margin-left:30px;
  float: left;
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
