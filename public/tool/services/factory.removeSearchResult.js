'use strict';
var app = angular.module('phive');

app.factory('searchResult',['getFirebaseRef','$http','$q',function(getFirebaseRef,$http,$q){
    var ref = getFirebaseRef.ref;
    var remove = function(hashId){
        return $q(function(resolve,reject){
            if(hashId){
            var restdata = {
                hashId:hashId
            }
            $http.get('/validateHashId',{params:restdata}).then(function(validateRes){
                if(typeof(validateRes)==='object'){
                    var validated = validateRes.data;
                    if(typeof(validated)==='boolean'&& validated){
                    //
                    //hashId is valid
                    //
                    ref.child('users').child(hashId).child('searchResults').remove(function(err){
                        if(err){
                            console.log('not able to delete the searchResults');
                            reject(err);
                        }else{
                         //   console.log('success:: searchResults deleted ');
                            resolve();
                        }
                    })
                    }else{
                        console.log('invalid hashId : during remove search result');
                        reject('not a valid hashId');
                    }
                }else{
                     console.log('some thing went wrong during validating hashId in removeSearchResult');
                    reject('some thing went wrong during validating hashId in removeSearchResult');
                }

        },function(err){
            console.log('some thing went wrong during validating hashId in removeSearchResult');
            reject(err);
        })
        }else{
            console.log('no hashId in the parameter');
            reject('you must pass hashId to remove searchResutl');
        }
        });
    }
    return {
        remove:remove
    }
}])