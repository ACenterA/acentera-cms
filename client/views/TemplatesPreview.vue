<template>
  <iframe v-if="selectedTheme" class="fullIframe" :src="selectedTheme.Preview"  width=100% height=100% marginwidth=0 marginheight=0 frameborder=0></iframe>
</template>

<script>
import { mapActions } from 'vuex'
// import Vue from 'vue'

export default {

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

    var self = this
    this.$http.get('/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      console.log('got monuted raw json')
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
