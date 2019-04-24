<template>
  <div>
    <div>
      <div class="title">
        <a>
          ({{model.name}})
        </a>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import VueFormGenerator from 'vue-form-generator/dist/vfg-core.js'
  import 'vue-form-generator/dist/vfg-core.css'
  Vue.use(VueFormGenerator)

  export default {
    props: [
      'model',
      'index',
      'schema',
      'id',
      'parentId',
      'removeElementButtonLabel',
      'moveElementDownButtonLabel',
      'moveElementUpButtonLabel',
      'itemContainerHeader'
    ],
    data () {
      return {
        contentVisible: false
      }
    },
    methods: {
      moveItem (direction) {
        return false
      }
    }
  }
</script>
<style scoped>
  .title { background: whitesmoke; }
  .content { border: 2px solid whitesmoke; padding: 10px; }
  a { color: blue; text-decoration: underline; }
</style>
