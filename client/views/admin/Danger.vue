<template>

    <div>
      <div class="tile is-ancestor">
      <div class="tile is-parent">
      <article class="tile is-child box">

      <div v-if="domainCount === 0">
        <b>Warning</b> do you really want to delete your website ?
        <br/>
        <br/>
        Enter this confirmation id <b>{{getWebsiteId}}</b>
        <br/>
        <br/>
        <input type="text" v-model="confirmationWebsiteId" id="confirmationWebsiteId">
        <br/>
        <br/>
        <button v-if="!processing" type="submit" class="button is-danger" v-on:click="deleteSite" id="deleteSiteSubmit">Delete My Site</button>
        <button v-else="processing" type="submit" class="button" id="deleteSiteSubmitWait">Deleting...</button>
      </div>
      <div v-else>
        To delete your site, first delete all of your associated domains from the domain section. <br/>
      </div>
    </article>
    </div>
    </div>
  </div>

</template>


<script>
import { mapGetters } from 'vuex'

export default {
  components: {
  },

  data () {
    return {
      showModal: false,
      response: false,
      processing: false,
      confirmationWebsiteId: ''
    }
  },

  mounted: function () {
    this.confirmationWebsiteId = ''
  },

  computed: {
    ...mapGetters({
      getBasicAuth: 'getBasicAuth',
      selectedWebsite: 'selectedWebsite'
    }),
    txt: function () {
      return 'v=' + this.$store.state.app.account
    },
    domainCount () {
      if (this.selectedWebsite && this.selectedWebsite.domains) {
        var keys = Object.keys(this.selectedWebsite.domains)
        return keys.length
      }
      return 0
    },
    getDomains () {
      if (this.selectedWebsite) {
        return this.selectedWebsite.domains
      } else {
        return null
      }
    },
    getWebsiteId () {
      if (this.selectedWebsite) {
        return this.selectedWebsite.websiteId
      } else {
        // dev only
        return 'ThisIsForTestingPurposes'
      }
    },
    getProjectId () {
      if (this.$store.state.app.project) {
        return this.$store.state.app.project.projectId
      }
      return '111DevTest'
    }
  },

  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },

  methods: {
    deleteSite () {
      var self = this
      if (this.confirmationWebsiteId === this.getWebsiteId) {
        if (!this.processing) {
          var projectId = this.getProjectId

          var gitUrl = null
          if (self.$store.state.app && self.$store.state.app.repoState) {
            gitUrl = self.$store.state.app.repoState.url
          }

          var deleteSite = {
            'projectId': projectId,
            'websiteId': this.getWebsiteId,
            'git': gitUrl,
            'txt': self.txt.replace('v=', '')
          }

          this.processing = true
          var deleteSiteRepoCall = window.websiteapiUrl + '/sites/v1/websites/' + projectId + '/' + this.getWebsiteId + '/delete'
          var h = { 'authorization': 'Bearer ' + self.$store.state.session.token }
          self.$http.post(deleteSiteRepoCall, deleteSite, {
            headers: h
          }).then((response) => {
            if (response && response.data && response.data.type) {
              if (!(response.data.type.startsWith('error'))) {
                self.$notify({
                  title: 'Website deleted.',
                  message: 'We successfully deleted your website from our hosting. We thank you for using it.',
                  type: 'success'
                })

                setTimeout(function () {
                  self.processing = false
                  delete window.vm.$store.getters.app.project.websites[deleteSite.websiteId]
                  self.$store.commit('SELECT_WEBSITE', {projectId: projectId, websiteId: null})
                }, 5000)
              } else {
                self.processing = false
                self.$notify({
                  title: 'Could delete website.',
                  message: 'We were unable to delete your website. Contact support! ',
                  type: 'danger'
                })
              }
            } else if (response && response.data && response.data.typeid) {
              if (!(response.data.typeid.startsWith('error'))) {
                self.$notify({
                  title: 'Website deleted.',
                  message: 'We successfully deleted your website from our hosting. We thank you for using it.',
                  type: 'success'
                })

                setTimeout(function () {
                  self.processing = false
                  delete window.vm.$store.getters.app.project.websites[deleteSite.websiteId]
                  self.$store.commit('SELECT_WEBSITE', {projectId: projectId, websiteId: null})
                }, 5000)
              } else {
                self.processing = false
                self.$notify({
                  title: 'Could delete website.',
                  message: 'We were unable to delete your website. Contact support! ',
                  type: 'danger'
                })
              }
            } else {
              self.processing = false
              self.$notify({
                title: 'Could delete website.',
                message: 'We were unable to delete your website. Contact support! ',
                type: 'danger'
              })
            }
          }, function (errr) {
            self.processing = false
            self.$notify({
              title: 'Could delete website.',
              message: 'We were unable to delete your website. Contact support! ',
              type: 'danger'
            })
          })
        }
      } else {
        this.$notify({
          title: 'Invalid value',
          message: 'The confirmation value does not match.',
          type: 'danger'
        })
      }
    },
    openModalBasic (index) {
      this.response = false
      this.showModal = true
    },
    closeModalBasic () {
      this.showModal = false
    }
  }

}
</script>

<style scoped>
  .button {
    margin: 5px 0 0;
  }

  .control .button {
    margin: inherit;
  }

  .fa-trash-o {
    color: red;
  }

  .fa-info {
    color: lightskyblue;
  }

  .left {
    float:left;
  }
</style>
