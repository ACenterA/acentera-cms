<template>

    <div>
      <div class="tile is-ancestor">
      <div class="tile is-parent">
      <article class="tile is-child box">

      Current Theme : {{ theme }}
      <div v-for="json in themes">


          <div v-if="json.name == theme" class="tile is-parent is-vertical is-3 left">
            <article class="message" v-bind:class="'is-primary'">
              <div class="message-header">
                <p>{{json.Title}}</p>
              </div>
              <div class="message-body">
                {{json.ShortDesc}}
              </div>
            </article>
          </div>

          <div v-if="json.name != theme" class="tile is-parent is-vertical is-3 left">
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
    this.$http.get('/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      console.log('got monuted raw json')
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

      this.$http.get(window.apiUrl + '/settings').then((response) => {
        console.log('got http get')
        console.log(response)
        let result = response.data
        console.log(result)

        /*
        let keys = Object.keys(result)
        for (var i = 0; i < keys.length; i++) {
          console.log(keys[i])
          console.log(result[keys[i]])
        }
        */
        if (result.hasOwnProperty('theme')) {
          self.theme = result.theme
        }
        if (result.hasOwnProperty('languages')) {
          console.log('LANGS ARE')
          console.log(result.languages)

          var TempAvailablelanguages = []
          var TempAvailablelanguageshash = {}

          let langkeys = Object.keys(result.languages)
          self.allSettings = result
          for (var i = 0; i < langkeys.length; i++) {
            console.log('Languages are:' + langkeys[i])
            console.log(result.languages[langkeys[i]])
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
        console.log('language load detail of' + lang.languagename)
        console.log(lang)
        this.selectedLangItem = this.availableLanguagesHash[lang]
      }
      console.log(this.availableLanguagesHash)
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
      // console.log(this.allSettings)
      var self = this
      this.$http.post(window.apiUrl + '/settings', this.allSettings, {}).then((response) => {
        console.log('SAVED')
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
