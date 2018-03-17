<template>
  <modal :show="shown" :multiModal="multiModal" :big="true" :hidden="hidden">
    <header slot="header">
      <div class="plekan-modal-title">Select Image</div>
    </header>
    <div slot="body"
         class="plekan-modal-color-body plekan-clearfix no-overflow" :style="{ 'height': height + 'px' }">
       <br/>
       Which image would you want to use ?
       <br/>
       <div slot="images">
         <i
           class="image image-text-sm fa window-close"
           :class="{ selected: index === -2 }"
           @click="selectImage(-2)"
           :style="{ width: '400px', height: '200px' }"
         >Click to remove Image</i>
         <i
           class="image image-text-sm fa nonefa-plus-circle"
           @click="selectImage(-1)"
           :style="{ width: '400px', height: '200px' }"
         >Click to add an Image</i>
          <div
            class="image"
            :class="{ selected: image.selected }"
            v-for="image, imageIndex in images"
            @click="selectImage(imageIndex)"
            :style="{ backgroundImage: 'url(' + basePath + '/img/' + image.Path + ')', width: '400px', height: '200px' }"
          ></div>
      </div>


    </div>
    <footer slot="footer"
            class="plekan-clearfix">
      <button class="plekan-footer-button"
              @click="onFileSelect"
              :disabled="(!noImages && !file)">Select</button>
      <button class="plekan-footer-button"
              @click="cancelSelection">Cancel</button>
    </footer>
  </modal>
</template>

<script>
import modal from 'components/plekan/modal'
import VueGallery from 'vue-gallery'

export default {
  props: ['multiModal', 'shown', 'close'],
  data () {
    return {
      file: null,
      fileName: null,
      width: 800,
      height: 400,
      left: '40%',
      images: [],
      selectedImage: null,
      hidden: false,
      index: null
    }
  },
  components: {
    modal,
    'gallery': VueGallery
  },
  mounted () {
    // call the computed resource?

    var self = this
    this.$bus.$on('REFRESH_IMAGES', function (data) {
      var refImages = self.refreshImages
      if (refImages !== null) {
        // ???
      }
    })
    var refImages = this.refreshImages
    if (refImages !== null) {
    }
    const d = document.getElementsByTagName('iframe')[0].contentWindow
    this.width = d.innerWidth

    var left = '10%'
    var tmpWidith = d.innerWidth - 100
    if (tmpWidith < 600) {
      left = '30%'
      this.width = 500
    } else {
      left = '10%'
      this.width = tmpWidith
    }

    var tmpHeight = d.innerHeight - 300
    if (tmpHeight < 500) {
      this.height = 500
    } else {
      this.height = tmpHeight
    }

    this.left = left // not used
  },
  destroyed () {
    this.$bus.$off('TOGGLE_FILESELECT_RESTORE')
    this.$bus.$off('SELECT_NEW_IMAGE')
    this.$bus.$off('REFRESH_IMAGES')
  },
  computed: {
    noImages () {
      return this.index === -2
    },
    basePath () {
      return window.goHostUrl
    },
    refreshImages () {
      console.error('refreshing images ??? a1')
      var self = this
      if (!this.$store.state.app.isLoaded) {
        return null
      }

      console.error('refreshing images ??? a1a')
      if (this.$store.state.app.website) {
        console.error('refreshing images ??? a1a erra')
        // Is Hosted Version ensure, a website is selected..
        if (!this.$store.state.app.websiteId) {
          console.error('refreshing images ??? a1a fff')
          return null
        }
      }
      console.error('refreshing images ??? a1b')

      var iterateFolder = function (first, data, acc, cb) {
        var files = data.Files
        var folders = data.Folders
        if (files[0]) {
          for (var w in files) {
            files[w]['selected'] = false
          }
          acc = acc.concat(files)
        }
        for (var k in folders) {
          if (folders.hasOwnProperty(k)) {
            var resp = iterateFolder(0, folders[k], [], cb)
            acc = acc.concat(resp)
          }
        }
        return acc
      }
      console.error('refreshing images AA ?? using ' + window.apiUrl + '/imagelist')
      this.$httpApi.get(window.apiUrl + '/imagelist').then((response) => {
        this.$data.chart = response.data
        var StaticImages = response.data.StaticImages
        const acc = []
        var tmpAcc = iterateFolder(1, StaticImages, acc)
        self.images = tmpAcc
        self.$store.commit('TOGGLE_SIDEBAR_TWO', true)
        self.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', response.data)
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    ext () {
      if (!(this.file && this.file.data && this.file.data.type)) {
        return ''
      }
      return this.file.data.type.substring(this.file.data.type.indexOf('/') + 1).replace('jpeg', 'jpg')
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
      } else {
        return null
      }
    }
  },
  methods: {
    selectImage (imageIndex) {
      var prevIndex = this.index
      if (this.selectedImage) {
        this.selectedImage['selected'] = false
        this.file = null
        this.index = null // reset
      }
      try {
        if (imageIndex === -1) {
          this.$bus.$emit('TOGGLE_FILEUPLOAD')
          this.hidden = true
          var self = this
          this.$bus.$on('SELECT_NEW_IMAGE', function (receivedData) {
            self.images.unshift(receivedData)
            self.file = receivedData
            self.selectedImage = receivedData
            self.index = 0
            self.file = {
              file: {
                Name: self.selectedImage.Name,
                Path: self.selectedImage.Path,
                Existing: true // NEW_IMAGE actually created the new image on disk ...
              },
              data: self.selectedImage
            }
            self.hidden = false
            self.$bus.$off('TOGGLE_FILESELECT_RESTORE')
            self.$bus.$off('SELECT_NEW_IMAGE')
          })
          this.$bus.$on('TOGGLE_FILESELECT_RESTORE', function () {
            self.hidden = false
            self.$bus.$off('TOGGLE_FILESELECT_RESTORE')
            self.$bus.$off('SELECT_NEW_IMAGE')
          })
          return
        }

        // only if selecting an image
        if (prevIndex !== imageIndex) {
          this.index = imageIndex // reset
          this.selectedImage = this.images[imageIndex]
          // this.images[imageIndex]['selected'] = true
          if (this.selectedImage) {
            this.selectedImage['selected'] = true
            this.file = {
              file: {
                Name: this.selectedImage.Name,
                Path: this.selectedImage.Path,
                Existing: true
              },
              data: this.selectedImage
            }
          }
        } else {
          this.index = null // reset failsafe
        }
      } catch (ff) {
        console.error(ff.stack)
      }
    },
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
      } else {
        this.$notify({
          title: 'Image failed',
          message: 'The file you selected is not an image',
          type: 'warning'
        })
      }
    },
    cancelSelection () {
      this.$bus.$emit('TOGGLE_FILESELECT_CLOSE')
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
    onFileSelect () {
      /*
      @TODO : Pass file
      */
      // var isImage = false
      // isImage = this.file.data.type.match(/(png|jpg|jpeg|JPEG|gif)/) != null
      var clonedImg = this.$clone(this.selectedImage)
      if (clonedImg === undefined) {
        clonedImg = {
          remove: true
        }
      } else {
        if (!(clonedImg.Path.startsWith(this.basePath))) {
          clonedImg.RelPath = '/img/' + clonedImg.Path // must be before .Path
          clonedImg.Path = this.basePath + '/img/' + clonedImg.Path
        } else {
          clonedImg.RelPath = clonedImg.Path
        }
      }
      this.$bus.$emit('TOGGLE_FILESELECT_SELECTED', clonedImg)
      this.$bus.$emit('TOGGLE_FILESELECT_CLOSE', clonedImg)
      // this.close()

      /*
      if (isImage) {
        this.$plekanEvent.onFileUpload(this.file, (url) => {
          exec(
            'insertHTML',
            `<a href="${url.src}" target="_blank">${url.title || url.src}</a>`
          )

          this.close()
        })
      }
      */
    }
  }
}
</script>

<style>
  .no-overflow {
    overflow: auto
  }

  .image {
    cursor: hand;
    float: left;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 1px solid #ebebeb;
    margin: 5px;
  }
  i.image {
   padding-top: 60px;
   font-size: 40px;
  }
  i.image-text-sm {
    cursor: hand;
    float: left;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 1px solid #ebebeb;
    margin: 5px;
    padding-top: 60px;
    font-size: 30px;
  }

  .selected {
    border: solid 3px blue !important;
  }
</style>
