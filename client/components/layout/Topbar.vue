<template>
  <nav class="topbar app-topbar" :class="{ hidden: !show }">
    <div class="level-left">
      <div class="level-item">
        <h3 v-if="selectedPost !== null" class="subtitle is-5">          
          <span v-if="selectedPost.title">
            Editing : {{ selectedPost.title }}
          </span>
          <span v-else>
            <br/>
          </span>
        </h3>
      </div>
      <div class="level-item" v-if="!!codelink">
        <tooltip label="View code" placement="right" size="small" :rounded="true">
          <span class="icon">
            <a  :href="codelink">
              <i class="fa fa-github"></i>
            </a>
          </span>
        </tooltip>
      </div>
    </div>

    <div v-if="selectedPost !== null" class="level-right is-hidden-mobile">
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
      list: null
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
      selectedPost: 'selectedPost'
    }),
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

  methods: {
    topbarClick () {
      console.error('aa')
      console.error($('.rightSide'))
      console.error($('.rightSide').hasClass('active'))
      if ($('.rightSide').hasClass('active')) {
        $('.rightSide').removeClass('active')
      } else {
        $('.rightSide').addClass('active')
      }
    },
    getList () {
      console.log('route is')
      console.log(this.$route)
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
}
.topbar-settings {
  padding-right:50px;
  padding-bottom:5px;
  cursor: pointer;
}
</style>
