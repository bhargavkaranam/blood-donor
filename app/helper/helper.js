'use strict';
var data
exports.equals=function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};
 
exports.set=function(card){
    var section1= `<div class="card doc collapse in" >`;
    var section2=`<div class="phd-card-title phd-card-title--bordered m-t-3">
                    <p>${card.heading}</p>
                </div>`;
                
    var section3=`<div class="doc-temp">`;
     var section4='';
    var section5=`
                </div>
            </div>
            `;
            for (var block of card.block){
                section4+=`
                    <div class="p-y-1 doc-desc">
                    <p>${block.des}</p>
                    </div>
                    <div class="p-y-2 doc-img">
                        <span class="overlay">
                            <img src="{{address}}/resource/image/documentation/image${block.imgNo}.png" alt="Image" class="img-fluid">
                        </span>
                   </div>`;
            } 
   return section1+section2+section3+section4+section5;
    
};
exports.menuGenerator=function(menu){
    var toReturn='';
    for (var menuItem of menu){
        toReturn += `<a href="${menuItem.link}" class="list-group-item list-group-item-action">${menuItem.content}</a>`;
    }
    return toReturn;
}