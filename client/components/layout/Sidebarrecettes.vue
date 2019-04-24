<template>
  <aside class="menu app-sidebarblog animated fullheight" :class="{ slideInLeft: show, slideOutLeft: !show }" width="200px">
    <p class="menu-label">
    </p>
    <div class="list">
      <ul>
        <li>
          <span @click="createNewPost()">Create new Post
          <br/>
          </span>
        </li>
        <li v-for="(item, index) in blogData">
          <!--
            // Removed we would have to find a logic
            // to update the sidebar objects for items not in draft
            // ie: english in draft, but french not in draft
            <div v-if="item.draft" class="draft">draft</div>
          -->
          <span v-if="!item.delete" @click="clickSelectPost({ vue: this, item: item })">
            <div class="postTitle">{{item.title}}</div>
            <br/>
            {{item.pubDate | formatDate}}
          </span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
import Expanding from 'vue-bulma-expanding'
import { mapGetters, mapActions } from 'vuex'
import TreeView from 'components/TreeView'

export default {
  components: {
    Expanding,
    TreeView
  },

  props: {
    show: Boolean,
    jsonData: Array
  },

  data () {
    return {
      isReady: false
    }
  },
  // destroyed () {
  //  this.$bus.$off('REFRESH_LEFTMENU')
  // },
  mounted () {
    let route = this.$route
    if (route.name) {
      this.isReady = true
      this.shouldExpandMatchItem(route)
    }
  },
  computed: {
    ...mapGetters({
      menu: 'menuitems'
    }),
    blogData () {
      return this.$store.state.app.sidebarblogData.json
    }
  },

  methods: {
    ...mapActions([
      'expandMenu',
      'selectPost'
    ]),
    clickSelectPost (itm) {
      var self = this
      var link = itm.item.link
      console.error('clicked on post')
      console.error(itm.item)
      var type = ''
      var langCode = ''
      var langPrefix = ''
      if (itm.item.hasOwnProperty('alternate')) {
        // New Logic
        // New Logic
        var alternateLangLinks = itm.item.alternate
        type = itm.item.section
        if (alternateLangLinks.hasOwnProperty(langPrefix)) {
          console.error('ok link has alternate of ' + langPrefix)
          link = itm.item.dir
          langCode = langPrefix
          // link = alternateLangLinks[langPrefix]
        } else {
          console.error('1 -ok link does not have alternate of ' + langPrefix)
          var selectedLangItem = window.vm.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
          langCode = '' + selectedLangItem.id
        }
        link = itm.item.dir
        console.error('ok DID GOT LINK ALTER?')
      } else {
        var selectedLangItem1 = window.vm.$store.state.app.languages.languagesHash[window.vm.$store.state.app.languageSelected]
        langCode = '' + selectedLangItem1.id
        if (window.vm.$store.state.app.language === window.vm.$store.state.app.languageSelected) {
          langCode = '' // no prefix, this is the default site...
        }

        type = 'blogs'
        if (link.indexOf('localhost:') >= 0 && link.indexOf('localhost:') <= 8) {
          link = link.replace('localhost:1313/', '')
        } else {
          // link = link // link = window.goHostUrl + langPrefix + link
        }
        while (link.startsWith('//')) {
          link = link.substring(1)
        }
        if (link.startsWith('/' + type + '/')) {
          link = link.substring(('/' + type + '/').length)
        }
        while (link.endsWith('/')) {
          link = link.substring(0, link.length - 1)
        }
      }
      console.error('GOT LINK OF : ' + link)
      self.$httpApi.post(window.apiUrl + '/frontmatter?sidebarrecettes=1', { type: 'recettes', id: link, lang: langCode }, { }).then((res) => {
        itm.item['frontMatter'] = {}
        for (var p in res.data) {
          if (res.data.hasOwnProperty(p)) {
            if (p === 'title' || p === 'pubDate' || p === 'date' || p === 'draft') {
              // This is bad
              if (p === 'date') {
                itm.item['pubDate'] = res.data[p]
              }
              itm.item[p] = res.data[p]
            } else {
              itm.item['frontMatter'][p] = res.data[p]
            }
          }
        }
        self.selectPost(itm)
      })
      .catch((error) => {
        self.$onError(error)
      })
    },
    createNewPost: function () {
      this.$store.state.app.createItem = true
      this.selectPost({ vue: this, item: { link: '/blogs/this_does_not_exists' } })
    },
    isExpanded (item) {
      return item.meta.expanded
    },

    toggle (index, item) {
      this.expandMenu({
        index: index,
        expanded: !item.meta.expanded
      })
    },

    incrementTotal: function () {
    },

    shouldExpandMatchItem (route) {
      let matched = route.matched
      let lastMatched = matched[matched.length - 1]
      let parent = lastMatched.parent || lastMatched
      const isParent = parent === lastMatched

      if (isParent) {
        const p = this.findParentFromMenu(route)
        if (p) {
          parent = p
        }
      }

      if ('expanded' in parent.meta && !isParent) {
        this.expandMenu({
          item: parent,
          expanded: true
        })
      }
    },

    generatePath (item, subItem) {
      return `${item.component ? item.path + '/' : ''}${subItem.path}`
    },

    findParentFromMenu (route) {
      const menu = this.menu
      for (let i = 0, l = menu.length; i < l; i++) {
        const item = menu[i]
        const k = item.children && item.children.length
        if (k) {
          for (let j = 0; j < k; j++) {
            if (item.children[j].name === route.name) {
              return item
            }
          }
        }
      }
    }
  },

  watch: {
    $route (route) {
      this.isReady = true
      this.shouldExpandMatchItem(route)
    }
  }

}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';
@import '~bulma/sass/utilities/mixins';



.app-sidebarblog {
  position: relative;
  top: 0px;
  left: 0;
  bottom: 0;
  padding: 0px 0 0px;
  width: auto;
  min-width: 300px;
  max-width: 300px;
  float: left;
  max-height: 100%;
  height: calc(100% - 50px);
  // z-index: 1024 - 1;
  background: #FFF;
  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);
  overflow-y: auto;
  overflow-x: hidden;

  .draft {
    float: right;
    color: red;
  }

  .postTitle {
    width: 80%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis // This is where the magic happens
  }

  .tree-view-item-key {
    padding-right:30px;
  }

  @include mobile() {
    transform: translate3d(-180px, 0, 0);
  }

  .icon {
    vertical-align: baseline;
    &.is-angle {
      position: absolute;
      right: 10px;
      transition: transform .377s ease;
    }
    &:not(.is-angle) {
      position: relative;
      right: 3px;
      top: -1px;
    }
  }

  .menu-label {
    padding-left: 5px;
  }

  .menu-list {
    li a {
      &[aria-expanded="true"] {
        .is-angle {
          transform: rotate(180deg);
        }
      }
    }

    li a + ul {
      margin: 0 10px 0 15px;
    }
  }

  .list {

    h2 {
      font: 400 40px/1.5 Helvetica, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    li {
      font: 200 20px/1.5 Helvetica, Verdana, sans-serif;
      border-bottom: 1px solid #ccc;
    }

    li:last-child {
      border: none;
    }

    li span {
      text-decoration: none;
      color: #000;
      display: block;
      width: 100%;
      cursor: pointer;

      -webkit-transition: font-size 0.3s ease, background-color 0.3s ease;
      -moz-transition: font-size 0.3s ease, background-color 0.3s ease;
      -o-transition: font-size 0.3s ease, background-color 0.3s ease;
      -ms-transition: font-size 0.3s ease, background-color 0.3s ease;
      transition: font-size 0.3s ease, background-color 0.3s ease;
    }

    li span:hover {
      background: #f6f6f6;
    }
  }


}

.list span {
  min-height: 80px;
}

.app-sidebartwo-fixed {
  position: fixed;
  top: 50px;
  left: 0;
  bottom: 0;
  padding: 20px 0 50px;
  width: auto;
  min-width: 45px;
  max-height: 100vh;
  height: calc(100% - 50px);
  z-index: 1024 - 1;
  background: #FFF;
  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);
  overflow-y: auto;
  overflow-x: hidden;

  .tree-view-item-key {
    padding-right:30px;
  }

  @include mobile() {
    transform: translate3d(-180px, 0, 0);
  }

  .icon {
    vertical-align: baseline;
    &.is-angle {
      position: absolute;
      right: 10px;
      transition: transform .377s ease;
    }
    &:not(.is-angle) {
      position: relative;
      right: 3px;
      top: -1px;
    }
  }

  .menu-label {
    padding-left: 5px;
  }

  .menu-list {
    li a {
      &[aria-expanded="true"] {
        .is-angle {
          transform: rotate(180deg);
        }
      }
    }

    li a + ul {
      margin: 0 10px 0 15px;
    }
  }

}


</style>
