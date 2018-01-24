<template>
  <section class="plekan-editor-arena">
    <div class="plekan-editor">
      <editor-list cname="dynamic-editor"
                   :list="editorButtons.stick"
                   :custom="stickyCustomButtons">
        <li class="create-link"
            slot="link">
          <input v-model="linktext"
                 placeholder="http://www.example.com">
          <button type="button"
                  @click="createLink">
            <i class="fa fa-check"></i>
          </button>
        </li>
      </editor-list>
    </div>
    <button type="button"
            class="plekan-editable-elements-button"
            @click="openEditElement">Edit</button>
    <editelement :element="editableModalElement"
                 :shown="editableModal"></editelement>

    <color-modal :shown="showColorModal"
                 :close="toogleColorModal"></color-modal>
    <file-upload-modal v-if="$plekanEvent.onFileUpload"
                       :shown="showFileUploadModal"
                       :close="toggleFileUploadModal">
    </file-upload-modal>
  </section>
</template>

<script>
/**
 * <editor-list cname="stable-editor"
 *              :list="editorButtons.stable"
 *              :custom="stableCustomButtons"></editor-list>
 * Bu component düzenlenebilir DOM elemenaları,
 * Zengin editor: kalın yazı,link, vb component'leri içerir
 *
 * editor-list componet'i editor butonlarını listeler
 *
 */
import editelement from 'components/plekan/editelement'
import editorButtons from '../../plekan/core/constant/editor-buttons.json'
import editorList from 'components/plekan/editorList'
import colorModal from 'components/plekan/colorModal'
import fileUploadModal from 'components/plekan/fileUploadModal'
import { hasParent, exec } from '../../plekan/src/helper'
import store from '../../store'

export default {
  props: [],
  data () {
    return {
      editableModal: false,
      showColorModal: false,
      showFileUploadModal: false,

      editableModalElement: null,
      linktext: '',

      editorButtons,

      store
    }
  },
  components: {
    editelement,
    editorList,
    colorModal,
    fileUploadModal
  },
  computed: {
    stableCustomButtons () {
      return this.$customEditorButtons.filter(b => b.type === 'stable')
    },
    stickyCustomButtons () {
      return this.$customEditorButtons.filter(b => b.type === 'sticky')
    }
  },
  mounted () {
  /*
    var offset = function (el) {
      // var rect = el.getBoundingClientRect()
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop
      return { top: scrollTop, left: scrollLeft }
    }
*/
    /** @type {Array} Düzenlenebilir DOM elementleri */
    const editableTag = ['DIV', 'IFRAME', 'IMG', 'A', 'SCRIPT']
    const d = document.getElementsByTagName('iframe')[0].contentWindow.document

    const editButton = document.querySelector('.plekan-editable-elements-button')
    const editButtonWidth = editButton.clientWidth
    const editButtonHeight = editButton.clientHeight

    let target
    let tagname
    let calc
    let parents
    let editorIsVisible
    /** editButton pozisyonu'nu hesaplar */

    /* eslint-disable */
    var self = this

    self.store.commit('editorStart')

    var scrollYOffsetBase = 0
    var oldTarget = null
    var oldIframe = null
    d.addEventListener('mouseover', (e) => {
      console.error('zzz3a')
      console.error(window.editorElementDynamic)
      // console.error(document.querySelector('.plekan-editor .animated.dynamic-editor'))
      console.error(window.editorElementDynamic)
      console.error(window.editorElementDynamic.className)
      editorIsVisible =
        window.editorElementDynamic.className.indexOf('active') !== -1

      if (editorIsVisible) return

      target = e.target
      tagname = target.tagName
      calc = target.getBoundingClientRect()



      if (editableTag.indexOf(tagname) !== -1) {
        parents = hasParent(e.target, 'plekan-row-item')

        if (parents) {
          console.error(self)
          console.error(d)
          console.error(e.target)
          const st = target.scrollTop

          console.error('test aaaa')
          console.error(target)
          // console.error(target.attributes.hasOwnProperty('parameditable'))
          if (! target.attributes.hasOwnProperty('parameditable')) {
            return
          }

          self.editableModalElement = target
          editButton.style.display = 'block'
          editButton.classList.add('is-visible')
          editButton.style.visibility = 'visible'

          var target_body = $(target).parents('body')

          // find the corresponding iframe container
          var iframe = $('.arenatest').filter(function () {
            var iframe_body = $(this).contents().find('body')
            return target_body.get(0) === iframe_body.get(0)
          })
          oldTarget = target
          oldIframe = iframe
          // Need to adjust the iframe target position by current document scrolling
          editButton.style.top = `${calc.height / 2 + st + calc.top - editButtonHeight / 2 + window.pageYOffset}px`
          editButton.style.top = `${calc.height / 2 + st + calc.top - editButtonHeight / 2 + window.pageYOffset}px`

          window.editorElementDynamic.attributes['top'] = `${calc.height / 2 + st + calc.top - editButtonHeight / 2 + window.pageYOffset}`
          window.editorElementDynamic.attributes['scrolltop'] = $(d).scrollTop()
          console.error(window.editorElementDynamic.attributes)
          var left = $(oldIframe).offset().left + $(oldTarget).offset().left - $(d).scrollLeft()

          // This was used when using position: fixed ....
            // var top = $(oldIframe).offset().top + $(oldTarget).offset().top - $(d).scrollTop()
            // editButton.style.top = `${top - editButtonHeight / 2}px`
            // editButton.style.top = `${top - editButtonHeight / 2}px`

          console.error('calc is ...')
          console.error(calc)

          console.error('let window editor?')          
          editButton.style.left = `${calc.width / 2 + calc.left - editButtonWidth / 2}px`
        }
      } else if (target.parentNode !== editButton && target !== editButton) {
        editButton.style.display = 'none'
        editButton.classList.remove('is-visible')
      }
    })



    // window.scroll = null; // unbind the event before scrolling
    d.addEventListener('scroll', function (event) {

      console.error('scroll test A')
      console.error(window.editorElementDynamic.classList)
      console.error(editButton.classList)
      if (editButton.classList.contains('is-visible')) { // window.editorElementDynamic.classList.contains('active')) {
        console.error('scroll test B')
        // This was used when using position: fixed ....

        // var top = $(oldIframe).offset().top + $(oldTarget).offset().top - $(d).scrollTop()
        var oldTmpTop = $(d).scrollTop()
        console.error('TEST ...')
        console.error(oldTmpTop)
        console.error(window.editorElementDynamic.attributes['top'])
        var orig = window.editorElementDynamic.attributes['top']
        var scrollOrig = window.editorElementDynamic.attributes['scrolltop']
        var newScrollDiff = parseInt(scrollOrig) - oldTmpTop
        if (parseInt(scrollOrig) > oldTmpTop) {
          scrollOrig = scrollOrig - oldTmpTop
        }
        console.error('set new top from ' + orig + ' to ' + newScrollDiff)
        //  scrollOrig = scrollOrig - oldTmpTop
        var _top = parseInt(orig) + parseInt(newScrollDiff)
        console.error('TEST NEW TOP...' + _top)
        window.editorElementDynamic.style.top = `${_top}px`
        console.error('update to ' + _top)
        editButton.style.top = `${_top}px`
        // editButton.style.top = `${_top}px`
        /*
        console.error('scroll test C')
        const st = oldTarget.scrollTop
        console.error('scroll test D')
        calc = oldTarget.getBoundingClientRect()
        console.error('scroll test E')
        //editButton.style.top = `newScrollDiff}px`
        */
      }
      /*
      if (editButton.style.display !== 'none') {
        var left = $(oldIframe).offset().left + $(oldTarget).offset().left - $(d).scrollLeft()
        var top = $(oldIframe).offset().top + $(oldTarget).offset().top - $(d).scrollTop()
        editButton.style.top = `${top - editButtonHeight / 2}px`
      }
      */
    }, true /*Capture event*/);
    // window.onscroll = makeCallv

    /* eslint-enable */

    //
    const editorItems = document.querySelectorAll('.plekan-editor a')

    Object.keys(editorItems).map((e) => {
      console.error('add event listener to')
      console.error(editorItems[e])
      editorItems[e].addEventListener('click', (item) => {
        console.error('ON CLICK HERE TSET')
        console.error(item)
        item.preventDefault()
        const cmd = item.target.dataset.type
        console.error(cmd)
        switch (cmd) {
          case 'createLink':
            document.querySelector('.create-link').classList.add('active')
            break
          // ------------
          // NOT: main.js'de konfigürasyonu var sonradan eklenebilir.
          // ------------
          // eslint-disable-next-line
          case 'custom':
            console.error('custom event test')
            const customButton = self.$customEditorButtons[e.target.dataset.index]
            customButton.callback({
              target: e.target,
              execCommand: exec,
              selection: window.selo,
              savedSelection: self.store.state.sel
            })
            break
          case 'close':
            console.error('recv close')
            window.editorElementDynamic.classList.remove('active')
            break
          case 'color':
            self.toogleColorModal()
            break
          case 'fileUpload':
            self.toggleFileUploadModal()
            break
          case 'formatBlock':
            exec('formatBlock', e.target.dataset.value)
            break
          default:
            exec(cmd)
            break
        }
        /**
         * Selo hakkında daha fazlası için : /src/core/plekan_editor.js
         * @type {Selection Object}
         */
        self.store.state.sel = window.selo.saveSelection()
      })

      return true
    })

    /**
     * editelement.vue tarafından tetiklenir
     * DOM element'inin değiştiğinde modal kapanır
     */
    this.$bus.$on('domupdated', () => {
      console.error('received domupdated?')
      this.editableModal = false
    })

    /**
     * modal component'i kapatılmaya çalışıldığında gerekli
     * değişkiklikleri yapıp modalı kapatır
     * @todo
     *   1. Hangi modal'ın kapatıltığına göre işlem yapılması gerekir
     *   2. Modal içindeki değişikler sağlanmalı
     */
    console.error('set request hidden modal 01...')
    this.$bus.$on('requestHiddenModal', () => {
      console.error('request hidden modal 01')
      this.showColorModal = false
      this.editableModal = false
      this.showFileUploadModal = false
    })
    /*
      false,
    );
    */
  },
  methods: {
    /** Renk modal'ini açar/kapar */
    toogleColorModal () {
      this.showColorModal = !this.showColorModal
    },
    /** Dosya modal'ini açar/kapar */
    toggleFileUploadModal () {
      this.showFileUploadModal = !this.showFileUploadModal
    },
    /**
     * Editelement butonuna tıklandığında çalışır
     * editelemen component'ini aktif/açmak için editableModal değişkenini true yapar
     * @return {void}
     */
    openEditElement () {
      this.editableModal = true
    },
    /**
     * Editor içinde bulunan link butonuna tıklandığında
     * editor içinde input ve buton'u aktif hale getirir
     * Bu butona tıklandığında bu fonsksiyon tetiklenir
     * @return {void}
     */
    createLink () {
      exec('createLink', this.linktext)
      this.linktext = ''
      // const d = document.getElementsByTagName('iframe')[0].contentWindow.document
      document.querySelector('.create-link').classList.remove('active')
    }
  }
}
</script>
