<template>
  <div class="row">
    <div class="col-md-12">
        <!-- modals/GitHub -->
        <div v-if="isLogIn()">
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
        <div v-if="!isLogIn()">
              <p>
              <strong>Choose provider</strong>
                <article class="tile">

                  <p class="control">
                    <a class="button leftfloat is-primary"
                      @click="selectGitHub()">
                          <span>Github</span>
                    </a>
                  </p>

                  <p class="control">
                    <a class="button leftfloat is-primary" style="margin-left:30px"
                      @click="selectBitBucket()">
                          <span>Bitbucket</span>
                    </a>
                  </p>


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
            return this.$store.state.github || {}
          }
          return {}
        },
        bitbucket: false,
        tmpUsername: ''
      }
    },

    props: {
    },

    computed: {
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
            return tmpGithub.user.name || this.parallelData.user.login
          }
        }
        return null
      }
    },

    mounted: function () {
      if (this.github() !== undefined) {
        let raw = this.github()
        this.parallelData = raw
        this.$github.get('user', {}, this.updateGituser, this.gitError)
      }
    },
    methods: {
      updateGituser: function (param) {
        var loginfo = {
          user: this.tmpUsername,
          username: this.tmpUsername,
          pass: this.password,
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

      updateBitbucketuser: function (param) {
        var loginfo = {
          user: this.tmpUsername,
          username: param.username,
          pass: this.password,
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
        return this.bitbucket === true
      },
      selectBitBucket: function () {
        this.bitbucket = true
      },
      selectGitHub: function () {
        this.bitbucket = false
      },
      isLogIn: function () {
        return this.username !== null && this.username !== undefined
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

.tmp {
}
</style>
