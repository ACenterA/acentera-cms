/*
* 28 August 2016 Abdullah Mara  @abdullah
*/

var getParents = require('./helpers')
var selectionPolify = require('./polyfill.js')
selectionPolify.start();

;(function () {
  function Selo(props) {
    console.error('SELO START A');
    if (!props.els) {

        var log = props.log != undefined ? props.log : true

        if (log) {
          console.log("[El parameters] is not defined, this element set as body  ")
        }
    }

    if (!document) {
      throw "[Platfrom] not supported"
    }
    console.error('iframe 1');
    if (!props.iframe) {
       this._document = document;
    } else {
       this._document = props.iframe;
    }
    if (!props.window) {
    console.error('iframe 2');
       this._window = window;
    } else {
       this._window = props.window;
    }
    console.error('iframe 3');


    this._arena      = null;
    this.selection  = null;
    console.error('iframe 4');
    this.els         = props.els || this._document.body;
    this._bus        = props.bus;

    console.log('in selo...');
    console.log(this);
    console.error('iframe 5');
    this.init()
  }

  Selo.prototype.init = function () {
    this._arena = this.els;
    console.error('window.getSelection????');
    console.error(this);
    console.error(this._document);
    this.selection = this._window.getSelection()

    this.attachEvent();
  }

  Selo.prototype.attachEvent = function () {
       console.error('attachEvent...');
       var selectionEndTimeout = null,
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
        "keydown"
      ].map(function(e) {
        console.error('addEventListener........');
        console.error(this);
        console.error(this._document);
        this._document.addEventListener(e.toString(), function(evt/*event*/) {
          console.error(evt);
          if (evt.type != "selectionchange" && evt.type != "mouseup") {
            if (evt.type == "click") {
          		console.error('CLICK ON ITEM 01 A dispatch');
          		console.error(evt);
          		// evt.preventDefault();
          		// if (evt.target.className == 'close-modal') {
          			// console.error('trgger click');
          			// evt.target.click();
          		// }
              // this._document.dispatchEvent(evt);
	    } else if (evt.type == "keydown") {
              map[evt.keyCode] = true

            }else{

              if (map[65] && map[91] ) {
                if (this.hasText()) {
              		  if (this._bus !== undefined) {
              			     console.error('emit end event 03');
              		       this._bus.$emit(endEvent.type, endEvent);
              		  } else {
                    	   this._document.dispatchEvent(endEvent);
              		  }
                }
              }
              else if ((map[16] && map[37]) || (map[16] && map[38]) || (map[16] && map[39]) || (map[16] && map[40]) ) {
                if (this.hasText()) {
              		  if (this._bus !== undefined) {
              			   console.error('emit end event 01?');
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
              console.error('selection change A1?');
              console.error(this.hasText());
              if (this.hasText()) {
                  console.error('NICE NICE 99');
                  console.error(this);
                  console.error(this._bus);
            		  if (this._bus !== undefined) {
            			     console.error('emit start event');
            		  	   this._bus.$emit(startEvent.type, startEvent);
            		  } else {
                       this._document.dispatchEvent(startEvent);
            		  }
              } else {
                console.error('has tetxt aaa');
                if (this._bus !== undefined) {
                     console.error('emit end event 02');
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
            			     console.error('emit endevent mouseup event');
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
        console.error('save sel test?');
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
    console.error('export object');
    module.exports = Selo
  } else if (typeof define == "function" && define.amd) {
  define([], function () {
    console.error('return selo');
    return Selo
  })
  } else if (window.Vue) {
    console.error('return vue solo..');
    window.Selo = Selo
  }



})()
