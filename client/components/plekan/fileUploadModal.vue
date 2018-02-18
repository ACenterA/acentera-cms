<template>
  <modal :show="shown" :multiModal="multiModal">
    <header slot="header">
      <div class="plekan-modal-title">File Upload</div>
    </header>
    <div slot="body"
         class="plekan-modal-color-body plekan-clearfix">
      <file-upload :clean="shown"
                   :types="$allowedFileTypes"
                   :fileChange="fileChange"></file-upload>
       <br/>

       <div class="field has-addons">
         <p class="control is-expanded">
             <span>File Name</span>
             <input type="text" v-model="fileName" @input="fileNameValidator" :placeholder="filenamePlaceHolder">
             <br/>
             <br/>
             <small v-if="ext !== ''">Will be saved to img/{{ fileNameOrPlaceHolder }} <br/><br/></small>
         </p>
       </div>
    </div>
    <footer slot="footer"
            class="plekan-clearfix">
      <button class="plekan-footer-button"
              @click="onFileUpload"
              :disabled="!file">Upload</button>
      <button class="plekan-footer-button"
              @click="cancelNewImage">Cancel</button>
    </footer>
  </modal>
</template>

<script>
import modal from 'components/plekan/modal'
import fileUpload from 'components/plekan/fileUpload'
// import { exec } from '../../plekan/src/helper'

export default {
  props: ['multiModal', 'shown', 'close'],
  data () {
    return {
      file: null,
      fileRaw: null,
      fileName: null
    }
  },
  components: {
    modal,
    fileUpload
  },
  computed: {
    ext () {
      if (!(this.file && this.file.data)) {
        return ''
      }
      return this.file.data.type.substring(this.file.data.type.indexOf('/') + 1)
    },
    fileNameOrPlaceHolder () {
      var res = this.fileNameValidator
      if (!this.fileNameValidator) {
        res = this.filenamePlaceHolder
      }
      res = res + '.' + this.ext
      return res
    },
    filenamePlaceHolder () {
      if (this.file && this.file.data && this.file.data.name) {
        var result = (this.file.data.name.replace('.' + this.ext, '')).replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace and also the extension
               .replace(/--+/, '-')
               .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
               .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
               .toLowerCase()
        return result
      }
      return 'Click the image'
    },
    fileNameValidator () {
      if (this.fileName) {
        var result = this.fileName.replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace and also the extension
               .replace(/--+/, '-')
               .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
               .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
               .toLowerCase()
        this.fileName = result
        return result
      }
      return null
    }
  },
  methods: {
    /**
     * Bu method file-upload componentine property olarak pass edilir.
     * file-upload'da geri dönen değer file objesi local scope'a alınır
     *
     * Daha fazlası için file-upload.vue'ye bakınız
     * @param  {Object of File} file
     * @return {void}
   */
    fileChange (file) {
      var isImage = false
      isImage = file.data.type.match(/(png|jpg|jpeg|JPEG|gif)/) != null
      if (isImage) {
        this.file = file
        // this.fileRaw = file[0]
      } else {
        this.$notify({
          title: 'Image failed',
          message: 'The file you selected is not an image',
          type: 'warning'
        })
      }
    },
    cancelNewImage () {
      this.$bus.$emit(this.multiModal)
    },
    /**
    * Upload button'nuna tıklandığında bu method çağrılır.
    *
    * Callback method'unden geri gelen değer ile link oluşturulur
    *
    * this.$onFileUpload fonksiyonu global'dir. Plekan.js
    * #Vue.prototype.$onFileUpload tanımalasına bakınız
    * @return {void}
   */
    onFileUpload () {
      /*
      @TODO : Pass file
      */
      var isImage = false
      isImage = this.file.data.type.match(/(png|jpg|jpeg|JPEG|gif)/) != null
      if (isImage) {
        var self = this

        var form = new FormData()
        form.append('name', 'img/' + this.fileNameOrPlaceHolder)
        var fileInfo = {
          Name: this.fileNameOrPlaceHolder,
          Path: this.fileNameOrPlaceHolder, // img/ is already added
          selected: true
        }
        form.append('file', this.file.data)
        self.$httpApi.post(window.apiUrl + '/upload/img', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((response) => {
          self.$bus.$emit('SELECT_NEW_IMAGE', fileInfo)
          self.$bus.$emit(this.multiModal)
        }).catch((error) => {
          this.$onError(error)
        })

        /*
        this.$plekanEvent.onFileUpload(this.file, (url) => {
          exec(
            'insertHTML',
            `<a href="${url.src}" target="_blank">${url.title || url.src}</a>`
          )

          this.close()
        })
        */
      }
    }
  }
}
</script>

<style>

</style>
