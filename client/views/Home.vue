<template>
  <!-- Home -->
  <div class="content has-text-centered">

    <h1 class="is-title is-bold">{{ pkg.name.replace('-', ' ') }}</h1>

    <p>
      <strong>{{ pkg.description }}</strong>
    </p>

    <div v-if="isRepoUpdating()">
      <p>Please wait, we are trying to gather latest updates on your website...</p>
    </div>

    <div v-if="isRepoUpdated()">
      <p>Start designing your website by using the left toolbar in the design section.</p>
    </div>
    <div v-if="isRepoMissing()">
      <p>There is an error with your repository. You do not have a .git/config file.</p>
    </div>

    <br/>
    <div v-if="repoUrl">
    Repository Information: {{ repoUrl }}
    </div>

    <div v-if="isKeyMissing()">
      <br/>
      <p class="blue">SSH Key is missing. &nbsp;<router-link to="/login" :exact="true"><b>Click here to configure.</b></router-link></p>
    </div>

  </div>
</template>

<script>
import { mapActions } from 'vuex'
// import Vue from 'vue'

export default {

  data () {
    console.log(this.$store.state)
    return {
      pkg: this.$store.state.pkg
    }
  },
  computed: {
    repoState: function () {
      return this.$store.state.app.repoState
    },
    repoUrl: function () {
      if (this.$store.state.app.repoState.hasOwnProperty('url')) {
        if (this.$store.state.app.repoState.hasOwnProperty('url') !== undefined && this.$store.state.app.repoState.hasOwnProperty('url') !== null && this.$store.state.app.repoState.hasOwnProperty('url') !== '') {
          return this.$store.state.app.repoState.url
        }
      }
    }
  },
  mounted () {
    console.log('toggle test')
    this.toggleRepoState(1)
    var self = this

    this.$http.get(window.apiUrl + '/git?action=config').then((response) => {
      this.toggleRepoUrl(response.data.Data)
      if (self.$store.state.app.inet) {
        this.$http.get(window.apiUrl + '/git?action=pull').then((response) => {
          console.log('doing pull done')
          console.log(response.data.Data)
          self.toggleRepoState(0) // all good
        })
        .catch((error) => {
          if (error.response.status === 500) {
            self.toggleRepoState(6) // need to setup SSH Key for the user
          } else {
            this.$onError(error)
          }
        })
      }
    })
    .catch((error) => {
      if (error.response.status === 500) {
        self.toggleRepoState(5) // State 5 = no .git/config file....
      } else {
        this.$onError(error)
      }
    })
  },

  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepoUrl'
    ]),
    isRepoUpdating () {
      return (this.repoState.updating === 1)
    },
    isRepoUpdated () {
      return (this.repoState.updating === 0)
    },
    isRepoMissing () {
      return (this.repoState.updating === 5)
    },
    isKeyMissing () {
      return (this.repoState.updating === 6)
    }
  }

}
</script>

<style lang="scss" scoped>
.is-title {
  text-transform: capitalize;
}
</style>
