<template>

    <div v-if="loaded">
      <div v-if="isWebsite">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <article class="tile is-child box minh">
              <div v-if="selectedWebsite">
                <div v-if="!selectedWebsite.domains || domainCount === 0 || addNewDomain">
                  Want to use your own domain name ? <br/>
                  It is free, as long as you have already registered it.<br/>

                  <br/>
                  Enter the domain name you want to register
                  <br/>
                  <br/>
                  <label class="label">Enter your domain name below</label>
                  <i>Note: you need to use a subdomain such as 'www', otherwise contact us.</i>
                  <div class="field has-addons">
                    <p class="control is-expanded">
                      <input class="input" type="text" placeholder="www.mydomainname.com"
                             v-model="newDomainName"/>
                    </p>
                  </div>

                  <a class="button leftfloat is-primary"
                    @click="createDomain()" :disabled="invalidDomainName || updating">
                    <span>{{ validateText }}</span>
                  </a>


                  <a v-if="domainCount >= 1" class="button leftfloat is-primary"
                    @click="cancelAddNew">
                    <span>Cancel</span>
                  </a>
                </div>
                <div v-else style="max-width: 800px">
                  Here are your domains associated to this website.
                  <br/>
                  <br/>
                  <div class="button leftfloat is-primary float-right"
                    @click="addNewDomainClick()">
                    Add New domain...
                  </div>

                  <br/>
                  <br/>
                  <br/>
                  <div v-for="(item, index) in selectedWebsite.domains">
                      <label class="label float-left">{{ index }}</label>

                      <div v-if="item.primary" class="button is-success float-right minw">
                        Primary
                      </div>

                      <div v-if="!item.primary" class="button is-danger float-right minw"
                        @click="setPrimary(index)">
                        Set Primary
                      </div>

                      <div class="button leftfloat is-primary margin-right float-right minw"
                        @click="delDomain(index)">
                        Delete
                      </div>
                     <br/>
                     <br/>
                     <br/>
                  </div>
                </div>
              </div>
              <div v-else>
                No website selected.
              </div>
            </article>
          </div>
        </div>

      </div>

      <div v-if="!isWebsite">

        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <article class="tile is-child box">
              Only available if you are using the website panel.
            </article>
          </div>
        </div>

      </div>
      <confirmTxtModal :visible="showConfirmModal" :title="confirmModalTitle" :domain="domain" :info="txt" :error="txterror" @close="closeModal" @confirmed="confirmedModal()"></confirmTxtModal>
      <confirmCnameModal :visible="showConfirmCnameModal" :title="confirmCnameModalTitle" :fullDomain="newDomainName" :domain="domain" :error="cnameerror" :info="txt" @close="closeConfirmCnameModal" @confirmed="confirmedCnameModal()"></confirmCnameModal>
      <confirmDomainOverrideModal :visible="showConfirmCnameWebsiteOverride" :domain="newDomainName" @close="closeConfirmOverrideModal" @confirmed="confirmedOverrideModal()"></confirmDomainOverrideModal>
      <confirmCreatingModal :visible="showConfirmCreatingModal" :domain="newDomainName" @close="closeConfirmCreatingModal" @confirmed="confirmedCreatingModal()"></confirmCreatingModal>
      <confirmDomainActiveChangeModal :visible="showActiveWarning" :domain="newDomainName" @close="closeConfirmActiveModal" @confirmed="confirmedActiveModal()"></confirmDomainActiveChangeModal>
      <confirmDomainDeleteModal :visible="showDeleteWarning" :domain="newDomainName" @close="closeConfirmDeleteModal" @confirmed="confirmedDeleteModal()"></confirmDomainDeleteModal>

    </div>
</template>


<script>
import { mapGetters } from 'vuex'
import ConfirmTxtModal from './modals/ConfirmTxtModal'
import ConfirmCnameModal from './modals/ConfirmCnameModal'
import ConfirmDomainOverrideModal from './modals/ConfirmDomainOverrideModal'
import ConfirmCreatingModal from './modals/ConfirmCreatingModal'
import ConfirmDomainActiveChangeModal from './modals/ConfirmDomainActiveChangeModal'
import ConfirmDomainDeleteModal from './modals/ConfirmDomainDeleteModal'

export default {

  components: {
    ConfirmTxtModal,
    ConfirmCnameModal,
    ConfirmDomainOverrideModal,
    ConfirmCreatingModal,
    ConfirmDomainActiveChangeModal,
    ConfirmDomainDeleteModal
  },
  data () {
    return {
      showConfirmModal: false,
      showConfirmCnameModal: false,
      addNewDomain: false,
      showConfirmCnameWebsiteOverride: false,
      updating: false,
      showActiveWarning: false,
      showDeleteWarning: false,
      showConfirmCreatingModal: false,
      validateText: 'Validate & Create',
      confirmModalTitle: '',
      txterror: null,
      cnameerror: null,
      confirmCnameModalTitle: '',
      newDomainName: null
    }
  },

  mounted: function () {
    /*
    var self = this
    // TODO: Fetch from github, if fail get local file?
    this.$http.get('/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      self.themes = response.data
      this.switchTab(0)
    }).catch((error) => {
      this.$onError(error)
    })
    */
  },

  computed: {
    ...mapGetters({
      getBasicAuth: 'getBasicAuth',
      isWebsite: 'isWebsite',
      selectedWebsite: 'selectedWebsite',
      loaded: 'loaded'
    }),
    txt: function () {
      return 'v=' + this.$store.state.app.account
    },
    invalidDomainName () {
      if (!this.newDomainName) {
        return true
      }
      if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(this.newDomainName)) {
        // valid domain name.
        return false
      }
      return true
    },
    domain () {
      if (this.invalidDomainName) {
        return null
      }
      var domainInfoArr = this.newDomainName.split('.')
      var ext = domainInfoArr.pop('.')
      var domain = domainInfoArr.pop('.')
      // var subdomainInfo = domainInfoArr
      return domain + '.' + ext
    },
    domainCount () {
      if (this.selectedWebsite && this.selectedWebsite.domains) {
        var keys = Object.keys(this.selectedWebsite.domains)
        return keys.length
      }
      return 0
    }
  },
  methods: {
    delDomain (domain) {
      this.newDomainName = domain
      this.showDeleteWarning = true
    },
    closeConfirmDeleteModal () {
      this.showDeleteWarning = false
      this.newDomainName = null
    },
    confirmedDeleteModal () {
      this.showActiveWarning = false
      this.proceedDomainDelete(false)
    },
    setPrimary (domain) {
      this.showActiveWarning = true
      this.newDomainName = domain
    },
    closeConfirmActiveModal () {
      this.showActiveWarning = false
      this.newDomainName = null
    },
    confirmedActiveModal () {
      this.showActiveWarning = false
      this.proceedDomainAssociation(true)
    },
    addNewDomainClick () {
      this.addNewDomain = true
    },
    cancelAddNew () {
      this.addNewDomain = false
    },
    createDomain () {
      if (this.invalidDomainName) {
        return
      }
      var self = this
      this.validateText = 'Processing...'
      this.updating = true
      this.validateDomain().then(function (data) {
        // OK TXT has been validated, he own the DNS domain.
        self.validateCnameOrCreate()
      }).catch((error) => {
        console.error('got error')
        console.error(error)
        this.showConfirmCnameModal = false
        this.showConfirmModal = true
      })
    },
    validateCnameOrCreate () {
      var self = this
      this.validateCnameDomain().then(function (data) {
        // OK TXT has been validated, he own the DNS domain.
        // OK IT HAS BEEN CREATED
        console.error('validate cname domain is resp')
        console.error(data)
        if (data.type && data.type === 'missing_cname') {
          self.showConfirmCnameModal = true
          self.showConfirmModal = false
        } else if (data.type && data.type === 'record_not_found') {
          self.showConfirmCnameModal = true
          self.showConfirmModal = false
        } else if (data.type && data.type === 'invalid_txt') {
          self.showConfirmModal = true
          self.showConfirmCnameModal = false
        } else if (data.type && data.type === 'different_website') {
          // Ask confirmation for it...
          self.showConfirmCnameWebsiteOverride = true
        } else {
          self.proceedDomainAssociation()
        }
      }).catch((error) => {
        // TODO: ????
        console.error(error)
        try {
          if (error && error.type && error.type === 'missing_cname') {
            console.error('A1')
            self.showConfirmCnameModal = true
            self.showConfirmModal = false
          } else if (error && error.type && error.type === 'record_not_found') {
            console.error('A2')
            self.showConfirmCnameModal = true
            self.showConfirmModal = false
          } else if (error && error.type && error.type === 'invalid_txt') {
            console.error('A3')
            self.showConfirmModal = true
            self.showConfirmCnameModal = false
          } else {
            console.error('A4')
            console.error(self)
            self.showConfirmCnameModal = true
            self.showConfirmModal = false
          }
        } catch (ex) {
          console.error(ex.stack)
          self.showConfirmCnameModal = true
          self.showConfirmModal = false
        }
      })
    },
    proceedDomainAssociation (primary) {
      var self = this
      self.cnameerror = null
      self.showConfirmCreatingModal = true
      var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
      // request it with headers an param
      self.$http.post(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/create/' + self.newDomainName, {
        primary: primary
      },
        {
          headers: h
        }
      ).then((response) => {
        if (response && response.data && (response.data.websiteId === self.selectedWebsite.websiteId)) {
          console.error('GOOD WEBSITE')
          console.error(response.data)
          if (!self.selectedWebsite.domains) {
            self.selectedWebsite.domains = {}
          }
          if (self.selectedWebsite.domains) {
            self.selectedWebsite.domains[response.data.domain] = {
              enabled: response.data.enabled
            }
          }
          self.addNewDomain = false

          self.validateText = 'Validate & Create'
          self.updating = false
          self.newDomainName = null

          // force a refresh for the domainCount fix ...
          this.$store.commit('SELECT_WEBSITE', {projectId: self.selectedWebsite.projectId, websiteId: self.selectedWebsite.websiteId})

          self.$notify({
            title: 'Custom Domain!',
            message: 'Congratulations, your website is ready.',
            type: 'success'
          })
          self.showConfirmCreatingModal = false
        } else {
          // self.validateCnameOrCreate()
          self.validateText = 'Validate & Create'
          self.updating = false
          self.$notify({
            title: 'Custom Domain!',
            message: 'An error has occured, please try again or contact us.',
            type: 'danger'
          })
          self.showConfirmCreatingModal = false
        }
      }).catch((error) => {
        console.error(error)
        self.validateText = 'Validate & Create'
        self.updating = false
        self.$notify({
          title: 'Custom Domain!',
          message: 'An error has occured, please try again or contact us.',
          type: 'danger'
        })
      })
    },
    proceedDomainDelete (primary) {
      var self = this
      self.cnameerror = null
      self.showConfirmCreatingModal = true
      var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
      // request it with headers an param
      self.$http.post(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/delete/' + self.newDomainName, {
        primary: primary
      },
        {
          headers: h
        }
      ).then((response) => {
        if (response && response.data && (response.data.websiteId === self.selectedWebsite.websiteId)) {
          if (self.selectedWebsite.domains) {
            delete self.selectedWebsite.domains[response.data.domain]
          }
          self.addNewDomain = false

          self.validateText = 'Validate & Create'
          self.updating = false
          self.newDomainName = null

          // force a refresh for the domainCount fix ...
          this.$store.commit('SELECT_WEBSITE', {projectId: self.selectedWebsite.projectId, websiteId: self.selectedWebsite.websiteId})

          self.$notify({
            title: 'Custom Domain!',
            message: 'The SSL configuration has successfully been deleted.',
            type: 'success'
          })
          self.showDeleteWarning = false
          self.showConfirmCreatingModal = false
        } else {
          // self.validateCnameOrCreate()
          self.validateText = 'Validate & Create'
          self.updating = false
          self.$notify({
            title: 'Custom Domain!',
            message: 'An error has occured, please try again or contact us.',
            type: 'danger'
          })
        }
      }).catch((error) => {
        console.error(error)
        self.validateText = 'Validate & Create'
        self.updating = false
        self.$notify({
          title: 'Custom Domain!',
          message: 'An error has occured, please try again or contact us.',
          type: 'danger'
        })
      })
    },
    validateCnameDomain () {
      var self = this
      self.cnameerror = null
      return new Promise(function (resolve, reject) {
        var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
        // request it with headers an param
        console.error('validate CNAME')
        self.$http.get(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/cname/' + self.newDomainName,
          {
            headers: h
          }
        ).then((response) => {
          console.error('received of')

          if (!response.data) {
            reject(new Error('No response?'))
          }
          console.error('got type:' + response.data.type)
          if ((response.data.success === true)) {
            return resolve(response.data)
          }

          return reject(response.data)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    validateDomain () {
      var self = this
      self.txterror = null
      return new Promise(function (resolve, reject) {
        var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
        // request it with headers an param
        console.error('validate TXT')
        self.$http.get(window.websiteapiUrl + '/sites/v1/dns/domain/validate/' + self.newDomainName + '/' + self.txt.replace('v=', ''),
          {
            headers: h
          }
        ).then((response) => {
          console.error('received of')
          if (!response.data) {
            reject(new Error('No response?'))
          }
          if ((response.data.success === true)) {
            return resolve(response.data)
          }
          console.error('ta : ' + response.data.success)
          console.error('1 ta : ' + (response.data.success === true))
          if (response.data.type) {
            return reject(new Error(response.data.type))
          }
          if (response.data.message) {
            self.txterror = 'Found mistmatched value of ' + response.data.message
          } else {
            self.txterror = 'No entries found. Please wait few minutes.'
          }
          return reject(new Error('invalid_response'))
        }).catch((error) => {
          reject(error)
        })
      })
    },
    confirmedCnameModal () {
      this.showConfirmCnameModal = false
      var self = this
      setTimeout(function () {
        self.validateCnameOrCreate()
      }, 1000)
    },
    closeModal () {
      this.showConfirmModal = false
      this.validateText = 'Validate & Create'
      this.updating = false
    },
    createCnameDomain () {
      this.showConfirmModal = false
      this.showConfirmCnameModal = true
    },
    closeCnameModal () {
      this.showConfirmCnameModal = false
      this.validateText = 'Validate & Create'
      this.updating = false
    },
    confirmedModal () {
      var self = this
      this.validateDomain().then(function (data) {
        // all good
        self.createCnameDomain()
      }).catch((error) => {
        console.error('got error')
        console.error(error)
        self.showConfirmCnameModal = false
        self.showConfirmModal = true
      })
    },
    closeConfirmCreatingModal () {
      this.showConfirmCreatingModal = false
    },
    closeConfirmOverrideModal () {
      this.showConfirmCnameWebsiteOverride = false
      this.validateText = 'Validate & Create'
      this.updating = false
    },
    confirmedCreatingModal () {
      this.showConfirmCreatingModal = false
    },
    confirmedOverrideModal () {
      // OK Proceed wit hthe change
      this.showConfirmCnameWebsiteOverride = false
      this.proceedDomainAssociation()
    },
    closeConfirmCnameModal () {
      this.showConfirmCnameModal = false
      this.validateText = 'Validate & Create'
      this.updating = false
    }
  }
}
</script>

<style scoped>
  .is-success {
    cursor: none;
  }
  .minh {
    min-height: 500px;
  }
  .float-left {
    float: left;
  }
  .float-right {
    float: right;
  }
  .minw {
    min-width: 110px;
  }
  .margin-right {
    margin-right: 70px;
  }

</style>
