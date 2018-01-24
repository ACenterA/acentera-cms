<template>
    <div class="plekan-template" v-html="_content" :contenteditable="false"></div>
</template>
// <div class="plekan-template" v-html="_content" :contenteditable="isEditable"></div>

<script>
  import mixinComponent from '../../core/mixin'

  export default {
    mixins: [ mixinComponent ],
    props: ['ff'],
    data () {
      var self = this
      return {
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
        console.error('is editable testaaaa')
        console.error(this)
        return true
      }
    },
    postInserts () {
      console.error('POST INSERT...')
    }
  }
</script>
