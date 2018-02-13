<template>
  <div class="app-inner-content">
    <div class="fullheight">
      <sidebarblogs :jsonData="sidebarblogData.json" :show="sidebartwo.opened && !sidebartwo.hidden"></sidebarblogs>
      <div class="plekan-outerdiv tile is-ancestor is-vertical fullheight">
          <article :class="{ hidden: isPostSelected }" class="tile is-child box">
              <label class="label">Select a post post from the left menu, or click on Create new post.</label>
          </article>

          <article :class="{ hideme: !isPostSelected || inPostCreate, hidden: ((isPostSelected && !postDoesNotExists)) }" class="tile is-child box">
              <label class="label">This Post doesn't have this language created yet.</label>
              <button class="button is-info" @click="create('newLang','blogs')">Create Draft</button>
          </article>

          <article :class="{ hidden: !inPostCreate }" class="tile is-child box">
            <label class="label">{{ blogPostEnterLang }}</label>
            <label class="label">Current Language: {{ selectedLanguage }}</label>
            <br/>
            <!--
            <div class="field has-addons">
              <p class="control is-expanded">
                    <span>Title</span>
                    <input class="input" type="text"
                           v-model="newTitle"
                           :placeholder="titlePlaceHolder">
              </p>
            </div>
            <br/>
            <br/>
            -->
            <div class="field has-addons">
              <p class="control is-expanded">
                  <span>File Name</span>
                  <input type="text" v-model="fileName" @input="fileNameValidator()" :placeholder="shortName">
                  <br/>
                  <br/>
                  <small>blogs/{filename}.{lang}.md <br/><br/>lang.md will be appended to the filename</small>
              </p>
            </div>

            <br/>
            <button class="button is-info" @click="create('new','blogs')">Create Post</button>
          </article>

          <plekan :class="{ hidden: inPostCreate || !isPostSelected || postDoesNotExists }"></plekan>
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
import { mapGetters, mapActions } from 'vuex'
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
      newTitle: null,
      fileName: null,
      selectedObject: null,
      type: 'Static',
      selectedPage: null,
      actionPending: false,
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
    this.$store.commit('deleteAllRows', 0, 1)
    this.$bus.$on('staticHtmlSelected', function (data) {
      self.selectedObject = data
      self.showModal = true
    })

    this.$bus.$on('staticHtmlEdit', function (data) {
      self.selectedPage = window.apiHost + '/widgetedit/' + data.original.Path + self.extra + '&widget=' + data.original.Path
    })

    this.$bus.$on('NO_DATA_FOUND', function (data) {
      // //console.error('NO DATA FOUND FOR THIS LANGUAGE..')
    })

    this.$bus.$on('SAVE_CMD', function (data) {
      const d = document.getElementsByTagName('iframe')[0].contentWindow.document
      // TODO: use somehting else than contenteditable ? ie: editor-content ?
      if ($(d).find('[contenteditable=true]').length <= 1) {
        return
      }
      var markDownValue = window.vm.turndownService.turndown($(d).find('[contenteditable=true]')[2].innerHTML)
      if (!(window.vm.$store.state.app.selectedItem && window.vm.$store.state.app.selectedItem.item)) {
        return
      }
      var item = window.vm.$store.state.app.selectedItem.item
      var tmpLink = item.link
      if (item.link.startsWith('//') || item.link.startsWith('http://') || item.link.startsWith('https://')) {
        tmpLink = item.link.substring(item.link.indexOf('/', 5))
      }
      if (tmpLink.endsWith('/')) {
        tmpLink = tmpLink.substring(0, tmpLink.lastIndexOf('/'))
      }

      var selectedLangItem = self.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
      markDownValue = markDownValue.replace('<br>', '\\n').replace('<br/>', '\\n')
      var updateData = {
        type: 'blogs',
        id: tmpLink,
        title: item.title,
        draft: item.draft,
        date: item.pubDate,
        lang: selectedLangItem.id,
        content: markDownValue
      }

      var httpApiAction = self.$httpApi.put
      httpApiAction(window.apiUrl + '/content/update', updateData, {
        // headers: {'TmpHeader': 'tmp'}
      })
      .then((response) => {
        self.$notify({
          title: 'Saved.',
          message: 'Successfully saved your new awesome content.',
          type: 'success'
        })
      })
      .catch((error) => {
        // self.actionPending = false
        self.$onError(error)
      })
    })

    this.$bus.$on('LANGUAGE_CHANGE_EVENT', function (data) {
      // TODO: Validate no pending changes ?

      // Refresh selected post link ( it will get the proper language item)
      self.selectPost(window.vm.$store.state.app.selectedItem)
    })
    this.refreshData()
  },
  destroyed: function () {
    this.$bus.$off('LANGUAGE_CHANGE_EVENT')
    // this.$bus.$off('SITE_PAGE_CHANGE_EVENT')
    this.$bus.$off('NO_DATA_FOUND')
    this.$bus.$off('SAVE_CMD')
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
    }),
    shortName () {
      var result = (this.newTitle || '').replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace
             .replace(/--+/, '-')
             .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
             .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
             .replace(/-$/, '')
             .replace(/-$/, '')
             .replace(/-$/, '')
             .toLowerCase()
      return result
    },
    titleFromShortName () {
      var result = (this.fileNameValidator()).replace(/-/g, ' ')
      return result
    },
    selectedLanguage: function () {
      return this.$store.state.app.languageSelected
    },
    blogPostEnterLang: function () {
      if (this.$store.state.app.languageSelected === 'Francais') {
        return 'Inscrivez les informations pour votre article...'
      } else if (this.$store.state.app.languageSelected === 'English') {
        return 'Please enter your post informations...'
      } else if (this.$store.state.app.languageSelected === 'Deutsch' || this.$store.state.app.languageSelected === 'German') {
        return 'Bitte geben Sie Ihre Post Informationen ein ...'
      }

      // default
      return 'Please enter your blog informations...'
    },
    titlePlaceHolder: function () {
      if (this.$store.state.app.languageSelected === 'Francais') {
        return 'Inscrivez le titre de votre post.'
      } else if (this.$store.state.app.languageSelected === 'English') {
        return 'Enter your post title here.'
      } else if (this.$store.state.app.languageSelected === 'Deutsch' || this.$store.state.app.languageSelected === 'German') {
        return 'Ihr Eintrag Geben Sie hier den Titel der'
      }

      // default
      return 'Enter your post title here.'
    },
    isPostSelected: function () {
      return this.$store.state.app.selectedItem !== null
    },
    inPostCreate: function () {
      return this.$store.state.app.createItem
    },
    postDoesNotExists: function () {
      return (('' + this.$store.state.app.nodata) === 'true')
    }
  },

  events: {
    incrementTotal: function () {
    }
  },

  methods: {
    ...mapActions([
      'selectPost'
    ]),
    fileNameValidator () {
      try {
        var result = (this.fileName || this.shortName).replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace
               .replace(/--+/, '-')
               .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
               .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
               .toLowerCase()
        this.fileName = result
        return result
      } catch (ff) {
      }
    },
    create (newOrUpdate, type) {
      if (this.actionPending) {
        return
      }

      var self = this

      var fileToCreate = null
      var action = 'new'
      var tmpId = ''
      if (newOrUpdate === 'newLang') {
        action = 'newlang'
        var item = window.vm.$store.state.app.selectedItem.item
        var tmpLink = item.link
        if (item.link.startsWith('//') || item.link.startsWith('http://') || item.link.startsWith('https://')) {
          tmpLink = item.link.substring(item.link.indexOf('/', 5))
        }
        if (tmpLink.endsWith('/')) {
          tmpLink = tmpLink.substring(0, tmpLink.lastIndexOf('/'))
        }
        fileToCreate = tmpLink // includes the /{type}/
        tmpId = fileToCreate
      } else {
        fileToCreate = this.fileNameValidator()
        tmpId = '/' + type + '/' + fileToCreate
      }
      var selectedLangItem = this.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
      var postData = {
        type: type,
        title: this.newTitle,
        lang: selectedLangItem.id,
        filename: fileToCreate,
        id: tmpId
      }

      if (!postData.title || postData.title === '') {
        postData.title = this.titleFromShortName
      }
      self.actionPending = true
      var httpApiAction = this.$httpApi.post
      if (newOrUpdate === 'update') {
        httpApiAction = this.$httpApi.put
      }

      // action = new, or newlang
      httpApiAction(window.apiUrl + '/content/' + action, postData, {
        // headers: {'TmpHeader': 'tmp'}
      })
      .then((response) => {
        var newPost = {
          pubDate: 'Now',
          title: postData.title,
          draft: true
        }
        if (action === 'new') {
          newPost['guid'] = '/' + type + '/' + postData.filename
          newPost['link'] = '/' + type + '/' + postData.filename
        } else {
          // newlang
          newPost['guid'] = postData.id
          newPost['link'] = postData.id
        }

        if (action === 'new') {
          // only add the post to the sidebar object if new post not new language
          self.$store.state.app.sidebarblogData.json.unshift(newPost)
        }

        // Select the post for editing..
        // Lets give 500 milliseconds...
        return setTimeout(function () {
          self.actionPending = false
          self.$notify({
            title: 'Success',
            message: 'Creation successful',
            type: 'success'
          })
          self.selectPost({ vue: this, item: newPost, retry: 5 })
        }, 500)

        // Returned statement in setTimeout
      })
      .catch((error) => {
        self.actionPending = false
        self.$onError(error)
      })
    },
    refreshData () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }

      // TOOD: Add an option for the /language prefix?
      this.$httpApi.get(window.goHostUrl + '/blogs/index.xml', {
        responseType: 'document'
      }).then((response) => {
        var jsObj = JSON.parse(JSON.parse(JSON.stringify(window.xml2json(response.data.childNodes[0].children[0])).replace('undefined', '')))
        this.$store.commit('TOGGLE_SIDEBAR_BLOGDATA', true)
        this.$store.commit('TOGGLE_BLOGDATA', jsObj.channel.item)
      })
      .catch((error) => {
        this.$onError(error)
      })
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

  .hideme {
    display: none;
  }
</style>
