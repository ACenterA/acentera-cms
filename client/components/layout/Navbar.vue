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
          <div v-if="getSelectedWebsite" class="nav-item">Editing: {{getSelectedWebsite.title }}</div>

          <div v-if="isOffline()">
            <p class="blue">No internet.</p>
          </div>
        </div>
        <div class="nav-center">

          <div v-if="!isLoggedIn()">
            <p class="red">
              You must Login to your account first.
            </p>
          </div>
          <div v-else>
            <div v-if="isWebsiteSelected()">
              <!-- TODO:                      -->

              <div v-if="!getSelectedWebsite">
                <p class="red" @click="GitLogin">Click here for Git Login...</p>
              </div>


              <div v-if="getSelectedWebsite">
                <div v-if="hasSession() && isRepoInError()">
                  <p class="red">Error with repo...</p>
                </div>
                <div v-if="hasSession() && isRepoUpdating()">
                  <p class="blue">Updating...</p>
                </div>
                <div v-if="hasSession() && isKeyMissing()">
                  <p class="blue">Missng SSH Key.<router-link to="/login" :exact="true"><b>Click here.</b></router-link></p>
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

          <div v-if="hasSession() && isWebsiteSelected()">
            <a v-if="hasSession() && isTestMissing()" @click="createPreviewSite()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Create Preview Site
            </a>

            <!-- this is same .. as Save.. -->
            <a v-if="hasSession() && isSavePushAvail()" @click="saveAndPreviewAndPushModal()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Submit for Review
            </a>

            <a v-if="hasSession() && isSavePushAvailOrisTestMissing()" @click="saveAndPushModal()" class="navheighfix button is-primary is-outlined nav-item is-hidden-mobile">
                Save
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
    // var state = self.$store.state
    console.error('IS WEBSITE?? HOSTED VERSION?')
    console.error(this.getSelectedWebsite)

    if (self.$store.state.app.website && !this.selectedWebsite) {
      console.error('IS WEBSITE?? HOSTED VERSION YES ?')
    } else {
      // nothing
      // not good this.getSelectedWebsite()
    }

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
        console.error('CLEAR SESSION HEREA')
        this.$store.commit('clearSession')
      } else {
        console.error('CLEAR SESSION HEREB')
        this.$store.commit('setSession', session)
      }
    } else {
      self.toggleRepoState(0) // all good
      // console.error('CLEAR SESSION HEREC')
      // already cleared this.$store.commit('clearSession')
    }

    let gitraw = window.localStorage.getItem('github')
    if (gitraw) {
      var github = JSON.parse(gitraw)
      console.log('set of github')
      console.log(github)
      this.$store.commit('setGit', github)
    } else {
      this.$store.commit('clearGit')
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
    }),
    getSelectedWebsite: function () {
      console.error('IS WEBSITE?? HOSTED VERSION WORKABLE?' + this.selectedWebsite)
      console.error(this)
      if (this.selectedWebsite !== null) {
        if (this.$store.state.github == null || this.$store.state.github.logininfo == null) {
          return
        }
        var self = this

        var $gitobj = this.$github
        console.error('this store.')
        console.error(this)
        console.error(window.vm.$store.state.github)
        if (this.$store.state.github.logininfo.type === 'BitBucket') {
          $gitobj = this.$bitbucket
        }
        console.error('USER ASS' + this.$store.state.github.logininfo.user)
        $gitobj.setUserPass(this.$store.state.github.logininfo.user, this.$store.state.github.logininfo.pass)

        this.$httpApi.get(window.apiUrl + '/git?action=config').then((response) => {
          this.toggleRepoUrl(response.data.Data)
          if (response !== null && response.data !== null) {
            this.toggleRepo(response.data)
          }

          if (self.$store.state.app.inet) {
            this.$httpApi.get(window.apiUrl + '/git?action=pull', { headers: { 'Authorization': $gitobj.getBasicAuth() } }).then((response) => {
              self.toggleRepoState(0) // all good
            })
            .catch((error) => {
              console.error(error)
              console.error('err1')
              if (error.response.status === 500) {
                self.toggleRepoState(6) // need to setup SSH Key for the user
              } else {
                this.$onError(error)
              }
            })
          }
        })
        .catch((error) => {
          console.error(error)
          console.error('err2a')
          console.error(error)
          try {
            if (error.response.status === 500) {
              self.toggleRepoState(5) // State 5 = no .git/config file....
            } else {
              this.$onError(error)
            }
          } catch (ee) {
            self.toggleRepoState(5) // State 5 = no .git/config file....
          }
        })
      }

      return this.selectedWebsite
    }
  },

  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'logOut',
      'toggleRepoUrl',
      'toggleSidebar'
    ]),
    isManual () {
      console.log('manualttt')
      console.log(this.$route.path)
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
      // Is hosted Version
      if (!this.$store.state.app.website) {
        // Hosted version.
        return false
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
      return (this.repoState.updating === 6)
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
    isLoggedIn () {
      if (this.$store.state.app.website) {
        if (this.session && this.session.display_name !== undefined) {
          return true
        }
      }
      console.log('is loggedi n test')
      if (this.$store.state.github == null) {
        return false
      }
      console.log('is loggedi n test 1 ')
      console.error(this.$store.state.github)
      if (this.$store.state.github.logininfo == null) {
        return false
      }
      console.log('is loggedi n test 2 ')
      if (this.$store.state.github.logininfo.username == null) {
        return false
      }

      console.log('is loggedi n test3')
      if (!(this.$store.session === null || this.$store.session === undefined)) {
        if (!(this.$store.session.display_name === null || this.$store.session.display_name === undefined)) {
          return false
        }
      }
      console.log('is loggedi n test4')
      return true
    },
    isSavePushAvailOrisTestMissing () {
      if (!this.isLoggedIn()) {
        return false
      }
      return (this.isTestMissing() || this.isSavePushAvail())
    },
    isSavePushAvail () {
      if (!this.isLoggedIn()) {
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
      console.log('Hit save and Preview Modal')
      this.showModalReviewComment = true
    },
    saveAndPushModal () {
      console.log('save and push')
      this.showModalComment = true
    },
    closeCreateSiteModal () {
      this.selectedIndex = -1
      this.showCreateModal = false
    },
    nextStep (nextstep) {
      console.error('next step')
    },
    GitLogin () {
      // console

    },
    closeModalSaveReview (obj) {
      console.log('close modal review here')
      console.log('got obj of')
      console.log(obj)
      if (obj === undefined) {
        this.selectedIndex = -1
        this.showModalReviewComment = false
      } else {
        var self = this
        if (self) {
        }
        // console.log(this.logininfo)
        // ensure to use login credentials first...
        console.log('github state')
        console.log(this.$store.state.github)
        console.log(this.$store.state)
        console.log(this.$store.state.app.repoState.url)
        console.log(this.$store.state.github.logininfo.username)

        var fullGitPath = ('' + this.$store.state.app.repoState.url).substring(('' + this.$store.state.app.repoState.url).indexOf('/') + 1)
        fullGitPath = fullGitPath.substring(0, fullGitPath.lastIndexOf('.git'))
        var tmpGit = ('' + this.$store.state.app.repoState.url).substring(('' + this.$store.state.app.repoState.url).lastIndexOf('/') + 1)
        tmpGit = tmpGit.substring(0, tmpGit.lastIndexOf('.git'))
        console.log(tmpGit)

        var userGetPath = 'repos/' + this.$store.state.github.logininfo.username + '/' + tmpGit + '/pulls'
        console.log(userGetPath)

        console.log('create pull request')
        var userPostPath = 'repos/' + this.$store.state.github.logininfo.username + '/' + tmpGit + '/pulls'
        if (userPostPath) {
        }
        var $gitobj = this.$github
        console.log('type test')

        var pullReqObj = {
          'title': obj.title || 'New Pull Request',
          'body': obj.desc || 'Please pull this in!',
          'head': this.$store.state.app.repoState.Branch,
          'base': this.$store.state.app.repoState.Master
        }
        if (this.$store.state.github.logininfo.type === 'BitBucket') {
          $gitobj = this.$bitbucket
          userGetPath = '2.0/repositories/' + this.$store.state.github.logininfo.username + '/' + tmpGit + '/pullrequests'
          userPostPath = '2.0/repositories/' + this.$store.state.github.logininfo.username + '/' + tmpGit + '/pullrequests'
          console.log('TEST TITLE')
          console.log(obj)
          console.log(obj.Title)
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
        console.log(this.$store.state.github.logininfo)
        $gitobj.setUserPass(this.$store.state.github.logininfo.user, this.$store.state.github.logininfo.pass)

        console.log(pullReqObj)
        // $gitobj.post(userPostPath, githubPush, function (resp) {
        $gitobj.post(userPostPath, pullReqObj, function (next) {
          console.log('success fully POSTED PULL informations...')

          // success fully POSTED PULL informations.
          //  {"merge_commit": null, "description": "Desc here", "links": {"decline": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/decline"}, "commits": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/commits"}, "self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3"}, "comments": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/comments"}, "merge": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/merge"}, "html": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website/pull-requests/3"}, "activity": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/activity"}, "diff": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/diff"}, "approve": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/approve"}, "statuses": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/pullrequests/3/statuses"}}, "title": "a faf 32 f3 2", "close_source_branch": false, "reviewers": [], "destination": {"commit": {"hash": "1addbeecd463", "links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/commit/1addbeecd463"}}}, "repository": {"links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website"}, "html": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website"}, "avatar": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website/avatar/32/"}}, "type": "repository", "name": "test-simple-website", "full_name": "Gizmodo1/test-simple-website", "uuid": "{a1526fe3-4e13-4d6f-bc36-b4eb55e45300}"}, "branch": {"name": "master"}}, "state": "OPEN", "closed_by": null, "source": {"commit": {"hash": "1ad4ff49dd3d", "links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website/commit/1ad4ff49dd3d"}}}, "repository": {"links": {"self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/test-simple-website"}, "html": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website"}, "avatar": {"href": "https://bitbucket.org/Gizmodo1/test-simple-website/avatar/32/"}}, "type": "repository", "name": "test-simple-website", "full_name": "Gizmodo1/test-simple-website", "uuid": "{a1526fe3-4e13-4d6f-bc36-b4eb55e45300}"}, "branch": {"name": "Demo_Nelify"}}, "comment_count": 0, "author": {"username": "Gizmodo1", "display_name": "francis Lavalliere", "type": "user", "uuid": "{d1f483aa-fb4b-4a10-b7df-e58bd6a7500f}", "links": {"self": {"href": "https://api.bitbucket.org/2.0/users/Gizmodo1"}, "html": {"href": "https://bitbucket.org/Gizmodo1/"}, "avatar": {"href": "https://bitbucket.org/account/Gizmodo1/avatar/32/"}}}, "created_on": "2017-09-15T02:33:43.353448+00:00", "participants": [], "reason": "", "updated_on": "2017-09-15T02:33:43.398141+00:00", "type": "pullrequest", "id": 3, "task_count": 0}
          // console.log(next)

          /*
          self.$http.get(window.apiUrl + '/sshkeys?action=create').then((response) => {
            console.log('doing SSH KEY CREATE done')
            if (response.data !== undefined && response.data !== null) {
              self.pubKey = response.data.Data
              if (self.pubKey !== undefined && self.pubKey !== null) {
                console.log(response.data)
                var githubPush = {
                  key: self.pubKey
                }

                if (self.$store.state.github.logininfo.type === 'BitBucket') {
                  githubPush['accountname'] = self.$store.state.github.logininfo.username
                  githubPush['label'] = 'ServerlessCMS Generated'
                }
                console.log('will create ssh key')
                console.log(githubPush)

                $gitobj.post(userPostPath, githubPush, function (resp) {
                  console.log('received git response for ssh key creation')
                  console.log(resp)
                  if (resp.status === 201 || resp.status === 200) { // 200 = BitBucket success response, 201 = Github success response
                    // SSH Key got created... NICE! Lets fetch
                    self.testFetch()
                  }
                }, function (err) {
                  console.log('recieved github error?')
                  console.log(err)
                })
              }
            }

            // self.sshKeyCreateError = true
          })
          .catch((error) => {
            console.error('got error of')
            console.error(error)
            console.error('err4')
            if (error.response.status === 500) {
              this.sshKeyCreateError = true
            } else {
              this.$onError(error)
            }
          })
          */
        }, this.gitError)

        this.selectedIndex = -1
        this.showModalReviewComment = false
      }
    },
    executeLogout () {
      console.log('sending logout')
      this.logOut(this)
    },
    closeModalSaveBasic (obj) {
      console.log('close modal basic here')
      console.log('got obj of')
      console.log(obj)

      console.log('got title of ' + obj.title)

      // TODO: Create Pull Request Here
      // var self = this
      /*
      this.$httpApi.post(window.apiUrl + '/git?action=save',
      querystring.stringify(obj), {
        headers: {'X-CSRF-Token': this.csrf}
      })
      */
      this.$httpApi.post(window.apiUrl + '/git?action=save',
      obj, {
      })
      .then((response) => {
        this.$message({
          message: 'Your change ID is: ' + response.data.result,
          type: 'success',
          duration: 0,
          showCloseButton: true
        })

        if (response.data.error !== '') {
          this.$notify({
            title: 'Slack webhook',
            message: response.data.error,
            type: 'warning'
          })
        }
      })

      .catch((error) => {
        this.$onError(error)
      })

      this.selectedIndex = -1
      this.showModalComment = false
    },
    closeModalBasic (obj) {
      console.log('close modal basic here')
      console.log('got obj of')
      console.log(obj)

      console.log('got title of ' + obj.title)

      // TODO: Create Pull Request Here
      // var self = this
      /*
      this.$httpApi.post(window.apiUrl + '/git?action=create_pull',
      querystring.stringify(obj), {
        headers: {'X-CSRF-Token': this.csrf}
      })
      */
      this.$httpApi.post(window.apiUrl + '/git?action=create_pull',
      obj, {

      })
      .then((response) => {
        /*
          this.toggleRepoUrl(response.data.Data)
          console.log('toggle repo data')
          if (response !== null && response.data !== null) {
            this.toggleRepo(response.data)
          }
        */
        this.$message({
          message: 'Your change ID is: ' + response.data.result,
          type: 'success',
          duration: 0,
          showCloseButton: true
        })

        if (response.data.error !== '') {
          this.$notify({
            title: 'Slack webhook',
            message: response.data.error,
            type: 'warning'
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
