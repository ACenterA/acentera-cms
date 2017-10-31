<template>
  <iframe class="fullIframe" src="https://www.cmpb.co/"  width=100% height=100% marginwidth=0 marginheight=0 frameborder=0></iframe>
</template>

<script>
import { mapActions } from 'vuex'
// import Vue from 'vue'

export default {

  data () {
    return {
      pkg: this.$store.state.pkg
    }
  },
  computed: {
  },
  mounted () {
    $('body').addClass('overflow-hidden')
  },

  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'toggleRepoUrl',
      'isWebsite'
    ])
  }
}

</script>

<style lang="scss" scoped>

@import '~bulma/sass/utilities/variables';
body {
  margin:0;
  overflow: hidden;
  }

.fullIframe {
  position:absolute;
  left:0;
  top:0;
  width:100%;
  height:100%;
  overflow-y: hidden;
  overflow-x: hidden;
}


</style>
