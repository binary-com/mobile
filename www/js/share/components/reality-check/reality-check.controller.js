/**
 * @name reality-check controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.reality-check.controllers')
        .controller('RealityCheckController', RealityCheck);

    RealityCheck.$inject = [
      '$scope', '$timeout', '$translate', '$location',
      '$state', '$ionicPopup', 'websocketService',
      'appStateService', 'accountService', 'alertService',
      'languageService', 'proposalService'];

    function RealityCheck(
        $scope, $timeout, $translate, $location, $state,
        $ionicPopup, websocketService, appStateService,
        accountService, alertService, languageService, proposalService) {
			var vm = this;
    var landingCompanyName;
    vm.integerError = false;

    $scope.$on('authorize', function(e, authorize) {
      vm.sessionLoginId = authorize.loginid;
      if(!appStateService.realityCheckLogin) {
        appStateService.realityCheckLogin = true;
        // check if user is not already authorized, account is real money account  & is not changed in app
        if (!appStateService.isRealityChecked && authorize.is_virtual == 0 && !appStateService.isChangedAccount) {
          landingCompanyName = authorize.landing_company_name;
          websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
        }
        // check if user is already authorized, account changed and is virtual money account
        else if (appStateService.isRealityChecked && appStateService.isChangedAccount && authorize.is_virtual == 1) {
          $timeout.cancel(vm.realityCheckTimeout);
          appStateService.isChangedAccount = false;
          appStateService.isRealityChecked = true;
          if(!_.isEmpty(sessionStorage.realityCheckStart)){
            sessionStorage.removeItem('realityCheckStart');
          }
          if(!_.isEmpty(sessionStorage.start)){
            sessionStorage.removeItem('start');
          }
        }
        // check if account is changed and is real money account
        else if (appStateService.isRealityChecked && appStateService.isChangedAccount && authorize.is_virtual == 0) {
          if (vm.realityCheckTimeout) {
            $timeout.cancel(vm.realityCheckTimeout);
          }
          if(!_.isEmpty(sessionStorage.realityCheckStart)){
            sessionStorage.removeItem('realityCheckStart');
          }
          if(!_.isEmpty(sessionStorage.start)){
            sessionStorage.removeItem('start');
          }
          appStateService.isRealityChecked = false;
          landingCompanyName = authorize.landing_company_name;
          websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
          appStateService.isChangedAccount = false;
        }
        else if(!appStateService.isRealityChecked && appStateService.isChangedAccount && authorize.is_virtual == 0){
          if (vm.realityCheckTimeout) {
            $timeout.cancel(vm.realityCheckTimeout);
          }
          if(!_.isEmpty(sessionStorage.realityCheckStart)){
            sessionStorage.removeItem('realityCheckStart');
          }
          if(!_.isEmpty(sessionStorage.start)){
            sessionStorage.removeItem('start');
          }
          appStateService.isRealityChecked = false;
          landingCompanyName = authorize.landing_company_name;
          websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
          appStateService.isChangedAccount = false;
        }
      }

    });

    $scope.$on('landing_company_details', function(e, landingCompanyDetails) {
      if (landingCompanyDetails.has_reality_check === 1) {
        vm.hasRealityCheck();
      }
    });

    vm.setInterval = function setInterval(val) {
      var set = sessionStorage.setItem('_interval', val);
    };
    vm.setStart = function setInterval(val) {
      var set = sessionStorage.setItem('start', val);
    };

    vm.getInterval = function(key) {
      return sessionStorage.getItem(key);
    };
    vm.getStart = function(key) {
      return sessionStorage.getItem(key);
    };

    vm.removeInterval = function(key) {
      var remove = sessionStorage.removeItem(key);
    };
    vm.removeStart = function(key) {
      var remove = sessionStorage.removeItem(key);
    };

    vm.hasRealityCheck = function() {
      // if not asked the interval from user and the start time of reality check popups are not set in sessionStorage
      if (!appStateService.isRealityChecked && _.isEmpty(sessionStorage._interval) == true) {
        vm.realityCheck();
      }
      // if not asked the interval from user and the start time of reality check popups are set in sessionStorage
      // happens when user refresh the browser
      else if (!appStateService.isRealityChecked && !_.isEmpty(sessionStorage.start)) {
        appStateService.isRealityChecked = true;
        // calculate the difference between time of last popup and current time
        var timeGap = vm.getStart('start');
        var thisTime = (new Date()).getTime();
        // if the difference above is smaller than the interval set the period for popup timeout to remained time
        if ((vm.getInterval('_interval') * 60000) - (thisTime - timeGap) > 0) {
          var period = (vm.getInterval('_interval') * 60000) - (thisTime - timeGap);
          vm.realityCheckTimeout = $timeout(vm.getRealityCheck, period);
        }
      }
      // if user did not refresh the app and the interval is set
      else {
        if (_.isEmpty(sessionStorage._interval) == false) {
          var period = vm.getInterval('_interval') * 60000;
          vm.realityCheckTimeout = $timeout(vm.getRealityCheck, period);
        }
      }
    }


    vm.realityCheck = function() {
      appStateService.isRealityChecked = true;
      vm.data = {};
      vm.data.interval = 60;
      if(!appStateService.isPopupOpen){
        appStateService.isPopupOpen = true;
        $translate(['realitycheck.continue', 'realitycheck.title'])
          .then(function(translation) {
              alertService.displayRealitCheckInterval(
                translation['realitycheck.title'],
                'realitycheck getinterval',
                $scope,
                'js/share/components/reality-check/interval-popup.template.html', [{
                  text: translation['realitycheck.continue'],
                  type: 'button-positive',
                  onTap: function(e) {
                    if (vm.data.interval <= 120 && vm.data.interval >= 10 && !vm.integerError) {
                      vm.setInterval(vm.data.interval);
                      vm.data.start_interval = (new Date()).getTime();
                      vm.setStart(vm.data.start_interval);
                      vm.hasRealityCheck();
                      appStateService.isPopupOpen = false;
                      sessionStorage.setItem('realityCheckStart', Date.now());
                    } else {
                      e.preventDefault();
                    }
                  }
                }, ]);
            }
          )
      }


    };

    vm.getLastInterval = function() {
      vm.removeInterval('_interval');
      vm.setInterval(vm.data.interval);
    };

    $scope.$on('reality_check', function(e, reality_check) {
      vm.alertRealityCheck(reality_check);
    });


    vm.getRealityCheck = function() {
      websocketService.sendRequestFor.realityCheck();
    }
    vm.sessionTime = function(reality_check) {
      vm.realityCheckitems.start_time = sessionStorage.getItem('realityCheckStart');
      vm.now = Date.now();
      vm.duration = (vm.now - vm.realityCheckitems.start_time);
      vm.realityCheckitems.days = Math.floor(vm.duration / 864e5);
      vm.hour = vm.duration - (vm.realityCheckitems.days * 864e5);
      vm.realityCheckitems.hours = Math.floor(vm.hour / 36e5);
      vm.min = vm.duration - ((vm.realityCheckitems.days * 864e5) + (vm.realityCheckitems.hours * 36e5));
      vm.realityCheckitems.minutes = Math.floor(vm.min / 60000);
    }

    vm.logout = function() {
      alertService.confirmRemoveAllAccount(
        function(res) {
          if (typeof(res) !== "boolean") {
            if (res == 1)
              res = true;
            else
              res = false;
          }

          if (res) {
            websocketService.logout();
          }
          if (!res) {
            vm.hasRealityCheck();
          }
        }
      );
    };

    vm.alertRealityCheck = function(reality_check) {
      vm.removeStart('start');
      vm.realityCheckitems = reality_check;
      if (vm.sessionLoginId == vm.realityCheckitems.loginid && !appStateService.isPopupOpen) {
        vm.sessionTime(reality_check);
        vm.data = {};
        vm.data.interval = parseInt(vm.getInterval('_interval'));
        $timeout.cancel(vm.realityCheckTimeout);
        appStateService.isPopupOpen = true;
        $translate(['realitycheck.title', 'realitycheck.continue', 'realitycheck.logout', 'realitycheck.view_statement'])
          .then(
            function(translation) {
              alertService.displayRealityCheckResult(
                translation['realitycheck.title'],
                'realitycheck result-popup',
                $scope,
                'js/share/components/reality-check/reality-check-result.template.html', [{
                  text: translation['realitycheck.logout'],
                  type: 'button-secondary',
                  onTap: function() {
                    vm.logout();
                  }
                }, {
                  text: translation['realitycheck.view_statement'],
                  type: 'button-positive',
                  onTap: function(e) {
                    $state.go('statement');
                    $('.popup-container').removeClass('popup-showing');
                    $('body').removeClass('popup-open');
                    $('.backdrop').removeClass('visible');
                    e.preventDefault();
                  }
                }, {
                  text: translation['realitycheck.continue'],
                  type: 'button-positive',
                  onTap: function(e) {

                    if (vm.data.interval <= 120 && vm.data.interval >= 10 && !vm.integerError) {
                      if (vm.sessionLoginId == vm.realityCheckitems.loginid) {
                        vm.getLastInterval(vm.data.interval);
                        vm.data.start_interval = (new Date()).getTime();
                        vm.setStart(vm.data.start_interval);
                        vm.hasRealityCheck();
                        appStateService.isPopupOpen = false;
                      }
                    } else {
                      e.preventDefault();
                    }
                  }
                }]
              );
            }
          )
      }
    }

    $scope.$watch('vm.data.interval', () => {
      if(appStateService.isPopupOpen && !((Math.floor(vm.data.interval) === vm.data.interval) && $.isNumeric(vm.data.interval))) {
        vm.integerError = true;
      }
      else {
        vm.integerError = false;
      }
    });

    };
	})();
