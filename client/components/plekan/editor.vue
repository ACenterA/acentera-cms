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
      <editor-list cname="stable-editor"
                  :list="editorButtons.stable"
                  :custom="stableCustomButtons"></editor-list>
    </div>
    <button type="button"
            class="plekan-editable-elements-button"
            @click="openEditElement">Edit</button>


    <editelement :element="editableModalElement"
                 :shown="editableModal"></editelement>

    <color-modal :shown="showColorModal"
                 :close="toogleColorModal"></color-modal>
    <file-upload-modal :shown="showFileUploadModal" :multiModal="multiModal"
                       :close="toggleFileUploadModal">
    </file-upload-modal>
    <file-select-modal :shown="showFileSelectModal" :multiModal="multiModal"
                       :close="toggleFileSelectModalClose">
    </file-select-modal>
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
import fileSelectModal from 'components/plekan/fileSelectModal'
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
      showFileSelectModal: false,
      multiModal: false,

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
    fileUploadModal,
    fileSelectModal
  },
  computed: {
    stableCustomButtons () {
      return this.$customEditorButtons.filter(b => b.type === 'stable')
    },
    stickyCustomButtons () {
      return this.$customEditorButtons.filter(b => b.type === 'sticky')
    }
  },
  destroyed: function () {
    this.$bus.$off('TOGGLE_FILESELECT')
    this.$bus.$off('TOGGLE_FILESELECT_CLOSE')
    this.$bus.$off('TOGGLE_FILEUPLOAD')
    this.$bus.$off('TOGGLE_FILEUPLOAD_CLOSE')
    this.$bus.$off('TOGGLE_EDITABLE_ELEMENT')
  },
  mounted () {
    /** @type {Array} Düzenlenebilir DOM elementleri */
    const editableTag = ['NAV', 'HEADER', 'SECTION', 'DIV', 'IFRAME', 'IMG', 'A', 'SCRIPT', 'UL', 'LI', 'SPAN']
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
      editorIsVisible =
        window.editorElementDynamic.className.indexOf('active') !== -1

      // console.error('mouse over a')
      if (editorIsVisible) return

      target = e.target
      tagname = target.tagName
      // console.error('mouse over b')
      calc = target.getBoundingClientRect()


      // console.error('mouse over c')
      if (true || editableTag.indexOf(tagname) !== -1) {
        // console.error('mouse over d')
        parents = hasParent(e.target, 'plekan-row-item')
        if (parents) {
          const st = target.scrollTop
          // console.error('mouse over e')
          var parentElements = []
          if (! target.attributes.hasOwnProperty('parameditable')) {
            parentElements = $(target).parent('[parameditable]')
            if (parentElements.length <= 0) {
              editButton.style.display = 'none'
              editButton.classList.remove('is-visible')
              editButton.classList.remove('active')
              return
            }
          }
          // console.error('mouse over g')
          self.editableModalElement = target

          // In case se set the param editable element to the parent object...
          if (parentElements.length >= 1) {
            self.editableModalElement = parentElements[0]
          }

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

          var left = $(oldIframe).offset().left + $(oldTarget).offset().left - $(d).scrollLeft()

          // TODO Fix hardcoded left / top margin ?
          // window.editorElementStable.attributes['top'] = 100 + window.pageYOffset
          // window.editorElementStable.attributes['top'] = 100 + left

          // This was used when using position: fixed ....
            // var top = $(oldIframe).offset().top + $(oldTarget).offset().top - $(d).scrollTop()
            // editButton.style.top = `${top - editButtonHeight / 2}px`
            // editButton.style.top = `${top - editButtonHeight / 2}px`

          editButton.style.left = `${calc.width / 2 + calc.left - editButtonWidth / 2}px`
        }
      } else if (target.parentNode !== editButton && target !== editButton) {
        editButton.style.display = 'none'
        editButton.classList.remove('is-visible')
      }


    })

    this.$bus.$on('TOGGLE_FILESELECT', function () {
      console.error('selected here a')
      self.toggleFileSelectModal('TOGGLE_FILESELECT_CLOSE')
    })
    this.$bus.$on('TOGGLE_FILESELECT_CLOSE', function () {
      self.toggleFileSelectModal(false)
    })

    this.$bus.$on('TOGGLE_EDITABLE_ELEMENT', function (editableTarget) {
      self.editableModalElement = editableTarget
      self.editableModal = true
    })

    this.$bus.$on('TOGGLE_FILEUPLOAD', function () {
      self.toggleFileUploadModal('TOGGLE_FILEUPLOAD_CLOSE')
    })
    this.$bus.$on('TOGGLE_FILEUPLOAD_CLOSE', function () {
      self.toggleFileUploadModalClose(false)
    })


    // window.scroll = null; // unbind the event before scrolling
    d.addEventListener('scroll', function (event) {

      if (editButton.classList.contains('is-visible')) { // window.editorElementDynamic.classList.contains('active')) {
        // This was used when using position: fixed ....
        // var top = $(oldIframe).offset().top + $(oldTarget).offset().top - $(d).scrollTop()
        var oldTmpTop = $(d).scrollTop()

        var orig = window.editorElementDynamic.attributes['top']
        var scrollOrig = window.editorElementDynamic.attributes['scrolltop']
        var newScrollDiff = parseInt(scrollOrig) - oldTmpTop
        if (parseInt(scrollOrig) > oldTmpTop) {
          scrollOrig = scrollOrig - oldTmpTop
        }
        //  scrollOrig = scrollOrig - oldTmpTop
        var _top = parseInt(orig) + parseInt(newScrollDiff)
        window.editorElementDynamic.style.top = `${_top}px`
        editButton.style.top = `${_top}px`
        // editButton.style.top = `${_top}px`
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
      editorItems[e].addEventListener('click', (item) => {
        item.preventDefault()
        const cmd = item.target.dataset.type
        switch (cmd) {
          case 'createLink':
            document.querySelector('.create-link').classList.add('active')
            break
          // ------------
          // NOT: main.js'de konfigürasyonu var sonradan eklenebilir.
          // ------------
          // eslint-disable-next-line
          case 'custom':
            const customButton = self.$customEditorButtons[e.target.dataset.index]
            customButton.callback({
              target: e.target,
              execCommand: exec,
              selection: window.selo,
              savedSelection: self.store.state.sel
            })
            break
          case 'close':
            window.editorElementDynamic.classList.remove('active')
            break
          case 'color':
            self.toogleColorModal()
            break
          case 'fileUpload':
            self.toggleFileUploadModal()
            break
          case 'formatBlock':
            exec('formatBlock', item.target.dataset.value)
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
      this.editableModal = false
    })

    /**
     * modal component'i kapatılmaya çalışıldığında gerekli
     * değişkiklikleri yapıp modalı kapatır
     * @todo
     *   1. Hangi modal'ın kapatıltığına göre işlem yapılması gerekir
     *   2. Modal içindeki değişikler sağlanmalı
     */
    this.$bus.$on('requestHiddenModal', () => {
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
    toggleFileUploadModal (isMulti) {
      if (isMulti) {
        this.multiModal = isMulti
      } else {
        this.multiModal = null
      }
      this.showFileUploadModal = !this.showFileUploadModal
    },
    toggleFileUploadModalClose (isMulti) {
      // this.multiModal = null <-- do not modify this, it reset the multiModal
      // and gallery picture selection doesn't behave properly ...

      // we revert it to its original value ... need to find a better multi-modal strategy
      this.multiModal = 'TOGGLE_FILESELECT_CLOSE' // revert to the FILESELECT_CLOSE
      this.showFileUploadModal = false
    },
    toggleFileSelectModalClose () {
      console.error('received close?')
      this.showFileSelectModal = false
    },
    toggleFileSelectModal (isMulti) {
      console.error('select modal a3')
      if (isMulti) {
        this.multiModal = isMulti
      } else {
        this.multiModal = null
      }
      console.error('tt : ' + this.showFileSelectModal)
      console.error('tt 1: ' + !this.showFileSelectModal)
      this.showFileSelectModal = !this.showFileSelectModal
    },
    /**
     * Editelement butonuna tıklandığında çalışır
     * editelemen component'ini aktif/açmak için editableModal değişkenini true yapar
     * @return {void}
     */
    openEditElement () {
      if ($(this.editableModalElement).attr('parameditable') === 'sidebar') {
        this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS')
      } else {
        this.editableModal = true
      }
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
