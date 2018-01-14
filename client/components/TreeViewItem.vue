<template>
  <div class="tree-view-item">
    <div v-if="isObject(data)" class="tree-view-item-leaf">
      <tree-view-item :key="getKey(data)" :max-depth="maxDepth" :current-depth="currentDepth+3" v-show="isOpen()" v-for="child in data.children" :data="child"></tree-view-item>
    </div>
    <div v-if="isArray(data)" class="tree-view-item-leaf">
      <div @click="openWrench(data)" class="tree-view-item-node" :class="{ hovered: active }" @mouseover="mouseOver(data)" @mouseleave="mouseOut(data)">
        <span @click.stop="toggleOpen()" :class="{opened: isOpen()}"  class="tree-view-item-key tree-view-item-key-with-chevron">{{getKey(data)}}</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length === 1">{{data.children.length}} item</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length !== 1">{{data.children.length}} items</span>
        <i class="right fa fa-wrench">&nbsp;</i>
        <!-- array -->
      </div>
      <tree-view-item :key="getKey(data)" :max-depth="maxDepth" :current-depth="currentDepth+3" v-show="isOpen()" v-for="child in data.children" :data="child"></tree-view-item>
    </div>
    <div @click="editPage(data)" class="tree-view-item-leaf" v-if="isValue(data)" :class="{ hovered: active }"  @mouseover="mouseOver(data)" @mouseleave="mouseOut(data)">
      <span class="tree-view-item-key">{{getKey(data)}}</span>
      <span class="tree-view-item-value" :class="getValueType(data)">{{getValue(data)}}</span>
      <i @click="openWrench(data)" class="right fa fa-wrench">&nbsp;</i>
    </div>
  </div>
</template>

<script>

  import _ from 'lodash'
  // import Vue from 'vue'
  export default {
    name: 'tree-view-item',
    props: ['data', 'max-depth', 'current-depth', 'active'],
    data: function () {
      return {
        open: this.currentDepth < this.maxDepth
      }
    },
    methods: {
      isOpen: function () {
        return this.open
      },

      mouseOver: function (obj) {
        this.active = true
        // this.active = !this.active;
      },

      isHover: function (obj) {
        return obj.active === true
      },

      mouseOut: function (obj) {
        this.active = false
      },
      openWrench: function (d) {
        this.$bus.$emit('staticHtmlSelected', d)
      },

      editPage: function (d) {
        this.$bus.$emit('staticHtmlEdit', d)
      },

      toggleOpen: function () {
        this.open = !this.open
      },

      isObject: function (value) {
        console.log('got is object check')
        console.log(value)
        if (value.type === 'object') {
          console.log('got is object check 1')
          if (value.subtype === 'file' || value.subtype === 'File') {
            this.open = false
          }
          console.log('got is object check 2')
          if (value.subtype === true) {
            this.open = true
            console.log('got is object check 3')
            return true
          }
          console.log('got is object check 4')
          if (value.subtype === 'dir' || value.subtype === 'Dile') {
            console.log('got is object check 1')
            return false
          }
        }
        return false
      },
      isDir: function (value) {
        console.log('check if is dir')
        console.log(value)

        if (!value) return false

        console.log((value.subtype === 'dir' || value.subtype === 'Dir'))
        return (value.subtype === 'dir' || value.subtype === 'Dir')
      },
      isFile: function (value) {
        return (value.subtype === 'file' || value.subtype === 'File')
      },
      isNotIdx: function (value) {
        return ((_.isInteger(value.key)))
      },
      isNotIdxTest: function (value) {
        return (!(_.isInteger(value.key)))
      },
      isArray: function (value) {
        if (value.subtype === 'dir' || value.subtype === 'Dir') {
          return true
        }
        return value.type === 'array'
      },
      isValue: function (value) {
        if (value.subtype === 'file' || value.subtype === 'File') {
          return true
        }
        return value.type === 'value'
      },
      getKey: function (value) {
        if (_.isInteger(value.key)) {
          return value.key + ':'
        } else {
          return value.key
        }
      },
      getValue: function (value) {
        if (_.isNumber(value.value)) {
          return value.value
        }
        if (_.isNull(value.value)) {
          return 'null'
        }
        if (_.isString(value.value)) {
          return '"' + value.value + '"'
        }
        return value.value
      },
      getValueType: function (value) {
        var prefix = 'tree-view-item-value-'

        if (_.isNumber(value.value)) {
          return prefix + 'number'
        }
        if (_.isFunction(value.value)) {
          return prefix + 'function'
        }
        if (_.isBoolean(value.value)) {
          return prefix + 'boolean'
        }
        if (_.isNull(value.value)) {
          return prefix + 'null'
        }
        if (_.isString(value.value)) {
          return prefix + 'string'
        }
        return prefix + 'unknown'
      },
      isRootObject: function (value = this.data) {
        return value.isRoot
      }
    }
  }
</script>

<style scoped>

.tree-view-item {
  font-family: monospace;
  font-size: 14px;
  margin-left: 18px;
}

.tree-view-item-node {
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tree-view-item-leaf {
  white-space: nowrap;
}


.tree-view-item-node .hovered,
.tree-view-item-leaf .hovered {
  color: blue;
}

.tree-view-item-leaf-active {
  color: green;
}


.tree-view-item-key {
  padding-left: 14px;
  font-weight: bold;
}

.tree-view-item-key-with-chevron {
  padding-left: 14px;
}


.tree-view-item-key-with-chevron.opened::before {
    top:4px;
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
}

.tree-view-item-key-with-chevron::before {
    color: #444;
    content: '\25b6';
    font-size: 10px;
    left: 1px;
    position: absolute;
    top: 3px;
    transition: -webkit-transform .1s ease;
    transition: transform .1s ease;
    transition: transform .1s ease, -webkit-transform .1s ease;
    -webkit-transition: -webkit-transform .1s ease;
}

.tree-view-item-hint {
  color: #ccc
}

.right {
  float:right;
  padding-right:20px;
  padding-left:20px;
}
</style>
