<template>
  <!-- Home -->
  <div class="content has-text-centered">

    <div v-if="isWebsite && !showSiteBeingCreated">

      <!-- For Each Websites -->

      <section class="">
        <div class="">
          <nav class="">
            <div class="box-center-main">
              <div>
                  <div class="center-text">
                      <h4 class="site-title">Choosea template for your website</h4>
                      (i know its duplicated .. lack of theme right now)
                  </div>
              </div>
            </div>
          </nav>
        </div>
      </section>


      <div class="width-full">&nbsp;</div>


      <section class="">
        <div class="">

        <div class="box box-template" v-for="item in themes">
          <div class="template-thumbnails">
              {{ item.Name }}
              <div class=""
                    style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">

                    <div v-if="item.Screenshot">
                      <img  :src="item.Screenshot" class="mw-100">
                    </div>
                    <div v-else>
                      <img v-if="item.Repository" :src="item.Repository + 'raw/master/images/screenshot.png'" class="mw-100">
                    </div>
              </div>
              <div class="width-full">
                <div class="float-left width-50">

                  <div v-if="isLoggedIn" class="button button-site is-primary is-outlined nav-item is-hidden-mobile" @click="nextStep(item)">
                    Edit site
                  </div>
                <!--
                <router-link :to="{ path: '/templates/' + item.Name + '/edit'}" :exact="true">
                </router-link>
                -->
                <div v-else class="button button-site is-primary is-outlined nav-item is-hidden-mobile" @click="loginGitBit(item)">
                  Edit site
                </div>

                </div>
                <div class="float-right width-50 small-leftmargin">
                  <router-link :to="{ path: '/templates/' + item.Name + '/preview'}" :exact="true">
                    <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile">
                      Preview
                    </div>
                  </router-link>

                </div>
              </div>
          </div>
        </div>


        </div>
      </section>




<!--
      <section class="">
        <div class="">
          <nav class="box">
            <div class="box-left">
              <div>
              <div class="imageloader loaded site-details--thumbnail desktop"
              style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                <img src="https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023" class="mw-100"
              ></div>
              </div>
            </div>
            <div class="line">&nbsp;</div>
            <div class="box-center">
              <div>
                <div class="col-md-8 col-sm-12"><div class="site-details--content">
                  <div class="site-details--content--header clearfix">
                    <div class="float-left">
                      <h4 class="site-title">mytestsite03</h4>
                      <span class="status--subscription-status"><span class="status--subscription-status published">Published</span>
                    </span>
                  </span>
                </div>
                </div>
                </div>
                </div>
              </div>
            </div>
            <div class="box-right">
              <div>
                  <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile">
                      <span>Edit site</span>
                  </div>
              </div>
            </div>
          </nav>
        </div>
      </section>
-->

    </div>

    <div v-if="showSiteBeingCreated">
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>

      Your site is being created....
      <br/>
      A new repository and a new deploy key as been added to your Git repository.
      <br/>
      Please standby...
      <br/>
    </div>

    <div v-if="!isWebsite">
      <h1 class="is-title is-bold">{{ pkg.name.replace('-', ' ') }}</h1>

      <p>
        <strong>{{ pkg.description }}</strong>
      </p>

      <div v-if="isRepoUpdating()">
        <p>Please wait, we are trying to gather latest updates on your website...</p>
      </div>

      <div v-if="isRepoUpdated()">
        <p>Start designing your website by using the left toolbar in the design section.</p>
      </div>
      <div v-if="isRepoMissing()">
        <p>There is an error with your repository. You do not have a .git/config file.</p>
      </div>

      <br/>
      <div v-if="repoUrl">
      Repository Information: {{ repoUrl }}
      </div>

      <div v-if="isKeyMissing()">
        <br/>
        <p class="blue">SSH Key is missing. &nbsp;<router-link to="/login" :exact="true"><b>Click here to configure.</b></router-link></p>
      </div>
    </div>

    <gitModal :visible="showLoginModal" :template="selectedItem" @nextStep="nextStep($event)" @close="closeGitModal"></gitModal>

    <createSiteModal :visible="showCreateModal" :template="selectedItem" @changePage="changePage($event)" @close="closeCreateSiteModal"></createSiteModal>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import GitModal from './modals/GitLogin'
import createSiteModal from './modals/CreateSiteModal'

export default {
  components: {
    GitModal,
    createSiteModal
  },
  data () {
    return {
      themes: [],
      pkg: this.$store.state.pkg,
      selectedItem: null,
      selectedItemName: null,
      showLoginModal: false,
      showCreateModal: false,
      showSiteBeingCreated: false
    }
  },
  computed: {
    isLoggedIn: function () {
      if (this.$store.state.github == null) {
        return false
      }
      if (this.$store.state.github.logininfo == null) {
        return false
      }
      if (this.$store.state.github.logininfo.username == null) {
        return false
      }
      if (!(this.$store.session === null || this.$store.session === undefined)) {
        if (!(this.$store.session.display_name === null || this.$store.session.display_name === undefined)) {
          return false
        }
      }
      return true
    },
    repoState: function () {
      return this.$store.state.app.repoState
    },
    repoUrl: function () {
      if (this.$store.state.app.repoState.hasOwnProperty('url')) {
        if (this.$store.state.app.repoState.hasOwnProperty('url') !== undefined && this.$store.state.app.repoState.hasOwnProperty('url') !== null && this.$store.state.app.repoState.hasOwnProperty('url') !== '') {
          return this.$store.state.app.repoState.url
        }
      }
    }
  },
  mounted () {
    var self = this
    self.$store.state.app.sidebarglobal.opened = false

    // better not to set UX is nicer
    // self.$store.state.app.sidebarglobal.hidden = true

    // TODO: Test github themes, then local file as fallback ?
    this.$http.get('/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      self.themes = response.data
      this.switchTab(0)
    }).catch((error) => {
      this.$onError(error)
    })
  },

  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'toggleRepoUrl',
      'isWebsite',
      'refreshUser'
    ]),
    loginGitBit: function (item) {
      this.showLoginModal = true
      this.selectedItem = item
    },
    switchTab: function (index) {
    },
    closeGitModal () {
      this.selectedIndex = -1
      this.showLoginModal = false
    },
    closeCreateSiteModal () {
      this.selectedIndex = -1
      this.showCreateModal = false
    },
    isRepoUpdating () {
      return (this.repoState.updating === 1)
    },
    isRepoUpdated () {
      return (this.repoState.updating === 0)
    },
    isRepoMissing () {
      return (this.repoState.updating === 5)
    },
    isKeyMissing () {
      return (this.repoState.updating === 6)
    },
    nextStep (nextStepData) {
      // Theme => nextStepData.Name
      // next route => '/templates/' + nextStepData.Name + '/edit'
      this.selectedItem = nextStepData

      this.selectedIndex = -1
      this.showLoginModal = false
      this.showCreateModal = true
      // work but not this .. this.$router.push({ 'path': '/templates/' + nextStepData.Name + '/edit' })
    },
    changePage (nextStepData) {
      var self = this
      // Theme => nextStepData.Name
      // next route => '/templates/' + nextStepData.Name + '/edit'
      this.showCreateModal = false

      this.showSiteBeingCreated = true
      self.$store.state.app.websiteInCreationMode = true // To prevent Navbar messages...

      var websiteId = nextStepData.websiteId // '12c47ce0-ccc5-11e7-b808-bd4f405609c4'
      this.$notify({
        title: 'Creating site.',
        message: 'Your site is being created...',
        type: 'success'
      })

      var projectId = nextStepData.projectId

      var initSite = {
        'projectId': projectId,
        'websiteId': websiteId
      }

      // websiteId

      var ready = function () {
        var initSiteRepoCall = window.websiteapiUrl + '/sites/v1/websites/' + initSite.projectId + '/' + initSite.websiteId + '/state/ready'
        var h = { 'authorization': 'Bearer ' + self.$store.state.session.token }
        self.$http.post(initSiteRepoCall, initSite, {
          headers: h
        }).then((response) => {
          self.$notify({
            title: 'Website ready.',
            message: 'Your website has been created.',
            type: 'success'
          })

          window.vm.$store.commit('SELECT_INITIAL_WEBSITE', nextStepData)
          try {
            self.refreshUser()
          } catch (f) {
          }
          setTimeout(function () {
            // do not update state.app.websiteInCreationMode ... the emit changePage will reset this to false ..
            self.$store.commit('setProjectIdForCreation', response.data.projectId)
            self.$store.commit('setWebsiteIdForCreation', response.data.websiteId)
            window.vm.$store.commit('SELECT_WEBSITE', initSite)

            self.$store.state.app.websiteInCreationMode = false
            self.$router.push({ 'path': '/' }) // sites/' + websiteId + '/edit' }) // this route is bad.. it should be going to /
          }, 1000)
        }, function (errr) {
          self.$store.state.app.websiteInCreationMode = false // To prevent Navbar messages...
          self.$notify({
            title: 'Website ready.',
            message: 'We could not update your website state :(.  Please contact us.',
            type: 'danger'
          })
        })
      }
      var fctCheckNewSite = function (itr) {
        $.ajax({
          url: 'http://' + websiteId + '.web.acentera.com/?' + new Date(),
          type: 'GET',
          crossDomain: true,
          // dataType: 'jsonp',
          success: function () {
            ready()
          },
          error: function (e) {
            // error?
            try {
              if (e.readyState === 0) {
                // All Good but Cross Domain Error. We assume the website is alive.
                ready()
                return
              }
              if (e.response === undefined) {
                e.response = e
              }
              if (e.response.status === 404) {
                if (itr <= 30) {
                  setTimeout(function () {
                    fctCheckNewSite(++itr)
                  }, 5000)
                } else {
                  self.$notify({
                    title: 'Creating site.',
                    message: 'Your site could not be created...',
                    type: 'danger'
                  })

                  setTimeout(function () {
                    self.$store.state.app.websiteInCreationMode = false // To prevent Navbar messages...
                    self.$router.push({ 'path': '/' })
                  }, 5000)
                }
              } else {
              }
            } catch (ff) {
              if (itr <= 30) {
                setTimeout(function () {
                  fctCheckNewSite(++itr)
                }, 5000)
              } else {
                setTimeout(function () {
                  self.$store.state.app.websiteInCreationMode = false // To prevent Navbar messages...
                  self.$router.push({ 'path': '/' })
                }, 5000)
              }
            }
          }
        })
      }
      fctCheckNewSite(0)

      //

      // work but not this .. this.$router.push({ 'path': '/templates/' + nextStepData.Name + '/edit' })
    }
  }

}
</script>

<style lang="scss" scoped>

@import '~bulma/sass/utilities/variables';

.is-title {
  text-transform: capitalize;
}
.box {
  min-height:120px;
  display: inline-block;
}

.box-left {
    float: left;
    height:100%;
    // margin-right:50px;
    width:40%;
    -webkit-overflow-scrolling: touch;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    max-width: 100%;
    overflow: auto;
    justify-content: flex-start;
    white-space: nowrap;
    -ms-flex-pack: start;
}

.box-right {

    -webkit-overflow-scrolling: touch;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    max-width: 100%;
    overflow: auto;
    -ms-flex-pack: end;
    justify-content: flex-end;
}

.background-box {
  background-color: white;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  color: #4a4a4a;
  display: block;
  padding: 1.25rem;
  width: 20%;
}

.width-50 {
  // width: 30%;
  width: 100%;
}

.small-leftmargin {
  margin-left:30px;
}


.width-full {
  width: 100%;
  display: inline-flex;
}

.line {
  height: 100%;
  position: relative;
  float: left;
  height: auto;
  border-left: 1px solid #efefef;
  height: 100%;
}

.box-template {
  width:25%;
  margin-left:30px;
}

.template-thumbnails {
   width:100%;
}

.box-center-main {
  width:100%;
  padding-left:10px;
  float: left;
  -ms-flex-align: stretch;
  align-items: stretch;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-positive: 0;
  flex-grow: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -ms-flex-pack: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}
.box-center {
    padding-left:10px;
    float: left;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 0;
    flex-grow: 0;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    -ms-flex-pack: center;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
}

.button-site {
  min-width:100px;
}

.float-left {
  float:left;
}

.center-text-template {
  position: relative;
  text-align: center;
  display: inline-block; /* changed this line */
  // color: white;
  // text-shadow: 0 1px 5px grey;
  clear: both;
}
.center-text {
    position: relative;
    top: 50%;
    display: inline;
    left: 50%; /* added this line and changed the next four lines */
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    display: inline-block; /* changed this line */
    // color: white;
    // text-shadow: 0 1px 5px grey;
    clear: both;
}
.box-main {
  width:80%;
  text-align:center;
}
</style>
