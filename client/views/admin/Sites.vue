<template>
  <div>

    <div class="tile is-ancestor">
      <div class="tile is-parent is-vertical">
        <article class="tile is-child box">

        <label class="label">Select Language</label>
        <div class="control has-icons-right">
          <span class="select">
            <select v-model="selectedLang" @change="loadLanguageDetails(selectedLang)">
              <option v-for="lang in availableLanguages">
                {{lang.languagename}}
              </option>
            </select>
          </span>
        </div>
        <div v-if="selectedLangItem">
            <!-- Tab navigation -->
            <div class="tabs is-medium is-boxed is-fullwidth">
              <ul>
                <li v-bind:class="tabName === 'configuration' ? 'is-active' : ''" v-on:click="switchTab(0)"><a>{{selectedLang}} Configuration</a></li>
                <!-- <li v-bind:class="tabName === 'metadata' ? 'is-active' : ''" v-on:click="switchTab(1)"><a>Metadata</a></li> -->
                <!-- <li v-bind:class="tabName === 'approle' ? 'is-active' : ''" v-on:click="switchTab(2)"><a>Approle</a></li> -->
                <!-- <li disabled><a>Certificates</a></li> -->
              </ul>
            </div>


            <!-- Tokens tab -->
            <div v-if="tabName === 'configuration'" class="tile is-parent table-responsive is-vertical">

                <div class="field">
                    <p class="field">
                      Google Analytics Code:
                    </p>
                    <p class="control">
                      <input class="input" type="input"
                      v-model="store.state.app.settings.googleanalytics">
                    </p>
                </div>

                <div class="field">
                    <p class="field">
                      Enabled:
                    </p>
                    <p class="control">
                      <input :disabled="selectedLangItem.locked" class="checkbox" type="checkbox"
                      v-model="selectedLangItem.enable" @click="langToggle">
                    </p>
                </div>

                Title:

                <div class="field">
                    <p class="control">
                      <input class="input" type="text"
                      placeholder="Enter website title"
                      v-model="selectedLangItem.title">
                    </p>
                </div>


                <p class="control">
                  <a class="button is-success" @click="saveNewSettings">
                    Save
                  </a>
                </p>


            </div>

            <div v-if="tabName === 'metadata'" class="tile is-parent table-responsive is-vertical">
                  In Metadata
            </div>
        </div>

        </article>
      </div>
    </div>

  </div>
</template>

<script>

// var TabNames = ['configuration', 'metadata', 'approle']
import { mapActions } from 'vuex'
var TabNames = ['configuration']

export default {

  components: {
  },

  data () {
    return {
      csrf: '',
      tabName: 'token',
      store: this.$store,
      tableData: [],
      lang: null,
      selectedLang: null,
      selectedLangObject: null,
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
    this.switchTab(0)
  },

  computed: {
    selectedLangItem () {
      console.error('a1')
      if (this.lang !== null) {
        console.error('a2')
        console.error(this.$store.state.app.settings.languages)
        console.error(this.lang)
        return this.$store.state.app.settings.languages[this.lang]
      }
      return null
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  methods: {
    ...mapActions([
      'saveNewSettings'
    ]),
    langToggle: function () {
      var tmpNewLang = []
      var self = this
      var selectedLangId = this.selectedLangItem.id
      var currDisabledLanguages = (this.$store.state.app.settings.disablelanguages || '').split(' ')
      $.each(currDisabledLanguages, function (idx, langId) {
        if (langId === selectedLangId) {
            // Skip this language
            // we do the logic outside of the loop
        } else {
          tmpNewLang.push(langId)
        }
      })
      if (!self.selectedLangItem.enable) {
        tmpNewLang.push(selectedLangId) // disable the language..
      }
      this.$store.state.app.settings.disablelanguages = tmpNewLang.join(' ')
      if (this.$store.state.app.settings.disablelanguages.startsWith(' ')) {
        this.$store.state.app.settings.disablelanguages = this.$store.state.app.settings.disablelanguages.substring(1)
      }
      console.error('NEW LANGUAGES ARE')
      console.error(this.$store.state.app.settings.disablelanguages)
    },
    switchTab: function (index) {
      this.tabName = TabNames[index]
      var self = this

      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.switchTab(index)
        }, 1000)
      }

      // TODO: This got moved into the refreshConfig ...
      // we should add a refreshConfig callback and execute remaining stuff here

      this.$httpApi.get(window.apiUrl + '/settings').then((response) => {
        let result = response.data

        var disabledLanguagesStr = '' + result.disablelanguages || ''
        var disabledLanguagesHash = {}
        var disabledLanguagesArr = disabledLanguagesStr.split(' ')

        for (var z = 0; z < disabledLanguagesArr.length; z++) {
          disabledLanguagesHash[disabledLanguagesArr[z]] = true
        }

        if (result.hasOwnProperty('languages')) {
          var TempAvailablelanguages = []
          var TempAvailablelanguageshash = {}

          let langkeys = Object.keys(result.languages)
          // self.allSettings = result
          self.$store.state.app.settings = result
          for (var i = 0; i < langkeys.length; i++) {
            var tmpLang = result.languages[langkeys[i]]
            tmpLang.id = langkeys[i]
            tmpLang.value = langkeys[i]
            TempAvailablelanguageshash[langkeys[i]] = tmpLang
            TempAvailablelanguageshash[result.languages[langkeys[i]].languagename] = tmpLang
            if (self.selectedLang === undefined) {
              self.selectedLang = langkeys[i].languagename
            }

            if (disabledLanguagesHash.hasOwnProperty(langkeys[i])) {
              result.languages[langkeys[i]]['enable'] = false
            } else {
              result.languages[langkeys[i]]['enable'] = true
            }

            if (langkeys[i] === result.defaultcontentlanguage) {
              result.languages[langkeys[i]]['enable'] = true // default language cannot be disabled...
              result.languages[langkeys[i]]['locked'] = true // default language cannot be disabled...
            }

            TempAvailablelanguages.push(tmpLang)
          }
          self.availableLanguages = TempAvailablelanguages
          self.availableLanguagesHash = TempAvailablelanguageshash
        }
      })
      .catch((error) => {
        console.error(error.stack)
        this.$onError(error)
      })
    },
    loadLanguageDetails (lang) {
      if (lang !== undefined) {
        // this.selectedLangItem = this.availableLanguagesHash[lang]
        this.lang = this.availableLanguagesHash[lang].id
        // console.error('test a ' + this.$store.state.app.languages
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

  p.field {
    float: left;
    padding-right: 30px;
  }
</style>
