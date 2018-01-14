
##Selo 


Selo is a trigger **end** of the custom selection text and fires event. [see](https://developer.mozilla.org/en-US/docs/Web/Events/selectionchange) 

####İnstall

```npm i selo -S```

##Set properties & Use


```
<script src="selopath/selo.min.js"></script>
//or
var Selo = require('selo');
//or
import Selo from 'require'

var Selo = new Selo({
  log:false,
  els : '.arena'
});


document.addEventListener('selectionEnd',function () {
  console.log("End",Selo.getPositionRange())
  document.querySelector('span').innerText = "End"
})

document.addEventListener('selectionStart',function () {
  console.log("Start")
  document.querySelector('span').innerText = "Start"
})

document.addEventListener('selectionBeforeStart',function () {
  console.log("Before Start")
  document.querySelector('span').innerText = "Before Start"
})

```
