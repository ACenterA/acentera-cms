
// Anonymous "self-invoking" function
var noConsoleAvail = {
  log: function() {

  },
  error: function() {

  },
}
window.console = window.console || noConsoleAvail;
function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
}

(function() {

   String.prototype.replaceAll = function(search, replacement) {
       var target = this;
       return target.replace(new RegExp(search, 'g'), replacement);
   };

   function grapeCodeAsync(head, content) {
       if(typeof grapesjs=='undefined') {
           setTimeout(function() {
		            grapeCodeAsync(head, content);
           }, 100);
        } else {
		          grapeCode(head, content)
	      }
   }

   function grapeCode(head,content) {

    var myNode = document.getElementsByTagName("body")[0];
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    var apiPort = getParameterByName('apiPort') || window.location.port;
    var prefix = window.editoradminprefix || getParameterByName('prefix') || "/";
    var jsPort = getParameterByName('jsPort') || window.location.port;
    var containerGjs = document.createElement('div');
    containerGjs.id = 'gjs';
    myNode.appendChild(containerGjs);
    $('body').attr('style', '');
    $("body").css({margin: 0, padding:0});

    var ll = ""
    if (window.editoradminindev) {
       ll = window.editoradminindev + '/dist';//dist/css/grapes.min.css';
    } else {
       ll = prefix + '/'//assets/css/grapes.min.css';
    }



    //var tmphtmlContent = $("body").html();
    var rawHtml = '';
    var tagEditOnly = true;
    if ((""+window.location).indexOf("editMode=static")>=0) {
	tagEditOnly = false;
    } else if ((""+window.location).indexOf("editMode=widget")>=0) {
      var div = document.getElementById("yourDivElement");
      var input = document.createElement("textarea");
        input.id = "injectHere";
        input.style = "display:none;";
/*
        if (input.hasOwnProperty('innerHTML')) {
		input.innerHTML = content.replaceAll(/\&nbsp;/g, ' ').replaceAll(/<br\s*\/?>/mg,"\n\r");
        } else {
		input.innerText = content.replaceAll(/\&nbsp;/g, ' ').replaceAll(/<br\s*\/?>/mg,"\n\r");
	}
*/
	rawHtml = content;
        content = $('<div>').append(input).html();
	tagEditOnly = false;
    } else {

    }

    var editor = grapesjs.init({
        allowScripts: 1,
        showOffsets: 1,
        autorender: 0,
	tagEditorOnly: tagEditOnly,
        apiUrl: 'http://localhost:' + apiPort + '/api',
	locationprefix: ll,
        noticeOnUnload: 0,
        container  : '#gjs',
        height: '100%',
        components: content,
        rawHtml: rawHtml,
        headers: head,
        clearOnRender: 0,

        storageManager:{
          autoload: 0,
          storeComponents: 1,
          storeStyles: 1,
        }
    });


    // Assign handlers immediately after making the request,
    // and remember the jqxhr object for this request
    var jqxhr = $.get( "http://localhost:" + apiPort + "/api/templates?data=templates/blocks", function(data) {
       console.log("success");
       console.log(data);
       var len = data.length;
       var bm = editor.BlockManager;
       var pageManager = editor.PageManager;
       var staticBlock = getParameterByName('staticBlock');
       var onlyBasic = false;
       if (!(staticBlock === null)) {
	  onlyBasic = true;
       }
       for (var i = 0; i < len; i++) {
           var blockElement = data[i];

           if (blockElement.hasOwnProperty("ContentHtml")) {
             blockElement["content"] = blockElement["ContentHtml"];
           };

           if (onlyBasic) {
              if (blockElement.hasOwnProperty("category")) {
                if (blockElement.category == "Basic" || blockElement.category == "Layout") {
                    bm.add(blockElement.Name, blockElement);
    	        }
              }
	   } else {
              bm.add(blockElement.Name, blockElement);
	   }

           //convert item for block editing   ...
           var pageObj = JSON.parse(JSON.stringify(blockElement))
           //console.error("GOT PAGE OBJ")
           if (pageObj.content.hasOwnProperty("type")) {
             //cannot update these yet, as they are basic elements and not HTML Ones.
           } else {
               pageObj.category = 'Block';
               pageObj.command = 'block-edit';
               pageManager.add(pageObj.Name, pageObj);
           }
       }
    })
      .done(function(e) {
        //console.log("scucess done");
    })
      .fail(function(e) {
      //console.log('error');
      //console.log(e);
    })
      .always(function() {
        //console.log('get finished');
       setTimeout(function() {
          editor.afterLoaded()
          editor.render();
       }, 2000);
    });


/*
var bm = editor.BlockManager;
  bm.add('link-block', {
    label: 'Link Block',
    attributes: {class:'fa fa-link'},
    category: 'Basic',
    content: {
      type:'link',
      editable: false,
      droppable: true,
      style:{
        display: 'inline-block',
        padding: '5px',
        'min-height': '50px',
        'min-width': '50px'
      }
    },
  });
*/

    window.editor = editor;

   }

   function myJQueryCode() {
    //Do stuff with jQuery
    $("#acentera_ignore").remove()
    $("#acentera_js_ignore").remove()
    var scripts = document.getElementsByTagName("script");
      for (var i=0;i<scripts.length;i++) {
         if (scripts[i].src) {
             console.log("SRC:");
             console.log(scripts[i].id);
	     if (scripts[i].id.indexOf("acentera_ignore")>=0) {
		$('#' + scripts[i].id).remove();
	     } else {

	     }
	 } else {
             console.log("CONTENT:");
             console.log(i,scripts[i].innerHTML)
         }
    }

    var headStart = window.data.Data.indexOf("<head>") + 6
    if (headStart < 7) {
       headStart = window.data.Data.toLowerCase().indexOf("<head>") +6
    }

    if (headStart < 7) {
      headStart = 0;
    }

    var headEnd = window.data.Data.indexOf("</head>")
    if (headEnd < 0) {
       headEnd = window.data.Data.toLowerCase().indexOf("</head>") +7
    }
    var bodyStart = window.data.Data.indexOf("<body>") + 6
    if (bodyStart < 7) {
       bodyStart = window.data.Data.toLowerCase().indexOf("<body>") + 6
    } else {
    }
    if (bodyStart < 7) {
      bodyStart = 0;
    }

    var bodyEnd = window.data.Data.lastIndexOf("</body>")
    if (bodyEnd < 0) {
       bodyEnd = window.data.Data.toLowerCase().lastIndexOf("</body>")
    }
    var body = window.data.Data.substring(bodyStart,bodyEnd) // .replaceAll(" href=\"#"," data-href=\"#").replaceAll(" href=\"/#"," data-href=\"/#")
    var head = window.data.Data.substring(headStart, headEnd)
    var htmlContent = body;  //  window.data.Data; //$("body").html()
    var headContent = head;  //  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa


 //   var htmlContent = $("body").html()
 //   var headContent = $("head").html() //head;  //  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    // console.error("HTML CONTENT");
    // console.error(htmlContent);

    if(typeof grapejs=='undefined') {

       var headTag = document.getElementsByTagName("head")[0];

       var styles = document.createElement('link');
       styles.rel = 'stylesheet';
       styles.type = 'text/css';
       styles.media = 'screen';
       //styles.href = '/css/grapes.min.css';

       var prefix = window.editoradminprefix || getParameterByName('prefix') || "/";
       var jsPort = getParameterByName('jsPort') || window.location.port;
       console.log("AAAAAADF")
       console.log(window.editoradminindev)

       if (window.editoradminindev) {
          styles.href = window.editoradminindev + '/dist/css/grapes.min.css';
       } else {
          styles.href = prefix + '/assets/grapesjs/grapes.min.css';
       }
       //styles.href = '/css/grapes.min.css';

       headTag.appendChild(styles);

       var jqTag = document.createElement('script');
       jqTag.id="acentera_js_ignore",
       jqTag.type = 'text/javascript';
       //jqTag.src = '/js/grapes.min.js';
       //jqTag.src = 'http://localhost:' + jsPort + '/dist/grapes.min.js';
       if (window.editoradminindev) {
         jqTag.src = window.editoradminindev + '/dist/grapes.min.js';
       } else {
         jqTag.src = prefix + '/assets/grapesjs/grapes.min.js';
       }
       //jqTag.src = '/js/grapes.min.js';

       jqTag.onload = grapeCodeAsync(headContent, htmlContent);
       headTag.appendChild(jqTag);

       //<link rel="stylesheet" href="/css/grapes.min.css">
    } else {
        grapeCode(htmlContent);
    }


   }


   var adminPrefix = window.adminPrefix || "admin";
   if(typeof jQuery=='undefined') {
       var headTag = document.getElementsByTagName("head")[0];
       var jqTag = document.createElement('script');
       var tmp = document.getElementById("acentera_ignore").innerHTML.substring(document.getElementById("acentera_ignore").innerHTML.indexOf("prefix=")+7)
       tmp = tmp.substring(0,tmp.indexOf('"'))
       window.editoradminprefix = tmp;
       var isDev = document.getElementById("acentera_ignore").innerHTML.substring(document.getElementById("acentera_ignore").innerHTML.indexOf("indev=")+6)
       isDev = isDev.substring(0,isDev.indexOf('&'))
       window.editoradminindev = isDev;//+ tmp
       if (isDev.indexOf("8090") < 0) {
	        window.editoradminindev = null;
       }
       jqTag.id="acentera_js_ignore",
       jqTag.type = 'text/javascript';
       if (window.editoradminindev) {
         jqTag.src = window.editoradminindev + tmp + '/assets/js/jquery-2.0.3.min.js';
       } else {
         jqTag.src = tmp + '/assets/js/jquery-2.0.3.min.js';
       }
       jqTag.onload = myJQueryCode;
       headTag.appendChild(jqTag);
   } else {
        var tmp = document.getElementById("acentera_ignore").innerHTML.substring(document.getElementById("acentera_ignore").innerHTML.indexOf("prefix=")+7)
        tmp = tmp.substring(0,tmp.indexOf('"'))
        window.editoradminprefix = tmp + adminPrefix;
        var isDev = document.getElementById("acentera_ignore").innerHTML.substring(document.getElementById("acentera_ignore").innerHTML.indexOf("indev=")+6)
        isDev = isDev.substring(0,isDev.indexOf('&'))
        window.editoradminindev = isDev
        myJQueryCode();
   }
})();

/*
<div id="ignore">
<script src="http://code.jquery.com/jquery-2.2.0.min.js"></script>
<!--

<div id="gjs"></div>

<script type="text/javascript">
</script>
</div>
*/
