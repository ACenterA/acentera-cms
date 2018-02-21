<template>

    <div>
      <div class="tile is-ancestor">
      <div class="tile is-parent">
      <article class="tile is-child box">

      Current Theme : {{ theme }}
      <div v-for="json in themes">

          <div v-if="json.Name == theme" class="tile is-parent is-vertical is-3 left">
            <article class="message" v-bind:class="'is-primary'">
              <div class="message-header">
                <p>{{json.Title}}</p>
                <button v-on:click="updateTheme(json)">Update</button>
              </div>
              <div class="message-body">
                {{json.ShortDesc}}
              </div>
            </article>
          </div>

          <div v-if="json.Name != theme" class="tile is-parent is-vertical is-3 left">
            <article class="message" v-bind:class="'not-selected'">
              <div class="message-header">
                <p>{{json.Title}}</p>
                <button v-on:click="selectTheme(json)">Select</button>
              </div>
              <div class="message-body">
                {{json.ShortDesc}}
                <br/>
              </div>
            </article>
          </div>

      </div>
    </article>
    </div>
    </div>
  </div>

</template>


<script>
var TabNames = ['configuration', 'metadata', 'approle']
import { mapGetters } from 'vuex'

export default {

  components: {
  },

  data () {
    return {
      csrf: '',
      themes: [],
      tabName: 'token',
      theme: null,
      tableData: [],
      selectedLang: null,
      selectedLangItem: null,
      allSettings: null,
      availableLanguages: [],
      availableLanguagesHash: {},
      tableColumns: [
        'accessor',
        'display_name',
        'num_uses',
        'orphan',
        'policies',
        'ttl'
      ],
      showModal: false,
      showDeleteModal: false,
      selectedIndex: -1,
      currentPage: 1,
      lastPage: 1,
      tokenCount: 0,
      loading: false,
      // when adding properties here,
      // be careful with reactivity (overwritten by switchTab())
      search: {
        show: false,
        str: '',
        found: 0,
        searched: 0,
        regex: false,
        regexp: null
      }
    }
  },

  mounted: function () {
    var self = this
    // TODO: Fetch from github, if fail get local file?
    this.$http.get('/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      self.themes = response.data
      this.switchTab(0)
    }).catch((error) => {
      this.$onError(error)
    })
  },

  computed: {
    ...mapGetters({
      getBasicAuth: 'getBasicAuth'
    })
  },

  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },

  methods: {
    switchTab: function (index) {
      this.tabName = TabNames[index]
      var self = this

      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.switchTab(index)
        }, 1000)
      }
      // TODO: This language selection is done from a global function refreshConfig now
      // we should add a callback and do remaining logic here... in the callback function?

      this.$httpApi.get(window.apiUrl + '/settings').then((response) => {
        let result = response.data
        if (result.hasOwnProperty('theme')) {
          self.theme = result.theme
        }
        if (result.hasOwnProperty('languages')) {
          var TempAvailablelanguages = []
          var TempAvailablelanguageshash = {}

          let langkeys = Object.keys(result.languages)
          self.allSettings = result
          for (var i = 0; i < langkeys.length; i++) {
            var tmpLang = result.languages[langkeys[i]]
            tmpLang.id = langkeys[i]
            tmpLang.value = langkeys[i]
            TempAvailablelanguageshash[langkeys[i]] = tmpLang
            TempAvailablelanguageshash[result.languages[langkeys[i]].languagename] = tmpLang
            if (self.selectedLang === undefined) {
              self.selectedLang = langkeys[i].languagename
            }
            TempAvailablelanguages.push(tmpLang)
          }
          self.availableLanguages = TempAvailablelanguages
          self.availableLanguagesHash = TempAvailablelanguageshash
        }
      }).catch((error) => {
        this.$onError(error)
      })
    },
    loadLanguageDetails (lang) {
      if (lang !== undefined) {
        this.selectedLangItem = this.availableLanguagesHash[lang]
      }
    },
    openModalBasic (index) {
      this.selectedIndex = index
      this.showModal = true
    },
    closeModalBasic () {
      // this.selectedIndex = -1
      // this.showModal = false
    },
    openDeleteModal (index) {
      // this.selectedIndex = index
      // this.showDeleteModal = true
    },
    closeDeleteModal () {
      // this.selectedIndex = -1
      // this.showDeleteModal = false
    },
    save (json) {
      var self = this
      this.$httpApi.post(window.apiUrl + '/settings', this.allSettings, {}).then((response) => {
        if (json !== undefined) {
          self.theme = json.Name
        }
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    changeTheme (json) {
      var self = this
      this.$httpApi.post(window.apiUrl + '/settings', this.allSettings, {}).then((response) => {
        if (json !== undefined) {
          self.theme = json.Name
        }
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    selectTheme (json) {
      var self = this
      if (this.$store.state.app.repoState.updating >= 5) {
        self.$notify({
          title: 'Not logged in.',
          message: 'You must login using your GIT account. (see left login menu)',
          type: 'warning'
        })
        return
      }

      console.error('baci auth: ' + self.getBasicAuth)
      console.error(json)
      this.$httpApi.post(window.apiUrl + '/themes/update', { Name: json.Name, Repository: json.Repository }, {
        headers: {
          'Authorization': self.getBasicAuth,
          'Token': window.vueAuth.getToken()
        }
      }).then((response) => {
        self.allSettings.theme = json.Name
        self.changeTheme(json)

        self.$notify({
          title: 'Theme updated.',
          message: 'The operation has been successfully completed. Please validate your website before publishing your updated site.',
          type: 'success'
        })
      })
      .catch((error) => {
        console.error('ok err')
        console.error(error.stack)
        this.$onError(error)
      })
    },
    updateTheme (json) {
      var self = this
      if (this.$store.state.app.repoState.updating >= 5) {
        self.$notify({
          title: 'Not logged in.',
          message: 'You must login using your GIT account. (see left login menu)',
          type: 'warning'
        })
        return
      }
      console.error('baci auth: ' + self.getBasicAuth)
      this.$httpApi.post(window.apiUrl + '/themes/refresh', { Name: json.Name }, {
        headers: {
          'Authorization': self.getBasicAuth,
          'Token': window.vueAuth.getToken()
        }
      }).then((response) => {
        self.$notify({
          title: 'Theme updated.',
          message: 'The operation has been successfully completed. Please validate your website before publishing your updated site.',
          type: 'success'
        })
      })
      .catch((error) => {
        console.error('ok err')
        console.error(error.stack)
        this.$onError(error)
      })
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
