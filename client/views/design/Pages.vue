<template>
  <div class="app-inner-content">
    <div v-if="isRepoError()">
      <div class="tile is-ancestor is-vertical fullheight">

          <article class="padleft tile is-child box">
              <label class="label">Your current repository is in error. <br/><br/>Validate if you have a .git/config file, in your folder or ask for help on our gitter channel.</label>
          </article>

      </div>
    </div>


    <div class="fullheight" v-if="!isRepoError()">
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
    console.log('is github')
    console.log(this)
    console.log(this.github)
    this.$bus.$on('staticHtmlSelected', function (data) {
      console.log('reciev inc dotal modal')
      console.log(this)
      self.selectedObject = data
      self.showModal = true
    })

    this.$bus.$on('staticHtmlEdit', function (data) {
      console.log('reciev edidt of ...data')
      console.log(data)
      // self.selectedObject = data
      // self.showModal = true
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
      repoState: 'repoState'
    })
  },

  events: {
    incrementTotal: function () {
      console.log('total aaa')
    }
  },

  methods: {
    refreshData () {
      console.log('get file listing')
      this.$http.get(window.apiUrl + '/filelist').then((response) => {
        this.$data.chart = response.data
        // this.$store.commit('TOGGLE_SIDEBAR', false)
        this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
        this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', response.data)
      })
      .catch((error) => {
        this.$onError(error)
      })
    },

    close () {
      console.log('close here a')
      this.showModal = false
    },
    /*
    editObj () {
      console.log('edit obj of a')
    },
    */
    createPage (obj) {
      console.log('creating page using')
      console.log(obj)

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
      this.$http.post(window.apiUrl + '/fileupload', postData, {
        headers: {'TmpHeader': 'tmp'}
      })
      .then((response) => {
        console.log('got response')
        console.log(response)
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
        console.log('got error eee')
        console.log(error)
        self.close()
        self.$onError(error)
      })
    },

    editObj (obj) {
      console.log('edit obj of')
      console.log(obj)
      console.log(obj.original.Path)
      this.selectedPage = window.goHostUrl + '/' + obj.original.Path
      this.showModal = false
    },

    closeModalBasic () {
      console.log('close modal basic here')
      this.selectedIndex = -1
      this.showModal = false
    },

    AtoggleSidebar: function (f) {
      this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
      this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', this.$data.chart)
    },

    incrementTotal: function () {
      console.log('total aaa')
    },

    openWrench: function () {
      console.log('azz')
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
