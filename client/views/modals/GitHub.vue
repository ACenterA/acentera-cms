<template>
  <div class="row">
    <div class="col-md-12">

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
        console.log('updagint paal data')
        console.log(param)
        var loginfo = {
          user: this.tmpUsername,
          username: this.tmpUsername,
          pass: this.password,
          type: 'GitHub'
        }
        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        console.error('SET GITHUB HERE 00001')
        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'github')
        this.$store.commit('setDefaultGitProvider', 'github')
        this.password = ''
      },

      updateBitbucketuser: function (param) {
        console.log('A2 updating bitbucket data')
        console.log('UPDATING GIT TEST 01- CC ')
        console.log(param)
        var loginfo = {
          user: this.tmpUsername,
          username: param.username,
          pass: this.password,
          type: 'BitBucket'
        }

        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        console.error('SET GITHUB HERE 9999')
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
        console.log('aaa')
        console.log(this.username)
        return this.username !== null && this.username !== undefined
      },
      validateGithubLogin: function () {
        console.log('validate githbu user')
        console.log(this.tmpUsername)
        console.log(this.password)

        this.$github.setUserPass(this.tmpUsername, this.password)
        this.$github.get('user', {}, this.updateGituser, this.gitError)
      },
      validateBitBucketLogin: function () {
        console.log('validate githbu user')
        console.log(this.tmpUsername)
        console.log(this.password)

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
        console.log('difjkslfjl a : ' + ((this.tmpUsername === undefined)) + ' vs ' + this.tmpUsername)
        if ((this.tmpUsername === undefined || this.tmpUsername === '') || (this.password === undefined || this.password === '')) {
          console.log('AA')
          return false
        }
        console.log('BBB')
        return true
      },
      isBitBucketValid: function () {
        console.log('difjkslfjl a : ' + ((this.tmpUsername === undefined)) + ' vs ' + this.tmpUsername)
        if ((this.tmpUsername === undefined || this.tmpUsername === '') || (this.password === undefined || this.password === '')) {
          console.log('AA')
          return false
        }
        console.log('BBB')
        return true
      },
      logoutGithub: function () {
        window.localStorage.removeItem('github')
        Vue.set(this.parallelData, 'user', {})
        this.$store.commit('clearGit')
      },
      gitError: function (e) {
        console.log('error')
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
