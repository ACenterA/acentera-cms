<template>
    <div class="plekan-template" v-html="_content" :contenteditable="isEditable"></div>
</template>

<script>
  import mixinComponent from '../../core/mixin'

  export default {
    mixins: [ mixinComponent ],
    props: ['ff'],
    data () {
      var self = this
      return {
        DEFAULT_CONTENT: function () {
          return self.getData()
        }
      }
    },
    methods: {
      getData () {
        // console.error(this.DEFAULT_CONTENT)
        // console.error('get data here 03?')
        return 'afaf'
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
