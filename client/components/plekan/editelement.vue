<template>
  <modal :show="shown">
    <header slot="header">
      <div class="plekan-modal-title">Edit</div>
    </header>
    <div slot="body">

      <div v-if="isParamEditable()">
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
              class="plekan-footer-button">Save</button>
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
    console.error('updated shown here')
    // console.error(document)
    document.body.style.overflow = this.shown ? 'hidden' : ''
  },
  watch: {
    /**
     * Her değişimde DOM element'inin özellikleri local scope'a alınır
     * @return {void}
     */
    shown () {
      console.error('SHOWN SELECTED')
      this.event = new CustomEvent('domupdated') // eslint-disable-line

      console.error('SHOWN SELECTED ELEMENT IS')
      console.error(this)
      console.error(this.element)
      if (!this.element) return

      const el = this.element
      const tmp = {}

      console.error(el)
      this.elementIsImage = el.tagName === 'IMG'
      // console.error(this.elementIsImage)
      this.getElementPropertyArray.map((p) => {
        console.error(p.prop)
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
  methods: {
    isParamEditable () {
      if (!this.element) {
        return false
      }
      return (this.element.attributes.hasOwnProperty('parameditable'))
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
    /**
     * Değiştirilen özelliklerin DOM element'ine atanması ve kayıt edilmesi
     * @return {void}
     */
    save () {
      Object.keys(this.elementEditableProperties).map((e) => {
        console.error('save here 01')
        console.error(e)
        this.element[e] = this.elementEditableProperties[e]
        return true
      })
      console.error('save object here')
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
      console.error('make broadcaks ehre ')
      // console.error(this.event)
      console.error('EMEIT  here 01')
      console.error(this.event)
      this.$bus.$emit(this.event.type, this.event)
      // document.dispatchEvent(this.event)
    }
  }
}

</script>
