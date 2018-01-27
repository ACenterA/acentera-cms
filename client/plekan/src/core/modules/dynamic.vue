<template>
    <div :editor-name="nm()" ff="aa" class="plekan-template" v-html="_content"></div>
</template>

<script>
  import mixinComponent from '../../core/mixin'

  export default {
    mixins: [ mixinComponent ],
    props: ['ff'],
    data () {
      var self = this
      return {
        nm: function () {
          return this.me.name
        },
        IS_EDITABLE: function () {
          console.error('IS EDITABLE TEST')
          return self.editable() // false
        },
        DEFAULT_CONTENT: function () {
          console.error(self)
          console.error('GEEZZ3')
          return self.getData()
        }
      }
    },
    mounted () {
      console.error('mountedComponent')
      var self = this
      this.updateElementToEditable(this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1))
      this.$bus.$on('destroyDynamicComponent', (data) => {
        console.error('recieved destroy...')
        console.error(self)
        console.error('delete of component ' + this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1))
        delete window.componentObj[this.$vnode.tag.substr(this.$vnode.tag.indexOf('-awesome') + 1)]
        self.$bus.$off('destroyDynamicComponent')
        try {
          self.$destroy(true)
        } catch (f) {
          console.error(f.stack)
        }
        // self.$emit('remove') // destroy()
      })
    },
    methods: {
      getData () {
        // console.error(this.DEFAULT_CONTENT)
        console.error('get data here 03?')

        console.error(this)
        return this.DEFAULT_CONTENT() // 'afaf'
      },
      isHead: function () {
        return false
      },
      isEditable () {
        console.error('isEditable: false')
        console.error(this)
        // return false
        return this.IS_EDITABLE() // DEFAULT_CONTENT()
      }
    },
    postInserts () {
      console.error('POST INSERT...')
    }
  }
</script>
