<template>
  <div>
    Ok received {{ provider }} code is : {{ code }}
  </div>
</template>

<script>
// import { mapActions } from 'vuex'
// import Vue from 'vue'

export default {
  computed: {
    provider () {
      return this.$route.params.provider
    },
    code () {
      return this.$route.query.code
    },
    state () {
      return this.$route.query.state
    }
  },
  mounted () {
  },
  methods: {
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
