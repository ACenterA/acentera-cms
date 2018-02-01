<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <button class="btnNoPad rightfloat" @click="cancel">Cancel</button>
          <div class="content">
            <div v-if="editing">

                <div v-if="checkAction(action,'AddPage')">
                  <article class="tile is-child box">

                      <label class="label">Widget Name</label>
                      <div class="field has-addons">
                        <p class="control is-expanded">
                          <input class="input" type="text"
                                 placeholder="Enter widget short name"
                                 v-model="pageTitle"
                                 @keyup.enter="validateTitle()">
                        </p>
                      </div>

                      <label class="label">Widget Category</label>
                      <div class="field has-addons">
                        <p class="control is-expanded">
                          <input class="input" type="text"
                                 placeholder="Enter widget category"
                                 v-model="widgetCategory"
                                 @keyup.enter="validateCategory()">
                        </p>
                      </div>


                      <label class="label">File name <i>(must ends with .yml)</i></label>
                      <div class="field has-addons">
                        <p class="control is-expanded">
                          <input class="input" type="text"
                                 placeholder="Enter .yml file name here"
                                 v-model="filename"
                                 @keyup.enter="validateFilename()">
                        </p>
                      </div>


                      <p class="control">
                      <a class="button rightfloat is-primary"
                      @click="createPage()"
                      :disabled="addPageValidator()">
                      <span>Create widget</span>
                      </a>
                      </p>

                  </article>
                </div>
                <div v-if="checkAction(action,'AddFolder')">
                  Adding foler
                </div>

            </div>
            <div v-if="!editing">
              <div v-if="isDir(object)">
                <p>
                  <strong>Selected Directory: {{ object.key }}</strong>
                  <br/>Type : {{ type }}
                  <br/>Select one of the operation below.<br/>
                </p>
              </div>
              <div v-if="isFile(object)">
                <p>
                  <strong>File {{ object.key }}</strong>
                  Path: {{object.original.Path}}
                  <br>Type is {{ type }}
                </p>
              </div>
            </div>
          </div>

          <div class="buttons" v-if="!editing">

            <div v-if="isDir(object)">

              <button class="btn" @click="addPage">Add Widget</button>
              <button class="btn"@click="addFolder">Add Widget Folder</button>

              <br/>
              <br/>

              <button class="btn" title="Not yet implemented" disabled>Delete Widget Folder</button>

            </div>

            <div v-if="isFile(object)">
              <button class="btn right" @click="edit(object)">Edit</button>
              <br/>
              <br/>
              <button class="btn"  title="Not yet implemented" disabled>Delete Widget</button>
              <button class="btn"  title="Not yet implemented" disabled>Copy Widget</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </modal>
</template>

<script>
import { Modal } from 'vue-bulma-modal'

export default {
  components: {
    Modal
  },

  props: {
    visible: Boolean,
    object: Object,
    type: String
  },

  data () {
    return {
      editing: false,
      action: '',
      pageTitle: '',
      // widgetCategory: '',
      errorMsg: null,
      filename: ''
    }
  },

  methods: {
    addPageValidator () {
      if (this.pageTitle === '') {
        return true
      }
      if (this.widgetCategory === '') {
        return true
      }
      if (!(this.filename.endsWith('.yml'))) {
        return true
      }
      return false
    },

    createPage () {
      if (!(this.filename.endsWith('.yml'))) {
        this.errorMsg = 'Filename must ends with .yml'
      } else if (this.pageTitle === '') {
        this.errorMsg = 'Widget name must not be empty'
        return true
      } else if (this.widgetCategory === '') {
        this.errorMsg = 'Widget category must not be empty'
        return true
      } else {
        this.errorMsg = null

        var folderPath = this.object.original.Path + this.object.original.Name + '/'

        if (this.object.original.Root) {
          // its the root folder, do not create the folder....
          folderPath = ''
        }

        var resp = {
          folder: folderPath,
          filename: this.filename,
          headers: {
            title: this.pageTitle,
            category: this.widgetCategory
          }
        }
        this.pageTitle = ''
        this.widgetCategory = ''
        this.filename = ''
        this.$emit('createWidget', resp)
      }
    },
    validateFilename () {
      return false
    },
    validateTitle () {
      return true
    },
    widgetCategory () {
      return true
    },
    checkAction (obj, val) {
      return (obj === val)
    },
    isInEdit () {
      return this.editing === true
    },
    isDir () {
      if (!this.object) return false
      return (this.object.subtype === 'Dir')
    },
    isFile () {
      if (!this.object) return false
      return (this.object.subtype === 'File')
    },
    cancel () {
      if (this.editing === true) {
        this.editing = false
      } else {
        this.close()
      }
    },
    close () {
      this.$emit('close')
    },
    edit (obj) {
      this.$emit('editObj', obj)
    },
    addPage () {
      this.action = 'AddPage'
      this.editing = true
    },
    addFolder () {
      this.action = 'AddFolder'
      this.editing = true
    }
  }
}
</script>


<style scoped>

.box {
  min-height: 400px;
}

.btnNoPad {
  width: 29%;
}

.btn {
  width: 29%;
  margin:30px;
}

.rightfloat {
  float: right;
}

</style>
