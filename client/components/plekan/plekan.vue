<template>
  <div id="plekan">
    <Editor></Editor>
    <div style="height:100%">
      <Arena></Arena>
      <!--
        // TODO: This will be used when we do
        // widgets ?
        <List></List>
      -->
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Arena from 'components/plekan/arena';
import List from 'components/plekan/list';
import Editor from 'components/plekan/editor';
import store from '../../store';

export default {
  props: ['rows'],
  data() {
    return {
      store
    }
  },
  components: {
    Arena,
    List,
    Editor
  },
  beforeMount() {
    if (this.rows) {
      this.store.commit('rows', JSON.parse(JSON.stringify(this.rows)));
    }
  },
  created() {
    window.editorvm = this
  },
  mounted() {
    console.error('editor start init aa');
    // this.store.commit('editorStart')
    // this.$plekanEvent.onInit()
  }
}
</script>
