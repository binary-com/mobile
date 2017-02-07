/**
 * @name session-timout controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 02/04/2017
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.self-exclusion.controllers')
    .controller('SessionTimeoutController', SessionTimeout);

  SessionTimeout.$inject = ['$scope', '$translate',
                            'alertService', 'websocketService'];

  function SessionTimeout($scope, $translate,
      alertService, websocketService){
    var vm = this;
    var timeoutHasSet = false;

    $scope.$on('authorize', (e, response) => {
      websocketService.sendRequestFor.getSelfExclusion();
      timeoutHasSet = false;
    });

    $scope.$on('get-self-exclusion', (e, response) => {
      if(response.session_duration_limit && !timeoutHasSet){
        setTimeout(()=>{

          $translate(['self-exclusion.warning', 'self-exclusion.session-timeout-warning'])
            .then((translation) => {
              alertService.displayAlert(translation['self-exclusion.warning'],
                  translation['self-exclusion.session-timeout-warning']);
            });
          setTimeout(()=>{
            websocketService.logout();
          }, 10 * 1000);
        }, response.session_duration_limit * 60 * 1000);

        timeoutHasSet = true;
      }
    });

  }
})();
