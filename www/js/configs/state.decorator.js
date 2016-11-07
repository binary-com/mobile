/**
 * @name angular-ui $state decorator
 * @author Morteza Tavanarad
 * @contributors []
 * @since 11/07/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary')
    .config(StateDecorator);

  function StateDecorator($provide){
    $provide.decorator('$state',  ['$delegate', '$rootScope', function($delegate, $rootScope){
      var $state = $delegate;
      $state.previous = undefined;

      $state.goBack = function(){
        if($state.previous){
          $state.go($state.previous.name);
        }
      }

      $rootScope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams){
        $state.previous = {
          name: from,
          params: fromParams
        };
      });

      return $state;
    }]);
  }


})();
