import Promise from '../promise.js'
import { objectExtend, parseQueryString, getFullUrlPath, isUndefined } from '../utils.js'

/**
 * OAuth2 popup management class
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Class mostly taken from https://github.com/sahat/satellizer
 * and adjusted to fit vue-authenticate library
 */
export default class OAuthPopup {
  constructor(url, name, popupOptions) {
    this.popup = null
    this.url = url
    this.name = name
    this.popupOptions = popupOptions
  }

  open(redirectUri, skipPooling) {
    try {
      this.popup = window.open(this.url, this.name, this._stringifyOptions())
      if (this.popup && this.popup.focus) {
        this.popup.focus()
      }

      if (skipPooling) {
        // console.error('SKIP POLLING HERE')
        return Promise.resolve()
      } else {
        window.localStorage.removeItem('custom_auth_msg')

        // addEventListener support for IE8
        var bindEvent = function (element, eventName, eventHandler) {
           if (element.addEventListener){
               element.addEventListener(eventName, eventHandler, false);
           } else if (element.attachEvent) {
               element.attachEvent('on' + eventName, eventHandler);
           }
        }

        // addEventListener support for IE8
        var unbindEvent = function (element, eventName, eventHandler) {
           if (element.addEventListener){
               element.addEventListener(eventName, eventHandler, false);
           } else if (element.attachEvent) {
               element.attachEvent('on' + eventName, eventHandler);
           }
        }

        // Listen to message from child window
        bindEvent(window, 'message', function (event) {
            // console.error('received of')
            // console.log(event)
            // console.log(event.data)
            // console.error(e)
            // results.innerHTML = e.data;
        });
        return this.pooling(redirectUri)
      }
    } catch(e) {
      // console.error(e.stack)
      return Promise.reject(new Error('OAuth popup error occurred'))
    }
  }

  pooling(redirectUri) {
    return new Promise((resolve, reject) => {
      const redirectUriParser = document.createElement('a')
      redirectUriParser.href = redirectUri
      const redirectUriPath = getFullUrlPath(redirectUriParser)

      let poolingInterval = setInterval(() => {
        if (!this.popup || this.popup.closed || this.popup.closed === undefined) {
          clearInterval(poolingInterval)
          poolingInterval = null
          reject(new Error('Auth popup window closed'))
        }

        try {
          const popupWindowPath = getFullUrlPath(this.popup.location)

          if (popupWindowPath === redirectUriPath) {
            if (this.popup.location.search || this.popup.location.hash) {
              const query = parseQueryString(this.popup.location.search.substring(1).replace(/\/$/, ''));
              const hash = parseQueryString(this.popup.location.hash.substring(1).replace(/[\/$]/, ''));
              let params = objectExtend({}, query);
              params = objectExtend(params, hash)

              var crossWindowMsgFallback = window.localStorage.getItem('custom_auth_msg') // post message didn't work somehow..
              if (crossWindowMsgFallback) {
                window.localStorage.removeItem('custom_auth_msg')
              }

              if (params.error) {
                reject(new Error(params.error));
              } else {
                resolve(params);
              }
            } else {
              reject(new Error('OAuth redirect has occurred but no query or hash parameters were found.'))
            }
            clearInterval(poolingInterval)
            poolingInterval = null
            this.popup.close()
          }
        } catch(e) {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
          // well..
          var crossWindowMsgFallback = window.localStorage.getItem('custom_auth_msg') // post message didn't work somehow..
          if (crossWindowMsgFallback) {
            window.localStorage.removeItem('custom_auth_msg')
            var idxSearch = crossWindowMsgFallback.indexOf('?')
            var search = ""
            if (idxSearch > 0) {
              search = crossWindowMsgFallback.substring(idxSearch)

              var idxHash = crossWindowMsgFallback.indexOf('#')
              var hash = ""
              if (idxHash > 0) {
                hash = crossWindowMsgFallback.substring(idxHash)
              }

              const query = parseQueryString(search.substring(1).replace(/\/$/, ''));
              var hash = parseQueryString(hash.substring(1).replace(/[\/$]/, ''));
              let params = objectExtend({}, query);
              params = objectExtend(params, hash)

              // console.error('got params')
              // console.error(params)
              if (params.error) {
                reject(new Error(params.error));
              } else {
                resolve(params);
              }

              clearInterval(poolingInterval)
              poolingInterval = null
              this.popup.close()
            }
          }
        }
      }, 250)
    })
  }

  _stringifyOptions() {
    let options = []
    for (var optionKey in this.popupOptions) {
      if (!isUndefined(this.popupOptions[optionKey])) {
        options.push(`${optionKey}=${this.popupOptions[optionKey]}`)
      }
    }
    return options.join(',')
  }
}
