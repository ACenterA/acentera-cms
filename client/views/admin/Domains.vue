<template>
    <div v-if="loaded">
      <div v-if="isWebsite">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <article class="tile is-child box minh">
              <div v-if="selectedWebsite && (!acenteraType || acenteraType && acenteraTypeStageConfigured)">

                <article class="tile is-child box scrollable floatleft marginpad fullw" v-if="(acenteraType && acenteraTypeStageConfigured)">

                  <div>
                    <label class="label floatleft">Select a stage</label><br/>
                    <div class="control has-icons-right">
                      <span class="select">
                        <select v-model="selectedStage">
                          <option v-for="(stage, index) in stages" :value='stage.stageId'>
                            {{stage.title}}
                          </option>
                        </select>
                      </span>
                    </div>
                  </div>
                </article>
                <div v-if="((!acenteraType) || (acenteraType && acenteraTypeStageConfigured && selectedStage)) && (!selectedWebsite.domains || domainCount === 0 || addNewDomain)">

                  <br/>
                  Enter the domain name that you already manage.
                  <br/>
                  <br/>
                  <label class="label">Enter your domain name below</label>
                  <i>Note: You need to use add a subdomain to website.</i>
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

                  <div v-if="(acenteraType && acenteraTypeStageConfigured && !selectedStage)">

                  </div>
                  <div v-else>
                    Here are your domains associated to this website.
                    <br/>
                    <br/>
                    <div class="button leftfloat is-primary float-right"
                      @click="addNewDomainClick()">
                      Add domain...
                    </div>

                    <br/>
                    <br/>
                    <br/>
                    <div v-for="(item, index) in selectedWebsite.domains">
                        <div v-if="(!selectedStage || selectedStage && item.stageId === selectedStage)">
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
                </div>
              </div>
              <div v-else>

                <div v-if="selectedWebsite && !acenteraType">
                  No website selected.
                </div>
                <div v-if="! (selectedWebsite && !acenteraType)">
                  No stages configured.
                </div>

              </div>
            </article>
          </div>
        </div>

      </div>

      <div v-if="!isWebsite">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <article class="tile is-child box">
              Only available using the ACenterA hosted version.
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
      selectedStage: null,
      confirmModalTitle: '',
      txterror: null,
      cnameerror: null,
      confirmCnameModalTitle: '',
      newDomainName: null
    }
  },

  mounted: function () {
    console.error('in here mounted?')
    /*
    var self = this
    // TODO: Fetch from github, if fail get local file?
    this.$http.get(window.currentUrl + '/assets/themes.json').then((response) => {
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
    stages () {
      console.error('in here get stages?')
      var stageArr = []
      if (this.acenteraTypeStageConfigured) {
        var keys = Object.keys(this.selectedWebsite.stages)
        var l = keys.length
        for (var k = 0; k < l; k++) {
          var stageObj = JSON.parse(JSON.stringify(this.selectedWebsite.stages[keys[k]]))
          stageObj['stageId'] = keys[k]
          stageArr.push(stageObj)
        }
      }
      return stageArr
    },
    txt: function () {
      return 'v=' + this.$store.state.app.account
    },
    acenteraTypeStageConfigured () {
      if (this.selectedWebsite && this.selectedWebsite.acentera_type && (!(('' + this.selectedWebsite.acentera_type).toLowerCase().indexOf('hugo') >= 0)) && this.selectedWebsite.stages) {
        var keys = Object.keys(this.selectedWebsite.stages)
        return (keys.length >= 1)
      }
      return false
    },
    acenteraType () {
      return (this.selectedWebsite && this.selectedWebsite.acentera_type && (!(this.selectedWebsite.acentera_type.toLowerCase().indexOf('hugo') >= 0)))
    },
    invalidDomainName () {
      if (!this.newDomainName) {
        return true
      }
      if (/^[a-zA-Z0-9-][a-zA-Z0-9-]{1,61}[a-zA-Z0-9-](?:\.[a-zA-Z0-9-]{2,})+$/.test(this.newDomainName)) {
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
        this.showConfirmCnameModal = false
        this.showConfirmModal = true
        console.error(error)
      })
    },
    validateCnameOrCreate () {
      var self = this
      this.validateCnameDomain().then(function (data) {
        // OK TXT has been validated, he own the DNS domain.
        // OK IT HAS BEEN CREATED
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
        try {
          if (error && error.type && error.type === 'missing_cname') {
            self.showConfirmCnameModal = true
            self.showConfirmModal = false
          } else if (error && error.type && error.type === 'record_not_found') {
            self.showConfirmCnameModal = true
            self.showConfirmModal = false
          } else if (error && error.type && error.type === 'invalid_txt') {
            self.showConfirmModal = true
            self.showConfirmCnameModal = false
          } else {
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
        primary: primary,
        stageId: self.selectedStage
      },
        {
          headers: h
        }
      ).then((response) => {
        if (response && response.data && (response.data.websiteId === self.selectedWebsite.websiteId)) {
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
        self.validateText = 'Validate & Create'
        self.updating = false
        self.$notify({
          title: 'Custom Domain!',
          message: 'An error has occured, please try again or contact us.',
          type: 'danger'
        })
        console.error(error)
      })
    },
    proceedDomainDelete (primary) {
      var self = this
      self.cnameerror = null
      self.showConfirmCreatingModal = true
      var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
      // request it with headers an param
      self.$http.post(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/delete/' + self.newDomainName, {
        primary: primary,
        stageId: self.selectedStage
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
        console.error('a1 - selected website test')
        console.error(self.selectedWebsite)
        self.$http.get(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/cname/' + self.newDomainName,
          {
            headers: h
          }
        ).then((response) => {
          if (!response.data) {
            reject(new Error('No response?'))
          }
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
        self.$http.get(window.websiteapiUrl + '/sites/v1/dns/domain/validate/' + self.newDomainName + '/' + self.txt.replace('v=', ''),
          {
            headers: h
          }
        ).then((response) => {
          if (!response.data) {
            reject(new Error('No response?'))
          }
          if ((response.data.success === true)) {
            return resolve(response.data)
          }
          if (response.data.type) {
            return reject(new Error(response.data.type))
          }
          if (response.data.message) {
            self.txterror = 'Found mistmatched value of ' + response.data.message
            return reject(self.txterror)
          } else {
            self.txterror = 'No entries found. Please wait few minutes.'
            return reject(self.txterror)
          }
          // return reject(new Error('invalid_response'))
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
        if (error && error.message) {
          self.txterror = error.message
        }
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
