<template>
  <!-- Home -->
  <div class="content has-text-centered">
    <div v-if="!isLoaded">
    </div>

    <div v-if="isLoaded">
        <div v-if="isWebsite">
          <!-- For Each Websites -->
          <div v-if="project && project.websites">
              <div v-if="selectedWebsite">

                <article class="tile is-child box scrollable floatleft fullw">
                    <h1 class="is-title is-bold">{{ pkg.name.replace('-', ' ').replace('CMS', ' CMS') }}</h1>

                    <p>
                      <strong>{{ pkg.description }} </strong>
                    </p>

                    <br/>
                    <h4 class="is-title">Selected website: <br/>{{selectedWebsite.title}}</h4>

                    <div v-if="isRepoUpdating()">
                      <p>Please wait, we are trying to gather latest updates on your website...</p>
                    </div>

                    <div v-if="isRepoUpdated() && !acenteraType">
                      <p>Start designing and adding content to your website by using the left toolbar in the design section.</p>
                      <p>Add blog content using the Blog menu item.</p>
                    </div>

                    <div v-if="isRepoMissing()">
                      <p>There is an error with your repository configuration. We could not sync from it</p>
                    </div>

                    <br/>

                    <div v-if="repoUrl">
                      <br/>
                      Your current Repository Informations: <br/><br/>
                      <div v-if="repoUrl !== 'hidden'">Repository: {{ repoUrl }}<br/></div>
                      Branch: {{ repoState.Branch }}
                      <br/>
                    </div>

                    <br/>
                </article>



                <article class="tile is-child box scrollable floatleft marginpad fullw" v-if="(selectedWebsite && acenteraType) && ((acenteraTypeStageConfigured && addNewStage) || !acenteraTypeStageConfigured)">
                  <br/>
                  <h3>Create your first Deployment Stage</h3>
                  <br/>
                  <br/>
                  <label class="label">Enter name of this stage.</label>
                  <div class="field has-addons">
                    <p class="control is-expanded">
                      <input class="input" type="text" placeholder="Ex: develop"
                             v-model="newStageName"/>
                    </p>
                  </div>

                  <a class="button leftfloat is-primary"
                    @click="createStageByName()" :disabled="invalidStageName || updating">
                    <span>{{ validateText }}</span>
                  </a>

                  <a class="button leftfloat is-primary"
                    @click="cancelAddNewStage">
                    <span>Cancel</span>
                  </a>
                </article>


                <article class="tile is-child box scrollable floatleft marginpad fullw" v-if="selectedWebsite && acenteraType && acenteraTypeStageConfigured && !addNewStage">
                  <h3 class="is-title is-bold">Great you have stages configured.</h3>
                  <div>

                    <table>
                      <tr>
                        <th>Stage Id</th>
                        <th>Stage Name</th>
                      </tr>
                    <tr v-for="(item, index) in selectedWebsite.stages">
                        <td>
                          <label class="label float-left">{{ index }}</label>
                        </td>
                        <td>
                          {{ item.title }}

                          <div class="button leftfloat is-primary margin-right float-right minw hidden"
                            @click="delStage(index)">
                            Delete
                          </div>
                         </td>
                    </tr>
                    </table>

                    <br/>
                    <div class="field has-addons floatleft fullwidth">
                      <p class="control is-expanded">
                        <div class="button leftfloat is-primary float-right"
                          @click="addNewStageClick()">
                          Add Stage
                        </div>
                    </div>
                  </div>

                </article>

                <article class="tile is-child box scrollable floatleft marginpad fullw" v-if="(!this.acenteraType)">

                    <h3 class="is-title is-bold">Website Informations</h3>

                    <div>
                      <label class="label floatleft">Website Live Url</label><br/>
                      <br/>
                      <div class="field has-addons floatleft fullwidth">
                        <p class="control is-expanded">
                          <input class="fullwidth" type="text" v-model="websitePublicUrl" readonly/>
                        </p>
                      </div>
                    </div>
                    <br/>&nbsp;<br/>
                    <div class="button button-site is-primary is-outlined nav-item" @click="gotoWebsite()">
                      View Website
                    </div>
                    <br/>
                    <br/>
                </article>
                <article class="tile is-child box scrollable floatleft marginpad fullw" v-if="(!this.acenteraType)">
                    <h3 class="is-title is-bold">Share your preview</h3>

                    <div>
                      <label class="label floatleft">Website Preview Url</label><br/>
                      <br/>
                      <div class="field has-addons floatleft fullwidth">
                        <p class="control is-expanded">
                          <input class="fullwidth" type="text" v-model="websiteUrl" readonly/>
                        </p>
                      </div>
                    </div>
                    <br/>
                    <br/>
                    <div>
                      <label class="label floatleft">Code</label><br/>
                      <br/>
                      <div class="field has-addons floatleft fullwidth">
                        <p class="control is-expanded">
                          <input class="fullwidth" type="text" v-model="selectedWebsite.code" readonly/>
                        </p>
                      </div>
                    </div>
                    <br/>
                    <br/>
                    <i>Since you are logged in, you will not be asked the preview code</i>
                    <br/><br/>
                    <div class="button button-site is-primary is-outlined nav-item" @click="gotoPreviewWebsite()">
                      View Website Preview
                    </div>
                </article>

              </div>


              <div v-else="selectedWebsite">
                <div class="box box-template" v-for="item in project.websites"  style="min-height:300px; height:auto;">
                  <div class="template-thumbnails">
                      {{ item.title }}
                      <div class=""
                            style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                            <!-- <img v-if="item.Repository" :src="item.Repository + 'raw/master/images/screenshot.png'" class="mw-100"> -->
                            <img :src="'https://github.com/jweslley/hugo-conference/' + item.websiteId + '/thumbnails.png'" class="mw-100">
                      </div>
                      <div class="width-full">
                        <div class="float-right width-50 small-leftmargin">
                            <!--
                            <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile" @click="preview(item)">
                              Preview
                            </div>
                            -->
                        </div>
                        <div class="float-right width-50 small-leftmargin">
                            <div class="button button-site is-primary is-outlined nav-item" @click="selectWebsite(item)">
                              Select
                            </div>
                        </div>
                      </div>
                  </div>
                </div>


                <br/>
                <div class="box box-template" style="min-height:300px; height:auto;">
                  <div class="template-thumbnails">
                      Add a Website
                      <div class="" style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                        <img class="mw-100"/>
                        Do not hesitate.  Start building a <br/> new website at no extra cost.
                      </div>
                      <div class="width-full">
                        <div class="float-right width-50 small-leftmargin">
                          <router-link :to="{name: 'Templates'}">
                            <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile">
                                <span>Create your website</span>
                            </div>
                          </router-link>
                        </div>
                      </div>
                  </div>
                </div>

                <div v-if="isExperimental || getAccountId === '7314d742747523cd6d244a0e880270d3' || getAccountId == '87c6f1725ae57ad36cc53a3fcba2b06b' || getAccountId === '54f34540e409d9c4975daaf368a5276a' || getAccountId ==='cf3e0bf6c4d9213ab0da086858d78151'" class="box box-template" style="min-height:300px; height:auto;">
                  <div class="template-thumbnails">

                      Add new Docker site
                      <div class="" style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                        <img class="mw-100"/>
                        &nbsp;<br/>&nbsp;
                      </div>
                      <div class="width-full">
                        <div class="float-right width-50 small-leftmargin">
                            <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile" @click="loginGitBit(item)">
                                <span>Create another docker website</span>
                            </div>
                        </div>
                      </div>
                  </div>
                </div>

              </div>

          </div>

          <!-- No website yet... -->
          <section v-if="! ( project && project.websites )">
            <div class="">
              <nav class="box box-main">
                <div class="box-center-main">
                  <div>

                      <div class="center-text">
                          <h4 class="site-title">Welcome</h4>

                          <br/>
                          <br/>
                          It happears that you have not yet created your first AWESOME website<br/>

                          <br/>
                          <br/>
                          <br/>
                          <router-link :to="{name: 'Templates'}">
                          <div class="button button-site is-primary is-outlined nav-item">
                              <span>Create your website</span>
                          </div>
                          </router-link>
                      </div>
                  </div>
                </div>
              </nav>
            </div>
          </section>

          <section v-if="((! ( project && project.websites )) && (isExperimental || getAccountId === '7314d742747523cd6d244a0e880270d3' || getAccountId === '87c6f1725ae57ad36cc53a3fcba2b06b' || getAccountId === '54f34540e409d9c4975daaf368a5276a' || getAccountId ==='cf3e0bf6c4d9213ab0da086858d78151'))">
            <div class="">
              <nav class="box box-main">
                <div class="box-center-main">
                  <div>

                      <div class="center-text">
                          <h4 class="site-title">Docker fan?</h4>

                          <br/>
                          <br/>
                          Let us manage your docker based projects<br/>

                          <br/>
                          <br/>
                          <br/>
                          <div class="button button-site is-primary is-outlined nav-item" @click="loginGitBit(item)">
                              <span>Create your website</span>
                          </div>

                      </div>
                  </div>
                </div>
              </nav>
            </div>
          </section>


    <!--
          <section class="">
            <div class="">
              <nav class="box">
                <div class="box-left">
                  <div>
                  <div class="imageloader loaded site-details--thumbnail desktop"
                  style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                    <img src="https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023" class="mw-100"
                  ></div>
                  </div>
                </div>
                <div class="line">&nbsp;</div>
                <div class="box-center">
                  <div>
                    <div class="col-md-8 col-sm-12"><div class="site-details--content">
                      <div class="site-details--content--header clearfix">
                        <div class="float-left">
                          <h4 class="site-title">mytestsite03</h4>
                          <span class="status--subscription-status"><span class="status--subscription-status published">Published</span>
                        </span>
                      </span>
                    </div>
                    </div>
                    </div>
                    </div>
                  </div>
                </div>
                <div class="box-right">
                  <div>
                      <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile">
                          <span>Edit site</span>
                      </div>
                  </div>
                </div>
              </nav>
            </div>
          </section>
    -->

        </div>
        <div v-else>
          <h1 class="is-title is-bold">{{ pkg.name.replace('-', ' ').replace('CMS', ' CMS') }}</h1>

          <p>
            <strong>{{ pkg.description }}</strong>
          </p>

          <div v-if="isRepoUpdating()">
            <p>Please wait, we are trying to gather latest updates on your website...</p>
          </div>

          <div v-if="isRepoUpdated()">
            <p>b Start designing and adding content to your website by using the left toolbar in the design section.</p>
            <p>Select new theme, without code changes</p>
          </div>
          <div v-if="isRepoMissing()">
            <p>There is an error with your repository. You do not have a .git/config file.</p>
          </div>

          <br/>
          <div v-if="repoUrl">
            <br/>
            Your current Repository Informations: <br/><br/>
            Repository: {{ repoUrl }}
            <br/>
            Branch: {{ repoState.Branch }}
            <br/>
          </div>

          <div v-if="isKeyMissing()">
            <br/>
            <p class="blue">SSH Key is missing. &nbsp;<router-link to="/login" :exact="true"><b>Click here to configure.</b></router-link></p>
          </div>
        </div>
      </div>

      <gitModal :visible="showLoginModal" :template="selectedItem" @nextStep="nextStep($event)" @close="closeGitModal"></gitModal>
      <createDockerSiteModal :visible="showCreateModal" :template="selectedItem" @changePage="changePage($event)" @close="closeCreateSiteModal"></createDockerSiteModal>

      <confirmTxtModal :visible="showConfirmModal" :title="confirmModalTitle" :domain="domain" :info="txt" :error="txterror" @close="closeModal" @confirmed="confirmedStageModal()"></confirmTxtModal>
      <confirmDomainOverrideModal :visible="showConfirmCnameWebsiteOverride" :domain="newDomainName" @close="closeConfirmOverrideModal" @confirmed="confirmedOverrideModal()"></confirmDomainOverrideModal>
      <confirmDomainActiveChangeModal :visible="showActiveWarning" :domain="newDomainName" @close="closeConfirmActiveModal" @confirmed="confirmedActiveModal()"></confirmDomainActiveChangeModal>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
// import Vue from 'vue'
import GitModal from './modals/GitLogin'
import ConfirmTxtModal from './modals/ConfirmTxtModal'
import ConfirmDomainOverrideModal from './modals/ConfirmDomainOverrideModal'
import ConfirmDomainActiveChangeModal from './modals/ConfirmDomainActiveChangeModal'
import createDockerSiteModal from './modals/CreateDockerSiteModal'

export default {
  components: {
    ConfirmTxtModal,
    ConfirmDomainOverrideModal,
    ConfirmDomainActiveChangeModal,
    GitModal,
    createDockerSiteModal
  },
  data () {
    return {
      pkg: this.$store.state.pkg,
      validateText: 'Validate & Create',
      showLoginModal: false,
      addNewStage: false,
      newDomainName: '',
      newStageName: '',
      updating: false,
      confirmModalTitle: '',
      txterror: null,
      cnameerror: null,
      confirmCnameModalTitle: '',
      showActiveWarning: false,
      showDeleteWarning: false,
      showConfirmModal: false,
      showConfirmCnameModal: false,
      showConfirmCnameWebsiteOverride: false,
      showCreateModal: false,
      getVueObj: function () {
        return this
      }
    }
  },
  computed: {
    ...mapGetters({
      isWebsite: 'isWebsite',
      selectedWebsite: 'selectedWebsite',
      selectedProject: 'selectedProject'
    }),
    accountObject () {
      if (this.$store.state.app.accountObject) {
        return this.$store.state.app.accountObject
      }
      var tmp = {}
      return tmp
    },
    isExperimental () {
      if (this.accountObject) {
        if (this.accountObject.experimental === 'true') {
          return true
        }
      }
      return false
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
    acenteraType () {
      return (this.selectedWebsite && this.selectedWebsite.acentera_type && this.selectedWebsite.acentera_type === 'docker-simple')
    },
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
    invalidStageName () {
      if (!this.newStageName) {
        return true
      }
      if (/^[a-zA-Z0-9][a-zA-Z0-9- ]{1,30}[a-zA-Z0-9]$/.test(this.newStageName)) {
        // valid domain name.
        return false
      }
      return true
    },
    getAccountId () {
      if (this.$store.state.session) {
        return this.$store.state.session.accountId
      }
      return ''
    },
    websitePublicUrl: function () {
      if (this.selectedWebsite && this.selectedWebsite.domains) {
        for (var v in this.selectedWebsite.domains) {
          if (this.selectedWebsite.domains.hasOwnProperty(v)) {
            var dom = this.selectedWebsite.domains[v]
            if (dom.primary) {
              return 'https://' + v
            }
          }
        }
        return window.goHostUrl.replace('.workspace.acentera.com', '.web.acentera.com')
      } else {
        return window.goHostUrl.replace('.workspace.acentera.com', '.web.acentera.com')
      }
    },
    websiteUrl: function () {
      return window.goHostUrl
    },
    isLoaded: function () {
      return this.$store.state.app.isLoaded
    },
    project: function () {
      return this.selectedProject
    },
    acenteraTypeStageConfigured () {
      if (this.selectedWebsite && this.selectedWebsite.acentera_type && this.selectedWebsite.acentera_type === 'docker-simple' && this.selectedWebsite.stages) {
        var keys = Object.keys(this.selectedWebsite.stages)
        return (keys.length >= 1)
      }
      return false
    },
    repoState: function () {
      return this.$store.state.app.repoState
    },
    repoUrl: function () {
      if (this.$store.state.app.repoState.hasOwnProperty('url')) {
        if (this.$store.state.app.repoState.hasOwnProperty('url') !== undefined && this.$store.state.app.repoState.hasOwnProperty('url') !== null && this.$store.state.app.repoState.hasOwnProperty('url') !== '') {
          // if (this.$store.state.app.repoState.url === 'hidden') {
          //  return ''
          // }
          return this.$store.state.app.repoState.url
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'toggleRepoUrl',
      'selectWebsite',
      'refreshUser'
    ]),
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
    confirmedStageModal () {
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
    },
    closeConfirmActiveModal () {
      this.showActiveWarning = false
      this.newDomainName = null
    },
    confirmedActiveModal () {
      this.showActiveWarning = false
      this.proceedDomainAssociation(true)
    },
    proceedStageAssociation (primary) {
      var self = this
      self.cnameerror = null
      self.showConfirmCreatingModal = true
      var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
      // request it with headers an param
      self.$http.post(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/stage/create/' + self.newStageName, { title: self.newStageName },
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
          self.addNewStage = false

          self.validateText = 'Validate & Create'
          self.updating = false
          self.newDomainName = null

          // force a refresh for the domainCount fix ...
          this.$store.commit('SELECT_WEBSITE', {projectId: self.selectedWebsite.projectId, websiteId: self.selectedWebsite.websiteId})

          self.$notify({
            title: 'Stage Creation!',
            message: 'Congratulations, your stage website has been added.',
            type: 'success'
          })
          self.showConfirmCreatingModal = false
        } else {
          // self.validateCnameOrCreate()
          self.validateText = 'Validate & Create'
          self.updating = false
          self.$notify({
            title: 'Stage Creation!',
            message: 'An error has occured, please try again or contact us.',
            type: 'danger'
          })
          self.showConfirmCreatingModal = false
        }
      }).catch((error) => {
        self.validateText = 'Validate & Create'
        self.updating = false
        self.$notify({
          title: 'Stage Creation!',
          message: 'An error has occured, please try again or contact us.',
          type: 'danger'
        })
        console.error(error)
      })
    },
    validateStageCnameDomain () {
      var self = this
      self.cnameerror = null
      return new Promise(function (resolve, reject) {
        resolve({ success: true })
      })
    },
    validateCnameOrCreate () {
      var self = this
      console.error('validate again a??')
      this.validateStageCnameDomain().then(function (data) {
        console.error('validate again b??')
        console.error(data)
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
          self.proceedStageAssociation()
        }
      }).catch((error) => {
        console.error('validate error b??')
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

    createStageByName () {
      if (this.invalidStageName) {
        return
      }
      var self = this
      this.validateText = 'Processing...'
      this.updating = true
      self.proceedStageAssociation()
      /*
      console.error('test vlaidate a processing')
      this.validateDomain().then(function (data) {
        // OK TXT has been validated, he own the DNS domain.
        console.error('test vlaidate a ok vlaidate cnameorcrate')
        self.validateCnameOrCreate()
      }).catch((error) => {
        this.showConfirmCnameModal = false
        this.showConfirmModal = true
        console.error(error)
      })
      */
    },

    createStage () {
      if (this.invalidDomainName) {
        return
      }
      var self = this
      this.validateText = 'Processing...'
      this.updating = true
      console.error('test vlaidate a processing')
      this.validateDomain().then(function (data) {
        // OK TXT has been validated, he own the DNS domain.
        console.error('test vlaidate a ok vlaidate cnameorcrate')
        self.validateCnameOrCreate()
      }).catch((error) => {
        this.showConfirmCnameModal = false
        this.showConfirmModal = true
        console.error(error)
      })
    },
    validateDomain () {
      var self = this
      self.txterror = null
      console.error('test vlaidate a')
      return new Promise(function (resolve, reject) {
        var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
        // request it with headers an param
        self.$http.get(window.websiteapiUrl + '/sites/v1/dns/domain/validate/' + self.newDomainName + '/' + self.txt.replace('v=', ''),
          {
            headers: h
          }
        ).then((response) => {
          console.error('test vlaidate b')
          if (!response.data) {
            reject(new Error('No response?'))
          }
          console.error('test vlaidate c')
          if ((response.data.success === true)) {
            console.error('test vlaidate e')
            return resolve(response.data)
          }
          console.error('test vlaidate d')
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
    addNewStageClick () {
      this.addNewStage = true
    },
    cancelAddNewStage () {
      this.addNewStage = false
    },
    loginGitBit: function (item) {
      this.showLoginModal = true
      this.selectedItem = item
    },
    gotoWebsite () {
      window.open(this.websitePublicUrl, '_blank')
    },
    gotoPreviewWebsite () {
      window.open(window.goHostUrl, '_blank')
    },
    isRepoUpdating () {
      return (this.repoState.updating === 1)
    },
    isRepoUpdated () {
      return (this.repoState.updating === 0)
    },
    isRepoMissing () {
      return (this.repoState.updating === 5)
    },
    isKeyMissing () {
      return (this.repoState.updating === 6)
    },
    preview: (item) => {
    },
    select: (item) => {
      window.vm.$store.commit('SELECT_WEBSITE', item.projectId, item.websiteId, window.vm.$store.getters.session)
    },
    nextStep (nextStepData) {
      // Theme => nextStepData.Name
      // next route => '/templates/' + nextStepData.Name + '/edit'
      this.selectedItem = nextStepData

      this.selectedIndex = -1
      this.showLoginModal = false
      this.showCreateModal = true
      // work but not this .. this.$router.push({ 'path': '/templates/' + nextStepData.Name + '/edit' })
    },
    proceedStageDelete (primary) {
      var self = this
      self.cnameerror = null
      self.showConfirmCreatingModal = true
      var h = { 'Authorization': 'Bearer ' + self.$store.state.session.token }
      // request it with headers an param
      self.$http.post(window.websiteapiUrl + '/sites/v1/websites/' + self.selectedWebsite.projectId + '/' + self.selectedWebsite.websiteId + '/stage/delete/' + self.newDomainName, {
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
            message: 'The Stage has successfully been deleted.',
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
    changePage (nextStepData) {
      var self = this
      // Theme => nextStepData.Name
      // next route => '/templates/' + nextStepData.Name + '/edit'
      this.showCreateModal = false

      this.showSiteBeingCreated = true
      self.$store.state.app.websiteInCreationMode = true // To prevent Navbar messages...

      var websiteId = nextStepData.websiteId // '12c47ce0-ccc5-11e7-b808-bd4f405609c4'
      this.$notify({
        title: 'Creating site.',
        message: 'Your site is being created...',
        type: 'success'
      })

      var projectId = nextStepData.projectId

      var initSite = {
        'projectId': projectId,
        'websiteId': websiteId
      }

      // websiteId

      var ready = function () {
        var initSiteRepoCall = window.websiteapiUrl + '/sites/v1/websites/' + initSite.projectId + '/' + initSite.websiteId + '/state/ready'
        var h = { 'authorization': 'Bearer ' + self.$store.state.session.token }
        self.$http.post(initSiteRepoCall, initSite, {
          headers: h
        }).then((response) => {
          self.$notify({
            title: 'Website ready.',
            message: 'Your website has been created.',
            type: 'success'
          })

          window.vm.$store.commit('SELECT_INITIAL_WEBSITE', nextStepData)

          // TODO: change web.acentera.com by a variable
          self.$store.commit('SET_WEBSITE_SSO_TOKEN', { secure: true, domain: '.acentera.com', cookie_value: response.data.sso_token })

          try {
            self.refreshUser()
          } catch (f) {
          }
          setTimeout(function () {
            // do not update state.app.websiteInCreationMode ... the emit changePage will reset this to false ..
            self.$store.commit('setProjectIdForCreation', response.data.projectId)
            self.$store.commit('setWebsiteIdForCreation', response.data.websiteId)
            window.vm.$store.commit('SELECT_WEBSITE', initSite)

            self.$store.state.app.websiteInCreationMode = false
            self.$router.push({ 'path': '/' }) // sites/' + websiteId + '/edit' }) // this route is bad.. it should be going to /
          }, 1000)
        }, function (errr) {
          self.$store.state.app.websiteInCreationMode = false // To prevent Navbar messages...
          self.$notify({
            title: 'Website ready.',
            message: 'We could not update your website state :(.  Please contact us.',
            type: 'danger'
          })
        })
      }
      var fctCheckNewSite = function (itr) {
        // TODO GET SCHEME HERE ....
        $.ajax({
          url: 'https://' + websiteId + '.web.acentera.com/?' + new Date(),
          type: 'GET',
          crossDomain: true,
          // dataType: 'jsonp',
          success: function () {
            ready()
          },
          error: function (e) {
            // error?
            try {
              if (e.readyState === 0) {
                // All Good but Cross Domain Error. We assume the website is alive.
                ready()
                return
              }
              if (e.response === undefined) {
                e.response = e
              }
              if (e.response.status === 404) {
                if (itr <= 30) {
                  setTimeout(function () {
                    fctCheckNewSite(++itr)
                  }, 5000)
                } else {
                  self.$notify({
                    title: 'Creating site.',
                    message: 'Your site could not be created...',
                    type: 'danger'
                  })

                  setTimeout(function () {
                    self.$store.state.app.websiteInCreationMode = false // To prevent Navbar messages...
                    self.$router.push({ 'path': '/' })
                  }, 5000)
                }
              } else {
              }
            } catch (ff) {
              if (itr <= 30) {
                setTimeout(function () {
                  fctCheckNewSite(++itr)
                }, 5000)
              } else {
                setTimeout(function () {
                  self.$store.state.app.websiteInCreationMode = false // To prevent Navbar messages...
                  self.$router.push({ 'path': '/' })
                }, 5000)
              }
            }
          }
        })
      }
      fctCheckNewSite(0)

      //

      // work but not this .. this.$router.push({ 'path': '/templates/' + nextStepData.Name + '/edit' })
    }
  }

}
</script>


<style lang="scss" scoped>

@import '~bulma/sass/utilities/variables';

.floatleft {
  float: left;
}
.marginpad {
  margin-left:30px!important;
}
.fullw {
  width: 45%;
  margin-top: 30px!important;
}
.fullwidth {
  width: 100%;
}

.is-title {
  text-transform: capitalize;
}
.box {
  min-height:120px;
  display: inline-block;
}

.box-left {
    float: left;
    height:100%;
    // margin-right:50px;
    width:40%;
    -webkit-overflow-scrolling: touch;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    max-width: 100%;
    overflow: auto;
    justify-content: flex-start;
    white-space: nowrap;
    -ms-flex-pack: start;
}

.box-right {

    -webkit-overflow-scrolling: touch;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    max-width: 100%;
    overflow: auto;
    -ms-flex-pack: end;
    justify-content: flex-end;
}

.background-box {
  background-color: white;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  color: #4a4a4a;
  display: block;
  padding: 1.25rem;
  width: 20%;
}

.width-50 {
  // width: 30%;
  width: 100%;
}

.small-leftmargin {
  margin-left:30px;
}


.width-full {
  width: 100%;
  display: inline-flex;
}

.line {
  height: 100%;
  position: relative;
  float: left;
  height: auto;
  border-left: 1px solid #efefef;
  height: 100%;
}

.box-template {
  width:25%;
  margin-left:30px;
}

.template-thumbnails {
   width:100%;
}

.mw-100 {
  min-height:190px;
}

.box-center-main {
  width:100%;
  padding-left:10px;
  float: left;
  -ms-flex-align: stretch;
  align-items: stretch;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-positive: 0;
  flex-grow: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -ms-flex-pack: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}
.box-center {
    padding-left:10px;
    float: left;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 0;
    flex-grow: 0;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    -ms-flex-pack: center;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
}

.button-site {
  min-width:100px;
}

.float-left {
  float:left;
}

.center-text-template {
  position: relative;
  text-align: center;
  display: inline-block; /* changed this line */
  // color: white;
  // text-shadow: 0 1px 5px grey;
  clear: both;
}
.center-text {
    position: relative;
    top: 50%;
    display: inline;
    left: 50%; /* added this line and changed the next four lines */
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    display: inline-block; /* changed this line */
    // color: white;
    // text-shadow: 0 1px 5px grey;
    clear: both;
}
.box-main {
  width:80%;
  text-align:center;
}
</style>
