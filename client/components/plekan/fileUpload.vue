<template>
  <div class="file-upload-area">

    <label v-if="!preventDrop" for="upload"
           @drop="drop"
           @dragover="dropAllow"
           :class="{empty : getImage ? false : true}"
           style="cursor: pointer;""
           :style="{ backgroundImage: 'url(' + getImage + ')' }"></label>

     <label v-if="preventDrop"
            @click="openFileUploadModal"
            :class="{empty : getImage ? false : true}"
            style="cursor: pointer;""
            :style="{ backgroundImage: 'url(' + getImage + ')' }"></label>
    <div class="plekan-file-information">

    </div>
    <input v-if="!preventDrop" id="upload"
           type="file"
           @change="onFileChange">
  </div>
</template>

<script>
export default {
  props: ['preventDrop', 'fileChange', 'types', 'clean', 'origimage', 'elementItem'],
  data () {
    return {
      image: null,
      imageSelected: null,
      file: null,
      fileRaw: null
    }
  },
  computed: {
    getImage () {
      if (this.image !== null) {
        return this.image
      }
      return this.origimage || null
    }
  },
  watch: {
    clean (n) {
      if (n) {
        this.image = null
        this.file = null
      }
    }
  },
  destroyed () {
    this.$bus.$off('TOGGLE_FILESELECT_SELECTED')
  },
  methods: {
    openFileUploadModal (e) {
      this.$bus.$emit('TOGGLE_FILESELECT')
      var self = this
      this.$bus.$on('TOGGLE_FILESELECT_SELECTED', function (data) {
        self.image = data.Path
        self.fileChange({
          data: data,
          base64: null
        })

        if (self.elementItem) {
          if (data.remove) {
            self.elementItem['value'] = null
          } else {
            self.elementItem['file'] = data
            var computePath = data.Path
            var idx = computePath.indexOf(window.goHostUrl)
            var len = window.goHostUrl.length
            if (idx >= 0) {
              computePath = computePath.substr(idx + len)
            }
            self.elementItem['value'] = computePath // contain full img path but no domain
            self.elementItem['src'] = computePath
          }
        }

        // todo: element... change ??
      })
    },
    dropAllow (e) {
      e.stopPropagation()
      e.preventDefault()
    },
    drop (e) {
      this.dropAllow(e)
      this.onFileChange(e)
    },
    onFileChange (e) {
      const files = e.target.files || e.dataTransfer.files

      if (!files.length) return

      const isAllowed = files[0].type.match(new RegExp(this.types, 'g')) !== null
      if (!isAllowed) return

      /**
       * Eğer dosya fotoğraf ise fotoğraf oluşturulur.
       * @types {Boolean}
       */
      const isImage = files[0].type.match(/(png|jpg|jpeg|JPEG|gif)/) != null

      if (isImage) {
        this.fileRaw = files[0]
        this.createImage(files[0])
      } else {
        this.file = files[0]
        this.fileRaw = files[0]
        this.fileChange({
          data: this.file,
          base64: null
        })
      }
    },
    createImage (file) {
      // const image = new Image()
      const reader = new FileReader()
      const vm = this

      reader.onload = (e) => {
        vm.image = e.target.result
        if (this.elementItem) {
          this.elementItem['file'] = this.file
          this.elementItem['fileDataBase64'] = this.image
          this.elementItem['value'] = 'newfiletmp'
        }
        this.fileChange({
          data: this.file,
          base64: this.image
        })
      }

      this.file = file
      reader.readAsDataURL(file)
    }
  }
}

</script>
