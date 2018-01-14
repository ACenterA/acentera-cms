<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <button class="btnNoPad rightfloat" @click="cancel">Cancel</button>
          <br/><br/>
          Enter a comment.<br/>
          <small>This is usefull when you are working with others on your website..</small>
          <br/>&nbsp;
          <div class="field has-addons">
            <p class="control is-expanded">
              <textarea class="input" style="resize:none;height:200px;"
                     v-model="pullTitle"></textarea>
            </p>
          </div>

          <button :disabled="isDisabled()" class="btnNoPad rightfloat" @click="create">Create</button>

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
      errorMsg: null,
      pullTitle: null,
      filename: ''
    }
  },

  methods: {
    addPageValidator () {
      if (this.pageTitle === '') {
        return true
      }
      if (!(this.filename.endsWith('.html'))) {
        return true
      }
      return false
    },

    isDisabled () {
      if (this.pullTitle !== null) {
        if ((this.pullTitle + '').trim().length <= 0) {
          return true
        }
      }
      return ((this.pullTitle === null))
    },

    create () {
      this.$emit('close', { title: this.pullTitle })
      /*
      if (!(this.filename.endsWith('.html'))) {
        this.errorMsg = 'Filename must ends with .html'
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
            title: this.pageTitle
          }
        }
        this.pageTitle = ''
        this.filename = ''
        this.$emit('createPage', resp)
      }
      */
    },
    validateFilename () {
      console.log('validaing title' + this.filename)
      return false
    },
    validateTitle () {
      console.log('validaing title' + this.pageTitle)
      /*
      // do nothing if there is no input token string
      if (this.pageTitle === '') {
        return
      }
      this.$http.post('/api/wrapping/unwrap', querystring.stringify({
      */
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
      console.log('emiting editObj')
      console.log(obj)
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
