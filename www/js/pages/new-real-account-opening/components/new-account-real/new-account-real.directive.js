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
        .module('binary.pages.new-real-account-opening.components.new-account-real')
        .directive('bgNewAccountReal', NewAccountReal);

    function NewAccountReal() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/new-real-account-opening/components/new-account-real/new-account-real.template.html',
            controller: 'NewAccountRealController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

          }
          return directive;
        }
      })();
