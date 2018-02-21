<template>
  <transition enter-active-class="animated fadeIn custom-classes-transition"
              leave-active-class="animated fadeOut custom-classes-transition">
    <div class="plekan-modal"
         v-show="layoutShow" :class="{ fullScreen: multiModal }">
      <transition enter-active-class="animated fadeIn custom-classes-transition-child"
                  leave-active-class="animated  fadeOut custom-classes-transition-child">
        <div v-show="bodyShow"
             class="plekan-modal-arena-layout" :class="{ 'big': big }">
          <div class="plekan-modal-arena">
            <a class="plekan-modal-close" v-if="!multiModal"
               @click="makeBroadcast()"></a>
            <slot name="header"></slot>
            <slot name="body">
            </slot>
            <slot name="footer"></slot>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  props: ['show', 'multiModal', 'big'],
  data () {
    return {
      bodyShow: false,
      layoutShow: false,
      event: null
    }
  },
  watch: {
    show () {
      this.setShownVariable()
    }
  },
  created () {
    this.setShownVariable()
  },
  mounted () {
    this.event = new CustomEvent('requestHiddenModal') // eslint-disable-line
    document.onkeydown = (e) => {
      if (e.key === 'Escape') {
        console.error('ignore broadcast a')
        this.makeBroadcast()
      }
    }

    this.$el.onclick = (e) => {
      if (e.target.className.indexOf('plekan-modal') !== -1) {
        console.error('ignore broadcast b')
        this.makeBroadcast()
      }
    }
  },
  methods: {
    makeBroadcast () {
      console.error('broadcast c')
      if (this.multiModal) {
        console.error('broadcast c 1')
        // if in gallery mode, and adding new image
        // we had to hide it to show the fileUpload modal
        // in front this is bad and should be changed ...
        if (this.multiModal === 'TOGGLE_FILEUPLOAD_CLOSE') {
          this.$bus.$emit('TOGGLE_FILESELECT_RESTORE')
        }
        this.$bus.$emit(this.multiModal) // 'TOGGLE_FILESELECT_CLOSE')
      } else {
        console.error('broadcast c 2')
        this.$bus.$emit(this.event.type, this.event)
        document.dispatchEvent(this.event)
      }
    },
    setShownVariable () {
      this.layoutShow = this.show
      this.bodyShow = this.show
    }
  }
}
</script>
