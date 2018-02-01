<template>
  <div class="row">
    <div class="col-md-12">
        <div v-if="isLogIn">
        <p><strong>Logged in as </strong> {{ username }} <em><br/>(hey there, have fun!)</em></p>
        <br/><br/>
        <br/>
        &nbsp;
        <p class="control">
        <a class="button rightfloat is-primary"
        @click="logoutGithub()">
        <span>Logout</span>
        </a>
        </p>
        </div>
        <div v-if="!isLogIn">
              <p>
              <strong>Choose provider : {{ bitbucket }}</strong>
                <article class="tile">
                <div v-if="repoState.Provider === null || repoState.Provider === 'Github'">
                    <p class="control">
                      <a class="button leftfloat is-primary"
                        @click="selectGitHub()">
                            <span>Github</span>
                      </a>
                    </p>
                  </div>
                  <div v-if="repoState.Provider === null || repoState.Provider === 'BitBucket'">
                    <p class="control">
                      <a class="button leftfloat is-primary" style="margin-left:30px"
                        @click="selectBitBucket()">
                            <span>Bitbucket</span>
                      </a>
                    </p>
                  </div>

                </article>
              </p>

              </article>
              <br/><br/>

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



                      <div v-if="!isBitBucket()">

                        <p class="control">
                        <a class="button rightfloat is-primary"
                        @click="validateGithubLogin()"
                        :disabled="!isGithubValid()">
                        <span>Login with Github</span>
                        </a>
                        </p>

                      </div>

                      <div v-if="isBitBucket()">

                        <p class="control">
                        <a class="button rightfloat is-primary"
                        @click="validateBitBucketLogin()"
                        :disabled="!isBitBucketValid()">
                        <span>Login with BitBucket</span>
                        </a>
                        </p>

                      </div>

                  </article>

            </p>
          </div>
    </div>
  </div>
</template>

<script>

  // import _ from 'lodash'
  import Vue from 'vue'

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
    },

    computed: {
      isLogIn: function () {
        this.parallelData = this.github()
        if (this.parallelData.logininfo) {
          if (this.parallelData.logininfo.pass && this.parallelData.logininfo.pass !== '') {
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
    username: function () {
      if (this.$store.state.github !== null) {
        if (this.$store.state.github.user !== null) {
          // Ok great we have usernames, lets check for the ssh keys... ??
          if (this.$store.state.github && this.$store.state.github.user) {
            return this.$store.state.github.user.name || this.$store.state.github.user.login || this.$store.state.github.user.username
          }
        }
      }
      return null
    },
    mounted: function () {
    },
    methods: {
      updateGituser: function (param) {
        var loginfo = {
          user: this.tmpUsername,
          username: this.tmpUsername,
          pass: this.password || this.$store.state.github.logininfo.pass,
          type: 'GitHub'
        }
        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'github')
        this.$store.commit('setDefaultGitProvider', 'github')
        this.password = ''
      },

      updateBitbucketuser: function (inputParam) {
        var param = {}
        if (typeof inputParam === 'string') {
          param = JSON.parse(inputParam)
        } else {
          param = inputParam
        }

        var loginfo = {
          user: this.tmpUsername,
          username: param.username,
          pass: this.password || this.$store.state.github.logininfo.pass,
          type: 'BitBucket'
        }

        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'bitbucket')
        this.$store.commit('setDefaultGitProvider', 'bitbucket')
        this.password = ''
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
      },
      selectGitHub: function () {
        this.bitbucket = false
      },
      validateGithubLogin: function () {
        this.$github.setUserPass(this.tmpUsername, this.password)
        this.$github.get('user', {}, this.updateGituser, this.gitError)
      },
      validateBitBucketLogin: function () {
        this.$bitbucket.setUserPass(this.tmpUsername, this.password)
        this.$bitbucket.get('/2.0/user', {}, this.updateBitbucketuser, this.gitError)
      },
      userPlaceHolder: function () {
        if (this.isBitBucket()) {
          return 'BitBucket Username'
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
        if (e.toString().indexOf('code 401')) {
          // Invalid user
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

.tmp {
}
</style>
