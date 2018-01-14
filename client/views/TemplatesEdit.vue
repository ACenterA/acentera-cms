<template>
  <plekan></plekan>
</template>

<script>
import plekan from 'components/plekan/plekan.vue'
import tmpA from '../plekan/src/core/modules/dynamic.vue'
import { mapActions } from 'vuex'
import Vue from 'vue'
// import Vue from 'vue'

export default {

  components: {
    plekan
  },
  data () {
    return {
      themes: [],
      selectedTheme: null,
      pkg: this.$store.state.pkg
    }
  },
  computed: {
  },
  mounted () {
    $('body').addClass('overflow-hidden')
    /*
    var self = this
    this.$http.get('/assets/themes.json').then((response) => {
    // this.$http.get('https://raw.githubusercontent.com/component/clone/master/component.json').then((response) => {
      console.log('got monuted raw json')
      self.themes = response.data
      for (var idx in self.themes) {
        if (self.themes[idx].Name === self.$route.params.id) {
          self.selectedTheme = self.themes[idx]
          break
        }
      }
      // TODO: if (self.selectedTheme is null... then.. show error
    }).catch((error) => {
      this.$onError(error)
    })
    */

    this.refreshPage()
  },
  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'toggleRepoUrl',
      'isWebsite'
    ]),
    refreshPage () {
      var self = this
      if (!this.$store.state.app.isLoaded) {
        console.error('not loaded')
        return setTimeout(function () {
          self.refreshPage()
        }, 1000)
      }

      var currentUrl = window.goHostUrl + '/'
      if (window.location.href.indexOf('acentera.com') <= -1) {
        currentUrl = 'http://localhost:8081/'
      }
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
        // var tmp01 = Data.substring(bodyStartIdx01)
        // var bodySpecialObj = tmp01.substring(0, tmp01.indexOf('>') + 1)
//        console.error(bodySpecialObj)

        if (headEnd < headStart) {
          headEnd = bodyStart - 6
        }

        var bodyEnd = Data.lastIndexOf('</body')
        if (bodyEnd < 0) {
          bodyEnd = Data.toLowerCase().lastIndexOf('</body')
        }
        bodyEnd += 7
        // console.error('FOUND BODY TEST START 02 :' + bodyStart + ' up to :' + bodyEnd)
        // console.error(Data)
        var body = Data.substring(bodyStart, bodyEnd) // .replaceAll(" href=\"#"," data-href=\"#").replaceAll(" href=\"/#"," data-href=\"/#")
        var head = Data.substring(headStart, headEnd)

        // console.error(head)

        // console.error('head is :')
        // console.error(head)
        // head = head.substring(6, head.lastIndexOf('>') + 1)
        // console.error('NEW head is :')
        if (currentUrl === '') {
          console.log('aa')
        }
        // head = '<head><' + 'script>document.domain = "acentera.com"<' + '/script>' + '<base href="' + currentUrl + '">\r\n' + head // TODO: Only when in Development / debugging

        head = '<base href="' + currentUrl + '">' + head // TODO: Only when in Development / debugging

        // console.error(head)
        // console.error('add test : ' + '<' + 'script>document.domain = "acentera.com"<' + '/script>' + '<base href="' + currentUrl + '">\r\n')
        // eslint-disable-next-line no-use-before-define
        // head = head +  // TODO: Could this cause issue ?? Its kind of required...
        // eslint-disable-next-line no-use-before-define
        // console.error('ADDING OF ' + '<' + 'script>document.domain = "acentera.com"<' + '/script>')

        // alert(head);
        var htmlContent = body  //  window.data.Data; //$("body").html()
        var headContent = head  //  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        window.Head = headContent
        window.Body = htmlContent
        var theH = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('head')[0]
        // window.document = document.getElementsByTagName('iframe')[0].contentWindow.document
        $(theH).append(head)

        console.log('CUSTOM COMPONENTS')
        // console.log(htmlContent)
        // htmlContent = '<body><div>lakjflakjfla</div></body>'
        var customComponents = [
          {
            'name': 'awesomecomponentBody9',
            'group': 'image',
            'thumbnail': 'https://vuejs.org/images/logo.png',
            context: tmpA,
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
        console.error('map test')
        const oList = customComponents.map(m => {
          // Register Component
          console.error('map test AAA')
          m.contents = m.contents || {}

          this.$store.state.languages.map(l => {
            m.contents[l] = {}
            m.contents[l].html = ""
            m.contents[l].fields = {}

            return true
          })

          console.error('fafa33a')
          console.error(m)
          console.error(m.context)
          console.error(m.name)
          try {
            console.error('CREATE COMPONENT OF...AA')
            console.error(this.$plekan)
            console.error(this.$plekan.plekanComponentMixin.methods)
            // console.error(m)
            if (m.hasOwnProperty('newContext')) {
              var tt = {}

              Object.assign(tt,m.context);
              console.error('FFFA')
              //console.error(tt.mixins[0].methods, m.newContext.methods);
              // console.error(tt.mixins[0].methods, m.newContext.methods);


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
              // this fixes the getData() function ....
              Object.assign(tt.mixins[0],m.newContext);
              Object.assign(tt,m.newContext);
              */



              // console.error(m.newContext)
              // console.error('CREATE COMPONENT OF...CC ' + tt.getData())
              // var skywalker = Object.assign(tt, m.context)
              // Object.assign(skywalker.mixins[0], m.newContext)
              // console.error('skywalker')
              // console.error(skywalker)
              // console.error(skywalker.data().DEFAULT_CONTENT)
              // console.error(' z 3z 3')

              // console.error(m.context)
              // console.error(tt)
              // console.error(skywalker/.)
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
          console.error('OKOK3')
          console.error(e)
          this.$store.commit('addModuleList', e) // weird ?
        })
      })
      // }, 2000);
    }
  }
}

</script>

<style lang="scss" scoped>

@import '~bulma/sass/utilities/variables';
body {
  margin:0;
  overflow: hidden;
  }

.fullIframe {
  position:absolute;
  left:0;
  top:0;
  width:100%;
  height:100%;
  overflow-y: hidden;
  overflow-x: hidden;
}


</style>
