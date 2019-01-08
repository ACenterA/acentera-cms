<template>
  <div class="app-inner-content">
    <div class="fullheight">
      <sidebarrecettes :jsonData="sidebarblogData.json" :show="sidebarblogData.loaded"></sidebarrecettes>
      <div class="plekan-outerdiv tile is-ancestor is-vertical fullheight">
          <article :class="{ hidden: isPostSelected }" class="tile is-child box">
              <label class="label">Select a post post from the left menu, or click on Create new post.</label>
          </article>

          <article :class="{ hideme: !isPostSelected || inPostCreate, hidden: ((isPostSelected && !postDoesNotExists)) }" class="tile is-child box">
              <label class="label">This Recipe doesn't have this language created yet.</label>
              <button class="button is-info" @click="create('newLang','recipes')">Create Draft</button>
          </article>

          <article :class="{ hidden: !inPostCreate }" class="tile is-child box">
            <vue-form-generator :schema="schemaCreateNew" :model="modelCreateNew" :options="formOptions"></vue-form-generator>
            <br/>
            <button class="button is-info" @click="create('new','recipes')" :disabled="actionPending">Create Recipes</button>
          </article>

          <div class="rightSide" :class="{ active: showRightSideBar}" style="overflow:auto;">
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

          <div class="rightSide" :class="{ active: showJsonRightSideBar}">
            <button class="button is-info float-right" @click="hideRightBar">Close</button>

            <article class="tile is-child box scrollable">

                old form was here
                <button v-if="isDefaultLang" :disabled="isSaving" class="button is-danger float-let" @click="deleteAllLangPost()">Delete Post (All Languages)</button>
                <button v-if="!isDefaultLang" :disabled="isSaving" class="button is-danger float-let" @click="deleteAllLangPost()">Delete Post (Single Language)</button>

                <button :disabled="isSaving" class="button is-info float-right" @click="updateSchemaData()">Update</button>
                <br/>
                <br/>
                <br/>
                <br/>
            </article>
          </div>


          <article v-if="selectedPost" :class="{ hidden: inPostCreate || !isPostSelected || postDoesNotExists }" style="overflow:auto;">
              <!-- Tab navigation -->
              <div class="tabs is-medium is-boxed is-fullwidth">
                <ul>
                  <li v-bind:class="tabName === 'Recette' ? 'is-active' : ''" v-on:click="switchTab(0)"><a>Configuration</a></li>
                  <li v-bind:class="tabName === 'Ingredients' ? 'is-active' : ''" v-on:click="switchTab(1)"><a>Ingredients</a></li>
                  <li v-bind:class="tabName === 'Steps' ? 'is-active' : ''" v-on:click="switchTab(2)"><a>Steps</a></li>
                  <li v-bind:class="tabName === 'Sauce' ? 'is-active' : ''" v-on:click="switchTab(3)"><a>Sauce</a></li>
                  <!-- <li v-bind:class="tabName === 'approle' ? 'is-active' : ''" v-on:click="switchTab(2)"><a>Approle</a></li> -->
                  <!-- <li disabled><a>Certificates</a></li> -->
                </ul>
              </div>

              <!-- Ingredients -->
              <div v-if="tabName === 'ingredients'" class="tile is-parent table-responsive is-vertical">
                        <button :disabled="isSaving" class="button is-info float-right" @click="updateIngSchemaData()">Update</button>
                          <article class="tile is-child box scrollable">
                              <div v-if="ingredientSchema !== null">
                                <vue-form-generator :schema="ingredientSchema" :model="ingredientModel" :options="formOptions"></vue-form-generator>
                              </div>

                              <br/>
                              <br/>
                              <br/>
                              <br/>
                              <button :disabled="isSaving" class="button is-info float-right" @click="updateIngSchemaData()">Update</button>
                          </article>
                          <br/>
                          <br/>
                          <br/>
              </div>

              <!-- Ingredients -->
              <div v-if="tabName === 'sauce'" class="tile is-parent table-responsive is-vertical">
                  <div v-if="ingredientModel && !ingredientModel.sauce">
                    Sauce is not defined. Go to the ingredients tabs. and enable it.
                  </div>
                  <div v-else>
                        <button :disabled="isSaving" class="button is-info float-right" @click="updateStepsSchemaData()">Update</button>
                          <article class="tile is-child box scrollable">
                              <div v-if="sauceSchema !== null">
                                <vue-form-generator :schema="sauceSchema" :model="stepsModel" :options="formOptions"></vue-form-generator>
                              </div>

                              <br/>
                              <br/>
                              <button :disabled="isSaving" class="button is-info float-right" @click="updateStepsSchemaData()">Update</button>
                              <br/>
                              <br/>
                          </article>

                          <br/>
                          <br/>
                          <br/>
                  </div>
              </div>


              <!-- Steps -->
              <div v-if="tabName === 'steps'" class="tile is-parent table-responsive is-vertical">
              <button :disabled="isSaving" class="button is-info float-right" @click="updateStepsSchemaData()">Update</button>
                          <article class="tile is-child box scrollable">
                              <div v-if="stepsSchema !== null">
                                <vue-form-generator :schema="stepsSchema" :model="stepsModel" :options="formOptions"></vue-form-generator>
                              </div>

                              <br/>
                              <br/>
                              <br/>
                              <button :disabled="isSaving" class="button is-info float-right" @click="updateStepsSchemaData()">Update</button>
                              <br/>
                              <br/>
                          </article>
                          <br/>
              </div>


              <!-- Tokens tab -->
              <div v-if="tabName === 'configuration'" class="tile is-parent table-responsive is-vertical">

                  <button class="button is-info" @click="saveUpdatePostTest()">Update</button>
                  <br/>

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
                              :preventDrop="false"
                              :origimage="currentImage"
                              :elementItem="tmpItem"
                              :fileChange="fileChange"
                              >
                    </file-upload>
                  <br/>
                  <br/>

                  <button class="button is-info" @click="saveUpdatePostTest()">Update</button>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
                  <br/>
              </div>

          </article>
      </div>
    </div>


  </div>
</template>

<script>
import Vue from 'vue'
import Tooltip from 'vue-bulma-tooltip'
import datetime from 'vuejs-datetimepicker'
// import moment from 'moment'
import TreeView from 'components/TreeView'
import { Sidebarrecettes } from 'components/layout/'
import { mapGetters, mapActions } from 'vuex'
import plekan from 'components/plekan/plekan.vue'
import fileUpload from 'components/plekan/fileUpload'
// import FormSchema from 'vue-json-schema'
// import Modal from './modals/InfoModalWidget'

import ArrayContainer from 'components/ArrayContainer'
Vue.component('ArrayContainer', ArrayContainer)

import StepsArrayContainer from 'components/StepsArrayContainer'
Vue.component('StepsArrayContainer', StepsArrayContainer)

import IngredientsArrayContainer from 'components/IngredientsArrayContainer'
Vue.component('IngredientsArrayContainer', IngredientsArrayContainer)

import NutritionsArrayContainer from 'components/NutritionsArrayContainer'
Vue.component('NutritionsArrayContainer', NutritionsArrayContainer)

import Autocomplete from 'vue2-autocomplete-js'

import ModuleLibrary from 'vfg-field-array'
// Install this library
Vue.use(ModuleLibrary)

import VgObject from 'vfg-field-object'
Vue.use(VgObject)

var TabNames = ['configuration', 'ingredients', 'steps', 'sauce']

export default {
  components: {
    Tooltip,
    datetime,
    TreeView,
    // Modal,
    Sidebarrecettes,
    plekan,
    fileUpload,
    Autocomplete
  },

  data () {
    return {
      csrf: '',
      isSaving: false,
      showModal: false,
      tabName: 'configuration',
      tableData: [],
      arrayData: [
        {
          name: 'Ben',
          description: '180cm'
        }, {
          name: 'Jon',
          description: '179cm'
        }
      ],
      store: this.$store,
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
      showJsonRightSideBar: false,
      userTransitKey: '',
      extra: '?editMode=widget&apiPort=8081&jsPort=8091',
      editing: false,
      schemaInfo: null,
      schema: null,
      model: {},
      ingredientModel: null,
      ingredientschema: {},
      sauceschema: {},
      sauceModel: {},
      stepsModel: {},
      stepsSchema: {},
      modelCreateNew: {
      },
      schemaCreateNew: {
        fields: [
          {
            type: 'select',
            inputType: 'text',
            label: 'Categories',
            model: 'category',
            inputName: 'category',
            styleClasses: 'field-one-class',
            validator: 'string',
            values: [
              {
                id: 'desserts',
                name: 'desserts'
              },
              { id: 'snacks', name: 'snacks' },
              { id: 'breakfast', name: 'breakfast' },
              { id: 'beverages', name: 'beverages' },
              { id: 'lunch', name: 'meal' }
            ]
          },
          {
            type: 'input',
            inputType: 'text',
            label: 'Sous-Categorie ie: eggs,chicken',
            model: 'subcategory',
            inputName: 'subcategory',
            validator: 'string'
          },
          {
            type: 'input',
            inputType: 'text',
            label: 'Titre de la recette',
            model: 'title',
            inputName: 'title',
            validator: 'string'
          }
        ]
      },
      modelA: {
        id: 1,
        name: 'John Doe',
        password: 'J0hnD03!x4',
        age: 35,
        geo: '09238420',
        skills: ['Javascript', 'VueJS'],
        email: 'john.doe@gmail.com',
        status: ['a', 'b'],
        Values: ['cc', 'dd'],
        array: ['cc', 'dd']
      },
      schemaA: {
        fields: [{
          label: 'Array field',
          type: 'array',
          model: 'columns',
          showRemoveButton: true,
          showModeElementUpButton: true,
          showModeElementDownButton: true,
          newElementButtonLabelClasses: 'btn btn-outline-dark mt-2',
          newElementButtonLabel: '+ Add Column',
          itemContainerHeader: function (model, schema, index) {
            if (model && model.label) {
              return 'Column ' + (index + 1) + '(' + model.label + ')'
            } else {
              return 'Column ' + (index + 1) + ''
            }
          },
          removeElementButtonClasses: 'btn btn-danger input-group-append',
          moveElementUpButtonClasses: 'btn btn-outline-dark input-group-append',
          moveElementDownButtonClasses: 'btn btn-outline-dark input-group-append',
          visible: function (model) {
            console.error('is this visible')
            console.error(model)
            return true
          },
          required: function (model) {
            return true // return model && (model.type === 'select' || model.type === 'multiselect')
          },
          itemContainerComponent: 'ArrayContainer'
        }]
      },
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true
      },
      chart: [
      ]
    }
  },
  mounted: function () {
    var self = this
    this.$store.state.app.topbar.show = true
    this.$store.commit('deleteAllRows', 0, 1)

    console.error('mounted a')
    self.$http.get(window.goHostUrl + '/recipes/schema.json').then((res) => {
      console.error('got.. ')
      console.error(res.data)
      self.schema = res.data
    })

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

    this.$bus.$on('HIDE_RIGHT_SETTINGS', function (data) {
      if (self.showJsonRightSideBar) {
        self.showJsonRightSideBar = false
      }
    })

    this.$bus.$on('TOGGLE_ADVANCED_SETTINGS', function (data) {
      if ((self.selectedPost && !self.inPostCreate && !self.postDoesNotExists) && ((self.isPostSelected && !self.postDoesNotExists))) {
        self.showRightSideBar = !self.showRightSideBar
      }
    })

    this.$bus.$on('SHOW_ADVANCED_SETTINGS', function (data) {
      if ((self.selectedPost && !self.inPostCreate && !self.postDoesNotExists) && ((self.isPostSelected && !self.postDoesNotExists))) {
        var dataFile = $(data).attr('editor-data')
        console.error('show advanced settings 01')
        console.error(data)
        var schemaFile = $(data).attr('editor-schema')
        var modelPath = $(data).attr('editor-model')

        var item = window.vm.$store.state.app.selectedItem.item
        var currSection = window.vm.$store.state.app.selectedItem.item.section

        var getJsonPostData = {
          id: item.dir,
          data_file: dataFile,
          schema: currSection + '/schema.json'
        }

        if (!(schemaFile === undefined)) {
          getJsonPostData['schema'] = schemaFile
        }

        self.schemaInfo = getJsonPostData
        console.error('would send of ')
        console.error(getJsonPostData)
        var basicAuth = self.$store.getters.getBasicAuth
        self.$httpApi.post(window.apiUrl + '/content/data/get?view=gen&loc=sidebar&ts=1', getJsonPostData, {
          headers: {
            'Authorization': basicAuth,
            'Token': window.vueAuth.getToken()
          }
        }).then((response) => {
          self.showJsonRightSideBar = true
          console.error(self.model)
          self.model = response.data.data
          self.schema = response.data.schema
          if (modelPath) {
            self.schema.fields[0].model = modelPath
          }
        }).catch((error) => {
          self.$notify({
            title: 'Could not get data.',
            message: 'An error occured while trying to retreive the data.',
            type: 'warning'
          })
          console.error(error)
        })
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
      /*
      var d = null
      if (document.getElementsByTagName('iframe')[0] && document.getElementsByTagName('iframe')[0].contentWindow) {
        d = document.getElementsByTagName('iframe')[0].contentWindow.document
      }
      // TODO: use somehting else than contenteditable ? ie: editor-content ?
      if ($(d).find('[contenteditable=true]').length !== 1) {
        return
      }
      var markDownValue = window.vm.turndownService.turndown($(d).find('[contenteditable=true]')[0].innerHTML)
      if (!(window.vm.$store.state.app.selectedItem && window.vm.$store.state.app.selectedItem.item)) {
        return
      }
      */

      var item = window.vm.$store.state.app.selectedItem.item
      var tmpLink = item.link
      if (item.link.startsWith('//') || item.link.startsWith('http://') || item.link.startsWith('https://')) {
        tmpLink = item.link.substring(item.link.indexOf('/', 8))
      }
      if (tmpLink.endsWith('/')) {
        tmpLink = tmpLink.substring(0, tmpLink.lastIndexOf('/'))
      }
      var selectedLangItem = self.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
      // markDownValue = markDownValue.replace('<br>', '\\n').replace('<br/>', '\\n')
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

      console.error('test save temp link ????' + tmpLink)
      // tmpLink,
      console.error('saving item... of')
      console.error(item)
      var updateData = {
        type: 'blogs',
        id: item.dir,
        title: item.title,
        frontMatter: JSON.parse(JSON.stringify(item.frontMatter)),
        draft: (item.draft === 'true'),
        delete: (item.delete === 'true'),
        date: dtStringDate,
        lang: selectedLangItem.id
      }
      delete updateData.frontMatter.title
      delete updateData.frontMatter.draft
      delete updateData.frontMatter.date
      delete updateData.frontMatter.pubDate
      console.error(updateData)
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
        var langPrefix = data.id // get selected langCode
        console.error('SELECTED ITEM')
        console.error(tmpItem)
        var itm = tmpItem.item
        var type = ''
        var link = ''
        var langCode = ''
        if (itm.hasOwnProperty('alternate')) {
          // New Logic
          var alternateLangLinks = itm.alternate
          type = itm.section
          if (alternateLangLinks.hasOwnProperty(langPrefix)) {
            console.error('ok link has alternate of ' + langPrefix)
            console.error('lang prefix? ' + langPrefix)
            langCode = langPrefix
            // console.error()
            link = itm.dir
            // link = alternateLangLinks[langPrefix]
          } else {
            console.error('3 - ok link does not have alternate of ' + langPrefix)
            self.$store.state.app.nodata = true
          }
        } else {
          // Old Logic to be deprecated

          link = itm.link
          var selectedLangItem = self.$store.state.app.languages.languagesHash[self.$store.state.app.languageSelected]
          langCode = '' + selectedLangItem.id
          if (self.$store.state.app.language === self.$store.state.app.languageSelected) {
            langCode = '' // no prefix, this is the default site...
          }

          type = 'blogs'
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
        }

        console.error('GOT LINK OF...' + link)
        console.error(selectedLangItem)
        self.$httpApi.post(window.apiUrl + '/frontmatter?recipes=2', { type: type, id: link, lang: langCode }, { }).then((res) => {
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
    this.$bus.$off('SHOW_ADVANCED_SETTINGS')
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
      if (this.selectedPost && this.selectedPost.frontMatter && this.selectedPost.frontMatter.cover) {
        return window.goHostUrl + '/' + this.selectedPost.dir + this.selectedPost.frontMatter.cover
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
    getData (obj) {
      console.log(obj)
    },
    switchTab: function (index) {
      this.tabName = TabNames[index]
      var self = this

      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.switchTab(index)
        }, 1000)
      }

      var schemaFile = 'recipes/schema.json'
      var dataFile = 'data/data.yaml'
      var modelPath = ''
      var item = window.vm.$store.state.app.selectedItem.item
      var currSection = window.vm.$store.state.app.selectedItem.item.section
      var getJsonPostData = {}

      var selectedLangItem = this.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]

      var basicAuth = self.$store.getters.getBasicAuth
      if (index === 1) {
        schemaFile = 'recipes/schema.json'
        dataFile = 'data/data.yaml'
        modelPath = ''

        getJsonPostData = {
          id: item.dir,
          data_file: dataFile,
          schema: currSection + '/schema.json'
        }
        if (!(schemaFile === undefined)) {
          getJsonPostData['schema'] = schemaFile
        }

        self.schemaInfo = getJsonPostData
        console.error('would send of ')
        console.error(getJsonPostData)
        self.$httpApi.post(window.apiUrl + '/content/data/get?view=gen&loc=sidebar&ts=1', getJsonPostData, {
          headers: {
            'Authorization': basicAuth,
            'Token': window.vueAuth.getToken()
          }
        }).then((response) => {
          console.error(self.model)
          self.ingredientModel = response.data.data
          self.ingredientSchema = response.data.schema
          if (modelPath) {
            self.ingredientSchema.fields[0].model = modelPath
          }
        }).catch((error) => {
          self.$notify({
            title: 'Could not get data.',
            message: 'An error occured while trying to retreive the data.',
            type: 'warning'
          })
          console.error(error)
        })
      } else if (index === 2 || index === 3) {
        schemaFile = 'recipes/schema-steps.json'
        dataFile = 'data/steps/' + selectedLangItem.id + '.yaml'
        modelPath = 'steps'

        getJsonPostData = {
          id: item.dir,
          data_file: dataFile,
          schema: currSection + '/schema.json'
        }
        if (!(schemaFile === undefined)) {
          getJsonPostData['schema'] = schemaFile
        }

        self.schemaInfo = getJsonPostData
        console.error('would send of ')
        console.error(getJsonPostData)
        self.$httpApi.post(window.apiUrl + '/content/data/get?view=gen&loc=sidebar&ts=1&steps01', getJsonPostData, {
          headers: {
            'Authorization': basicAuth,
            'Token': window.vueAuth.getToken()
          }
        }).then((response) => {
          console.error(self.model)
          self.stepsModel = response.data.data
          self.stepsSchema = response.data.schema

          self.sauceSchema = JSON.parse(JSON.stringify(response.data.schema))
          self.sauceSchema.fields[0].model = 'sauce'

          self.stepsSchema.fields[0].model = modelPath

          console.error('RECEIGED ALL')
          console.error(self.stepsModel)
          console.error(self.stepsSchema)
        }).catch((error) => {
          self.$notify({
            title: 'Could not get data.',
            message: 'An error occured while trying to retreive the data.',
            type: 'warning'
          })
          console.error(error)
        })
      }
    },
    submit (e) {
      // this.model contains the valid data according your JSON Schema.
      // You can submit your model to the server here
      console.log(JSON.stringify(this.model))
    },
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

    saveUpdatePostTest: function () {
      var self = this
      this.isSaving = true
      this.$bus.$emit('SAVE_CMD')
      setTimeout(function () {
        self.isSaving = false
        // self.$store.state.app.selectedItem = null
        self.refreshData()
      }, 500)
    },

    updateSchemaData: function (imgData) {
      var self = this
      this.isSaving = true
      console.error('update schema  data then.. call save')
      console.error(self.schemaInfo)

      var basicAuth = self.$store.getters.getBasicAuth

      self.schemaInfo['data'] = self.model

      self.$httpApi.post(window.apiUrl + '/content/data/update?view=gen&loc=sidebar&ts=1', self.schemaInfo, {
        headers: {
          'Authorization': basicAuth,
          'Token': window.vueAuth.getToken()
        }
      }).then((response) => {
        this.$bus.$emit('SAVE_CMD')
        setTimeout(function () {
          self.$bus.$emit('TOGGLE_ADVANCED_SETTINGS') // hide sidebar ...
          // setTimeout(function () {
          self.showRightSideBar = false
          self.showJsonRightSideBar = false
          self.isSaving = false
          // }, 200);
        }, 400)
        self.schemaInfo = null
      }).catch((error) => {
        self.$notify({
          title: 'Could not save data.',
          message: 'An error occured while trying to save the data.',
          type: 'warning'
        })
        self.isSaving = false
        console.error(error)
      })
    },

    updateIngSchemaData: function (imgData) {
      var self = this
      this.isSaving = true
      console.error('update schema  data then.. call save')
      console.error(self.schemaInfo)

      var basicAuth = self.$store.getters.getBasicAuth

      self.schemaInfo['data'] = self.ingredientModel

      self.$httpApi.post(window.apiUrl + '/content/data/update?view=gen&loc=sidebar01&ts=1', self.schemaInfo, {
        headers: {
          'Authorization': basicAuth,
          'Token': window.vueAuth.getToken()
        }
      }).then((response) => {
        self.$notify({
          title: 'Saved data.',
          message: 'Successfully saved.',
          type: 'success'
        })
        self.isSaving = false
      }).catch((error) => {
        self.$notify({
          title: 'Could not save data.',
          message: 'An error occured while trying to save the data.',
          type: 'warning'
        })
        self.isSaving = false
        console.error(error)
      })
    },
    updateStepsSchemaData: function (imgData) {
      var self = this
      this.isSaving = true
      console.error('update schema  data then.. call save')
      console.error(self.schemaInfo)

      var basicAuth = self.$store.getters.getBasicAuth

      self.schemaInfo['data'] = self.stepsModel

      self.$httpApi.post(window.apiUrl + '/content/data/update?view=gen&loc=sidebar01&ts=1', self.schemaInfo, {
        headers: {
          'Authorization': basicAuth,
          'Token': window.vueAuth.getToken()
        }
      }).then((response) => {
        self.$notify({
          title: 'Saved data.',
          message: 'Successfully saved.',
          type: 'success'
        })
        self.isSaving = false
      }).catch((error) => {
        self.$notify({
          title: 'Could not save data.',
          message: 'An error occured while trying to save the data.',
          type: 'warning'
        })
        self.isSaving = false
        console.error(error)
      })
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
      console.error('file change here a')
      console.error(imgData)
      this.selectedPost.frontMatter['image'] = imgData.data.RelPath

      var item = window.vm.$store.state.app.selectedItem.item

      var form = new FormData()
      form.append('id', item.dir)
      form.append('ext', imgData.data.type.split('/')[1])
      form.append('name', 'cover' + '.' + imgData.data.type.split('/')[1])
      form.append('file', imgData.data)

      var self = this
      this.$httpApi.post(window.apiUrl + '/coverupload', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {
        self.$notify({
          title: 'Success',
          message: 'Image saved successfully',
          type: 'success'
        })
      })
      .catch((error) => {
        self.close()
        self.$onError(error)
      })
    },
    hideRightBar: function () {
      console.error(this.showJsonRightSideBar)
      if (this.showJsonRightSideBar === true) {
        this.$bus.$emit('HIDE_RIGHT_SETTINGS')
      } else {
        this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS')
      }
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
      var selectedLangItem = this.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
      var fileToCreate = null
      var action = 'new'
      var tmpId = ''
      var postData = {
        type: type,
        lang: selectedLangItem.id
      }
      var tmpLink = null

      if (newOrUpdate === 'newLang') {
        action = 'newlang'
        var item = window.vm.$store.state.app.selectedItem.item
        tmpId = item.dir
        postData['newlang'] = true
        postData['id'] = tmpId
        tmpLink = item.dir
        /*
        var tmpLink = item.link
        if (item.link.startsWith('//') || item.link.startsWith('http://') || item.link.startsWith('https://')) {
          tmpLink = item.link.substring(item.link.indexOf('/', 8))
        }
        if (tmpLink.endsWith('/')) {
          tmpLink = tmpLink.substring(0, tmpLink.lastIndexOf('/'))
        }
        fileToCreate = tmpLink // includes the /{type}/
        tmpId = fileToCreate
        */
      } else {
        var category = this.modelCreateNew.category
        if (category === undefined) {
          category = 'uncategorized'
        }
        var subcategory = this.modelCreateNew.subcategory
        fileToCreate = this.modelCreateNew.title

        if (tmpId === '') {
          tmpId = category
          if (subcategory !== '') {
            tmpId = tmpId + '/' + subcategory.split(' ').join('-')
          }
          if (fileToCreate !== '') {
            tmpId = tmpId + '/' + fileToCreate.split(' ').join('-')
          }
        }
        action = 'new'
        postData['newlang'] = false
        postData['filename'] = tmpId + '/'
        postData['id'] = tmpId
        postData['id'] = postData['id'].split(' ').join('-')
        postData['title'] = fileToCreate
        tmpLink = postData['id']
      }

      if (!postData.title || postData.title === '') {
        postData.title = this.titleFromShortName
      }
      self.actionPending = true
      var httpApiAction = this.$httpApi.post
      if (newOrUpdate === 'update') {
        httpApiAction = this.$httpApi.put
      }
      tmpLink = tmpLink.toLowerCase()

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
        console.error('got new post?')
        console.error(postData)
        var forceLink = null
        if (action === 'new') {
          newPost['guid'] = response.data // '/' + type + '/' + postData.filename
          forceLink = response.data
          newPost['link'] = '/' + type + '/' + tmpLink
          newPost['dir'] = '/' + type + '/' + tmpLink
        } else {
          // newlang
          newPost['guid'] = postData.id
          forceLink = postData.id
          newPost['link'] = postData.id
          forceLink = response.data
          newPost['dir'] = postData.id
        }
        console.error(newPost)

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

            if (tmpLink.startsWith('/' + type + '/')) {
              tmpLink = tmpLink.substring(type.lenght + 2)
            }

            self.$httpApi.post(window.apiUrl + '/frontmatter?rcpblog=2', { type: type, id: tmpLink, lang: newPost.lang }, { }).then((res) => {
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

              console.error('sleect post test')
              console.error(curItem)
              curItem.link = forceLink
              curItem.dir = ('/' + tmpLink + '/').replace('//', '/')
              curItem.id = ('/' + tmpLink + '/').replace('//', '/')
              console.error('select item of')
              console.error(curItem)
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
      this.$httpApi.get(window.goHostUrl + '/recettes/index.xml', {
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

<style>
.group-one-class {
  background-color: #dcd0d0;
}

.form-group.field-one-class {
  width: 15%;
  max-width: 15%;
  float: left;
}

.form-group.field-step-class {
  width: 90%;
  max-width: 90%;
  line-height:30px;
  float: left;
}

</style>
<style scoped>
html {
	font-family: Tahoma;
	font-size: 14px;
}

body {
	font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
	font-size: 14px;
	line-height: 1.42857143;
	color: #333;
}

pre {
	overflow: auto;
}
	pre .string { color: #885800; }
	pre .number { color: blue; }
	pre .boolean { color: magenta; }
	pre .null { color: red; }
	pre .key { color: green; }

h1 {
	text-align: center;
	font-size: 36px;
	margin-top: 20px;
	margin-bottom: 10px;
	font-weight: 500;
}

fieldset {
	border: 0;
}

.panel {
	margin-bottom: 20px;
	background-color: #fff;
	border: 1px solid transparent;
	border-radius: 4px;
	-webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
	box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
	border-color: #ddd;
}

.panel-heading {
	color: #333;
	background-color: #f5f5f5;
	border-color: #ddd;

	padding: 10px 15px;
	border-bottom: 1px solid transparent;
	border-top-left-radius: 3px;
	border-top-right-radius: 3px;
}

.panel-body {
	padding: 15px;
}

.field-checklist .wrapper {
	width: 100%;
}

  .form {
    text-align: left;
    width: 600px;
    margin: auto;
  }
  h2 {
    font-size: 1.7em;
    text-align: center;
    margin-top: 0;
    margin-bottom: .2em
  }
  h2 + small {
    display: block;
    text-align: center;
    margin-bottom: 1.2em
  }
  small {
    line-height: 20px;
    display: block;
  }
  .el-alert {
    margin-bottom: 15px
  }

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
    overflow: auto;
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
