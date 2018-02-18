<template>
  <modal :show="shown">
    <header slot="header">
      <div class="plekan-modal-title">Edit</div>
    </header>
    <div slot="body">

      <div v-if="isParamEditable()">
        <div v-for="e in getElements" class="plekan-editable-element-fields-container">

          <div class="plekan-editable-element-fields">
             <!-- e.type -->
             <span>{{e.label}}</span>
             <input type="text"
                 v-model="e.value" v-if="e.type !== 'Image'">
              <file-upload :clean="shown"
                        types="png|jpg|jpeg|gif"
                        :preventDrop="true"
                        :origimage="e.currentImage"
                        :elementItem="e"
                        :fileChange="fileChange"
                        v-if="e.type === 'Image'"></file-upload>
              <div v-if="e.file">
                {{ e.file.name }}
              </div>
           </div>
         </span>
        </div>
      </div>

      <div v-if="!isParamEditable()">
        <div v-for="e in getElementPropertyArray"
             class="plekan-editable-element-fields-container">
          <div class="plekan-editable-element-fields"
               v-show="elementEditableProperties[e.prop] != undefined">
            <span>{{e.title}}</span>
            <input type="text"
                   v-model="elementEditableProperties[e.prop]"
                   :placeholder="e.placeholder">
          </div>
        </div>
        <file-upload :clean="shown"
                     types="png|jpg|jpeg|gif"
                     :fileChange="fileChange"
                     v-if="elementIsImage"></file-upload>

       </div>
    </div>
    <footer slot="footer"
            class="plekan-clearfix">
      <button @click.prevent="save()"
              type="button"
              class="plekan-footer-button">Update</button>
      <button @click.prevent="cancel()"
              type="button"
              class="plekan-footer-button">Cancel</button>
      <button @click.prevent="onFileUpload"
              v-show="elementIsImage"
              :disabled="!file"
              type="button"
              class="plekan-footer-button">Upload</button>
    </footer>
  </modal>
</template>

<script>
import modal from 'components/plekan/modal'
import fileUpload from 'components/plekan/fileUpload'

/**
 * Bu component Editor.vue tarafından kullanılır,
 * plekan-editable-elements-button'a tıklandığında açılır.
 *
 * Element objesi DOM'daki herhangi bir obje olabilir bkz: Editor.vue
 * line:101 #editableTag[]
 *
 * Shown özelliği modal'e özellik olarak tanımlanır bkz : Modal.vue line:36
 * #show()
 */
export default {
  props: ['element', 'shown'],
  data () {
    return {
      event: null,
      /** @type {Array} DOM element'inin değiştirlebilir özellikleri  */
      /* eslint-disable */
      getElementPropertyArray: [
        { title: 'Text', prop: 'text', placeholder: 'Text' },
        { title: 'Class', prop: 'className', placeholder: 'Class' },
        { title: 'Source', prop: 'src', placeholder: 'source link' },
        {
          title: 'Alt Title',
          prop: 'alt',
          placeholder: 'when the image error loaded shown text ',
        },
        { title: 'Link', prop: 'href', placeholder: 'source link' },
        { title: 'Title', prop: 'title', placeholder: 'title text' },
      ],
      /* eslint-enable */
      elementEditableProperties: {},
      elementIsImage: false,
      file: null
    }
  },
  components: { modal, fileUpload },
  beforeMount () {
    // document.body.style.overflow = "hidden"
  },
  updated () {
    document.body.style.overflow = this.shown ? 'hidden' : ''
  },
  watch: {
    /**
     * Her değişimde DOM element'inin özellikleri local scope'a alınır
     * @return {void}
     */
    shown () {
      this.event = new CustomEvent('domupdated') // eslint-disable-line
      if (!this.element) return

      const el = this.element
      const tmp = {}

      this.elementIsImage = el.tagName === 'IMG'
      this.getElementPropertyArray.map((p) => {
        if (el[p.prop] !== undefined) {
          tmp[p.prop] = el[p.prop]

          if (el.nodeName === 'A') {
            // TODO:: Do we need to do this...
            // Remove window baesURL from el[p.prop] value ?
          }
        }
        return true
      })

      this.elementEditableProperties = tmp
    }
  },
  computed: {
    getImage: function () {
      return ''
    },
    getElements: function () {
      if ($(this.element).attr('editor-data-param') === undefined) {
        return []
      }
      var editorParamDatas = $(this.element).attr('editor-data-param').split(',')
      var mapArrObj = []
      var self = this
      $.each(editorParamDatas, function (idx, item) {
        console.error('get element of')
        console.error(item)
        var itemArr = item.split(':')
        var itemInfo = {
          parameter: itemArr[0]
        }
        if (itemArr.length >= 1) {
          itemInfo['type'] = itemArr[1]
        }
        if (itemArr.length >= 2) {
          itemInfo['label'] = itemArr[2]
        }
        itemInfo['$el'] = $(self.element)
        itemInfo['value'] = window.getEditorProperty(itemArr[0], self.$store.state.app.settings.params)
        itemInfo['orig_value'] = window.getEditorProperty(itemArr[0], self.$store.state.app.settings.params)
        if (itemInfo['type'] === 'Image') {
          itemInfo['currentImage'] = window.goHostUrl + '/' + itemInfo['value']
        }
        console.error('PUSH OF')
        console.error(itemInfo)
        if (typeof itemInfo['value'] === 'undefined') {
          if (item.startsWith('i18n.')) {
            itemInfo['value'] = itemInfo['$el'].text()
            itemInfo['orig_value'] = itemInfo['$el'].text()
          }
        }
        mapArrObj.push(itemInfo)
      })
      return mapArrObj
    }
  },
  methods: {
    isParamEditable () {
      if (!this.element) {
        return false
      }
      return (this.element.attributes.hasOwnProperty('parameditable') || this.element.attributes.hasOwnProperty('editor-data-param'))
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
      this.file = file
    },
    /**
     * Upload button'nuna tıklandığında bu method çağrılır.
     * this.$onFileUpload fonksiyonu global'dir. Plekan.js
     * #Vue.prototype.$onFileUpload tanımalasına bakınız
     * @return {void}
     */
    onFileUpload () {
      if (!this.$plekanEvent.onFileUpload) {
        this.elementEditableProperties.src = this.file.base64
        return
      }

      this.$plekanEvent.onFileUpload(this.file, (obj) => {
        Object.keys(obj).map((e) => {
          this.elementEditableProperties[e] = obj[e]
          return true
        })
      })
    },
    cancel () {
      this.makeABroadcast()
    },
    /**
     * Değiştirilen özelliklerin DOM element'ine atanması ve kayıt edilmesi
     * @return {void}
     */
    save () {
      var updateImageByBgStyle = function (tmpImg, item) {
        if (tmpImg.style.backgroundImage) {
          var origBgImage = tmpImg.style.backgroundImage
          var foundStartIdx = -1
          if (foundStartIdx === -1) {
            foundStartIdx = origBgImage.indexOf('http:')
          }
          if (foundStartIdx === -1) {
            foundStartIdx = origBgImage.indexOf('https:')
          }
          if (foundStartIdx === -1) {
            foundStartIdx = origBgImage.indexOf('//')
          }

          if (foundStartIdx === -1) {
            foundStartIdx = origBgImage.indexOf('url("')
            if (foundStartIdx !== -1) {
              foundStartIdx += 5
            }
          }

          if (foundStartIdx === -1) {
            /* eslint-disable */
            foundStartIdx = origBgImage.indexOf("url('")
            /* eslint-enable */
            if (foundStartIdx !== -1) {
              foundStartIdx += 5
            }
          }

          if (foundStartIdx === -1) {
            foundStartIdx = origBgImage.indexOf('url(')
            if (foundStartIdx !== -1) {
              foundStartIdx += 4
            }
          }

          if (foundStartIdx !== -1) {
            var tmpOrigValue = item['orig_value']
            var foundEnd = origBgImage.indexOf(item['orig_value'])
            if (foundEnd === -1) {
              if (item['orig_value'] === undefined || item['orig_value'] === null) {
                tmpOrigValue = '/'
                // well .. find last '/'
                foundEnd = origBgImage.lastIndexOf('/')
              }
            }
            if (foundEnd !== -1) {
              if (item['src'] === undefined || item['src'] === null) {
                return false
              }
              if (item['src'].indexOf(window.goHostUrl) === -1) {
                tmpImg.style.backgroundImage = origBgImage.substring(0, foundStartIdx) + window.goHostUrl + item['src'] + origBgImage.substring(foundEnd + tmpOrigValue.length)
              } else {
                tmpImg.style.backgroundImage = origBgImage.substring(0, foundStartIdx) + item['src'] + origBgImage.substring(foundEnd + tmpOrigValue.length)
              }
              return true
            }
          }
        }
        return false
      }

      if (this.isParamEditable()) {
        var self = this
        var errorCount = 0
        $.each(this.getElements, function (idx, item) {
          var hasError = false
          try {
            if (item.value !== item.orig_value) {
              if (item.value === undefined || item.value === null) {
                item.value = null // overwite to have it sent to API Server.
              }
              hasError = true // if it works we have to update this to false

              window.updateEditorProperty(item.parameter, self.$store.state.app.settings.params, item.value)
              console.error('updating a')
              // TODO: Set settings dirty ??
              // TODO: We should implement a editor function to edit elements....
              // ie: an
              console.error('updated test ?')
              if (item['type'].toLowerCase() === 'text') {
                item['$el'].html(item.value)
                console.error('updated test  tt')
                if (item.parameter.startsWith('i18n.')) {
                  // TODO: Set i18n
                  console.error('updated test  yes')
                  var tmpParma = item.parameter
                  if (tmpParma.startsWith('i18n.')) {
                    tmpParma = tmpParma.substring(5)
                  }
                  self.$store.state.app.i18nUpdated[tmpParma] = {
                    value: item.value,
                    action: item.value ? 'upsert' : 'delete'
                  }
                }
                hasError = false
              } else if (item['type'].toLowerCase() === 'image') {
                console.error('updating b')
                // Find where the img is ... matching the orig_value ...
                var imgs = item['$el'].find('img')
                console.error('updating c')
                console.error(imgs)
                if (imgs[0]) {
                  console.error('updating d')
                  var isImgUpdated = updateImageByBgStyle(imgs[0], item)
                  if (isImgUpdated) {
                    hasError = false
                  } else if (imgs[0].src) {
                    imgs[0].src = item['src']
                    hasError = false
                  }
                } else {
                  console.error('updating e')
                  if (imgs) {
                    console.error('updating f')
                    if (imgs.prevObject) {
                      console.error('updating g')
                      var tmpImg = imgs.prevObject[0]
                      var isImgUpdated1 = updateImageByBgStyle(tmpImg, item)
                      if (isImgUpdated1) {
                        hasError = false
                      } else if (tmpImg.src) {
                        tmpImg.src = item['src'] // fileDataBase64
                        hasError = false
                      }
                    }
                  }
                }
                // currentSrc
              }
            }
          } catch (e) {
            hasError = true
          }
          if (hasError) {
            errorCount++
          }
        })
        if (errorCount >= 1) {
          window.reloadOnSave = true
          self.$notify({
            title: 'Preview unavailable.',
            message: 'Use the save button at the top right, to preview your change.',
            type: 'success'
          })
        }
      } else {
        Object.keys(this.elementEditableProperties).map((e) => {
          this.element[e] = this.elementEditableProperties[e]
          return true
        })
      }
      this.makeABroadcast()
    },
    /**
     * Gerekli DOM manipülasyonu yapıldı yayını yapar
     * Editor.vue veya başka bir component bu yayına göre işlemler yapabilir
     * Örnek: Editelement modal'ini kapatmak gibi
     *
     * @return {void}
     *
     */
    makeABroadcast () {
      if (this.event) {
        this.$bus.$emit(this.event.type, this.event)
      }
    }
  }
}

</script>
