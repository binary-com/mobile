/**
 * @name session-storage service
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/24/2017
 * @copyright Binary Ltd
 *
 */

(function(){
  'use strict';

  angular
    .module('binary')
    .factory('sessionStorageService', SessionStorage);

  function SessionStorage(){
    var factory = {};

    factory.getItem = function(itemName){

      var item = sessionStorage.getItem(itemName);
      if(_.isEmpty(item) || item === "undefined"){
        return null;
      }
      return item;
    };

    return factory;
  }
})();
