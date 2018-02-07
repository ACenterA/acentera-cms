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
                Title:

                <div class="field">
                    <p class="control">
                      <input class="input" type="text"
                      placeholder="Enter website title"
                      v-model="selectedLangItem.title">
                    </p>
                </div>


                <p class="control">
                  <a class="button is-success" @click="save">
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
var TabNames = ['configuration']

export default {

  components: {
  },

  data () {
    return {
      csrf: '',
      tabName: 'token',
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
    this.switchTab(0)
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

      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.switchTab(index)
        }, 1000)
      }

      // TODO: This got moved into the refreshConfig ...
      // we should add a refreshConfig callback and execute remaining stuff here

      this.$httpApi.get(window.apiUrl + '/settings').then((response) => {
        let result = response.data

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
      })
      .catch((error) => {
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
    save () {
      this.$httpApi.post(window.apiUrl + '/settings', this.allSettings, {}).then((response) => {
        // TODO: Return this.$notify scucess message.. feedback.
      })
      .catch((error) => {
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
</style>
