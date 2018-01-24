<template>
  <div class="app-inner-content">
    <div v-if="isRepoError()">
      <div class="tile is-ancestor is-vertical fullheight">

          <article class="padleft tile is-child box">
              <label class="label">Your current repository is in error. <br/><br/>Validate if you have a .git/config file, in your folder or ask for help on our gitter channel.</label>
          </article>

      </div>
    </div>

    <div class="fullheight" v-if="!isRepoError()">
      <plekan></plekan>
      <!--
      <div class="plekan-outerdiv tile is-ancestor is-vertical fullheight">
          <iframe v-if="loaded && selectedPage" class="fullheight" :src="selectedPage"></iframe>
      </div>
      -->
    </div>
  </div>
</template>

<script>
import Tooltip from 'vue-bulma-tooltip'
import TreeView from 'components/TreeView'
import { Sidebartwo } from 'components/layout/'
import Modal from './modals/InfoModalWidget'
import { mapGetters } from 'vuex'

import Vue from 'vue'
import plekan from 'components/plekan/plekan.vue'
import dynamicObj from '../../plekan/src/core/modules/dynamic.vue'
// import Vue from 'vue'

// import Modal from './modals/InfoModal'

const querystring = require('querystring')

export default {
  components: {
    Tooltip,
    TreeView,
    Modal,
    Sidebartwo,
    plekan
  },

  data () {
    return {
      csrf: '',
      showModal: false,
      plaintext: '',
      testTitle: '',
      selectedObject: null,
      type: 'Static',
      cipher: '',
      userTransitKey: '',
      extra: '?editMode=widget&apiPort=8081&jsPort=8091',
      editing: false,
      chart: [
      ]
    }
  },

  mounted: function () {
    var self = this
    console.log('is github')
    console.log(this)
    console.log(this.github)
    this.$bus.$on('staticHtmlSelected', function (data) {
      console.log('reciev inc dotal modal')
      console.log(this)
      self.selectedObject = data
      self.showModal = true
    })

    this.$bus.$on('staticHtmlEdit', function (data) {
      console.log('reciev edidt of ...data')
      console.log(data)
      // self.selectedObject = data
      // self.showModal = true
      self.selectedPage = window.apiHost + '/widgetedit/' + data.original.Path + self.extra + '&widget=' + data.original.Path
    })

    this.refreshData()
  },

  computed: {
    ...mapGetters({
      session: 'session',
      github: 'github',
      pkginfo: 'pkg',
      sidebartwo: 'sidebartwo',
      repoState: 'repoState',
      loaded: 'loaded'
    }),
    selectedPage: function () {
      if (this.$store.state.isLoaded) {
        return ''
      }
      return window.goHostUrl
    }
  },
  events: {
    incrementTotal: function () {
      console.log('total aaa')
    }
  },
  methods: {
    refreshWidgets () {
      console.log('get file listing')

      var self = this
      if (!this.$store.state.app.isLoaded) {
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }

      this.$httpApi.get(window.apiUrl + '/widgets').then((response) => {
        this.$data.chart = response.data
        // this.$store.commit('TOGGLE_SIDEBAR', false)
        this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
        this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', response.data)
      })
      .catch((error) => {
        this.$onError(error)
      })
    },
    refreshData () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        console.error('not loaded')
        return setTimeout(function () {
          self.refreshData()
        }, 1000)
      }
      var currentUrl = window.goHostUrl + '/'
      // if (window.location.href.indexOf('acentera.com') <= -1) {
      //   currentUrl = 'http://localhost:8081/'
      // }
      this.$httpApi.get(currentUrl, { headers: { edit: 1 } }).then((res) => {
        console.error(window.VueApp.$store.state.moduleList)
        var Data = res.data.data.Data

        // console.error(window.data.Data);
        var headStart = Data.indexOf('<head>') + 6
        if (headStart < 7) {
          headStart = Data.toLowerCase().indexOf('<head>') + 6
          if (headStart < 7) {
            // headStart = window.data.Data.toLowerCase().indexOf("doctype html>");
            // alert(headStart);
            // if (headStart <= 10) {
            headStart = Data.toLowerCase().indexOf('<html>') + 6
            //
          }
        }

        if (headStart < 6) {
          headStart = 0
        }

        var headEnd = Data.indexOf('</head>')
        if (headEnd < 0) {
          headEnd = Data.toLowerCase().indexOf('</head>') + 7
        }

        var bodyStartIdx01 = Data.indexOf('<body')
        var bodyStart = Data.indexOf('<body>') + 6
        if (bodyStart < 7) {
          console.error('FOUND BODY START AT A :' + bodyStart)
          console.error('FOUND BODY START AT A :' + bodyStartIdx01)
          // console.error(Data)
          if (bodyStartIdx01 > 6) {
            bodyStart = bodyStartIdx01
          } else {
            bodyStart = Data.toLowerCase().indexOf('<body>') + 6
            bodyStartIdx01 = Data.toLowerCase().indexOf('<body>') + 1
          }
        }

        window.TestData = Data
        if (bodyStart < 7) {
          console.error('FOUND BODY START AT :' + bodyStart)
          bodyStart = 0
          bodyStartIdx01 = 0
        }

        if (headEnd < headStart) {
          headEnd = bodyStart - 6
        }

        var bodyEnd = Data.lastIndexOf('</body')
        if (bodyEnd < 0) {
          bodyEnd = Data.toLowerCase().lastIndexOf('</body')
        }
        bodyEnd += 7

        var body = Data.substring(bodyStart, bodyEnd) // .replaceAll(" href=\"#"," data-href=\"#").replaceAll(" href=\"/#"," data-href=\"/#")
        var head = Data.substring(headStart, headEnd)

        if (currentUrl === '') {
          console.log('aa')
        }
        head = '<base href="' + currentUrl + '">' + head // TODO: Only when in Development / debugging

        var htmlContent = body
        var headContent = head
        window.Head = headContent
        window.Body = htmlContent
        var theH = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('head')[0]
        $(theH).append(head)

        var customComponents = [
          {
            'name': 'awesomecomponentBody9',
            'group': 'image',
            'thumbnail': 'https://vuejs.org/images/logoB.png',
            context: dynamicObj,
            newContext: {
              /*
                //this not working so we use getData from the methods below ...
              data () {
                return {
                  DEFAULT_CONTENT: htmlContent
                }
              },
              */
              methods: {
                isHead: function () {
                  return false
                },
                getData: function () {
                  return htmlContent
                },
                orThisgetData: function () {
                  return htmlContent
                }
              }
            }
          }
        ]

        // console.error(htmlContent)

        /* eslint-disable */
        const oList = customComponents.map(m => {
          // Register Component
          m.contents = m.contents || {}

          this.$store.state.languages.map(l => {
            m.contents[l] = {}
            m.contents[l].html = ""
            m.contents[l].fields = {}

            return true
          })

          try {
            if (m.hasOwnProperty('newContext')) {
              var tt = {}

              Object.assign(tt,m.context);

              if (m.newContext.hasOwnProperty('data')) {
                tt['data'] = m.newContext['data']
              }

              if (m.newContext.hasOwnProperty('methods')) {
                for (var k in m.newContext.methods) {
                    tt.methods[k] = m.newContext.methods[k]
                }
              }

              /*
              Object.assign(tt.mixins[0],this.$plekan.plekanComponentMixin.methods)
              Object.assign(tt,plekan.plekanComponentMixin)
              for (var k in m.newContext) {
                  console.error('have to process')
                  console.error(k)
                  console.error(m.newContext[k])
              }
              */

              /*
              // this fixes the getData() function ??? ....
              Object.assign(tt.mixins[0],m.newContext);
              Object.assign(tt,m.newContext);
              */

              Vue.component(m.name, tt)
            } else {
              Vue.component(m.name, Object.assign({}, m.context))
            }
          } catch (f) {
            console.error(f.stack)
          }

          delete m.context
          return m
        })

        oList.forEach((e) => {
          // this.$store.commit('addModuleList', e) // weird ?
          // this.store.state.moduleList[0]
          // const tmprow = this.list[rowindex]
          this.$store.commit('addRow', e, 0)
        })
      })
    },

    close () {
      console.log('close here a')
      this.showModal = false
    },
    /*
    editObj () {
      console.log('edit obj of a')
    },
    */
    createWidget (obj) {
      console.log('creating widget using')
      console.log(obj)

      var filetmp = obj.folder
      var filepath = filetmp
      var ctr = 0
      while (filetmp[ctr++] === '/') {
        filepath = filetmp.substring(1)
      }

      filetmp = obj.filename
      var file = filetmp
      ctr = 0
      while (filetmp[ctr++] === '/') {
        file = filetmp.substring(1)
      }

      var postData = {
        filename: file,
        path: filepath,
        type: 'widget',
        headers: obj.headers
      }

      var self = this
      this.$httpApi.post(window.apiUrl + '/widgetupload', postData, {
        // headers: {'TmpHeader': 'tmp'}
      })
      .then((response) => {
        console.log('got response')
        console.log(response)
        self.refreshData()
        self.close()
        self.$notify({
          title: 'Success',
          message: 'Creation successful',
          type: 'success'
        })
        this.selectedPage = window.goHostUrl + '/' + postData.path + '/' + postData.filename + self.extra
      })
      .catch((error) => {
        console.log('got error eee')
        console.log(error)
        self.close()
        self.$onError(error)
      })
    },

    editObj (obj) {
      console.log('edit obj of')
      console.log(obj)
      console.log(obj.original.Path)
      this.selectedPage = window.goHostUrl + '/widgetedit/' + obj.original.Path + this.extra
      this.showModal = false
    },

    closeModalBasic () {
      console.log('close modal basic here')
      this.selectedIndex = -1
      this.showModal = false
    },

    AtoggleSidebar: function (f) {
      this.$store.commit('TOGGLE_SIDEBAR_TWO', true)
      this.$store.commit('TOGGLE_SIDEBAR_TWO_DATA', this.$data.chart)
    },

    incrementTotal: function () {
      console.log('total aaa')
    },

    openWrench: function () {
      console.log('azz')
    },

    encryptText: function () {
      if (this.editing) {
        return
      }

      this.$http.post('/api/transit/encrypt', querystring.stringify({
        plaintext: this.plaintext,
        key: this.userTransitKey
      }), {
        headers: {'X-CSRF-Token': this.csrf}
      })

      .then((response) => {
        this.cipher = response.data.result
        this.plaintext = ''
        this.$notify({
          title: 'Success',
          message: 'Encryption successful',
          type: 'success'
        })
      })

      .catch((error) => {
        this.$onError(error)
      })
    },
    decryptText: function () {
      if (this.editing) {
        return
      }

      this.$http.post('/api/transit/decrypt', querystring.stringify({
        cipher: this.cipher,
        key: this.userTransitKey
      }), {
        headers: {'X-CSRF-Token': this.csrf}
      })

      .then((response) => {
        this.plaintext = response.data.result
        this.cipher = ''
        this.$notify({
          title: 'Success',
          message: 'Decryption successful',
          type: 'success'
        })
      })

      .catch((error) => {
        this.$onError(error)
      })
    },

    clearPlaintext: function () {
      this.plaintext = ''
    },
    clearCipher: function () {
      this.cipher = ''
    },
    isRepoError () {
      return (this.repoState.updating >= 5)
    },

    changeKey: function () {
      this.editing = true
    }
  }
}
</script>

<style scoped>
  .padleft {
    position: relative;
    left:30px;
    top:30px;
    height:300px;
    flex-grow: 0;
    min-height:300px;
    width:90%;
  }

  .app-inner-content {
      height: 100%;
  }
  .button {
    margin: 5px 0 0;
  }

  .fullheight {
    height: 100%;
    min-height:100%;
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
