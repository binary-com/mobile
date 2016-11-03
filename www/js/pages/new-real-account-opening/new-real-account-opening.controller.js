/**
 * @name new-real-account-opening controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.new-real-account-opening.controllers')
        .controller('NewRealAccountOpeningController', NewRealAccountOpeningController);

    NewRealAccountOpeningController.$inject = ['$scope', 'appStateService'];

    function NewRealAccountOpeningController($scope, appStateService) {
      var vm = this;
      vm.isNewAccountReal = false;
      vm.isNewAccountMaltainvest = false;
      $scope.$applyAsync(() => {
        if(appStateService.isNewAccountReal){
          vm.isNewAccountReal = true;
          vm.isNewAccountMaltainvest = false;
        }
        if(appStateService.isNewAccountMaltainvest){
          vm.isNewAccountMaltainvest = true;
          vm.isNewAccountReal = false;
        }
      });

		}})();
