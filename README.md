# ctrBindHelper
以不一样的方式组织和编写基于jQuery的前端代码，给你不一样的体验
## Pre-required：jQuery and jQuery ui
### Single bind example
```html
   <select id="testSelect"></select>
   
   <script>
   //single bind
    var option = {
        el: '#testSelect',
        bindType: 'selectBind',
        dataSource: ['please select', '1', '2', '3', '4', '5']
    };

    $ctrBindHelper(option).bindData();
   </script>
```

### Bind with callback
```html
<select id="selectCb"></select>

//bind with callback
<script>
   var option1 = {
       el: '#selectCb',
       bindType: 'selectBind',
       dataSource: ['please select', '1', '2', '3', '4', '5'],
       changeCb: function (e) {
            console.log(e.target.value);
       }
   };
   
   $ctrBindHelper(option1).bindData();
 </script>
```
### Customized binding
```html
  <div id="custCtrl"></div>
  
  <script>
    var option2 = {
        el: '#custCtrl',
        bindType: 'cust'
     };

     var bind = $ctrBindHelper(option2).addBindType('cust', function (opt) {
         $(opt.el).text('hello world ' + opt.bindType);
     }).bindData();
  </script>
```

### Multiple bind at the same time
```html
 <ul id="lt1"></ul>
 <ul id="lt2"></ul>
 
 <script>
    var option3 = {
        el: '#lt1',
        bindType: 'listBind',
        dataSource: ['please select', '1', '2', '3', '4', '5']
     };

    var option4 = {
       el: '#lt2',
       bindType: 'listBind',
       dataSource: ['please select', '6', '7', '8', '9', '10']
     };

     $ctrBindHelper([option3,option4]).bindAll();
 </scrpt>
```
