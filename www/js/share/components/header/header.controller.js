/**
 * @name header controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/08/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components')
        .controller('HeaderController', Header);

    Header.$inject = ['$scope', '$state',
        '$ionicHistory', '$ionicSideMenuDelegate',
        'appStateService',
    ];

    function Header($scope, $state,
        $ionicHistory, $ionicSideMenuDelegate,
        appStateService) {
        var vm = this;
        vm.hideMenuButton = false;
        vm.disableMenuButton = false;
        vm.disableBackButton = false;
        vm.showBack = false;
        $ionicSideMenuDelegate.canDragContent(false);
        $ionicHistory.backView(null);
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        vm.toggleSideMenu = function() {
            if (appStateService.tradeMode || !appStateService.purchaseMode) {
                $ionicSideMenuDelegate.toggleLeft();
            }
        }

        $scope.$watch(function () {
          return $ionicSideMenuDelegate.isOpenLeft();
        },
        function (isOpen) {
          if (isOpen){
            vm.hideMenuButton = true;
            vm.showBack = true;
          }
          else {
            vm.hideMenuButton = false;
            vm.showBack = false;
          }

   });

        $scope.$watch(
            () => {
                return appStateService.purchaseMode
            },
            () => {
                vm.disableMenuButton = appStateService.purchaseMode;
            }
        );

        $scope.$watch(
            () => {
                return appStateService.passwordChanged
            },
            () => {
                vm.disableBackButton = appStateService.passwordChanged;
            }
        );

        $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            vm.to = to;
            vm.from = from;
            if (['transaction-detail', 'language', 'profile', 'self-exclusion', 'change-password', 'trading-times', 'asset-index', 'limits'].indexOf(vm.to.name) > -1) {
                vm.hideMenuButton = true;
                vm.showBack = true;
            } else if (['terms-and-conditions'].indexOf(vm.to.name) > -1) {
                vm.hideMenuButton = true;
                vm.showBack = false;
            } else if (['financial-assessment'].indexOf(vm.to.name) > -1) {
                if (appStateService.hasToRedirectToFinancialAssessment) {
                    vm.hideMenuButton = true;
                    vm.showBack = false;
                } else {
                    vm.hideMenuButton = true;
                    vm.showBack = true;
                }
            } else if (['tax-information'].indexOf(vm.to.name) > -1) {
                if (appStateService.hasToRedirectToTaxInformation) {
                    vm.hideMenuButton = true;
                    vm.showBack = false;
                } else {
                    vm.hideMenuButton = true;
                    vm.showBack = true;
                }
            } else {
                if (vm.from.name === 'statement' && vm.to.name !== 'transactiondetail' && document.getElementsByClassName('realitycheck').length > 0) {
                    $('.popup-container').addClass('popup-showing');
                    $('body').addClass('popup-open');
                    $('.backdrop').addClass('visible');
                }
                vm.hideMenuButton = false;
                vm.showBack = false;
                if (vm.from.name === 'profit-table') {
                    appStateService.isProfitTableSet = false;
                }
                if (vm.from.name === 'statement') {
                    appStateService.isStatementSet = false;
                }
            }
        });

        // back button function
        vm.goToPrevPage = function() {
          if ($ionicSideMenuDelegate.isOpen()) {
            $ionicSideMenuDelegate.toggleLeft();
          }
          else {
            $state.go(vm.from);
          }
        };

    }
})();
