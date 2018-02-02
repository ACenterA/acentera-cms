<template>
  <div v-if="loaded" class="app-inner-content">
    <div class="fullheight">
      <modal :visible="showModal" :object="selectedObject " :type="type" @close="closeModalBasic" @createPage="createPage($event)" @editObj="editObj($event)"></modal>
      <sidebartwo :jsonData="sidebartwo.json" :show="sidebartwo.opened && !sidebartwo.hidden"></sidebartwo>
      <div class="tile is-ancestor is-vertical fullheight">

          <article v-if="!selectedPage" class="padleft tile is-child box">
              <label class="label">Select a page to exit from the left menu.</label>
          </article>

          <iframe v-if="selectedPage" class="fullheight" :src="selectedPage"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import TreeView from 'components/TreeView'
import { Sidebartwo } from 'components/layout/'
import { mapGetters } from 'vuex'
import Modal from './modals/InfoModal'
// import Vue from 'vue'

// import Modal from './modals/InfoModal'

const querystring = require('querystring')

export default {
  components: {
    Tooltip,
    TreeView,
    Modal,
    Sidebartwo
  },

  data () {
    return {
      csrf: '',
      showModal: false,
      plaintext: '',
      testTitle: '',
      selectedObject: null,
      type: 'Static',
      selectedPage: null,
      cipher: '',
      userTransitKey: '',
      extra: '?editMode=static&apiPort=8081&jsPort=8091',
      editing: false,
      chart: [
      ]
    }
  },

  mounted: function () {
    var self = this
    this.$bus.$on('staticHtmlSelected', function (data) {
      self.selectedObject = data
      self.showModal = true
    })

    this.$bus.$on('staticHtmlEdit', function (data) {
      self.selectedPage = window.goHostUrl + '/' + data.original.Path + self.extra
    })

    this.refreshData()
  },

  computed: {
    ...mapGetters({
      session: 'session',
      github: 'github',
      pkginfo: 'pkg',
      sidebartwo: 'sidebartwo',
      repoState: 'repoState',
      loaded: 'loaded',
      isWebsite: 'isWebsite'
    })
  },

  events: {
    incrementTotal: function () {
    }
  },

  methods: {
    refreshData () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }
      this.$httpApi.get(window.apiUrl + '/filelist').then((response) => {
        this.$data.chart = response.data
        this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', response.data) // response.data)
        this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
      })
      .catch((error) => {
        this.$onError(error)
      })
    },

    close () {
      this.showModal = false
    },
    createPage (obj) {
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
        type: 'static',
        headers: obj.headers
      }

      var self = this
      this.$httpApi.post(window.apiUrl + '/fileupload', postData, {
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
      this.selectedPage = window.goHostUrl + '/' + obj.original.Path
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
    position: relative;
    left:30px;
    top:30px;
    height:300px;
    flex-grow: 0;
    min-height:300px;
    width:90%;
  }

  .app-inner-content {
      height: 100%;
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
</style>
