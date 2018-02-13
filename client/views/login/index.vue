<template>
    <div class="tile is-ancestor box is-vertical">
      <div class="tile">
        <!-- Left side -->
        <div class="column is-6">
          <article v-if="isGitHub()"  class="tile is-parent is-5 is-vertical">
            <!-- Login tile -->
            <article class="tile is-child is-marginless is-paddingless">
              <GitHub showGitButtons="false"></GitHub>
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
                  <strong>You must be logged in to manage SSH Keys</strong>
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
                      <a class="button rightfloat is-primary" title="Delete the ssh key created"
                        @click="deleteSSHKeys()">
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
      creating: false,
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
      isWebsite: 'isWebsite',
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
      var self = this
      if (this.$store.state.app.website) {
        // No SshKey when using the hosted version.
        // We will use username / password passed on specific requests,
        // as we do not store any credentials
        return
      }

      this.$httpApi.get(window.apiUrl + '/sshkeys?action=test&loc=login&i=1').then((response) => {
        if (response.data.Data.indexOf('SSH Is Valid') >= 0) {
          var keySuffix = response.data.Extra
          if (keySuffix && keySuffix.startsWith('ssh-rsa')) {
            // Ok lets delete it from Git user account ...
            var userGetPath = '/user/keys'
            var $gitobj = self.$github
            if (self.$store.state.github && self.$store.state.github.logininfo && self.$store.state.github.logininfo.type === 'BitBucket') {
              $gitobj = self.$bitbucket
              userGetPath = '1.0/users/' + self.$store.state.github.logininfo.username + '/ssh-keys'
            }
            var gitInfo = self.github

            if (window.vueAuth.getToken()) {
              // validate if window.vueAuth.getToken() is same as this.$store.state.github.logininfo.token ??
              $gitobj.setToken(window.vueAuth.getToken())
            } else {
              $gitobj.setUserPass(gitInfo.logininfo.user, gitInfo.logininfo.pass)
            }

            $gitobj.get(userGetPath, {}, function (resp) {
              // If BitBucket ?
              var keyToDelete = null
              var len = resp.length
              for (var i = 0; i < len; i++) {
                if (resp[i].key === keySuffix) {
                  if ($gitobj === self.$bitbucket) {
                    keyToDelete = resp[i].pk
                  } else {
                    keyToDelete = resp[i].id
                  }
                  break
                }
              }
              var keyDeletePath = userGetPath
              if (keyToDelete !== null) {
                keyDeletePath += '/' + keyToDelete
              }
              $gitobj.delete(keyDeletePath, function (delResp) {
                if (delResp.status >= 200 && delResp.status < 300) {
                  self.sshValid = false
                  self.$httpApi.post(window.apiUrl + '/sshkeys?action=delete', { Data: keySuffix }).then((response) => {
                    if (response.status === 204) {
                      self.sshValid = false
                    } else {
                      // error deleting?
                    }
                    self.toggleRepoState(6) // need to setup SSH Key for the user
                  })
                  .catch((error) => {
                    self.$onError(error)
                  })
                }
              }, (error) => {
                self.$onError(error)
              })
            }, (error) => {
              self.$onError(error)
            })
          }
        }
      })
      .catch((error) => {
        self.$store.state.app.repoState.sshKeyMissing = true
        if (error && error.response && error.response.status === 504) {
          self.$store.commit('REPO_STATE_UPATE', 0) // all good
          self.$store.commit('setInet', false)
        } else {
          if (self.sshValid) {
            self.sshValid = false
            if (error && error.response && error.response.status === 500) {
              self.toggleRepoState(6) // need to setup SSH Key for the user
            } else {
              self.$onError(error)
            }
          }
        }
      })
    },
    testFetch: function () {
      var self = this

      if (this.$store.state.app.website) {
        // No SshKey Remote we use username / password
        return
      }

      this.$httpApi.get(window.apiUrl + '/sshkeys?action=test&loc=login&i=2').then((response) => {
        if (response.data.Data.indexOf('SSH Is Valid') >= 0) {
          self.sshValid = true
          self.toggleRepoState(0) // all good
        } else {
          self.sshValid = false
        }
      })
      .catch((error) => {
        self.$store.state.app.repoState.sshKeyMissing = true
        if (error && error.response && error.response.status === 504) {
          self.$store.commit('REPO_STATE_UPATE', 0) // all good
          self.$store.commit('setInet', false)
        } else {
          if (self.sshValid) {
            self.sshValid = false
            if (error.response && error.response.status === 500) {
              self.toggleRepoState(6) // need to setup SSH Key for the user
            } else {
              this.$onError(error)
            }
          }
        }
      })
    },
    createSSHKey: function () {
      this.sshKeyCreateError = false
      if (this.creating) {
        // prevent double creates ...
        return
      }
      this.creating = true

      var self = this
      var userGetPath = 'user'
      var userPostPath = '/user/keys'
      var $gitobj = this.$github
      if (this.$store.state.github && this.$store.state.github.logininfo && this.$store.state.github.logininfo.type === 'BitBucket') {
        $gitobj = this.$bitbucket
        userGetPath = '1.0/users/' + this.$store.state.github.logininfo.username
        userPostPath = '1.0/users/' + this.$store.state.github.logininfo.username + '/ssh-keys'
      }
      if (window.vueAuth.getToken()) {
        // validate if window.vueAuth.getToken() is same as this.$store.state.github.logininfo.token ??
        $gitobj.setToken(window.vueAuth.getToken())
      } else {
        $gitobj.setUserPass(this.logininfo.username, this.logininfo.pass)
      }

      $gitobj.get(userGetPath, {}, function (next) {
        self.$http.get(window.apiUrl + '/sshkeys?action=create').then((response) => {
          if (response.data !== undefined && response.data !== null) {
            self.pubKey = response.data.Data
            if (self.pubKey !== undefined && self.pubKey !== null) {
              var githubPush = {
                key: self.pubKey
              }

              if (self.$store.state.github.logininfo.type === 'BitBucket') {
                githubPush['accountname'] = self.$store.state.github.logininfo.username
                githubPush['label'] = 'ACenterA CMS Generated - ' + response.data.Extra
              }
              $gitobj.post(userPostPath, githubPush, function (resp) {
                if (resp.status === 201 || resp.status === 200) { // 200 = BitBucket success response, 201 = Github success response
                  // SSH Key got created... NICE! Lets fetch
                  self.testFetch()
                  self.creating = false
                }
              }, function (err) {
                console.error(err)
                self.creating = false
              })
            }
          }
          self.sshKeyCreateError = true
        })
        .catch((error) => {
          this.creating = false
          if (error.response && error.response.status === 500) {
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
