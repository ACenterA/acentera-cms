<template>
    <div :editor-name="nm()" ff="aa" class="plekan-template" v-html="_content"></div>
</template>

<script>
  import mixinComponent from '../../core/mixin'

  export default {
    mixins: [ mixinComponent ],
    props: ['ff'],
    data () {
      // var self = this
      return {
        nm: function () {
          return this.me.name
        },
        IS_EDITABLE: function () {
          return false // self.editable() // false
        },
        DEFAULT_CONTENT: function () {
          // this runs in local, but in dist its the one passed in the other function ...
          return window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1)].data()
        }
      }
    },
    mounted () {
      var self = this
      this.updateElementToEditable(this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1))
      this.$bus.$on('destroyDynamicComponent', (data) => {
        delete window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1)]
        self.$bus.$off('destroyDynamicComponent')
        try {
          self.$destroy(true)
        } catch (f) {
        }
        // self.$emit('remove') // destroy()
      })
    },
    methods: {
      getData () {
        return 'afaf' // this.DEFAULT_CONTENT() // 'afaf'
      },
      getBodyMeta () {
        return 'ffzzf' // this.DEFAULT_CONTENT() // 'afaf'
      },
      isHead: function () {
        return false
      },
      isEditable () {
        // return false
        return this.IS_EDITABLE() // DEFAULT_CONTENT()
      }
    },
    postInserts () {
    }
  }
</script>
