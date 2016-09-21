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

    function NewAccountMaltainvest() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/new-real-account-opening/components/new-account-maltainvest/new-account-maltainvest.template.html',
            controller: 'NewAccountMaltainvestController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

          }
          return directive;
        }
      })();
