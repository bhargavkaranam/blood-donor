

 (function(){
     new Clipboard('#copy-button');
    function locationHashChanged() {
      console.time('loop1');
      var sidebar = document.getElementById('sidebar-wrapper');
      if(sidebar){
      var selector = "a[href='"+location.hash+"']";
            var _el = sidebar.querySelectorAll('a[href]');
            for(var i= 0 ;i<_el.length;i++){
              _el[i].classList.remove('phd_selected');
            }
             var el = sidebar.querySelector(selector);
             if(el){
               el.classList.add('phd_selected');
            console.log(el);
             }
            
      }
      }
    window.onhashchange = locationHashChanged;
})();

(function(){
 if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
  Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" && 
    isFinite(value) && 
    Math.floor(value) === value;
};
}
})();
// function showDiv() {
//     document.getElementById("alert-copy").style.display = "block";
// }

