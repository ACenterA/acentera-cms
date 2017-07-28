<template>
  <div class="row">
    <div class="col-md-12">

        <div v-if="isLogIn()">
        <p><strong>Logged in as </strong> {{ username }} <em>(hey there, have fun!)</em></p>
        <br/><br/>
        <p class="control">
        <a class="button rightfloat is-primary"
        @click="logoutGithub()">
        <span>Logout</span>
        </a>
        </p>
        </div>
        <div v-if="!isLogIn()">
              <p>
              <strong>Login with GitHub</strong>
                <article class="tile is-child box">

                    <label class="label">User</label>
                    <div class="field has-addons">
                      <p class="control is-expanded">
                        <input class="input" type="text"
                               placeholder="Github user"
                               v-model="tmpUsername">
                      </p>
                    </div>

                    <label class="label">Password</label>
                    <div class="field has-addons">
                      <p class="control is-expanded">
                        <input class="input" type="password"
                               placeholder="password"
                               v-model="password">
                      </p>
                    </div>


                    <p class="control">
                    <a class="button rightfloat is-primary"
                    @click="validateGithubLogin()"
                    :disabled="!isGithubValid()">
                    <span>Login with Github</span>
                    </a>
                    </p>

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
        tmpUsername: ''
      }
    },

    props: {
    },

    computed: {
      username: function () {
        if (this.parallelData.user) {
          return this.parallelData.user.name || this.parallelData.user.login
        }
        return null
      }
    },

    mounted: function () {
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
    },
    methods: {
      updateGituser: function (param) {
        console.log('updagint paal data')
        console.log(param)
        var loginfo = {
          user: this.tmpUsername,
          pass: this.password
        }
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
        this.$store.commit('setGithub', this.parallelData)
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
      isGithubValid: function () {
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
        this.$store.commit('clearGithub')
      },
      gitError: function (e) {
        console.log('error')
        if (e.toString().indexOf('code 401')) {
          // Invalid user
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
