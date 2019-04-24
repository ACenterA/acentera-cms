<template>
  <div>
    <div>
      <div class="title">
        <a @click="contentVisible = !contentVisible">
          {{contentVisible ? "-" : "+"}} ({{model.name}})
        </a>
        <a @click="$emit('removeItem')"  style="float:right; padding-right:20px;">  
          X
        </a>
        <a @click="$emit('moveItemUp')" style="float:right; padding-right:20px;">
          ↑
        </a>
        <a @click="$emit('moveItemDown')"  style="float:right;padding-right:20px;">
          ↓
        </a>
      </div>
      <div class="content" v-if="contentVisible">
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
        contentVisible: true
      }
    },
    computed: {
      gg () {
        console.error(this)
        return 'aa'
      }
    },
    methods: {
      moveItem (direction) {
        console.error('received')
        console.error(direction)
        try {
          $('#collapse' + this.id).collapse('hide')
        } catch (e) {

        }
        this.$emit(direction)
      }
    }
  }
</script>
<style scoped>
  .title { background: whitesmoke; }
  .content { border: 2px solid whitesmoke; padding: 10px; }
  a { color: blue; text-decoration: underline; }
</style>
