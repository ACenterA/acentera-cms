<template>

  <div class="app-sidebar" style="height  :100%">

    Test

  </div>

</template>


<script>
var TabNames = ['configuration', 'metadata', 'approle']

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
    // TODO: Fetch from github fallback to local assets themes ?
    this.$http.get(window.currentUrl + '/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      self.themes = response.data
      this.switchTab(0)
    }).catch((error) => {
      this.$onError(error)
    })
  },

  computed: {

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
      // TODO: Shis should be a app.theme not self.theme
      // as config get refresh in refreshConfig function
      this.$httpApi.post(window.apiUrl + '/settings', this.allSettings, {}).then((response) => {
        if (json !== undefined) {
          self.theme = json.name
        }
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    selectTheme (json) {
      this.allSettings.theme = json.name
      this.save(json)
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
