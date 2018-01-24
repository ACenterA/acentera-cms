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
                <div v-if="repoState.Provider === 'Github'">
                    <p class="control">
                      <a class="button leftfloat is-primary"
                        @click="selectGitHub()">
                            <span>Github</span>
                      </a>
                    </p>
                  </div>
                  <div v-if="repoState.Provider === 'BitBucket'">
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
      /*
        let raw = window.localStorage.getItem('github')
        console.log(raw)
        if (raw !== null) {
          console.log('arse aa')
          console.log(raw)
          this.parallelData = JSON.parse(raw)
        } else {
          // this.$github.get('user', {}, [this.parallelData, 'user'], this.gitError) <-- auto set but will not save store?
          this.$github.get('user', {}, this.updateGituser, this.gitError)
        }
      */
      if (this.github() !== undefined) {
        let raw = this.github()
        console.error('SET OF PARRALEL DATA TEST OF.... ')
        console.error(typeof raw)
        if (typeof raw === 'string') {
          this.parallelData = JSON.parse(raw)
        } else {
          this.parallelData = raw
        }
        var $gitobj = this.$github
        if (this.parallelData.logininfo) {
          if (this.parallelData.logininfo.pass && this.parallelData.logininfo.pass !== '') {
            if (this.$store.state.github.logininfo.type === 'BitBucket') {
              console.error('updaitng git bitbucket 01  ')
              $gitobj = this.$bitbucket
              console.error(this.$store.state.github)
              console.error('TET USERNAME :' + this.$store.state.github.logininfo.username)
              console.error('TET PW  :' + this.$store.state.github.logininfo.pass)
              this.$bitbucket.setUserPass(this.$store.state.github.logininfo.username, this.$store.state.github.logininfo.pass)
              this.$bitbucket.get('/2.0/user', {}, this.updateBitbucketuser, this.gitError)
            } else {
              console.error('updaitng git github 01  ')
              $gitobj = this.$github
              $gitobj.setUserPass(this.$store.state.github.logininfo.username, this.$store.state.github.logininfo.pass)
              $gitobj.get('user', {}, this.updateGituser, this.gitError)
            }
          } else {
            console.error('ignoriing password')
          }
        }
      }
    },
    methods: {
      updateGituser: function (param) {
        console.log('UPDATING GIT TEST 01')
        console.log(param)
        var loginfo = {
          user: this.tmpUsername,
          username: this.tmpUsername,
          pass: this.password || this.$store.state.github.logininfo.pass,
          type: 'GitHub'
        }
        console.error(this.password)
        console.log('UPDATING GIT TEST 02')
        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        /*
        var gitHub = {
          user: param
        }
        */
        /*
        // Vue.set(this.$store.getters.github, 'github', gitHub)
        if (gitHub) {
          // d
        }
        */
        // Vue.set(this.$github, 'github', gitHub)
        // = gitHub
        // store session data in localstorage
        console.log('window set local storage of')
        console.log(this.parallelData)
        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'github')
        this.$store.commit('setDefaultGitProvider', 'github')
        this.password = ''
      },

      updateBitbucketuser: function (param) {
        console.log('UPDATING GIT TEST 01 - a')

        console.error(param)

        var loginfo = {
          user: this.tmpUsername,
          username: param.username,
          pass: this.password || this.$store.state.github.logininfo.pass,
          type: 'BitBucket'
        }

        console.error('param 003')
        console.log('UPDATING GIT TEST 01 - b')
        Vue.set(this.parallelData, 'user', param)
        Vue.set(this.parallelData, 'logininfo', loginfo)

        console.log('bitbucket window set local storage of')
        console.log(this.parallelData)
        window.localStorage.setItem('github', JSON.stringify(this.parallelData))
        this.$store.commit('setGit', this.parallelData)

        window.localStorage.setItem('default_git_provider', 'bitbucket')
        this.$store.commit('setDefaultGitProvider', 'bitbucket')
        this.password = ''
      },

      isBitBucket: function () {
        if (this.repoState.Provider === 'BitBucket') {
          this.bitbucket = true
          // return true
        } else {
          this.bitbucket = false
        }
        return this.bitbucket === true
      },
      selectBitBucket: function () {
        this.bitbucket = true
      },
      selectGitHub: function () {
        this.bitbucket = false
      },
      isLogIn: function () {
        console.log('aaa 999a')
        console.log(this.username)
        console.error(this.parallelData)
        if (this.parallelData.logininfo) {
          console.log('aaa 999a f')
          if (this.parallelData.logininfo.pass && this.parallelData.logininfo.pass !== '') {
            return true
          }
        }
        return false
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
