<template>
    <div class="tile is-ancestor box is-vertical">
      <div class="tile">
        <!-- Left side -->
        <div class="column is-6">
          <article v-if="isGitHub()"  class="tile is-parent is-5 is-vertical">

            <!-- Login tile -->
            <article class="tile is-child is-marginless is-paddingless">
              <GitHub></GitHub>
            </article>
          </article>
        </div>


        <!-- Right column -->
        <div class="column is-6">

          <div v-if="isWebsite">

            <!-- Warnings -->
            <div v-if="username === null" class="field">
              <article class="message is-warning">
                <div class="message-body">
                  <strong>You must be logged in to edit your website.</strong>
                </div>
              </article>
            </div>
            <div v-if="username !== null">
              <article class="message is-success">
                <div class="message-body">
                  <strong>You can edit and save your website..</strong>
                </div>
              </article>
            </div>
          </div>
          <div v-if="!isWebsite">
            <!-- Warnings -->
            <div v-if="username === null" class="field">
              <article class="message is-warning">
                <div class="message-body">
                  <strong>You must be logged in to enable SSH Keys</strong>
                </div>
              </article>
            </div>


            <div v-if="username !== null">
              <article class="tile is-child box">
               <strong>SSHKeys</strong>
               <br/>
               <br/>
               <article class="tile is-child">
                  <p class="control" v-if="!isSshValid()">
                    <a class="button rightfloat is-primary"
                    @click="createSSHKey()">
                    <span>Create SSH Key</span>
                    </a>
                  </p>

                  <div v-if="isSshValid()">
                    <span>Your SSH Key is valid</span>
                    <br/>
                    <br/>
                    <p class="control">
                      <a class="button leftfloat is-primary" title="Test your ssh key"
                        @click="testFetch()">
                        <span>Test SSH Key</span>
                      </a>
                      <a class="button rightfloat is-primary" title="Not yet implemented"
                        @click="deleteSSHKeys()" disabled>
                        <span>Delete SSH Key</span>
                      </a>
                    </p>
                  </div>
               </article>
              </article>
            </div>

          </div>
        </div>
    </div>
  </div>
</template>

<script>

// import Octokat from 'octokat'
import GitHub from 'components/GitHub'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    GitHub
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
    this.testFetch()
  },

  computed: {
    ...mapGetters({
      session: 'session',
      repoState: 'repoState',
      isWebsite: 'isWebsite'
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
      var self = this
      if (this.$store.state.github !== null) {
        if (this.$store.state.github.user !== null) {
          // Ok great we have usernames, lets check for the ssh keys... ??
          setTimeout(function () {
            self.testFetch()
          }, 100)
          if (this.$store.state.github && this.$store.state.github.user) {
            return this.$store.state.github.user.name || this.$store.state.github.user.login || this.$store.state.github.user.username
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
      var self = this

      if (this.$store.state.app.website) {
        // No SshKey Remote we use username / password
        return
      }

      this.$httpApi.get(window.apiUrl + '/sshkeys?action=test').then((response) => {
        // console.log('ssh key test is')
        // console.log(response)
        // console.log(response.data.Data.indexOf('SSH Is Valid'))
        if (response.data.Data.indexOf('SSH Is Valid') >= 0) {
          console.log('ssh valid set to true')
          self.sshValid = true
          self.toggleRepoState(0) // all good
        } else {
          self.sshValid = false
        }
      })
      .catch((error) => {
        console.log('set ssh valid to false??')
        console.log(error)
        if (self.sshValid) {
          self.sshValid = false
          console.error(error)
          console.error('err3')
          if (error.response.status === 500) {
            self.toggleRepoState(6) // need to setup SSH Key for the user
          } else {
            this.$onError(error)
          }
        }
      })
    },
    createSSHKey: function () {
      console.log('creat ssh key')
      this.sshKeyCreateError = false

      var self = this
      // console.log(this.logininfo)
      // ensure to use login credentials first...
      console.log('sshkey test a')
      var userGetPath = 'user'
      var userPostPath = '/user/keys'
      var $gitobj = this.$github
      console.log('type test')
      if (this.$store.state.github.logininfo.type === 'BitBucket') {
        $gitobj = this.$bitbucket
        userGetPath = '1.0/users/' + this.$store.state.github.logininfo.username
        userPostPath = '1.0/users/' + this.$store.state.github.logininfo.username + '/ssh-keys'
      }
      console.log(this.$store.state.github.logininfo)
      $gitobj.setUserPass(this.logininfo.username, this.logininfo.pass)
      $gitobj.get(userGetPath, {}, function (next) {
        console.log('success fully got user informations...')
        self.$http.get(window.apiUrl + '/sshkeys?action=create').then((response) => {
          console.log('doing SSH KEY CREATE done')
          if (response.data !== undefined && response.data !== null) {
            self.pubKey = response.data.Data
            if (self.pubKey !== undefined && self.pubKey !== null) {
              console.log(response.data)
              var githubPush = {
                key: self.pubKey
              }

              if (self.$store.state.github.logininfo.type === 'BitBucket') {
                githubPush['accountname'] = self.$store.state.github.logininfo.username
                githubPush['label'] = 'ServerlessCMS Generated'
              }
              console.log('will create ssh key')
              console.log(githubPush)

              $gitobj.post(userPostPath, githubPush, function (resp) {
                console.log('received git response for ssh key creation')
                console.log(resp)
                if (resp.status === 201 || resp.status === 200) { // 200 = BitBucket success response, 201 = Github success response
                  // SSH Key got created... NICE! Lets fetch
                  self.testFetch()
                }
              }, function (err) {
                console.log('recieved github error?')
                console.log(err)
              })
            }
          }
          self.sshKeyCreateError = true
        })
        .catch((error) => {
          console.error('got error of')
          console.error(error)
          console.error('err4')
          if (error.response.status === 500) {
            this.sshKeyCreateError = true
          } else {
            this.$onError(error)
          }
        })
      }, this.gitError)
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

<style scoped>
  .button {
    margin: 5px 0 0;
  }
  .button .leftfloat {
    margin-right:80px!important;
    float :left;
  }
  .control .button {
    margin: inherit;
  }
</style>
