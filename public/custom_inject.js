               
            //    'use strict';
            //     //trying to connect 
            //     var oldDiv = document.getElementById('popUpContainer');
            //     var connectionShow = document.createElement("style");
            //     var styleType = document.createTextNode(".hideConnectionCheck{ display:none!important; } #connectionCheck p{margin:0!important;padding:10px 0!important;}");
            //     connectionShow.appendChild(styleType);

            //     var connectionContainer = document.createElement("div");
            //     connectionContainer.setAttribute("id", "connectionCheck");
            //     connectionContainer.setAttribute("class", "hideConnectionCheck");
            //     connectionContainer.setAttribute("style", "position: fixed; bottom:1%; left:0; min-width:250px; max-width:300px; background-color:rgba(0,0,0,.5);color:white; text-align:center; font: 14px sans-serif; border-radius: 3px; box-shadow: 0px 2px 6px rgba(0,0,0,.8); z-index:1031;display: flex;align-items:center;justify-content: center;"); 
            //     var connectionMsgBox = document.createElement("p");
            //     var connectionMsg =	document.createTextNode("You are working offline....");
            //     connectionMsgBox.appendChild(connectionMsg);
            //     connectionContainer.appendChild(connectionMsgBox);
                
            //     document.body.insertBefore(connectionShow, oldDiv);
            //     document.body.insertBefore(connectionContainer, oldDiv);
            //        if(!navigator.onLine){
            //             document.getElementById('connectionCheck').classList.remove('hideConnectionCheck');
            //         }
            //         else{
            //               document.getElementById('connectionCheck').classList.add('hideConnectionCheck');
            //         }
            //     window.addEventListener('online',  function(){
            //         document.getElementById('connectionCheck').classList.add('hideConnectionCheck');
            //     });
            //     window.addEventListener('offline',  function(){
            //         document.getElementById('connectionCheck').classList.remove('hideConnectionCheck');
            //     });


                //appSynced Popup
                // var syncContainer = document.createElement("div");
                // syncContainer.setAttribute("id", "");
                // syncContainer.setAttribute("style", "position:fixed; top:200px; left:350px; background-color: #444; color: #fff; text-align:center; font: 16px sans-serif; border-radius: 3px; box-shadow: 0px 2px 6px rgba(0,0,0,.8);");
                
                // var syncMsgBody = document.createElement("p");
                // syncMsgBody.setAttribute("style", "padding: 20px; margin: 0px;");
                // var syncMsg = document.createTextNode("App synced. Wait! Now you can browse offline");
                // syncMsgBody.appendChild(syncMsg);

                // var syncBtn = document.createElement("a");
                // syncBtn.setAttribute("href", "");
                // syncBtn.setAttribute("style", "display: inline-block; padding: 2px 25px; margin: 0 0 15px 0; font-size: 16px; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; text-decoration: none; color: #fd586f;")
                // syncBtnText = document.createTextNode("OK!");
                // syncBtn.appendChild(syncBtnText);

                // syncContainer.appendChild(syncMsgBody);
                // syncContainer.appendChild(syncBtn);

                // document.body.insertBefore(syncContainer, oldDiv);