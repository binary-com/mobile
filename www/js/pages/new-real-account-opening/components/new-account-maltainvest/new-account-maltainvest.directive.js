/**
 * @name new-account-real directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.new-real-account-opening.components.new-account-maltainvest')
        .directive('bgNewAccountMaltainvest', NewAccountMaltainvest);
        NewAccountMaltainvest.$inject = ['accountService',
		      'languageService',
		      'websocketService',
		      'alertService',
		      '$state',
		      'appStateService',
		      '$rootScope',
		      '$location', '$compile'];

    function NewAccountMaltainvest() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/new-real-account-opening/components/new-account-maltainvest/new-account-maltainvest.template.html',
            controller: 'NewAccountMaltainvestController',
            controllerAs: 'vm'

          }
          return directive;
        }
      })();
