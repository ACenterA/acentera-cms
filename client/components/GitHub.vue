<template>
  <div class="row">
    <div class="col-md-12">
        <div v-if="isLogIn">
        <p><strong>Logged in as </strong> {{ username }} <br/>[ {{ loginuser }} ]<em><br/>(hey there, have fun!)</em></p>
        <br/><br/>
        <br/>
        &nbsp;
        <p class="control">
        <a class="button rightfloat is-warning"
        @click="logoutGithub()">
        <span>Logout</span>
        </a>
        </p>
        </div>
        <p class="hidden">components/GitHub</p>

        <div v-if="!isLogIn">
              <h2>Select the button above to login with your GIT provider.</h2>
              <i>If you do not have an account, no worries simply create one its free..</i>
              <br/>
              <br/>
              <p>
                <article class="tile" v-if="isShowGitButton">
                <div v-if="repoState.Provider === undefined || repoState.Provider === null || repoState.Provider === 'Github'">
                    <p class="control">
                      <a class="button leftfloat is-primary"
                        @click="selectGitHub()" :disabled="!loaded">
                            <span>Github</span>
                      </a>
                    </p>
                  </div>
                  <div v-if="repoState.Provider === undefined || repoState.Provider === null || repoState.Provider === 'BitBucket'">
                    <p class="control">
                      <a class="button leftfloat is-primary" style="margin-left:30px"
                        @click="selectBitBucket()" :disabled="!loaded">
                            <span>Bitbucket</span>
                      </a>
                    </p>
                  </div>

                </article>
              </p>

              </article>
              <br/><br/>
              <!--
                  <article class="tile is-child box">
                      <label class="label">User</label>
                      <div class="field has-addons">
                        <p class="control is-expanded">
                          <input class="input" type="text"
                                 :placeholder="userPlaceHolder()"
                                 v-model="tmpUsername">
                        </p>
                      </div>

                      <label class="label">Password</label>
                      <div class="field has-addons">
                        <p class="control is-expanded">
                          <input class="input" type="password"
                                 placeholder="password"
                                 v-model="password"
                                 v-on:keypress="monitorkey($event)">
                        </p>
                      </div>



                      <div v-if="loaded && !isBitBucket()">

                        <p class="control">
                        <a class="button rightfloat is-primary"
                        @click="validateGithubLogin()"
                        :disabled="!isGithubValid()">
                        <span>Login with Github</span>
                        </a>
                        </p>

                      </div>

                      <div v-if="loaded && isBitBucket()">

                        <p class="control">
                        <a class="button rightfloat is-primary"
                        @click="validateBitBucketLogin()"
                        :disabled="!isBitBucketValid()">
                        <span>Login with BitBucket</span>
                        </a>
                        </p>

                      </div>

                  </article>
                -->
            </p>
          </div>
    </div>
  </div>
</template>

<script>

  // import _ from 'lodash'
  import Vue from 'vue'
  import { mapGetters } from 'vuex'

  export default {
    data: function () {
      return {
        parallelData: {},
        password: '',
        github: function () {
          if (this.$store.state) {
            if (this.$store.state.github !== null && typeof this.$store.state.github === 'string') {
              return JSON.parse(this.$store.state.github)
            }
            return this.$store.state.github || {}
          }
          return {}
        },
        repoState: this.$store.state.app.repoState,
        bitbucket: false,
        tmpUsername: ''
      }
    },

    props: {
      showGitButtons: Boolean
    },

    computed: {
      ...mapGetters({
        loaded: 'loaded'
      }),
      isShowGitButton: function () {
        // return ('' + this.showGitButtons === 'true') // weird ???
        return true
      },
      isLogIn: function () {
        this.parallelData = this.github()
        if (this.parallelData.logininfo) {
          if (this.parallelData.logininfo.pass && this.parallelData.logininfo.pass !== '') {
            return true
          }
          // if using gitAuth
          if (this.parallelData.logininfo.token && this.parallelData.logininfo.token !== '') {
            return true
          }
        }
        return false
      },
      githubA: function () {
        if (this.$store.state) {
          return this.$store.state.github || {}
        }
        return {}
      },
      loginuser: function () {
        let tmpGithub = this.github()
        if (tmpGithub.user) {
          // if (tmpGithub.logininfo.type === 'BitBucket') {
          if (tmpGithub.logininfo) {
            return tmpGithub.logininfo.username
          } else {
            return ''
          }
          // }
        } else {
          return ''
        }
      },
      username: function () {
        let tmpGithub = this.github()
        if (tmpGithub.user) {
          if (tmpGithub.logininfo.type === 'BitBucket') {
            return tmpGithub.user.display_name || this.parallelData.user.username
          } else {
            if (this.parallelData && this.parallelData.user) {
              return tmpGithub.user.name || this.parallelData.user.login
            } else {
              return tmpGithub.user.name || null
            }
          }
        }
        return null
      }
    },
    mounted: function () {
    },
    methods: {
      login: function () {
        var self = this
        this.$auth.authenticate('github').then(function () {
          // Execute application logic after successful social authentication
          var gotToken = window.vueAuth.getToken()
          if (gotToken) {
            const $gitobj = self.$github
            $gitobj.setToken(gotToken)
            $gitobj.get('user', {}, self.updateGituser, self.gitError)
          }
        })
      },
      register: function () {
        var self = this
        this.$auth.login({ username: self.tmpUsername, password: self.password }).then(function () {
          // Execute application logic after successful registration
        })
      },
      updateGituser: function (param) {
        var gotToken = window.vueAuth.getToken()
        var pwd = this.password
        if (!pwd) {
          if (this.$store.state.github && this.$store.state.github.logininfo) {
            pwd = this.$store.state.github.logininfo.pass
          }
        }
        var loginfo = {
          user: param.login,
          username: param.login,  // this.tmpUsername,
          token: gotToken,
          pass: pwd,
          type: 'GitHub'
        }
        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'github')
        this.$store.commit('setDefaultGitProvider', 'github')
        this.password = ''

        if (!this.$store.state.app.website) {
          this.$store.commit('REFRESH_CONFIG', this.$store.state) // we still want to refresh settings, for offline version...
        } else {
          if (this.$store.state.app.websiteId) {
            // we are in a website.. not in template creating a template..
            this.$store.commit('REFRESH_CONFIG', this.$store.state) // we still want to refresh settings, for offline version...
          }
        }
      },

      updateBitbucketuser: function (inputParam) {
        var param = {}
        if (typeof inputParam === 'string') {
          param = JSON.parse(inputParam)
        } else {
          param = inputParam
        }

        var gotToken = window.vueAuth.getToken()
        var pwd = this.password
        if (!pwd) {
          if (this.$store.state.github && this.$store.state.github.logininfo) {
            pwd = this.$store.state.github.logininfo.pass
          }
        }
        var loginfo = {
          user: param.username, // this.tmpUsername,
          username: param.username, // param.username,
          pass: pwd,
          token: gotToken,
          type: 'BitBucket'
        }

        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'bitbucket')
        this.$store.commit('setDefaultGitProvider', 'bitbucket')
        this.password = ''

        if (!this.$store.state.app.website) {
          this.$store.commit('REFRESH_CONFIG', this.$store.state) // we still want to refresh settings, for offline version...
        } else {
          if (this.$store.state.app.websiteId) {
            // we are in a website.. not in template creating a template..
            this.$store.commit('REFRESH_CONFIG', this.$store.state) // we still want to refresh settings, for offline version...
          }
        }
      },

      isBitBucket: function () {
        if (this.repoState.Provider === null) {
          return this.bitbucket === true
        } else {
          if (this.repoState.Provider === 'BitBucket') {
            this.bitbucket = true
            // return true
          } else {
            this.bitbucket = false
          }
          return this.bitbucket === true
        }
      },
      selectBitBucket: function () {
        this.bitbucket = true

        var self = this
        this.$auth.authenticate('bitbucket').then(function () {
          var gotToken = window.vueAuth.getToken()
          if (gotToken) {
            const $gitobj = self.$bitbucket
            $gitobj.setToken(gotToken)
            $gitobj.get('/2.0/user', {}, self.updateBitbucketuser, self.gitError)
          }
        })
      },
      selectGitHub: function () {
        this.bitbucket = false

        var self = this
        this.$auth.authenticate('github').then(function () {
          var gotToken = window.vueAuth.getToken()
          if (gotToken) {
            const $gitobj = self.$github
            $gitobj.setToken(gotToken)
            $gitobj.get('user', {}, self.updateGituser, self.gitError)
          }
        })
      },
      validateGithubLogin: function () {
        // IF using username / password instead of oauth token ie: local dev
        this.$github.setUserPass(this.tmpUsername, this.password)
        this.$github.get('user', {}, this.updateGituser, this.gitError)
      },
      validateBitBucketLogin: function () {
        this.$bitbucket.setUserPass(this.tmpUsername, this.password)
        this.$bitbucket.get('/2.0/user', {}, this.updateBitbucketuser, this.gitError)
      },
      userPlaceHolder: function () {
        if (this.isBitBucket()) {
          return 'BitBucket Usernam se'
        }
        return 'GitHub Username'
      },
      isGithubValid: function () {
        if ((this.tmpUsername === undefined || this.tmpUsername === '') || (this.password === undefined || this.password === '')) {
          return false
        }
        return true
      },
      isBitBucketValid: function () {
        if ((this.tmpUsername === undefined || this.tmpUsername === '') || (this.password === undefined || this.password === '')) {
          return false
        }
        return true
      },
      logoutGithub: function () {
        window.localStorage.removeItem('github')
        Vue.set(this.parallelData, 'user', {})
        this.$store.commit('clearGit')
      },
      gitError: function (e) {
        if (e.response === undefined) {
          this.$notify({
            title: 'Cannot login',
            message: 'Do you have internet access?',
            type: 'danger'
          })
        } else {
          if (e.response && e.response.status === 401) {
            var type = 'GitHub'
            if (this.isBitBucket()) {
              type = 'BitBucket'
            }
            // Invalid user
            this.$notify({
              title: 'Cannot login',
              message: 'Invalid username / password. Are you trying to connect to your ' + type + ' account ?',
              type: 'danger'
            })
          }
        }
      },
      monitorkey: function (e) {
        if (e.code === 'Enter') {
          if (this.bitbucket) {
            this.validateBitBucketLogin()
          } else {
            this.validateGithubLogin()
          }
        }
      }
    },
    watch: {

    }
  }
</script>

<style scoped>

.hidden {
   display: none
}
.tmp {
}
</style>
