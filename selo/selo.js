/*
* 28 August 2016 Abdullah Mara  @abdullah
*/

var getParents = require('./helpers')
var selectionPolify = require('./polyfill.js')
selectionPolify.start();

;(function () {
  function Selo(props) {
    if (!props.els) {

        var log = props.log != undefined ? props.log : true

        if (log) {
          console.log("[El parameters] is not defined, this element set as body  ")
        }
    }

    if (!document) {
      throw "[Platfrom] not supported"
    }
    if (!props.iframe) {
       this._document = document;
    } else {
       this._document = props.iframe;
    }
    if (!props.window) {
       this._window = window;
    } else {
       this._window = props.window;
    }

    this._arena      = null;
    this.selection  = null;
    this.els         = props.els || this._document.body;
    this._bus        = props.bus;

    this.init()
  }

  Selo.prototype.init = function () {
    this._arena = this.els;
    this.selection = this._window.getSelection()

    this.attachEvent();
  }

  Selo.prototype.attachEvent = function () {
       var selectionEndTimeout = null,
          contextMenuEvent    = new CustomEvent('contextMenuEvent'),
          endEvent            = new CustomEvent('selectionEnd'),
          startEvent          = new CustomEvent('selectionStart',{detail:this.selection}),
          clearEvent          = new CustomEvent('removeSelectionEditor'),
          beforeStartEvent    = new CustomEvent('selectionBeforeStart');


      var map =  {
        65: false,
        91: false,
        37: false,
        38: false,
        39: false,
        40: false,
        16: false,
      };

       // "click",
      var listener = [
        "mouseup",
        "selectionchange",
        "keyup",
        "contextmenu",
        "keydown"
      ].map(function(e) {
        this._document.addEventListener(e.toString(), function(evt/*event*/) {
          if (evt.type != "selectionchange" && evt.type != "mouseup") {
            if (evt.type === "contextmenu") {
              var tmpcontextMenuEvent = new CustomEvent('contextMenuEvent', { detail: evt  })
              // {detail:this.selection}),
              // TODO: Should we check the target is editable ??
              if (this._bus !== undefined) {
                   this._bus.$emit(contextMenuEvent.type, tmpcontextMenuEvent);
              } else {
                   this._document.dispatchEvent(tmpcontextMenuEvent);
              }
              return
            } else if (evt.type == "click") {
      	    } else if (evt.type == "keydown") {
                    map[evt.keyCode] = true
            }else{

              if (map[65] && map[91] ) {
                if (this.hasText()) {
              		  if (this._bus !== undefined) {
              		       this._bus.$emit(endEvent.type, endEvent);
              		  } else {
                    	   this._document.dispatchEvent(endEvent);
              		  }
                }
              }
              else if ((map[16] && map[37]) || (map[16] && map[38]) || (map[16] && map[39]) || (map[16] && map[40]) ) {
                if (this.hasText()) {
              		  if (this._bus !== undefined) {
              		   	 this._bus.$emit(endEvent.type, endEvent);
              		  } else {
                       this._document.dispatchEvent(endEvent);
              		  }
                }
              }else{
                // Object.keys(map).map(function(e){
                //   map[e] = false
                // })
              }
            }

          }

          if (evt.type == "selectionchange") {
            // if (this.selection.type == "Range") {
              if (this.hasText()) {
            		  if (this._bus !== undefined) {
            		  	   this._bus.$emit(startEvent.type, startEvent);
            		  } else {
                       this._document.dispatchEvent(startEvent);
            		  }
              } else {
                if (this._bus !== undefined) {
                     this._bus.$emit(clearEvent.type, clearEvent); //only clearEventType is usefull
                } else {
                     this._document.dispatchEvent(clearEvent);
                }
              }
            // }else{
                // if (this.inArena()) {
                //   document.dispatchEvent(beforeStartEvent);
                // }
            // }
            clearTimeout(selectionEndTimeout);
          }

          selectionEndTimeout = setTimeout(function(){
              if (evt.type == "mouseup" && this.hasText()) {
            		  if (this._bus !== undefined) {
            		  	   this._bus.$emit(endEvent.type, endEvent);
            		  } else {
                    	this._document.dispatchEvent(endEvent);
            		  }
              }
          }.bind(this), 100);
        }.bind(this))
      }.bind(this))

    }


  Selo.prototype.hasText = function () {
      if (this.inArena()) {
        return  this.selection.toString() != ""
      }
      return false
    }

    Selo.prototype.inArena = function () {
      var _arena = this._document.querySelectorAll(this._arena)
      if (this.selection.focusNode) {
        var parents = getParents(this.selection.focusNode.parentNode);
        var tmp = false

        Object.keys(_arena).map(function(e)  {
          if (parents.indexOf(_arena[e]) != -1) {
            tmp = true
          }
        })
        return tmp;
      }
      return false
    }

    Selo.prototype.getPositionRange = function () {

      var oRange = this.selection.getRangeAt(0); //get the text range
      var oRect = oRange.getBoundingClientRect();

      var bound = {};

      bound["left"] =  oRect.left
      bound["top"] =  oRect.top
      bound["getBoundingClientRect"] = oRect;
      return  bound
    }

    Selo.prototype.saveSelection = function ()  {
        if (this._window.getSelection) {
            var sel = this._window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                return sel.getRangeAt(0);
            }
        } else if (this._document.selection && this._document.selection.createRange) {
            return this._document.selection.createRange();
        }
        return null;
    }

    Selo.prototype.restoreSelection  = function (range) {
        if (range) {
            if (this._window.getSelection) {
                var sel = this._window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (this._document.selection && range.select) {
                range.select();
            }
        }
    }


  if (typeof exports == "object") {
    module.exports = Selo
  } else if (typeof define == "function" && define.amd) {
  define([], function () {
    return Selo
  })
  } else if (window.Vue) {
    window.Selo = Selo
  }



})()
