<template>
  <div class="app-inner-content">
    <div class="fullheight">
      <sidebarblogs :jsonData="sidebarblogData.json" :show="sidebarblogData.loaded"></sidebarblogs>
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
            <button class="button is-info" @click="create('new','blogs')" :disabled="actionPending">Create Post</button>
          </article>

          <div class="rightSide" :class="{ active: showRightSideBar}">
            <button class="button is-info float-right" @click="hideRightBar">Close</button>

            <article class="tile is-child box scrollable">
                <label class="label">Title</label>
                <div class="field has-addons">
                  <p class="control is-expanded">
                    <input class="input" type="text"
                           v-model="selectedPost.title"/>
                  </p>
                </div>
                <br/>
                <label class="label">Description</label>
                <div v-if="selectedPost.frontMatter" class="field has-addons">
                  <p class="control is-expanded">
                    <input class="input" type="text"
                           v-model="selectedPost.frontMatter.description"/>
                  </p>
                </div>
                <br/>

                <label class="label">Post Date</label>
                <div v-if="selectedPost.frontMatter" class="field has-addons">
                  <p class="control is-expanded">
                    <datetime format="YYYY/MM/DD h:i:s" width="300px" @update:date-value="val => dob = val" v-model="selectedPost.pubDate"></datetime>
                  </p>
                </div>

                <br/>
                <label class="label">Cover Image</label>
                  <file-upload :clean="true"
                            types="png|jpg|jpeg|gif"
                            :preventDrop="true"
                            :origimage="currentImage"
                            :elementItem="tmpItem"
                            :fileChange="fileChange"
                            >
                  </file-upload>
                <br/>
                <!-- <button :disabled="isSaving" class="button is-warning float-let" @click="deletePost()">Delete Post</button> -->

                <button v-if="isDefaultLang" :disabled="isSaving" class="button is-danger float-let" @click="deleteAllLangPost()">Delete Post (All Languages)</button>
                <button v-if="!isDefaultLang" :disabled="isSaving" class="button is-danger float-let" @click="deleteAllLangPost()">Delete Post (Single Language)</button>

                <button :disabled="isSaving" class="button is-info float-right" @click="updatePage()">Update</button>
                <br/>
                <br/>
                <br/>
                <br/>
            </article>
          </div>

          <plekan :class="{ hidden: inPostCreate || !isPostSelected || postDoesNotExists }"></plekan>
      </div>
    </div>


  </div>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import datetime from 'vuejs-datetimepicker'
// import moment from 'moment'
import TreeView from 'components/TreeView'
import { Sidebarblogs } from 'components/layout/'
import { mapGetters, mapActions } from 'vuex'
import plekan from 'components/plekan/plekan.vue'
import fileUpload from 'components/plekan/fileUpload'
// import Modal from './modals/InfoModalWidget'
// import Vue from 'vue'

// import Modal from './modals/InfoModal'

// const querystring = require('querystring')

export default {
  components: {
    Tooltip,
    datetime,
    TreeView,
    // Modal,
    Sidebarblogs,
    plekan,
    fileUpload
  },

  data () {
    return {
      csrf: '',
      isSaving: false,
      showModal: false,
      plaintext: '',
      tmpItem: {},
      newTitle: null,
      fileName: null,
      selectedObject: null,
      type: 'Static',
      selectedPage: null,
      actionPending: false,
      cipher: '',
      showRightSideBar: false,
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

    this.$bus.$on('previewWebsite', function (data) {
      if (window.vm.$store.state.app.selectedItem) {
        var item = window.vm.$store.state.app.selectedItem.item
        if (item) {
          var tmpLink = item.link
          if (item.link.startsWith('//') || item.link.startsWith('http://') || item.link.startsWith('https://')) {
            tmpLink = item.link.substring(item.link.indexOf('/', 8))
          }
          if (tmpLink.endsWith('/')) {
            tmpLink = tmpLink.substring(0, tmpLink.lastIndexOf('/'))
          }
          var selectedLangItem = self.$store.state.app.languages.languagesHash[self.$store.state.app.languageSelected]
          window.previewWebsiteSent = -1
          var urlTemp = window.goHostUrl + item.link
          if (self.$store.state.app.language === selectedLangItem.languagename) {
            // This is default language, do not add the /{langcode} prefix

            // TODO: Find better implementation ...
            if (!self.$store.state.app.website) {
              urlTemp = urlTemp.replace('//localhost:1313', '').replace(':8081/', ':1313/') // our gohugo link contains the whole url which is bad..
            }
            window.open(urlTemp, '_blank')
          } else {
            // TODO: Find better implementation ...
            urlTemp = window.goHostUrl + '/' + selectedLangItem.id + item.link
            if (!self.$store.state.app.website) {
              urlTemp = urlTemp.replace('//localhost:1313', '').replace(':8081/', ':1313/') // our gohugo link contains the whole url which is bad..
            }
            window.open(urlTemp, '_blank')
          }
        }
      }
    })

    this.$bus.$on('TOGGLE_ADVANCED_SETTINGS', function (data) {
      if ((self.selectedPost && !self.inPostCreate && !self.postDoesNotExists) && ((self.isPostSelected && !self.postDoesNotExists))) {
        self.showRightSideBar = !self.showRightSideBar
      }
    })

    this.$bus.$on('staticHtmlSelected', function (data) {
      self.selectedObject = data
      self.showModal = true
    })

    this.$bus.$on('UNDRAFT', function (data) {
      //  SAVE
      data.draft = false
      this.$bus.$emit('SAVE_CMD', data)
      // self.selectPost({ vue: this, item: data, retry: 5 })
    })

    this.$bus.$on('staticHtmlEdit', function (data) {
      self.selectedPage = window.apiHost + '/widgetedit/' + data.original.Path + self.extra + '&widget=' + data.original.Path
    })

    this.$bus.$on('NO_DATA_FOUND', function (data) {
    })

    this.$bus.$on('SAVE_CMD', function (data) {
      const d = document.getElementsByTagName('iframe')[0].contentWindow.document
      // TODO: use somehting else than contenteditable ? ie: editor-content ?
      if ($(d).find('[contenteditable=true]').length !== 1) {
        return
      }
      var markDownValue = window.vm.turndownService.turndown($(d).find('[contenteditable=true]')[0].innerHTML)
      if (!(window.vm.$store.state.app.selectedItem && window.vm.$store.state.app.selectedItem.item)) {
        return
      }
      var item = window.vm.$store.state.app.selectedItem.item
      var tmpLink = item.link
      if (item.link.startsWith('//') || item.link.startsWith('http://') || item.link.startsWith('https://')) {
        tmpLink = item.link.substring(item.link.indexOf('/', 8))
      }
      if (tmpLink.endsWith('/')) {
        tmpLink = tmpLink.substring(0, tmpLink.lastIndexOf('/'))
      }
      var selectedLangItem = self.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
      markDownValue = markDownValue.replace('<br>', '\\n').replace('<br/>', '\\n')
      var dtStringDate = item.pubDate
      try {
        var arr = item.pubDate.split(/\/|\s|:/) // split string and create array.
        var dt = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]) // decrease month value by 1
        dtStringDate = dt.toISOString()
      } catch (e) {
        this.$notify({
          title: 'Invalid date.',
          message: 'Could not update, date was invalid.',
          type: 'danger'
        })
        return
      }

      var updateData = {
        type: 'blogs',
        id: tmpLink,
        title: item.title,
        frontMatter: JSON.parse(JSON.stringify(item.frontMatter)),
        draft: (item.draft === 'true'),
        delete: (item.delete === 'true'),
        date: dtStringDate,
        lang: selectedLangItem.id,
        content: markDownValue
      }
      delete updateData.frontMatter.title
      delete updateData.frontMatter.draft
      delete updateData.frontMatter.date
      delete updateData.frontMatter.pubDate

      // TODO: modiy the httpAction to be a .delete instead of a .put if (updateData.delete)
      // better REST API

      var httpApiAction = self.$httpApi.put
      httpApiAction(window.apiUrl + '/content/update', updateData, {
        // headers: {'TmpHeader': 'tmp'}
      })
      .then((response) => {
        // TODO: Find a better way ie: ajax polling.. check for E-Tag change up to X times?
        // well we actually did a force rebuild in hugo
        // setTimeout(function () {

        var basicAuth = self.$store.getters.getBasicAuth
        self.$httpApi.get(window.apiUrl + '/git?action=pull&loc=nav&ts=1', {
          headers: {
            'Authorization': basicAuth,
            'Token': window.vueAuth.getToken()
          }
        }).then((response) => {
          self.$store.commit('REPO_STATE_UPATE', 0) // all good
          if (response.data.Extra === 'pending') {
            self.$store.commit('REPO_STATE_PENDING', 1) // all good
          } else {
            self.$store.commit('REPO_STATE_PENDING', 0) // all good
          }
          window.vm.$store.commit('REFRESH_SETTINGS', self.$store.state) // {projectId: state.app.projectId, websiteId: state.app.websiteId})

          setTimeout(function () {
            self.selectPost(window.vm.$store.state.app.selectedItem)
            self.$notify({
              title: 'Saved.',
              message: 'Successfully saved your new awesome content.',
              type: 'success'
            })
          }, 1000)
        })
        .catch((error) => {
          setTimeout(function () {
            self.selectPost(window.vm.$store.state.app.selectedItem)
            self.$notify({
              title: 'Saved.',
              message: 'Successfully saved your new awesome content.',
              type: 'success'
            })
          }, 1000)
          console.error(error)
        })

        // }, 1000)
      })
      .catch((error) => {
        // self.actionPending = false
        self.$onError(error)
      })
    })

    this.$bus.$on('LANGUAGE_CHANGE_EVENT', function (data) {
      // TODO: Validate no pending changes ?

      // Refresh selected post link ( it will get the proper language item)
      var tmpItem = self.$store.state.app.selectedItem
      if (tmpItem) {
        var itm = tmpItem.item

        var link = itm.link
        var selectedLangItem = self.$store.state.app.languages.languagesHash[self.$store.state.app.languageSelected]
        var langCode = '' + selectedLangItem.id
        if (self.$store.state.app.language === self.$store.state.app.languageSelected) {
          langCode = '' // no prefix, this is the default site...
        }

        var type = 'blogs'
        if (link.indexOf('localhost:') >= 0 && link.indexOf('localhost:') <= 8) {
          link = link.replace('localhost:1313/', '')
        } else {
          // link = link // link = window.goHostUrl + langPrefix + link
        }
        while (link.startsWith('//')) {
          link = link.substring(1)
        }
        if (link.startsWith('/' + type + '/')) {
          link = link.substring(('/' + type + '/').length)
        }
        while (link.endsWith('/')) {
          link = link.substring(0, link.length - 1)
        }

        self.$httpApi.post(window.apiUrl + '/frontmatter?blog=1', { type: type, id: link, lang: langCode }, { }).then((res) => {
          window.vm.$store.state.app.selectedItem.item['frontMatter'] = {}
          for (var p in res.data) {
            if (res.data.hasOwnProperty(p)) {
              if (p === 'title' || p === 'pubDate' || p === 'date' || p === 'draft') {
                if (p === 'date') {
                  window.vm.$store.state.app.selectedItem.item['pubDate'] = res.data[p]
                }
                window.vm.$store.state.app.selectedItem.item[p] = res.data[p]
              } else {
                window.vm.$store.state.app.selectedItem.item['frontMatter'][p] = res.data[p]
              }
            }
          }
          self.selectPost(window.vm.$store.state.app.selectedItem) // window.vm.$store.state.app.selectedItem)
          // self.refreshData() // refresh left sidebar...
        })
        .catch((error) => {
          self.$onError(error)
        })
      } else {
        self.refreshData() // refresh left sidebar...
      }
    })
    this.refreshData()
  },
  destroyed: function () {
    this.$bus.$off('LANGUAGE_CHANGE_EVENT')
    // this.$bus.$off('SITE_PAGE_CHANGE_EVENT')
    this.$bus.$off('TOGGLE_ADVANCED_SETTINGS')
    this.$bus.$off('NO_DATA_FOUND')
    this.$bus.$off('SAVE_CMD')
    this.$bus.$off('UNDRAFT')

    this.$bus.$off('previewWebsite')
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
    isDefaultLang () {
      var self = this
      if (self.$store.state.app.languageSelected) {
        var selectedLangItem = self.$store.state.app.languages.languagesHash[self.$store.state.app.languageSelected]
        if (self.$store.state.app.language === selectedLangItem.languagename) {
          // This is default language, do not add the /{langcode} prefix
          return true
        }
        return false
      }
      return false
    },
    currentImage () {
      if (this.selectedPost && this.selectedPost.frontMatter && this.selectedPost.frontMatter.image) {
        return window.goHostUrl + '/' + this.selectedPost.frontMatter.image
      }
      return null
    },
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
      if (this.$store.state.app.selectedItem === null) {
        self.showRightSideBar = null
      }
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
    deletePost: function () {

    },
    deleteAllLangPost: function () {
      var self = this
      this.isSaving = true
      this.selectedPost.delete = 'true'
      // this.$store.state.app.topbar.selectedPost.delete = true
      this.$bus.$emit('SAVE_CMD')
      setTimeout(function () {
        this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS') // hide sidebar ...
        self.isSaving = false
        self.$store.state.app.selectedItem = null
        self.refreshData()
      }, 1500)
    },
    updatePage: function (imgData) {
      var self = this
      this.isSaving = true
      this.$bus.$emit('SAVE_CMD')
      setTimeout(function () {
        self.$bus.$emit('TOGGLE_ADVANCED_SETTINGS') // hide sidebar ...
        self.isSaving = false
      }, 600)
    },
    fileChange: function (imgData) {
      this.selectedPost.frontMatter['image'] = imgData.data.RelPath
    },
    hideRightBar: function () {
      this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS')
    },
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
          tmpLink = item.link.substring(item.link.indexOf('/', 8))
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

        // Select the post for editing..
        // Lets give 500 milliseconds...
        return setTimeout(function () {
          self.actionPending = false

          // TODO: Should be better implementation
          // self.refreshData() // refresh left sidebar...

          // TODO: Should be better implementation
          setTimeout(function () {
            // if (action === 'new') {
            // only add the post to the sidebar object if new post not new language
            // refresh latest data..
            var tmpLink = newPost.link
            if (tmpLink.startsWith('/blogs/')) {
              tmpLink = tmpLink.substring(7)
            }
            self.$httpApi.post(window.apiUrl + '/frontmatter?blog=2', { type: 'blogs', id: tmpLink, lang: newPost.lang }, { }).then((res) => {
              var curItem = {}

              // curItem['link'] = window.goHostUrl + newPost.link
              curItem['link'] = newPost.link  // ACE Fixed march

              curItem['guid'] = window.goHostUrl + newPost.link
              // curItem['id'] = window.goHostUrl + tmpLink
              // newPost.link
              // window.goHostUrl
              curItem['frontMatter'] = {}
              for (var p in res.data) {
                if (res.data.hasOwnProperty(p)) {
                  if (p === 'title' || p === 'pubDate' || p === 'date' || p === 'draft') {
                    if (p === 'date') {
                      curItem['pubDate'] = res.data[p]
                    }
                    curItem[p] = res.data[p]
                  } else {
                    curItem['frontMatter'][p] = res.data[p]
                  }
                }
              }
              curItem['pubDate'] = curItem['pubDate'] || curItem['date'] // pubDate required for sidebar...

              var retryCount = 5
              if (!(newOrUpdate === 'newLang')) {
                // only adding a new language here, do not add another row to the blog list
                retryCount = 0 // no need to retry selecting it, notbe created
                self.$store.state.app.sidebarblogData.json.unshift(curItem)
              }
              self.$notify({
                title: 'Success',
                message: 'Creation successful',
                type: 'success'
              })

              self.selectPost({ vue: self, item: curItem, retry: retryCount })
            })
            .catch((error) => {
              self.$onError(error)
            })
            // } else {
            //    self.selectPost({ vue: this, item: newPost, retry: 5 })
            // }
          })
        }, 1000)

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
        if (response.data) {
          var jsObj = JSON.parse(JSON.parse(JSON.stringify(window.xml2json(response.data.childNodes[0].children[0])).replace('undefined', '')))
          this.$store.commit('TOGGLE_SIDEBAR_BLOGDATA', true)
          this.$store.commit('TOGGLE_BLOGDATA', jsObj.channel.item)
        } else {
          // no data
          this.$store.commit('TOGGLE_BLOGDATA', [])
        }
      })
      .catch((error) => {
        if (error && error.response) {
          if (error.response.status === 404) {
            // no data
            return this.$store.commit('TOGGLE_BLOGDATA', [])
          }
        }
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

  .float-right {
    float: right;
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

  .hideme {
    display: none;
  }
</style>
