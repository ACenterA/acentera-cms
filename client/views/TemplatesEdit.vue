<template>
  <plekan></plekan>
</template>

<script>
import plekan from 'components/plekan/plekan.vue'
// import tmpA from '../plekan/src/core/modules/dynamic.vue'
import { mapActions } from 'vuex'
// import Vue from 'vue'
// import Vue from 'vue'

export default {

  components: {
    plekan
  },
  data () {
    return {
      themes: [],
      selectedTheme: null,
      pkg: this.$store.state.pkg
    }
  },
  computed: {
  },
  mounted () {
    $('body').addClass('overflow-hidden')
    /*
    var self = this
    this.$http.get(window.currentUrl + '/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      self.themes = response.data
      for (var idx in self.themes) {
        if (self.themes[idx].Name === self.$route.params.id) {
          self.selectedTheme = self.themes[idx]
          break
        }
      }
      // TODO: if (self.selectedTheme is null... then.. show error
    }).catch((error) => {
      this.$onError(error)
    })
    */

    // this.refreshPage()
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
