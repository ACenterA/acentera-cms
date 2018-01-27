<template>
  <div class="app-inner-content">
    <div v-if="isRepoError()">
      <div class="fullheight">

          <article class="padleft tile is-child box">
              <label class="label">Your current repository is in error. <br/><br/>Validate if you have a .git/config file, in your folder or ask for help on our gitter channel.</label>
          </article>

      </div>
    </div>


    <div class="fullheight" v-if="!isRepoError()">
      <sidebarblogs :jsonData="sidebarblogData.json" :show="sidebartwo.opened && !sidebartwo.hidden"></sidebarblogs>
      <div class="plekan-outerdiv tile is-ancestor is-vertical fullheight">

          <article :class="{ hidden: selectedPost }" class="tile is-child box">
              <label class="label">Select a post post from the left menu, or click on Create new post.</label>
          </article>

          <plekan :class="{ hidden: !selectedPost }"></plekan>

          <div v-if="selectedPost !== null" class="rightSide">

          </div>
      </div>
    </div>


  </div>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import TreeView from 'components/TreeView'
import { Sidebarblogs } from 'components/layout/'
import { mapGetters } from 'vuex'
import plekan from 'components/plekan/plekan.vue'
// import Modal from './modals/InfoModalWidget'
// import Vue from 'vue'

// import Modal from './modals/InfoModal'

// const querystring = require('querystring')

export default {
  components: {
    Tooltip,
    TreeView,
    // Modal,
    Sidebarblogs,
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
      selectedPage: null,
      cipher: '',
      userTransitKey: '',
      extra: '?editMode=widget&apiPort=8081&jsPort=8091',
      editing: false,
      chart: [
      ]
    }
  },

  mounted: function () {
    // $('.rightSide')[0].style.top = $('.app-sidebarblog').getBoundingClientRect().top
    var self = this
    console.log('is github')
    console.log(this)
    console.log(this.github)
    this.$store.state.app.topbar.show = true
    this.$store.commit('deleteAllRows', 0, 1)
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
      self.selectedPage = window.apiHost + '/widgetedit/' + data.original.Path + self.extra + '&widget=' + data.original.Path
    })

    this.refreshData()
  },

  computed: {
    ...mapGetters({
      session: 'session',
      github: 'github',
      pkginfo: 'pkg',
      sidebarblogData: 'sidebarblogData',
      sidebartwo: 'sidebartwo',
      repoState: 'repoState',
      selectedPost: 'selectedPost'
    })
  },

  events: {
    incrementTotal: function () {
      console.log('total aaa')
    }
  },

  methods: {
    refreshData () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        console.error('not loaded')
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }

      this.$httpApi.get(window.goHostUrl + '/blog/index.xml', {
        responseType: 'document'
      }).then((response) => {
        console.error(response.data.childNodes[0].children[0])
        var jsObj = JSON.parse(JSON.parse(JSON.stringify(window.xml2json(response.data.childNodes[0].children[0])).replace('undefined', '')))
        console.error(jsObj.channel.item)
        // self.$store.state.app.topbar.json = jsObj.channel.item

        // this.$data.chart = response.data
        // this.$store.commit('TOGGLE_SIDEBAR', false)
        this.$store.commit('TOGGLE_SIDEBAR_BLOGDATA', true)
        this.$store.commit('TOGGLE_BLOGDATA', jsObj.channel.item)
      })
      .catch((error) => {
        console.error(error.stack)
        this.$onError(error)
      })
    },

    updateEditFrame () {
    },

    close () {
      console.log('close here a')
      this.showModal = false
    },

    createWidget (obj) {
      console.log('creating widget using')
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
        type: 'widget',
        headers: obj.headers
      }

      var self = this
      this.$httpApi.post(window.apiUrl + '/widgetupload', postData, {
        // headers: {'TmpHeader': 'tmp'}
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
    },

    closeModalBasic () {
      this.selectedIndex = -1
      this.showModal = false
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
      margin-top: 13px;
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
