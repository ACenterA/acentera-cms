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
    },
    validateFilename () {
      return false
    },
    validateTitle () {
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
      this.close()
      /*
      if (this.editing === true) {
        this.editing = false
      } else {
        this.close()
      }
      */
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
