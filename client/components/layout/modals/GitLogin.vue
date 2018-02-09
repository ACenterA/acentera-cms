<template>
  <modal :visible="visible" @close="close">
      <div class="tile is-ancestor box is-vertical">
        <div class="tile">

          <!-- Left side -->
          <div v-bind:class="{ 'column is-12': !username, 'column is-6': username }">
            <div v-if="username === null" class="column is-6">
              <p class="control" style="right:50px; right;position:absolute;">
                <a class="button leftfloat" title="Test your ssh key"
                  @click="close()">
                  <span>Close</span>
                </a>
              </p>
            </div>
            <article v-if="isGitHub()"  class="tile is-parent is-12 is-vertical">

              <!-- Login tile -->
              <article class="tile is-child is-marginless is-paddingless">
                <GitHub showGitButtons="true"></GitHub>
              </article>
            </article>
          </div>


          <!-- Right column -->
          <div v-if="username !== null" class="column is-6">
              <p class="control" style="float:right;">
                <a class="button leftfloat " title="Test your ssh key"
                  @click="close()">
                  <span>Close</span>
                </a>
              </p>
              <br/>&nbsp;
              <!-- Warnings -->
              <div v-if="username === null" class="field">
                <article class="message is-warning">
                  <div class="message-body">
                    <strong>You must be logged in to enable SSH Keys</strong>
                  </div>
                </article>
              </div>


              <div v-if="username !== null">
                 <div>
                   <strong></strong>
                   <br/>
                   <br/>
                   <article class="tile is-child">
                      <div>
                        <span>Great Job! Lets continue.....</span>
                        <br/>
                        <br/>

                        <p class="control">
                          <a class="button rightfloat is-primary"
                          @click="nextStep()">
                          <span>Proceed to next Step.</span>
                          </a>
                        </p>
                      </div>
                   </article>
                 </div>
                </article>
              </div>


          </div>
      </div>
    </div>
  </modal>
</template>

<script>
import { Modal } from 'vue-bulma-modal'
import GitHub from 'components/GitHub'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    GitHub,
    Modal
  },
  props: {
    visible: Boolean,
    title: String,
    template: Object,
    info: String
  },
  data () {
    return {
      csrf: '',
      type: 'Token',
      ID: '',
      pubKey: '',
      Password: '',
      healthData: {},
      sshValid: true,
      sshKeyCreateError: false,
      healthLoading: false
    }
  },

  mounted: function () {
    // fetch csrf for login post request later
    // this.fetchCSRF()
    // fetch vault cluster details
    // this.getHealth()
    // this.testFetch()
  },

  computed: {
    ...mapGetters({
      session: 'session',
      repoState: 'repoState'
      github: 'github'
    }),
    healthKeys: function () {
      return Object.keys(this.healthData)
    },
    renewable: function () {
      return (this.session && this.session['renewable'])
    },
    session: function () {
      return this.$store.getters.session
    },
    logininfo: function () {
      if (this.$store.state.github.logininfo !== null) {
        if (this.$store.state.github.logininfo !== null) {
          return this.$store.state.github.logininfo
        }
      }
      return null
    },
    username: function () {
      var githubInfo = this.github
      if (githubInfo !== null) {
        if (githubInfo.user !== null) {
          // Ok great we have usernames, lets check for the ssh keys... ??
          if (githubInfo.user) {
            if (githubInfo.user.name === '') {
              return githubInfo.user.username
            } else {
              return githubInfo.user.name || githubInfo.user.login || githubInfo.user.username
            }
          }
        }
      }
      return null
    },
    sessionKeys: function () {
      return (this.session === null) || Object.keys(this.session)
    }
  },

  methods: {
    ...mapActions([
      'toggleRepoState'
    ]),
    close () {
      this.$emit('close')
    },
    nextStep () {
      var self = this
      self.$emit('nextStep', self.template)
    },
    confirmed () {
      this.$emit('confirmed')
    },
    isSshValid: function () {
      return this.sshValid === true
    },
    fetchCSRF: function () {
      this.$http.get('/api/login/csrf')
      .then((response) => {
        this.csrf = response.headers['x-csrf-token']
      })
      .catch((error) => {
        this.$onError(error)
      })
    },

    isGitHub: function () {
      return true
    },
    getHealth: function () {
      this.healthLoading = true
      this.$http.get('/api/health')
      .then((response) => {
        this.healthData = JSON.parse(response.data.result)
        this.healthData['server_time_utc'] = new Date(this.healthData['server_time_utc'] * 1000).toUTCString()
        this.healthLoading = false
      })
      .catch((error) => {
        this.$onError(error)
        this.healthLoading = false
      })
    },

    login: function () {
      this.$http.post('/api/login', {
        Type: this.type.toLowerCase(),
        ID: this.ID,
        Password: this.Password
      }, {
        headers: {'X-CSRF-Token': this.csrf}
      })
      .then((response) => {
        // notify user, and clear inputs
        this.$notify({
          title: 'Login success!',
          message: '',
          type: 'success'
        })
        this.clearFormData()

        // construct session data
        this.session = {
          'type': this.type,
          'display_name': response.data.data['display_name'],
          'meta': response.data.data['meta'],
          'policies': response.data.data['policies'],
          'renewable': response.data.data['renewable'],
          'token_expiry': response.data.data['ttl'] === 0 ? 'never' : new Date(Date.now() + response.data.data['ttl'] * 1000).toString(),
          'cookie_expiry': new Date(Date.now() + 28800000).toString() // 8 hours from now
        }

        // store session data in localstorage
        window.localStorage.setItem('session', JSON.stringify(this.session))

        // mutate state of vuex
        this.$store.commit('setSession', this.session)

        // notify user of generated client-token
        if (this.type === 'Userpass' || this.type === 'LDAP') {
          this.$message({
            message: 'Your access token is: ' + response.data.data['id'] + ' and this is the only time you will see it. If you wish, you may login with this to avoid creating unnecessary access tokens in the future.',
            type: 'warning',
            duration: 0,
            showCloseButton: true
          })
        }
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    deleteSSHKeys: function () {

    },
    testFetch: function () {
    },
    logout: function () {
      // force cookie timeout
      document.cookie = 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      // purge session from localstorage
      window.localStorage.removeItem('session')
      // mutate vuex state
      this.$store.commit('clearSession')
    },

    clearFormData: function () {
      this.ID = ''
      this.Password = ''
    },

    renewLogin: function () {
      this.$http.post('/api/login/renew-self', {}, {
        headers: {'X-CSRF-Token': this.csrf}
      })
      .then((response) => {
        this.$notify({
          title: 'Renew success!',
          message: '',
          type: 'success'
        })
        this.session['meta'] = response.data.data['meta']
        this.session['policies'] = response.data.data['policies']
        this.session['token_expiry'] = response.data.data['ttl'] === 0 ? 'never' : new Date(Date.now() + response.data.data['ttl'] * 1000).toString()

        // store session data in localstorage
        window.localStorage.setItem('session', JSON.stringify(this.session))

        // mutate state of vuex
        this.$store.commit('setSession', this.session)
      })
      .catch((error) => {
        this.$onError(error)
      })
    }
  }
}

</script>

<style>
.modal-content {
   overflow: hidden;
 }
 .background-red {
   background-color: red;
 }
</style>
