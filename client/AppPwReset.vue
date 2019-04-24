<template>
  <div id="app">
  <div class="tile is-ancestor box is-vertical">
    <div class="tile">
      <div v-if="noKey" class="tile">
        <h2>This link have either expird, or does not exists.</h2>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
      </div>
      <div v-else class="user-modal-container active">
        <div v-if="isSuccess" class="column is-6 margin-auto">
          <article class="tile is-child box">
            <div>
              <br/>
              <label>You have successfully updated your account password.</label><br/>
              <br/>
              <label>You will now be redirected to the login page.</label><br/>
            </div>
           </article>
        </div>
        <div v-if="!isSuccess" class="column is-6 margin-auto">
              <article class="tile is-child box">
                <div>
                  <label v-if='isError' class="message message-header is-critical">{{ error }}</label><br/>
                </div>
               <div>
                 <label class="label floatleft">Please enter a new Password</label><br/>
                 <br/>
                 <div class="field has-addons floatleft fullwidth">
                   <p class="control is-expanded">
                     <input class="fullwidth" type="password" v-model="newpwd"/>
                   </p>
                 </div>
               </div>

               <div>
                 <label class="label floatleft">Confirm the new Password</label><br/>
                 <br/>
                 <div class="field has-addons floatleft fullwidth">
                   <p class="control is-expanded">
                     <input class="fullwidth" type="password" v-model="newpwdconfirm"/>
                   </p>
                 </div>
               </div>

               <div class="box-right">
                 <div>
                     <div @click="submitnewpwd" class="button button-site is-primary float-right">
                         <span>Create new password</span>
                     </div>
                 </div>
               </div>
              </article>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  mounted () {
  },
  data () {
    return {
      error: '',
      newpwd: '',
      success: false,
      newpwdconfirm: ''
    }
  },
  computed: {
    noKey () {
      return false
    },
    isSuccess () {
      return (!(this.success === false))
    },
    isError () {
      return (!(this.error === ''))
    }
  },
  methods: {
    submitnewpwd () {
      console.error(this)
      if (!(this.newpwd === this.newpwdconfirm)) {
        this.error = 'passwords does not match'
        return false
      }
      this.success = false
      var self = this
      var forgotAuth = this.$Base64.encode(this.$route.params.id + ':' + this.newpwd)

      this.$http.post(window.websiteapiUrl + '/customer/v1/websites/password',
        {
          password: forgotAuth
        },
        {
        }
      )
      .then((response) => {
        this.success = true
        // if (response.data.error !== '') {
        this.$notify({
          title: 'Reset password',
          message: response.data.message,
          type: 'success'
        })

        setTimeout(function () {
          var idxHash = window.location.href.indexOf('#')
          var newLoc = window.location.href
          if (idxHash >= 1) {
            newLoc = newLoc.substring(0, idxHash)
            window.location.href = newLoc
          } else {
            // not history mode

            var idxHashReset = window.location.href.indexOf('password/reset/')
            var newLocReset = window.location.href
            if (idxHashReset >= 1) {
              newLocReset = newLocReset.substring(0, idxHashReset)
              window.location.href = newLocReset
            } else {
              // weird?
              this.$router.push({ path: '/' })
            }
          }
        }, 800)
      })
      .catch((error) => {
        console.error(error)
        console.error(error.stack)
        var msg = ''
        if (error.response && error.response.data) {
          msg = error.response.data.errorMessage
        }

        self.error = 'Reset password failed.'
        this.$notify({
          title: 'Reset password failed.',
          message: msg,
          type: 'danger'
        })
      })
    }
  },
  beforeMount () {
  }
}
</script>

<style scoped>
.margin-auto {
  margin:auto;
}
.is-critical {
  background-color: red;
}
</style>
