<template>
  <nav class="topbar app-topbar" :class="{ hidden: !show }">
    <div class="level-left">
      <div class="level-item" v-if="loaded">
        <h3 v-if="selectedPost !== null" class="subtitle is-5">
          <span v-if="selectedPost.title">
            Editing : {{ selectedPost.title }}
          </span>
          <span v-else>
            <br/>
          </span>
        </h3>
      </div>
      <div class="level-item" v-if="loaded && !!codelink">
        <tooltip label="View code" placement="right" size="small" :rounded="true">
          <span class="icon">
            <a  :href="codelink">
              <i class="fa fa-github"></i>
            </a>
          </span>
        </tooltip>
      </div>
    </div>

    <div v-if="loaded && selectedPost !== null" class="level-right is-hidden-mobile">
      <div v-if="selectedPost.draft" class="level-right">
        <button class="button is-primary is-outlined topBtnPad" @click="undraft">Undraft</button>
      </div>
      <div class="topbar-settings" v-if="hasSettings">
        <div class="control has-icons-right">
          <span class="select">
            <select v-model="selectedLang" @change="loadLanguageDetails(selectedLang)">
              <option v-for="lang in enabledLanguages">
                {{lang.languagename}}
              </option>
            </select>
          </span>
        </div>
      </div>
     <div class="topbar-settings">
      <tooltip label="Settings" placement="left" size="small" :rounded="true">
        <span class="icon">
          <span @click="topbarClick">
            <i class="fa fa-cogs"></i>
          </span>
        </span>
      </tooltip>
     </div>
    </div>
  </nav>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import { mapGetters } from 'vuex'

export default {
  components: {
    Tooltip
  },

  data () {
    return {
      list: null,
      selectedLang: null,
      hasSettings: false
    }
  },

  props: {
    show: Boolean
  },

  created () {
    this.getList()
  },

  computed: {
    ...mapGetters({
      selectedPost: 'selectedPost',
      loaded: 'loaded'
    }),
    enabledLanguages () {
      var tmpArr = []
      $.each(this.$store.state.app.languages.languages, function (idx, lang) {
        if (lang.enable) {
          tmpArr.push(lang)
        }
      })
      return tmpArr
    },
    availableLanguages () {
      return this.$store.state.app.languages.languages
    },
    codelink () {
      if (this.$route.meta && this.$route.meta.link) {
        return 'https://github.com/vue-bulma/vue-admin/blob/master/client/views/' + this.$route.meta.link
      } else {
        return null
      }
    },
    name () {
      return this.$route.name
    }
  },
  mounted: function () {
    this.loadLanguageDetails()
    // if ($('.rightSide').length >= 1) {
    this.hasSettings = true
    // } else {
    // this.hasSettings = false
    // }
  },
  methods: {
    loadLanguageDetails (lang) {
      if (!this.$store.state.app.isLoaded) { // } || (this.$store.state.app.languages.languages.length <= 0)) {
        var self = this
        return setTimeout(function () {
          self.loadLanguageDetails(lang)
        }, 300)
      }
      if (!lang) {
        lang = window.vm.$store.state.app.languageSelected
      }
      if (lang !== undefined) {
        if (this.$store.state.app.languages !== undefined) {
          // Get current language, if none defined then lets define to ourself
          // browser loaded the page properly
          var orig = this.$store.state.app.languageSelected // get current selected language ( or default one )
          if (!this.selectedLang) {
            orig = lang
          }
          this.selectedLang = lang
          this.selectedLangItem = this.$store.state.app.languages.languagesHash[lang]
          if (orig !== this.selectedLang) {
            // Ok we got a language change, we should $emit a change language occured event
            this.$store.commit('SITE_SELECT_LANG', this.selectedLang)
            this.$bus.$emit('LANGUAGE_CHANGE_EVENT', this.selectedLangItem)
          }
        }
      }
    },
    undraft () {
      this.$bus.$emit('UNDRAFT', this.selectedPost)
    },
    topbarClick () {
      // if ($('.rightSide').hasClass('active')) {
      // $('.rightSide').removeClass('active')
      this.$bus.$emit('TOGGLE_ADVANCED_SETTINGS', this.selectedPost)
      // } else {
      // ('.rightSide').addClass('active')
      //  this.$bus.$emit('SHOW_ADVANCED_SETTINGS', this.selectedPost)
      // }
    },
    getList () {
      if ((('' + this.$route.path)).indexOf('/Pages') >= 0) {
        this.$data.show = false
      } else if ((('' + this.$route.path)).indexOf('/items') >= 0) {
        this.$data.show = false
      } else if ((('' + this.$route.path)).indexOf('/widget') >= 0) {
        this.$data.show = false
      } else {
        this.$data.show = true
      }
      let matched = this.$route.matched.filter(item => item.name)
      let first = matched[0]
      if (first && (first.name !== 'Home' || first.path !== '')) {
        matched = [{ name: 'Home', path: '/' }].concat(matched)
      }
      this.list = matched
    }
  },

  watch: {
    $route () {
      this.getList()
    }
  }
}
</script>

<style>
.app-topbar {
  background: white;
  border-bottom: solid #AAA 1px;
  min-height:40px;
  // position: fixed;
  // width: 100%;
  // top: 55px;
}
.topbar-settings {
  padding-right:50px;
  padding-bottom:5px;
  cursor: pointer;
}
.topBtnPad {
  margin-right:10px;
  margin-top:-5px;
}
</style>
