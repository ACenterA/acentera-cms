<template>
  <div class="app-inner-content">
    <div v-if="loaded" class="fullheight">
      <plekan></plekan>
    </div>
  </div>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import TreeView from 'components/TreeView'
import { Sidebartwo } from 'components/layout/'
import Modal from './modals/InfoModalWidget'
import { mapGetters } from 'vuex'

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
      testTitle: '',
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

    this.$bus.$on('staticHtmlEdit', function (data) {
      self.selectedPage = window.apiHost + '/widgetedit/' + data.original.Path + self.extra + '&widget=' + data.original.Path
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
      loaded: 'loaded'
    }),
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
      var currentUrl = window.goHostUrl + '/'
      this.$bus.$emit('updateEditFrame', currentUrl.replace('localhost:1313/', 'localhost:8081/'))

      /*
      if (obj.item.link.indexOf('localhost:') >= 0 && obj.item.link.indexOf('localhost:') <= 8) {
        obj.vue.$bus.$emit('updateEditFrame', obj.item.link.replace('localhost:1313/', 'localhost:8081/'))
      } else {
        obj.vue.$bus.$emit('updateEditFrame', window.goHostUrl + obj.item.link)
      }
      */
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

.animated {
    animation-duration: .377s;
}

</style>
