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
            if (['transactiondetail', 'language', 'profile', 'self-exclusion', 'change-password', 'trading-times'].indexOf(vm.to.name) > -1) {
                vm.hideMenuButton = true;
                vm.showBack = true;
            } else if (['acceptTermsAndConditions'].indexOf(vm.to.name) > -1) {
                vm.hideMenuButton = true;
                vm.showBack = false;
            } else if (['financial-assessment'].indexOf(vm.to.name) > -1 && appStateService.hasToFillFinancialAssessment) {
                vm.hideMenuButton = true;
                vm.showBack = false;
            } else {
              if(vm.from.name === 'statement' && vm.to.name !== 'transactiondetail' && document.getElementsByClassName('realitycheck')) {
                $('.popup-container').addClass('popup-showing');
                $('body').addClass('popup-open');
                $('.backdrop').addClass('visible');
              }
                vm.hideMenuButton = false;
                vm.showBack = false;
                if (vm.from.name == 'profittable') {
                    appStateService.isProfitTableSet = false;
                }
                if (vm.from.name == 'statement') {
                    appStateService.isStatementSet = false;
                }
            }
        });

        // back button function
        vm.goToPrevPage = function() {
            $state.go(vm.from);

        };


    }
})();
