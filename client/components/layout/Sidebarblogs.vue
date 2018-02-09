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
          <div v-if="item.draft" class="draft">draft</div>
          <span @click="selectPost({ vue: this, item: item })">
            <div class="postTitle">{{item.title}}</div>
            <br/>
            {{item.pubDate}}
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
  float: left;
  max-height: 100%;
  height: calc(100% - 50px);
  z-index: 1024 - 1;
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
