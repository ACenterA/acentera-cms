(function () {
  function install (Vue, options) {
    // GitHub user Private Token or Personal Access Token
    var vv = Vue
    var token = 'you MUST provide an user Private Token or Personal Access Token'
    var username = 'you MUST provide an username'
    var pass = 'you MUST provide an password'
    var isToken = false

    // reading options
    if (typeof options !== 'undefined') {
      if (typeof options.username !== 'undefined') {
        username = options.username
      }
      if (typeof options.pass !== 'undefined') {
        pass = options.pass
        isToken = false
      }
      // a token is mandatory to connect to GitHub API,
      // but it could be set later with .setToken
      if (typeof options.token !== 'undefined') {
        token = options.token
        isToken = true
      }
      if (typeof options.http !== 'undefined') {
        vv = {
          $http: options.http
        }
      }
    }

    // GitHub API full url
    var apiUrl = 'https://api.github.com'

    var Base64 = {

      // private property
      _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

      // public method for encoding
      encode: function (input) {
        var output = ''
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4
        var i = 0

        input = Base64._utf8_encode(input)

        while (i < input.length) {
          chr1 = input.charCodeAt(i++)
          chr2 = input.charCodeAt(i++)
          chr3 = input.charCodeAt(i++)

          enc1 = chr1 >> 2
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
          enc4 = chr3 & 63

          if (isNaN(chr2)) {
            enc3 = enc4 = 64
          } else if (isNaN(chr3)) {
            enc4 = 64
          }

          output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4)
        }
        return output
      },

      // public method for decoding
      decode: function (input) {
        var output = ''
        var chr1, chr2, chr3
        var enc1, enc2, enc3, enc4
        var i = 0

        input = input.replace(/[^A-Za-z0-9+/=]/g, '')

        while (i < input.length) {
          enc1 = this._keyStr.indexOf(input.charAt(i++))
          enc2 = this._keyStr.indexOf(input.charAt(i++))
          enc3 = this._keyStr.indexOf(input.charAt(i++))
          enc4 = this._keyStr.indexOf(input.charAt(i++))

          chr1 = (enc1 << 2) | (enc2 >> 4)
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
          chr3 = ((enc3 & 3) << 6) | enc4

          output = output + String.fromCharCode(chr1)

          if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2)
          }
          if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3)
          }
        }
        output = Base64._utf8_decode(output)
        return output
      },

      // private method for UTF-8 encoding
      _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, '\n')
        var utftext = ''

        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n)

          if (c < 128) {
            utftext += String.fromCharCode(c)
          } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192)
            utftext += String.fromCharCode((c & 63) | 128)
          } else {
            utftext += String.fromCharCode((c >> 12) | 224)
            utftext += String.fromCharCode(((c >> 6) & 63) | 128)
            utftext += String.fromCharCode((c & 63) | 128)
          }
        }

        return utftext
      },

      // private method for UTF-8 decoding
      _utf8_decode: function (utftext) {
        var string = ''
        var i = 0
        var c = 0
        // var c1 = 0
        var c2 = 0
        var c3 = 0

        while (i < utftext.length) {
          c = utftext.charCodeAt(i)

          if (c < 128) {
            string += String.fromCharCode(c)
            i++
          } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1)
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
            i += 2
          } else {
            c2 = utftext.charCodeAt(i + 1)
            c3 = utftext.charCodeAt(i + 2)
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
            i += 3
          }
        }

        return string
      }

    }

    // adding an instance method by attaching it to Vue.prototype
    /**
     * A deadly simple Vue.js plugin to consume GitHub API.
     *
     * @mixin
     * @author {@link http://clorichel.com Pierre-Alexandre Clorichel}
     * @license {@link https://gitlab.com/clorichel/vue-github-api/blob/master/LICENSE MIT License}
     * @see {@link https://gitlab.com/clorichel/vue-github-api Project repository on GitLab.com}
     * @see {@link http://clorichel.com http://clorichel.com}
     */
    Vue.prototype.GitHubAPI = {
      /**
       * Set application wide GitHubAPI token value
       * @param {String} newToken The new token value
       * @example
       * // from anywhere in the global Vue scope
       * Vue.GitHubAPI.setToken('your user token')
       *
       * // from a .vue component
       * this.GitHubAPI.setToken('your user token')
       */
      setToken: function (newToken) {
        if (typeof newToken === 'undefined' || newToken == null || newToken === '') {
          return
        }
        token = newToken
        isToken = true
      },

      setUserPass: function (newUsername, newPass) {
        if (typeof newUsername === 'undefined' || newUsername == null || newUsername === '') {
          console.error('[vue-github-api] You MUST provide a non empty Username')
          return
        }
        if (typeof newPass === 'undefined' || newPass == null || newPass === '') {
          console.error('[vue-github-api] You MUST provide a non empty Password')
          return
        }
        username = newUsername
        pass = newPass
        isToken = false
      },

      /**
       * A request callback function.
       *
       * @callback requestCallback
       * @param {Object} response Full response from GitHub API
       */

      /**
       * A request error callback function.
       *
       * @callback errorCallback
       * @param {Object} response Full response from GitHub API
       */

      /**
       * Issue a GET request on 'https://api.github.com' with params and a variable to fill in
       * @param  {String}                  uri     The GitHub API uri to consume such as '/user/repos'
       * @param  {Object}                  params  A parameters object such as { 'project_id': 72 }
       * @param  {(Array|requestCallback)} fillIn  The Vue.js defined data to fill in with results from GitHub API, or a callback function fed with full response
       * @param  {errorCallback}           errorCb A callback function in case of error (response is passed to callback)
       * @example
       * // -------------------------------------------------
       * // 1- With an array to fill in a Vue.js defined data
       * // -------------------------------------------------
       * // from anywhere in the global Vue scope
       * Vue.GitHubAPI.get('/user/repos', {}, [this.myGitHubData, 'repositories'])
       * // from a .vue component
       * this.GitHubAPI.get('/user/repos', {}, [this.myGitHubData, 'repositories'])
       *
       *
       * // ----------------------------------------------------------
       * // 2- With a callback function to play with the full response
       * // ----------------------------------------------------------
       * // from anywhere in the global Vue scope
       * Vue.GitHubAPI.get('/user/repos', {}, (response) => {
       *   console.log('got response:', response)
       * })
       * // from a .vue component
       * this.GitHubAPI.get('/user/repos', {}, (response) => {
       *   console.log('got response:', response)
       * })
       */
      get: function (uri, params, fillIn, errorCb) {
        // verifying what user sends to fill in
        if (uri.startsWith(apiUrl)) {
          uri = uri.replace(apiUrl, '')
        }

        if (this._verifyFillIn(fillIn) !== true) {
          return
        }
        // ensure leading slash on uri
        uri = uri.replace(/^\/?/, '/')

        // downloading starts now
        this._updateStore('downloading')

        // request it with headers an params
        var h = {
        }

        if (isToken) {
          h = {
            'Authorization': 'token ' + token
          }
        } else {
          var auth = Base64.encode(username + ':' + pass)
          h = { 'Authorization': 'Basic ' + auth }
        }
        vv.$http.get(
          apiUrl + uri,
          {
            headers: h,
            params: params
          }
        ).then((response) => {
          // no more downloading
          this._updateStore('downloaded')
          if (typeof fillIn === 'function') {
            // sending back the full response
            if (response.data !== undefined) {
              fillIn(response.data)
            } else {
              fillIn(response)
            }
          } else {
            if (response.data !== undefined) {
              Vue.set(fillIn[0], fillIn[1], response.data)
            } else {
              Vue.set(fillIn[0], fillIn[1], response.body)
            }
          }
        }, (response) => {
          // no more downloading
          this._updateStore('downloaded')

          if (typeof errorCb === 'function') {
            // user defined an error callback function, calling it with response
            errorCb(response)
          } else {
            // no errorCb function defined, default to console error
            console.error('[vue-github-api] GET ' + uri + ' failed: "' + response.body.message + '" on ' + apiUrl + ' (using token "' + token + '")')
          }
        })
      },

      /**
       * Issue a POST request on 'https://api.github.com' with params and a variable to fill in
       * @param  {String}                  uri     The GitHub API uri to consume such as '/user/repos'
       * @param  {Object}                  params  A parameters object such as { 'project_id': 72 }
       * @param  {(Array|requestCallback)} fillIn  The Vue.js defined data to fill in with results from GitHub API, or a callback function fed with full response
       * @param  {errorCallback}           errorCb A callback function in case of error (response is passed to callback)
       * @example
       * // from anywhere in the global Vue scope
       * Vue.GitHubAPI.post('/repos/OWNER_NAME/REPO_NAME/issues', {
       *   title: 'My new issues from vue-github-api'
       * }, (response) => { console.log('posted it!', response) })
       *
       * // from a .vue component
       * this.GitHubAPI.post('/repos/OWNER_NAME/REPO_NAME/issues', {
       *   title: 'My new issues from vue-github-api'
       * }, (response) => { console.log('posted it!', response) })
       */
      post: function (uri, params, fillIn, errorCb) {
        // verifying what user sends to fill in
        if (this._verifyFillIn(fillIn) !== true) {
          return
        }

        // ensure leading slash on uri
        uri = uri.replace(/^\/?/, '/')

        // downloading starts now
        this._updateStore('downloading')

        var h = {
        }

        if (isToken) {
          h = {
            'Authorization': 'token ' + token
          }
        } else {
          var auth = Base64.encode(username + ':' + pass)
          h = { 'Authorization': 'Basic ' + auth }
        }
        // request it with headers an params
        vv.$http.post(
          apiUrl + uri,
          params,
          {
            headers: h
          }
        ).then((response) => {
          // no more downloading

          this._updateStore('downloaded')
          if (typeof fillIn === 'function') {
            // sending back the full response
            fillIn(response)
          } else {
            // fill in the data from the response body
            if (response.data !== undefined) {
              Vue.set(fillIn[0], fillIn[1], response.data)
            } else {
              Vue.set(fillIn[0], fillIn[1], response.body)
            }
            // Vue.set(fillIn[0], fillIn[1], response.body)
          }
        }, (response) => {
          // no more downloading
          this._updateStore('downloaded')

          if (typeof errorCb === 'function') {
            // user defined an error callback function, calling it with response
            errorCb(response)
          } else {
            // no errorCb function defined, default to console error
            console.error('[vue-github-api] POST ' + uri + ' failed: "' + response.body.message + '" on ' + apiUrl + ' (using token "' + token + '")')
          }
        })
      },

      getBasicAuth: function () {
        if (isToken) {
          /*
          var h = {
            'Authorization': 'token ' + token
          }
          */
          return token
        } else {
          var auth = Base64.encode(username + ':' + pass)
          // var h = { 'Authorization': 'Basic ' + auth }
          return auth
        }
      },

      /**
       * Issue a DELETE request on 'https://api.github.com' with params and a variable to fill in
       * @param  {String}                  uri     The GitHub API uri to consume such as '/user/repos'
       * @param  {(Array|requestCallback)} fillIn  The Vue.js defined data to fill in with results from GitHub API, or a callback function fed with full response
       * @param  {errorCallback}           errorCb A callback function in case of error (response is passed to callback)
       * @example
       * // from anywhere in the global Vue scope
       * Vue.GitHubAPI.post('/repos/OWNER_NAME/REPO_NAME/issues', {
       *   title: 'My new issues from vue-github-api'
       * }, (response) => { console.log('posted it!', response) })
       *
       * // from a .vue component
       * this.GitHubAPI.post('/repos/OWNER_NAME/REPO_NAME/issues', {
       *   title: 'My new issues from vue-github-api'
       * }, (response) => { console.log('posted it!', response) })
       */
      delete: function (uri, fillIn, errorCb) {
        // verifying what user sends to fill in
        if (this._verifyFillIn(fillIn) !== true) {
          return
        }

        // ensure leading slash on uri
        uri = uri.replace(/^\/?/, '/')

        // downloading starts now
        this._updateStore('downloading')

        var h = {
        }

        if (isToken) {
          h = {
            'Authorization': 'token ' + token
          }
        } else {
          var auth = Base64.encode(username + ':' + pass)
          h = { 'Authorization': 'Basic ' + auth }
        }
        // request it with headers an params
        vv.$http.delete(
          apiUrl + uri,
          {
            headers: h
          }
        ).then((response) => {
          // no more downloading

          this._updateStore('downloaded')
          if (typeof fillIn === 'function') {
            // sending back the full response
            fillIn(response)
          } else {
            // fill in the data from the response body
            if (response.data !== undefined) {
              Vue.set(fillIn[0], fillIn[1], response.data)
            } else {
              Vue.set(fillIn[0], fillIn[1], response.body)
            }
            // Vue.set(fillIn[0], fillIn[1], response.body)
          }
        }, (response) => {
          // no more downloading
          this._updateStore('downloaded')

          if (typeof errorCb === 'function') {
            // user defined an error callback function, calling it with response
            errorCb(response)
          } else {
            // no errorCb function defined, default to console error
            console.error('[vue-github-api] POST ' + uri + ' failed: "' + response.body.message + '" on ' + apiUrl + ' (using token "' + token + '")')
          }
        })
      },

      /**
       * Register your application Vuex store to improve it with GitHubAPI Vuex store module
       * @param  {Object} store Your application Vuex store
       * @example
       * // from within a .vue component
       * this.GitHubAPI.registerStore(this.$store)
       */
      registerStore: function (store) {
        if (typeof store === 'undefined') {
          console.error('[vue-github-api] This do not appear to be a Vuex store')
          return
        }

        // registering GitHubAPI Vuex module
        store.registerModule('GitHubAPI', {
          state: {
            // is GitHubAPI currently downloading?
            downloading: false,
            // how many downloads are running
            running: 0
          },
          mutations: {
            downloading: function (state) {
              // currently downloading
              state.running++
              state.downloading = true
            },
            downloaded: function (state) {
              // stopped downloading
              state.running--
              if (state.running === 0) {
                state.downloading = false
              }
            }
          }
        })

        // will need to update it later
        this._vuexStore = store
      },

      /**
       * If attached, the application wide Vuex store
       * @type {Object}
       * @private
       */
      _vuexStore: null,

      /**
       * Update the Vuex store if any
       * @param  {String} mutation The mutation to commit (downloading or downloaded)
       * @private
       */
      _updateStore: function (mutation) {
        if (this._vuexStore != null) {
          this._vuexStore.commit(mutation)
        }
      },

      /**
       * Verifying what to fill in from API consuming functions
       * @param  {(Array|requestCallback)} fillIn  The Vue.js defined data to fill in with results from GitHub API, or a callback function fed with full response
       * @return {Boolean}                         True if the fillIn type is ok, false (with a console error) if not
       * @private
       */
      _verifyFillIn: function (fillIn) {
        // fillIn can be a callback function to which the response will be sent
        if (typeof fillIn !== 'function') {
          // variable to fill in MUST be defined, as a Vue data (to be reactive),
          // and user MUST provide the key to fill in within that data, examples:
          // - [this.dataPropertyName, 'keyToFillDataIn']
          // - [this.GitHub, 'repositories']
          if (!(fillIn instanceof Array) || fillIn.length < 2) {
            console.error('[vue-github-api] You MUST define the Vue data you want to fill as a two values array')
            return false
          }

          // ensure reactive data is not an array but an object, or Vue.set will
          // fail in indexing the data to the expected key
          if (Array.isArray(fillIn[0]) || typeof fillIn[0] !== 'object') {
            console.error('[vue-github-api] Your Vue data to fill MUST be an object (ie `{}`)')
            return false
          }
        }

        return true
      }
    }
  }

  if (typeof exports === 'object') {
    module.exports = install
  }
})()
