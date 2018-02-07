<template>
  <div class="tree-view-wrapper">
    <tree-view-item class="tree-view-item-root" :data="parsedData" :max-depth="allOptions.maxDepth" :current-depth="0"></tree-view-item>
  </div>
</template>

<script>
  import _ from 'lodash'
  import TreeViewItem from './TreeViewItem.vue'

  export default {
    components: {
      TreeViewItem
    },
    name: 'tree-view',
    props: ['data', 'options'],
    methods: {

      // Transformer for the non-Collection types,
      // like String, Integer of Float
      transformValue: function (valueToTransform, keyForValue, extendObj = {}) {
        var tmpE = {
          key: keyForValue,
          type: 'value',
          original: extendObj,
          value: valueToTransform
        }
        return tmpE
      },

      // Since we use lodash, the _.map method will work on
      // both Objects and Arrays, returning either the Key as
      // a string or the Index as an integer
      generateChildrenFromCollection: function (collection) {
        var rr = _.map(collection, (value, keyOrIndex) => {
          if (this.isObject(value)) {
            if (value.hasOwnProperty('Folders')) {
              if (value.Folders.prop && value.Folders.prop.constructor === Array) {
                var tmpArr = []
                for (var k in value.Folders) {
                  if (value.Folders.hasOwnProperty(k)) {
                    var tmpObj = value.Folders[k]
                    tmpObj.Name = k
                    tmpArr.push(tmpObj)
                  }
                }
                value.items = value.Files
              } else {
                var tmpArr1 = []
                for (var k1 in value.Folders) {
                  if (value.Folders.hasOwnProperty(k1)) {
                    var tmpObj1 = value.Folders[k1]
                    tmpObj1.Name = k1
                    tmpArr1.push(tmpObj1)
                  }
                }
                value.items = value.Files.concat(tmpArr1)
              }
              // var extendObj = $.extend({}, oldObject)
              // var extendObj = value
              var extendObj = JSON.parse(JSON.stringify(value))
              if (value.hasOwnProperty('root') && value.root === true) {
                return this.transformObject(value.items, value.Name, 'Dir', true, extendObj)
              } else {
                return this.transformObject(value.items, value.Name, 'Dir', false, extendObj)
              }
            } else {
              if (value.Name !== undefined && !value.hasOwnProperty('Folders')) {
                return this.transformObject(value, value.Name, 'File', false, value)
              } else {
                return this.transformObject(value, value, true, value)
              }
            }
          }
          if (this.isArray(value)) {
            return this.transformArray(value, keyOrIndex, value)
          }

          if (this.isValue(value)) {
            return this.transformValue(value, keyOrIndex, value)
          }
        })

        return rr.sort(function (a, b) { return (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : ((b.key.toLowerCase() > a.key.toLowerCase()) ? -1 : (a.subtype.toLowerCase() > b.subtype.toLowerCase()) ? 1 : ((b.subtype.toLowerCase() > a.subtype.toLowerCase()) ? -1 : 0)) })
      },

      // Transformer for the Array type
      transformArray: function (arrayToTransform, keyForArray, extendObj = {}) {
        var tmpE = {
          key: keyForArray,
          type: 'array',
          original: extendObj,
          children: this.generateChildrenFromCollection(arrayToTransform)
        }
        /*
        for (var v in extendObj) {
          if (extendObj.hasOwnProperty(v)) {
            if (v !== 'children' && v !== 'items' && v !== 'key') {
              tmpE[v] = extendObj[v]
            }
          }
        }
        */
        return tmpE
      },

      // Transformer for the Object type
      transformObject: function (objectToTransform, keyForObject, subType = 'Dir', isRootObject = false, extendObj) {
        var tmpE = {
          key: keyForObject,
          type: 'object',
          subtype: subType,
          isRoot: isRootObject,
          original: extendObj,
          children: this.generateChildrenFromCollection(objectToTransform)
        }
        return tmpE
      },

      // Helper Methods for value type detection
      isObject: function (value) {
        return _.isPlainObject(value)
      },

      isArray: function (value) {
        return _.isArray(value)
      },

      isValue: function (value) {
        return !this.isObject(value) && !this.isArray(value)
      }
    },
    computed: {
      allOptions: function () {
        return _.extend({}, {
          rootObjectKey: 'root',
          maxDepth: 4
        }, (this.options || {}))
      },
      parsedData: function () {
        // Take the JSON data and transform
        // it into the Tree View DSL

        // Strings or Integers should not be attempted to be split, so we generate
        // a new object with the string/number as the value
        if (this.isValue(this.data)) {
          return this.transformValue(this.data, this.allOptions.rootObjectKey)
        }

        // If it's an object or an array, transform as an object
        return this.transformObject(this.data, this.allOptions.rootObjectKey, true)
      }
    }
  }
</script>

<style scoped>

.tree-view-wrapper {
  overflow: auto;
}

/* Find the first nested node and override the indentation */
.tree-view-item-root > .tree-view-item-leaf > .tree-view-item {
  margin-left: 0!important;
}

/* Root node should not be indented */
.tree-view-item-root {
  margin-left: 0!important;
}

</style>
