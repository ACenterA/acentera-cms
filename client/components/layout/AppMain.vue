<template>
  <section class="app-main" :class="{ nomargin: notLoggedIn, nomargin: !hasSidebar }">
    <div v-if="notLoggedIn">
      <div class="user-modal-container active" id="login-modal" >
          <div class="user-modal">
              <ul class="form-switcher">
                  <li v-on:click="flip('register', $event)"><a href="" id="register-form">Register</a>

                  </li>
                  <li v-on:click="flip('login', $event)"><a href="" id="login-form">Login</a>

                  </li>
              </ul>
              <div class="form-register" id="form-register">
                  <div class="error-message" v-text="registerError"></div>
                  <input type="email" name="email" placeholder="Email" v-model="email" v-on:keyup="submit('register', $event)">
                  <input type="password" name="password" placeholder="Password" v-model="registerPassword" v-on:keyup="submit('register', $event)">

                  <vue-recaptcha
                   style="margin:auto; margin-bottom:10px; float:left;width:304px;"
                   ref="recaptcha"
                   @verify="onVerify"
                   @expired="onExpired"
                   :sitekey="sitekey">
                  </vue-recaptcha>
                  <button style="float: left; min-height:75px; max-width:100px;" class="button rightfloat is-warning" @click="resetRecaptcha"> Reset </button>

                  <input type="submit" v-on:click="submit('register')" v-model="registerSubmit" id="registerSubmit">
                  <div class="links"> <a href="" v-on:click="flip('login', $event)">Already have an account?</a>
                  </div>
              </div>
              <div class="form-login active" id="form-login">
                  <div class="error-message" v-text="loginError"></div>
                  <input type="text" name="user" placeholder="Email" v-model="email" v-on:keypress="keyDownCheck($event)" v-on:keyup="submit('login', $event)">
                  <input type="password" name="password" placeholder="Password" v-model="loginPassword" v-on:keyup="submit('login', $event)">
                  <input type="submit" v-on:click="submit('login')" v-model="loginSubmit" id="loginSubmit">
                  <div class="links"> <a href="" v-on:click="flip('password', $event)">Forgot your password?</a>

                  </div>
              </div>
              <div class="form-password" id="form-password">
                  <div class="error-message" v-text="passwordError"></div>
                  <input type="text" name="email" placeholder="Email" v-model="email" v-on:keyup="submit('password', $event)">
                  <input type="submit" v-on:click="submit('password')" v-model="passwordSubmit" id="passwordSubmit">
              </div>
          </div>
      </div>
    </div>
    <div v-else style="height:100%">
      <!--
      <div :class="{ hidden: !show, isblog: inBlog }" class="container is-fluid is-marginless app-content">
      </div>
      -->
      <div :class="{ isblog: inBlog }" class="container is-fluid is-marginless app-content">
        <levelbar :show="false"></levelbar>
        <topbar :show="inBlog && topbar.show"></topbar>
        <transition
          mode="out-in"
          enter-active-class="fadeIn"
          leave-active-class="fadeOut"
          appear>
          <router-view class="animated"></router-view>
        </transition>
      </div>
    </div>

  </section>
</template>

<script>
import Levelbar from './Levelbar'
import Topbar from './Topbar'
import { mapGetters, mapActions } from 'vuex'
import VueRecaptcha from 'vue-recaptcha'

var modalSubmitRegister = 'Register'
var modalSubmitPassword = 'Reset Password'
var modalSubmitLogin = 'Login'

export default {
  components: {
    Levelbar,
    Topbar,
    VueRecaptcha
  },
  data () {
    return {
      active: 'login-form',
      // Submit button text
      registerSubmit: modalSubmitRegister,
      passwordSubmit: modalSubmitPassword,
      loginSubmit: modalSubmitLogin,
      // Modal text fields
      sitekey: '6LeXX0gUAAAAAEaJvYpRmJnpeYKxLUaqSnylMuFx',
      registerName: '',
      registerEmail: '',
      registerPassword: '',
      email: '',
      captchaVerify: '',
      loginUser: '',
      loginPassword: '',
      // Modal error messages
      registerError: '',
      loginError: '',
      passwordError: '',
      show: false
    }
  },
  computed: mapGetters({
    session: 'session',
    topbar: 'topbar'
  }),
  props: {
    notLoggedIn: Boolean,
    hasSidebar: Boolean,
    inBlog: Boolean
  },
  mounted: function () {
    if (this.session) {
    } else {
      this.flip('login', null)
    }
  },
  methods: {
    ...mapActions([
      'selectWebsite',
      'refreshUser'
    ]),
    onVerify: function (response) {
      this.captchaVerify = response
    },
    onExpired: function () {
    },
    resetRecaptcha () {
      this.$refs.recaptcha.reset() // Direct call reset method
    },
    close: function (e) {
      e.preventDefault()
      if (e.target === this.$el) {
        $('#login-modal').removeClass('active')
      }
    },
    flip: function (which, e) {
      if (e !== null) {
        e.preventDefault()
      }
      if (which !== this.active) {
        $('#form-' + this.active).removeClass('active')
        $('#form-' + which).addClass('active')
        $('#' + which + '-form').addClass('active')
        $('#' + this.active + '-form').removeClass('active')

        this.active = which
      }
    },
    keyDownCheck: function (e) {
      if (e.code === 'Space') {
        e.preventDefault()
      }
    },

    parseJwt: function (token) {
      var base64Url = token.split('.')[1]
      var base64 = base64Url.replace('-', '+').replace('_', '/')
      return JSON.parse(window.atob(base64))
    },

    submit: function (which, e) {
      if (!(e === null || e === undefined)) {
        if (e.code === 'Space') {
          e.preventDefault()
          return
        }
      }
      if ((!(e === null || e === undefined)) && e.code !== 'Enter') {
        // Validate email address and password?
      } else {
        if (!(e === null || e === undefined)) {
          e.preventDefault()
        }
        $('#' + which + 'Submit').addClass('disabled')
        var data = {
          form: which
        }

        switch (which) {
          case 'register':
            data.email = this.email
            data.verify = '' + this.captchaVerify

            /* eslint-disable */
            var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (!re.test(data.email)) {
              $('#' + which + 'Submit').removeClass('disabled')
              return this.$notify({
                  title: 'Invalid Parameter',
                  message: 'You must use a valid e-mail address.',
                  type: 'warning'
              })
            }

            data.password = this.registerPassword
            if (!data.password || (data.password+ '').length <= 5) {
              $('#' + which + 'Submit').removeClass('disabled')
              return this.$notify({
                  title: 'Invalid Parameter',
                  message: 'Password require at least 6 characters, numbers and at least one special character.',
                  type: 'warning'
              })
            }

            if (data.verify.length <= 10) {
              $('#' + which + 'Submit').removeClass('disabled')
              return this.$notify({
                  title: 'Invalid Parameter',
                  message: 'ReCaptcha must be validated first..',
                  type: 'warning'
              })
            }
            /* eslint-enable */

            this.registerSubmit = 'Registering account...' // modalSubmitRegister

            var regAuth = this.$Base64.encode(data.user + ':' + data.password)
            var regH = { 'Authorization': 'Basic ' + regAuth }

            // request it with headers an params
            this.$http.post(window.websiteapiUrl + '/customer/v1/websites/signup',
            data, {
              headers: regH
            })
            .then((response) => {
              if (!response || (response.data && response.data.status && response.data.status >= 400)) {
                throw new Error(response)
              }

              // construct session data
              var jsonTokenData = this.parseJwt(response.data.token)
              var expiration = jsonTokenData.exp
              // var iat = jsonTokenData.iat
              // var tokenId = jsonTokenData.id = id
              var tokenInfo = jsonTokenData.info

              var session = {
                'type': 'jwt',
                'accountId': tokenInfo.accountId || null,
                'display_name': tokenInfo.display_name || null,
                'meta': tokenInfo || null,
                'token': response.data.token,
                'policies': response.data['policies'],
                'renewable': true, // response.data['renewable'],
                'token_expiry': expiration, // response.data['ttl'] === 0 ? 'never' : new Date(Date.now() + response.data['ttl'] * 1000).toString(),
                'cookie_expiry': new Date(Date.now() + 8 * 3600 * 1000).toString() // 8 hours from now
              }

              // Temporary fix previous website selected...
              window.localStorage.removeItem('selectedWebsite')
              window.localStorage.removeItem('selectedProject')

              // store session data in localstorage
              // TODO: this is duplicated code with /login this is bad
              window.localStorage.setItem('session', JSON.stringify(session))
              this.$store.commit('setSession', session)
              this.$notify({
                title: 'Account created.',
                message: 'We are loading your account informations.',
                type: 'success'
              })

              var self = this
              this.refreshUser({ vue: this,
                callback: function () {
                  if (self.project && self.project.websites) {
                    // Only if no project is selected..
                    // window.vm.$store.state.app.isLoaded
                    if (!self.$store.state.app.isLoaded) {
                      self.$store.state.app.sidebarglobal.opened = true
                      self.$store.state.app.sidebarglobal.hidden = false
                    }
                  } else {
                    // NO PROJECT YET ??
                    self.$store.state.app.sidebarglobal.opened = false
                    self.$store.state.app.sidebarglobal.hidden = true
                  }
                }
              })
            })
            .catch((error) => {
              this.loginSubmit = modalSubmitLogin
              $('#' + which + 'Submit').removeClass('disabled')

              var msg = ''
              if (error.response && error.response.data) {
                msg = error.response.data.errorMessage
              }
              if (msg === '') {
                msg = 'An error has occured. Please reload your browser'
              }

              this.$notify({
                title: 'Account creation failed.',
                message: msg,
                type: 'danger'
              })
              this.$refs.recaptcha.reset() // Direct call reset method
            })

            break
          case 'login':
            data.user = this.email
            data.password = this.loginPassword

            /* eslint-disable */
            var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (!re.test(data.user)) {
              $('#' + which + 'Submit').removeClass('disabled')
              return this.$notify({
                  title: 'Invalid Parameter',
                  message: 'You must use a valid e-mail address!',
                  type: 'warning'
              })
            }

            if (!data.password || (data.password+ '').length <= 3) {
              $('#' + which + 'Submit').removeClass('disabled')
              return this.$notify({
                  title: 'Invalid Parameter',
                  message: 'Invalid password.',
                  type: 'warning'
              })
            }

            // this.$set('loginSubmit', 'Logging In...')
            this.loginSubmit = 'Logging In...' // modalSubmitLogin

            // account/v1/auth/anonymous/login

            var auth = this.$Base64.encode(data.user + ':' + data.password)
            var h = { 'Authorization': 'Basic ' + auth }

            // customer/v1/{project}/password/reset
            this.$http.post(window.websiteapiUrl + '/customer/v1/websites/login',
              {},
              {
                headers: h
              }
            )
            .then((response) => {
              // if (response.data.error !== '') {

              // construct session data
              var jsonTokenData = this.parseJwt(response.data.token)
              var expiration = jsonTokenData.exp
              // var iat = jsonTokenData.iat
              // var tokenId = jsonTokenData.id = id
              var tokenInfo = jsonTokenData.info

              var session = {
                'type': 'jwt',
                'accountId': tokenInfo.accountId || null,
                'display_name': tokenInfo.display_name || null,
                'meta': tokenInfo || null,
                'token': response.data.token,
                'policies': response.data['policies'],
                'renewable': true, // response.data['renewable'],
                'token_expiry': expiration, // response.data['ttl'] === 0 ? 'never' : new Date(Date.now() + response.data['ttl'] * 1000).toString(),
                'cookie_expiry': new Date(Date.now() + 8 * 3600 * 1000).toString() // 8 hours from now
              }

              // store session data in localstorage
              window.localStorage.setItem('session', JSON.stringify(session))
              this.$store.commit('setSession', session)

              this.$notify({
                title: 'Successfully logged in.',
                message: 'We are loading your account informations.',
                type: 'success'
              })

              var self = this
              this.refreshUser({ vue: this,
                callback: function () {
                  if (self.project && self.project.websites) {
                    // Only if no project is selected..
                    // window.vm.$store.state.app.isLoaded
                    if (!self.$store.state.app.isLoaded) {
                      self.$store.state.app.sidebarglobal.opened = true
                      self.$store.state.app.sidebarglobal.hidden = false
                    }
                  } else {
                    // NO PROJECT YET ??
                    self.$store.state.app.sidebarglobal.opened = false
                    self.$store.state.app.sidebarglobal.hidden = true
                  }
                }
              })
            })
            .catch((error) => {
              this.loginSubmit = modalSubmitLogin
              $('#' + which + 'Submit').removeClass('disabled')

              var msg = ''
              if (error.response && error.response.data) {
                msg = error.response.data.errorMessage
              }

              this.$notify({
                title: 'Login failed.',
                message: msg,
                type: 'danger'
              })

              // this.loginError = error.response.data.errorMessage
              // this.$onError(error)
            })

            break
          case 'password':
            data.email = this.passwordEmail || this.email
            data.password = ''
            this.passwordSubmit = 'Reseting password...' // modalSubmitPassword

            var forgotAuth = this.$Base64.encode(data.email + ':' + data.password)
            var forgotH = { 'Authorization': 'Basic ' + forgotAuth }

            this.$http.post(window.websiteapiUrl + '/customer/v1/websites/password/reset',
              {},
              {
                headers: forgotH
              }
            )
            .then((response) => {
              // if (response.data.error !== '') {
              this.$notify({
                title: 'Reset password',
                message: response.data.message,
                // 'We sent a reset link to your email address.',
                type: 'success'
              })

              this.passwordSubmit = 'E-Mail sent.' // modalSubmitPassword

              // }
            })
            .catch((error) => {
              this.passwordSubmit = modalSubmitPassword
              $('#' + which + 'Submit').removeClass('disabled')

              var msg = ''
              if (error.response && error.response.data) {
                msg = error.response.data.errorMessage
              }

              this.$notify({
                title: 'Rest password failed.',
                message: msg,
                type: 'danger'
              })

              // this.loginError = error.response.data.errorMessage
              // this.$onError(error)
            })

            break
        }
        // TODO: submit our `data` variable
      }
    }
  }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';
@import '~bulma/sass/utilities/mixins';

.hidden {
  display: none;
}

.app-main {
  padding-top: 50px;
  height: 100%;
  margin-left: 180px;
  transform: translate3d(0, 0, 0);

  @include mobile() {
    margin-left: 0;
  }

}

.app-content {
  padding: 20px;
  height: 100%;
  width: 100%;
}

.app-fixed {
  position: fixed !important;
}

.user-modal-container * {
    box-sizing: border-box;
}
.user-modal-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    visibility: hidden;
    cursor: pointer;
    overflow-y: auto;
    z-index: 3;
    font-family:'Lato', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif';
    font-size: 14px;
    background-color: rgba(17, 17, 17, .9);
    -webkit-transition: all 0.25s linear;
    -moz-transition: all 0.25s linear;
    -o-transition: all 0.25s linear;
    -ms-transition: all 0.25s linear;
    transition: all 0.25s linear;
}
.user-modal-container.active {
    opacity: 1;
    visibility: visible;
}
.user-modal-container .user-modal {
    position: relative;
    margin: 50px auto;
    width: 90%;
    max-width: 500px;
    background-color: #f6f6f6;
    cursor: initial;
}
.user-modal-container .form-login, .user-modal-container .form-register, .user-modal-container .form-password {
    padding: 75px 25px 25px;
    display: none;
}
.user-modal-container .form-login.active, .user-modal-container .form-register.active, .user-modal-container .form-password.active {
    display: block;
}
.user-modal-container ul.form-switcher {
    margin: 0;
    padding: 0;
}
.user-modal-container ul.form-switcher li {
    list-style: none;
    display: inline-block;
    width: 50%;
    float: left;
    margin: 0;
}
.user-modal-container ul.form-switcher li a {
    width: 100%;
    display: block;
    height: 50px;
    line-height: 50px;
    color: #666666;
    background-color: #dddddd;
    text-align: center;
}
.user-modal-container ul.form-switcher li a.active {
    color: #000000;
    background-color: #f6f6f6;
}

.nomargin {
  margin-left: 0px;
}

.user-modal-container input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #eeeeee;
}
.user-modal-container input[type="submit"] {
    color: #f6f6f6;
    border: 0;
    margin-bottom: 0;
    background-color: #3fb67b;
    cursor: pointer;
}
.user-modal-container input[type="submit"]:hover {
    background-color: #3aa771;
}
.user-modal-container input[type="submit"]:active {
    background-color: #379d6b;
}
.user-modal-container .links {
    text-align: center;
    padding-top: 25px;
}
.user-modal-container .links a {
    color: #3fb67b;
}
.user-modal-container input[type="submit"].disabled {
    background-color: #98d6b7;
}

.isblog {
  padding:0px;
  margin:0px;
}

</style>

<!--
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="/acentera/assets/lib/html5shiv.js"></script>
<script src="/acentera/assets/lib/respond.min.js"></script>
<script src="/acentera/assets/lib/jquery/js/jquery-1.10.2.js" type="text/javascript"></script>
<script src="/acentera/assets/lib/jquery/jquery-migrate-1.2.1.js" type="text/javascript"></script>
<link rel="stylesheet" media="screen" href="/acentera/assets/lib/bootstrap/css/bootstrap.css"/>
<link rel="stylesheet" media="screen" href="/acentera/assets/lib/bootstrap/css/bootstrap-switch.css"/>
<script src="/acentera/assets/javascripts/login.js" type="text/javascript"></script>
-->
