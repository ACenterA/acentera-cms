<template>
  <div class="app-inner-content">
    <div v-if="loaded" class="fullheight">
      <plekan></plekan>
      <div class="rightSide" :class="{ active: showRightSideBar}">
        <button class="button is-info float-right" @click="hideRightBar">Close</button>
        <article class="tile is-child box scrollable">
            <br/>
            <br/>
            <br/>
            <article class="tile is-child box scrollable">
              <div v-if="facebookSocial">
                <label class="label">Facebook Link</label>
                <div class="field has-addons">
                  <p class="control is-expanded">
                    <input class="input" type="text"
                           placeholder="https://www.facebook.com/"
                           v-model="facebookSocial.link"/>
                  </p>
                </div>
                <label for="facebook_checkbox">Visible</label>
                <input type="checkbox" id="facebook_checkbox" v-model="facebookSocial.enable">
              </div>
            </article>
            <br/>
            <article class="tile is-child box scrollable">
              <div v-if="linkinSocial">
                <label class="label">LinkedIn Link</label>
                <div class="field has-addons">
                  <p class="control is-expanded">
                    <input class="input" type="text"
                           placeholder="https://www.linkedin.com/company/acentera-inc-/"
                           v-model="linkinSocial.link"/>
                  </p>
                </div>
                <label for="linkedin_checkbox">Visible</label>
                <input type="checkbox" id="linkedin_checkbox" v-model="linkinSocial.enable">
              </div>
            </article>
            <br/>
            <article class="tile is-child box scrollable">
              <div v-if="twitterSocial">
                <label class="label">Twitter Link</label>
                <div class="field has-addons">
                  <p class="control is-expanded">
                    <input class="input" type="text"
                           placeholder="https://www.twitter.com/ACenterA/"
                           v-model="twitterSocial.link"/>
                  </p>
                </div>
                <label for="twitter_checkbox">Visible</label>
                <input type="checkbox" id="twitter_checkbox" v-model="twitterSocial.enable">
              </div>
            </article>

            <br/>
            <button :disabled="isSaving" class="button is-info float-right" @click="updatePage()">Update</button>
            <br/>
            <br/>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import TreeView from 'components/TreeView'
import { Sidebartwo } from 'components/layout/'
import Modal from './modals/InfoModalWidget'
import { mapGetters, mapActions } from 'vuex'

// import Vue from 'vue'
import plekan from 'components/plekan/plekan.vue'
// import dynamicObj from '../../plekan/src/core/modules/dynamic.vue'
// import Vue from 'vue'

// import Modal from './modals/InfoModal'

const querystring = require('querystring')

export default {
  components: {
    Tooltip,
    TreeView,
    Modal,
    Sidebartwo,
    plekan
  },

  data () {
    return {
      csrf: '',
      showModal: false,
      plaintext: '',
      showRightSideBar: false,
      testTitle: '',
      social: {
        facebook: {
          link: '#'
        }
      },
      selectedObject: null,
      type: 'Static',
      cipher: '',
      userTransitKey: '',
      extra: '?editMode=widget&apiPort=8081&jsPort=8091',
      editing: false,
      chart: [
      ]
    }
  },

  mounted: function () {
    var self = this
    this.$store.state.app.topbar.show = true
    this.$bus.$on('staticHtmlSelected', function (data) {
      self.selectedObject = data
      self.showModal = true
    })

    this.$bus.$on('TOGGLE_ADVANCED_SETTINGS', function (data) {
      // if ((self.selectedPost && !self.inPostCreate && !self.postDoesNotExists) && ((self.isPostSelected && !self.postDoesNotExists))) {
      self.showRightSideBar = !self.showRightSideBar
    })

    this.$bus.$on('staticHtmlEdit', function (data) {
      self.selectedPage = window.apiHost + '/widgetedit/' + data.original.Path + self.extra + '&widget=' + data.original.Path
    })

    this.$bus.$on('SAVE_CMD', function (data) {
      self.saveNewSettings()
    })

    this.$bus.$on('LANGUAGE_CHANGE_EVENT', function (data) {
      // TODO: Validate no pending changes ?
      var languageId = data.languagename
      var prefix = '/' + data.id
      if (window.vm.$store.state.app.language === languageId) {
        prefix = '' // no prefix, this is the default site...
      }
      var currentUrl = window.goHostUrl + prefix + '/'
      currentUrl = currentUrl.replace('localhost:1313/', 'localhost:8081/') // in case of local development
      this.$bus.$emit('updateEditFrame', currentUrl.replace('localhost:1313/', 'localhost:8081/'))
    })
    this.refreshData()
  },
  destroyed: function () {
    this.$bus.$off('LANGUAGE_CHANGE_EVENT')
    this.$bus.$off('SAVE_CMD')
    this.$bus.$off('TOGGLE_ADVANCED_SETTINGS')
  },
  computed: {
    ...mapGetters({
      session: 'session',
      github: 'github',
      pkginfo: 'pkg',
      sidebartwo: 'sidebartwo',
      repoState: 'repoState',
      loaded: 'loaded'
    }),
    twitterSocial: function () {
      if (this.$store.state.app.settings && this.$store.state.app.settings.params && this.$store.state.app.settings.params.social && this.$store.state.app.settings.params.social.data) {
        return this.$store.state.app.settings.params.social.data.twitter
      } else {
        return null
      }
    },
    linkinSocial: function () {
      if (this.$store.state.app.settings && this.$store.state.app.settings.params && this.$store.state.app.settings.params.social && this.$store.state.app.settings.params.social.data) {
        return this.$store.state.app.settings.params.social.data.linkedin
      } else {
        return null
      }
    },
    facebookSocial: function () {
      console.error('acebook social test')
      console.error(this.$store.state.app.settings)
      if (this.$store.state.app.settings && this.$store.state.app.settings.params && this.$store.state.app.settings.params.social && this.$store.state.app.settings.params.social.data) {
        return this.$store.state.app.settings.params.social.data.facebook
      } else {
        return null
      }
    },
    selectedPage: function () {
      if (this.$store.state.isLoaded) {
        return ''
      }
      return window.goHostUrl
    }
  },
  events: {
    incrementTotal: function () {
    }
  },
  methods: {
    ...mapActions([
      'saveNewSettings'
    ]),
    updatePage: function (imgData) {
      var self = this
      this.isSaving = true
      this.$bus.$emit('SAVE_CMD')
      setTimeout(function () {
        this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS') // hide sidebar ...
        self.isSaving = false
        self.refreshData()
      }, 600)
    },
    hideRightBar: function () {
      this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS') // _SOCIAL
    },
    refreshWidgets () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }

      this.$httpApi.get(window.apiUrl + '/widgets').then((response) => {
        this.$data.chart = response.data
        // this.$store.commit('TOGGLE_SIDEBAR', false)
        this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
        this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', response.data)
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    refreshData () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }

      // goHostUrl => https://.....workspace in hosted version
      // goHostUrl => //localhost:XXXX in local version
      // TODO: We should parameterizse this.. (ie: /pageX, /, /...)

      var selectedLangItem = this.$store.state.app.languages.languagesHash[this.$store.state.app.languageSelected]

      if (!selectedLangItem) { // weird ? site not yet loaded?
        selectedLangItem = {
          id: 'en'
        }
      }
      var prefix = '/' + selectedLangItem.id
      if (this.$store.state.app.language === this.$store.state.app.languageSelected) {
        prefix = '' // no prefix, this is the default site...
      }
      var currentUrl = window.goHostUrl + prefix + '/'
      currentUrl = currentUrl.replace('localhost:1313/', 'localhost:8081/') // in case of local development
      this.$bus.$emit('updateEditFrame', currentUrl.replace('localhost:1313/', 'localhost:8081/'))
    },
    close () {
      this.showModal = false
    },
    createWidget (obj) {
      var filetmp = obj.folder
      var filepath = filetmp
      var ctr = 0
      while (filetmp[ctr++] === '/') {
        filepath = filetmp.substring(1)
      }

      filetmp = obj.filename
      var file = filetmp
      ctr = 0
      while (filetmp[ctr++] === '/') {
        file = filetmp.substring(1)
      }

      var postData = {
        filename: file,
        path: filepath,
        type: 'widget',
        headers: obj.headers
      }

      var self = this
      this.$httpApi.post(window.apiUrl + '/widgetupload', postData, {
        // headers: {'TmpHeader': 'tmp'}
      })
      .then((response) => {
        self.refreshData()
        self.close()
        self.$notify({
          title: 'Success',
          message: 'Creation successful',
          type: 'success'
        })
        this.selectedPage = window.goHostUrl + '/' + postData.path + '/' + postData.filename + self.extra
      })
      .catch((error) => {
        self.close()
        self.$onError(error)
      })
    },

    editObj (obj) {
      this.selectedPage = window.goHostUrl + '/widgetedit/' + obj.original.Path + this.extra
      this.showModal = false
    },

    closeModalBasic () {
      this.selectedIndex = -1
      this.showModal = false
    },

    AtoggleSidebar: function (f) {
      this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
      this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', this.$data.chart)
    },

    incrementTotal: function () {
    },

    openWrench: function () {
    },

    encryptText: function () {
      if (this.editing) {
        return
      }

      this.$http.post('/api/transit/encrypt', querystring.stringify({
        plaintext: this.plaintext,
        key: this.userTransitKey
      }), {
        headers: {'X-CSRF-Token': this.csrf}
      })

      .then((response) => {
        this.cipher = response.data.result
        this.plaintext = ''
        this.$notify({
          title: 'Success',
          message: 'Encryption successful',
          type: 'success'
        })
      })

      .catch((error) => {
        this.$onError(error)
      })
    },
    decryptText: function () {
      if (this.editing) {
        return
      }

      this.$http.post('/api/transit/decrypt', querystring.stringify({
        cipher: this.cipher,
        key: this.userTransitKey
      }), {
        headers: {'X-CSRF-Token': this.csrf}
      })

      .then((response) => {
        this.plaintext = response.data.result
        this.cipher = ''
        this.$notify({
          title: 'Success',
          message: 'Decryption successful',
          type: 'success'
        })
      })

      .catch((error) => {
        this.$onError(error)
      })
    },

    clearPlaintext: function () {
      this.plaintext = ''
    },
    clearCipher: function () {
      this.cipher = ''
    },
    isRepoError () {
      return (this.repoState.updating >= 5)
    },
    changeKey: function () {
      this.editing = true
    }
  }
}
</script>

<style scoped>
.padleft {
  // position: relative;
  left:0px;
  top:0px;
  height:300px;
  flex-grow: 0;
  min-height:300px;
  width:90%;
}

.app-inner-content {
    height: 100%;
    margin-top: 0px;
}
.button {
  margin: 5px 0 0;
}

.fullheight {
  height: 100%;
  min-height:100%;
}

.control .button {
  margin: inherit;
}

.fa-trash-o {
  color: red;
}

.fa-info {
  color: lightskyblue;
}


.rightSide.active {
  right: 0px;
  z-index: 800;
}

.rightSide {
    position: fixed;
    width: 200px;
    height: 100%;
    background-color: #f2f2f2;
    right: -300px;
    padding: 10px;
    top: 105px;
    border-left: 1px solid #ddd;
    transition: all .3s;
    z-index: 12;
    box-shadow: 0px 3px 78px 0px rgba(0, 0, 0, 0.1);
}

.rightSide {
    position: fixed;
    width: 50%;
    height: 100%;
    background-color: #f2f2f2;
    right: -50%;
    padding: 10px;
    top: 105px;
    border-left: 1px solid #ddd;
    transition: all .3s;
    z-index: 12;
    box-shadow: 0px 3px 78px 0px rgba(0, 0, 0, 0.1);
}

.rightSide.active {
  right: 0px;
  // z-index: 2;
}

.animated {
    animation-duration: .377s;
}

.scrollable {
  // overflow-y: scroll;
}
.float-right {
  float: right;
}

.animated {
    animation-duration: .377s;
}

</style>
