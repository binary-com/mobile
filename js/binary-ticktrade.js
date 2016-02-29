/**
 * @name Binary Module
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * The main module of binary app
 */
angular.module('binary', [
  'ionic',
  'pascalprecht.translate',
  'hmTouchEvents',
  'ngIOS9UIWebViewPatch'
]);
angular.module('binary').run([
  '$rootScope',
  '$ionicPlatform',
  '$state',
  'alertService',
  'accountService',
  'appStateService',
  function ($rootScope, $ionicPlatform, $state, alertService, accountService, appStateService) {
    $ionicPlatform.ready(function () {
      // Setup Google Analytics
      if (typeof analytics !== 'undefined') {
        analytics.startTrackerWithId('UA-40877026-7');
      } else {
        console.log('Google Analytics Unavailable');
      }
      // Handle the android's hardware button
      $ionicPlatform.registerBackButtonAction(function () {
        if ($state.current.name === 'options') {
          alertService.confirmExit(function (res) {
            if (res == 1)
              navigator.app.exitApp();
          });
        } else if ($state.current.name === 'signin' || $state.current.name === 'home') {
          navigator.app.exitApp();
        } else if ($state.current.name === 'trade' && appStateService.purchaseMode) {
          return;
        } else if ($state.current.name === 'trade' && !appStateService.purchaseMode && !appStateService.tradeMode) {
          appStateService.tradeMode = true;
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        } else {
          navigator.app.backHistory();
        }
      }, 100);
      // Redirecting to the login page if there is not any default token
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.name != 'signin' && toState.name != 'help' && !accountService.getDefault()) {
          event.preventDefault();
          $state.go('signin');
        }
      });
    });
  }
]);
/**
 * ==================  angular-ios9-uiwebview.patch.js v1.1.1 ==================
 *
 * This patch works around iOS9 UIWebView regression that causes infinite digest
 * errors in Angular.
 *
 * The patch can be applied to Angular 1.2.0 – 1.4.5. Newer versions of Angular
 * have the workaround baked in.
 *
 * To apply this patch load/bundle this file with your application and add a
 * dependency on the "ngIOS9UIWebViewPatch" module to your main app module.
 *
 * For example:
 *
 * ```
 * angular.module('myApp', ['ngRoute'])`
 * ```
 *
 * becomes
 *
 * ```
 * angular.module('myApp', ['ngRoute', 'ngIOS9UIWebViewPatch'])
 * ```
 *
 *
 * More info:
 * - https://openradar.appspot.com/22186109
 * - https://github.com/angular/angular.js/issues/12241
 * - https://github.com/driftyco/ionic/issues/4082
 *
 *
 * @license AngularJS
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
angular.module('ngIOS9UIWebViewPatch', ['ng']).config([
  '$provide',
  function ($provide) {
    'use strict';
    $provide.decorator('$browser', [
      '$delegate',
      '$window',
      function ($delegate, $window) {
        if (isIOS9UIWebView($window.navigator.userAgent)) {
          return applyIOS9Shim($delegate);
        }
        return $delegate;
        function isIOS9UIWebView(userAgent) {
          return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
        }
        function applyIOS9Shim(browser) {
          var pendingLocationUrl = null;
          var originalUrlFn = browser.url;
          browser.url = function () {
            if (arguments.length) {
              pendingLocationUrl = arguments[0];
              return originalUrlFn.apply(browser, arguments);
            }
            return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
          };
          window.addEventListener('popstate', clearPendingLocationUrl, false);
          window.addEventListener('hashchange', clearPendingLocationUrl, false);
          function clearPendingLocationUrl() {
            pendingLocationUrl = null;
          }
          return browser;
        }
      }
    ]);
  }
]);
/**
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */
angular.module('binary').constant('config', {
  'tradeCategories': [
    {
      name: 'Up/Down',
      value: 'UP/DOWN'
    },
    {
      name: 'Digit Match/Differs',
      value: 'MATCH/DIFF',
      digits: true
    },
    {
      name: 'Digit Even/Odd',
      value: 'EVEN/ODD'
    },
    {
      name: 'Digit Over/Under',
      value: 'OVER/UNDER',
      digits: true
    }
  ],
  'tradeTypes': [
    {
      name: 'Up',
      value: 'CALL',
      markets: [
        'forex',
        'random'
      ],
      digits: false,
      category: 'UP/DOWN'
    },
    {
      name: 'Down',
      value: 'PUT',
      markets: [
        'forex',
        'random'
      ],
      digits: false,
      category: 'UP/DOWN'
    },
    {
      name: 'Digit Match',
      value: 'DIGITMATCH',
      markets: ['random'],
      digits: true,
      category: 'MATCH/DIFF'
    },
    {
      name: 'Digit Differs',
      value: 'DIGITDIFF',
      markets: ['random'],
      digits: true,
      category: 'MATCH/DIFF'
    },
    {
      name: 'Digit Even',
      value: 'DIGITEVEN',
      markets: ['random'],
      category: 'EVEN/ODD'
    },
    {
      name: 'Digit Odd',
      value: 'DIGITODD',
      markets: ['random'],
      category: 'EVEN/ODD'
    },
    {
      name: 'Digit Over',
      value: 'DIGITOVER',
      markets: ['random'],
      digits: true,
      category: 'OVER/UNDER'
    },
    {
      name: 'Digit Under',
      value: 'DIGITUNDER',
      markets: ['random'],
      digits: true,
      category: 'OVER/UNDER'
    }
  ],
  'language': 'en',
  'assetIndexes': {
    symbol: 0,
    displayName: 1,
    contracts: 2,
    contractName: 0,
    contractDisplayName: 1,
    contractFrom: 2,
    contractTo: 3
  }
});
/**
 * @name states.config
 * @author Massih Hazrati
 * @contributors []
 * @since 11/4/2015
 * @copyright Binary Ltd
 */
angular.module('binary').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
      url: '/home',
      templateUrl: 'templates/pages/home.html',
      controller: 'HomeController'
    }).state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/pages/sign-in.html',
      controller: 'SignInController'
    }).state('help', {
      url: '/help',
      templateUrl: 'templates/pages/help.html',
      controller: 'HelpController'
    }).state('trade', {
      url: '/trade',
      cache: false,
      templateUrl: 'templates/pages/trade.html',
      controller: 'TradeController'
    }).state('options', {
      url: '/options',
      cache: false,
      templateUrl: 'templates/pages/options.html',
      controller: 'OptionsController'
    }).state('accounts', {
      url: '/accounts',
      cache: false,
      templateUrl: 'templates/pages/accounts.html',
      controller: 'AccountsController'
    });
    $urlRouterProvider.otherwise('/home');
  }
]);
/**
 * @name translation.config
 * @author Massih Hazrati
 * @contributors []
 * @since 11/4/2015
 * @copyright Binary Ltd
 */
angular.module('binary').config([
  '$translateProvider',
  function ($translateProvider) {
    var language = localStorage['language'] || 'en';
    $translateProvider.preferredLanguage(language);
    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    });
  }
]);
/**
 * @name AccountController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/19/2015
 * @copyright Binary Ltd
 * Handles user's accounts
 */
angular.module('binary').controller('AccountsController', [
  '$scope',
  '$rootScope',
  '$state',
  '$window',
  '$ionicPopup',
  'websocketService',
  'accountService',
  'alertService',
  'proposalService',
  'appStateService',
  'marketService',
  function ($scope, $rootScope, $state, $window, $ionicPopup, websocketService, accountService, alertService, proposalService, appStateService, marketService) {
    if (typeof analytics !== 'undefined') {
      analytics.trackView('Account Management');
    }
    $scope.navigateToOptionsPage = function () {
      $state.go('options', {}, { reload: true });
    };
    $scope.logout = function () {
      alertService.confirmRemoveAllAccount(function (res) {
        if (typeof res !== 'boolean') {
          if (res == 1)
            res = true;
          else
            res = false;
        }
        if (res) {
          accountService.removeAll();
          proposalService.remove();
          marketService.removeActiveSymbols();
          marketService.removeAssetIndex();
          appStateService.isLoggedin = false;
          $state.go('signin');
        }
      });
    };
  }
]);
/**
 * @name HelpController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles help's functionalities (wizard/how to)
 */
angular.module('binary').controller('HelpController', [
  '$scope',
  '$state',
  function ($scope, $state) {
    if (typeof analytics !== 'undefined') {
      analytics.trackView('Help');
    }
    $scope.backToSignInPage = function () {
      $state.go('signin');
    };
    $scope.openExternal = function ($event) {
      window.open($event.currentTarget.href, '_system');
      return false;
    };
  }
]);
/**
 * @name HomeController
 * @author Massih Hazrati
 * @contributors []
 * @since 11/16/2015
 * @copyright Binary Ltd
 */
angular.module('binary').controller('HomeController', [
  '$scope',
  '$state',
  'websocketService',
  'accountService',
  function ($scope, $state, websocketService, accountService) {
    var init = function () {
      if (typeof analytics !== 'undefined') {
        analytics.trackView('Home');
      }
      websocketService.init();
      if (accountService.hasDefault()) {
        accountService.validate();
      } else {
        $state.go('signin');
      }
    };
    init();
    $scope.$on('authorize', function (e, response) {
      if (response) {
        $state.go('options');
      } else {
        $state.go('signin');
      }
    });
  }
]);
/**
 * @name OptionsController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles changing contract's options
 */
angular.module('binary').controller('OptionsController', [
  '$scope',
  '$rootScope',
  '$state',
  '$window',
  'config',
  'proposalService',
  'accountService',
  'websocketService',
  'chartService',
  'delayService',
  'appStateService',
  function ($scope, $rootScope, $state, $window, config, proposalService, accountService, websocketService, chartService, delayService, appStateService) {
    $scope.selected = {};
    $scope.isDataLoaded = false;
    $scope.letsTrade = false;
    if (typeof analytics !== 'undefined') {
      analytics.trackView('Options');
    }
    websocketService.sendRequestFor.forgetAll('ticks');
    function updateSymbols() {
      if (!appStateService.isLoggedin) {
        setTimeout(updateSymbols, 500);
      } else {
        websocketService.sendRequestFor.symbols();
        websocketService.sendRequestFor.assetIndex();
      }
    }
    delayService.update('symbolsAndAssetIndexUpdate', function () {
      updateSymbols();
    }, 60 * 1000);
    function init() {
      var proposal = proposalService.get();
      if (proposal) {
        $scope.selected = {
          symbol: proposal.symbol,
          tradeType: proposal.contract_type,
          tick: proposal.duration,
          basis: proposal.basis,
          market: proposal.passthrough.market,
          digit: proposal.digit
        };
        // set selected category
        var tradeType = _.find(config.tradeTypes, [
            'value',
            proposal.contract_type
          ]);
        if (tradeType) {
          $scope.selected.tradeCategory = tradeType.category;
        }
        if (proposal.barrier) {
          $scope.selected.barrier = proposal.barrier;
        }
      }
    }
    init();
    $scope.navigateToManageAccounts = function () {
      $state.go('accounts');
    };
    $scope.navigateToTradePage = function () {
      $state.go('trade');
    };
    $scope.saveChanges = function () {
      var proposal = {
          symbol: $scope.selected.symbol,
          contract_type: $scope.selected.tradeType,
          duration: $scope.selected.tick,
          basis: $scope.selected.basis,
          currency: accountService.getDefault().currency,
          passthrough: { market: $scope.selected.market },
          digit: $scope.selected.digit,
          barrier: $scope.selected.barrier
        };
      proposalService.update(proposal);
    };
    $scope.$on('connection:reopened', function (e) {
    });
    $scope.$watch('selected', function (_newValue, _oldValue) {
      if (!angular.equals(_newValue, _oldValue)) {
        $scope.saveChanges();
      }
    }, true);
    $scope.setDataLoaded = function (stopSpinner, enableLetsTrade) {
      $scope.isDataLoaded = stopSpinner;
      $scope.letsTrade = _.isNil(enableLetsTrade) ? stopSpinner : enableLetsTrade;
    };
  }
]);
/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in page
 */
angular.module('binary').controller('SignInController', [
  '$scope',
  '$state',
  function ($scope, $state) {
    if (typeof analytics !== 'undefined') {
      analytics.trackView('Singin');
    }
    $scope.navigateToHelpPage = function () {
      $state.go('help');
    };
  }
]);
/**
 * @name TradeController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles trade's functionalities
 */
angular.module('binary').controller('TradeController', [
  '$scope',
  '$state',
  '$ionicSlideBoxDelegate',
  'marketService',
  'proposalService',
  'websocketService',
  'accountService',
  'alertService',
  'appStateService',
  function ($scope, $state, $ionicSlideBoxDelegate, marketService, proposalService, websocketService, accountService, alertService, appStateService) {
    appStateService.waitForProposal = false;
    window.addEventListener('native.keyboardhide', function (e) {
      $scope.hideFooter = false;
      $scope.$apply();
    });
    window.addEventListener('native.keyboardshow', function (e) {
      $scope.hideFooter = true;
      $scope.$apply();
    });
    $scope.setTradeMode = function (mode) {
      //$scope.tradeMode = mode;
      appStateService.tradeMode = mode;
    };
    $scope.getTradeMode = function () {
      return appStateService.tradeMode;
    };
    var init = function () {
      if (typeof analytics !== 'undefined') {
        analytics.trackView('Trade');
      }
      $scope.proposalToSend = JSON.parse(localStorage.proposal);
      $scope.setTradeMode(true);
      appStateService.purchaseMode = false;
      proposalService.getCurrencies();
    };
    init();
    $scope.$on('proposal', function (e, response) {
      $scope.proposalRecieved = response;
      appStateService.waitForProposal = false;
      $scope.$apply();
    });
    $scope.$on('currencies', function (e, response) {
      if (response && response.length > 0) {
        $scope.currency = response[0];
        $scope.$apply();
        var proposal = proposalService.get();
        if (proposal) {
          proposal.currency = response[0];
          proposalService.update(proposal);
          proposalService.send();
        }
      }
    });
    websocketService.sendRequestFor.forgetAll('balance');
    websocketService.sendRequestFor.balance();
    $scope.$on('balance', function (e, _balance) {
      $scope.account = _balance;
      $scope.$apply();
    });
    $scope.$on('purchase', function (e, _contractConfirmation) {
      if (_contractConfirmation.buy) {
        $scope.setTradeMode(false);
        appStateService.purchaseMode = true;
        $scope.contract = {
          contract_id: _contractConfirmation.buy.contract_id,
          longcode: _contractConfirmation.buy.longcode,
          payout: $scope.proposalRecieved.payout,
          cost: _contractConfirmation.buy.buy_price,
          profit: parseFloat($scope.proposalRecieved.payout) - parseFloat(_contractConfirmation.buy.buy_price),
          balance: _contractConfirmation.buy.balance_after,
          transaction_id: _contractConfirmation.buy.transaction_id
        };
        websocketService.sendRequestFor.portfolio();
        $scope.$apply();
      } else if (_contractConfirmation.error) {
        alertService.displayError(_contractConfirmation.error.message);
        $('.contract-purchase button').attr('disabled', false);
        proposalService.send();
      } else {
        alertService.contractError.notAvailable();
        $('.contract-purchase button').attr('disabled', false);
      }
      websocketService.sendRequestFor.balance();  // it's moved to first if
                                                  // websocketService.sendRequestFor.portfolio();
    });
    $scope.$on('purchase:error', function (e, _error) {
      $('.contract-purchase button').attr('disabled', false);
      appStateService.purchaseMode = false;
      proposalService.send();
    });
    $scope.$on('contract:finished', function (e, _contract) {
      if (_contract.exitSpot) {
        if (_contract.result === 'win') {
          $scope.contract.buyPrice = $scope.contract.cost;
          $scope.contract.profit = $scope.contract.profit;
          $scope.contract.finalPrice = $scope.contract.buyPrice + $scope.contract.profit;
          websocketService.sendRequestFor.openContract();
        } else if (_contract.result === 'lose') {
          $scope.contract.buyPrice = $scope.contract.cost;
          $scope.contract.loss = $scope.contract.cost * -1;
          $scope.contract.finalPrice = $scope.contract.buyPrice + $scope.contract.loss;
        }
        $scope.contract.result = _contract.result;
        // Unlock view to navigate
        appStateService.purchaseMode = false;
        proposalService.send();
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    });
    $scope.$on('proposal:open-contract', function (e, contract) {
      if (contract.is_expired) {
        websocketService.sendRequestFor.sellExpiredContract();
      }
    });
    $scope.navigateToOptionsPage = function ($event) {
      $state.go('options');
    };
    $scope.$on('connection:ready', function (e) {
      if (accountService.hasDefault()) {
        accountService.validate();
        //					websocketService.sendRequestFor.symbols();
        //					websocketService.sendRequestFor.assetIndex();
        $scope.proposalToSend = JSON.parse(localStorage.proposal);
        proposalService.send();
        if (appStateService.purchaseMode) {
          sendProfitTableRequest();
        }
      }
    });
    $scope.$on('profit_table:update', function (e, _profitTable, _passthrough) {
      if (_passthrough.hasOwnProperty('isConnectionReopen') && _passthrough.isConnectionReopen) {
        if (_profitTable.count > 0) {
          // Check that contract is finished or not after connection reopenning
          if (appStateService.purchaseMode) {
            // find the current contract in the portfolio-table list
            var transaction = _.find(_profitTable.transactions, [
                'transaction_id',
                $scope.contract.transaction_id
              ]);
            if (transaction) {
              var finishedContract = {};
              finishedContract.exitSpot = true;
              finishedContract.result = transaction.sell_price > 0 ? 'win' : 'lose';
              $scope.$broadcast('contract:finished', finishedContract);
            }
          }
        } else {
          // because there is not any items in profitTable, the user is navigating to trade mode view
          appStateService.purchaseMode = false;
          appStateService.tradeMode = true;
        }
      }
    });
    $scope.isContractFinished = function () {
      return !appStateService.purchaseMode;
    };
    $scope.getWaitForProposal = function () {
      return appStateService.waitForProposal;
    };
    function sendProfitTableRequest(params) {
      // Wait untile the login progress is finished
      if (!appStateService.isLoggedin) {
        setTimeout(sendProfitTableRequest, 500);
      } else {
        var conditions = {};
        // Format date to 'YYYY-MM-DD'
        conditions.date_from = new Date().toISOString().slice(0, 10);
        conditions.date_to = conditions.date_from;
        conditions.limit = 10;
        conditions.passthrough = { isConnectionReopen: true };
        websocketService.sendRequestFor.profitTable(conditions);
      }
    }
  }
]);
/**
 * @name contractSummary
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/28/2015
 * @copyright Binary Ltd
 */
angular.module('binary').filter('customCurrency', [
  '$filter',
  function ($filter) {
    return function (amount, currencySymbol) {
      var currency = $filter('currency');
      if (amount < 0) {
        return currency(amount, currencySymbol).replace('(', '-').replace(')', '');
      }
      return currency(amount, currencySymbol);
    };
  }
]);
/**
 * @name accountService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 */
angular.module('binary').service('accountService', [
  'websocketService',
  function (websocketService) {
    /**
			 * find a {key,value} in an array of objects and return its index
			 * returns -1 if not found
			 * @param  {Array of Objects} _accounts
			 * @param  {String} _key
			 * @param  {String, Number, Boolean} _value
			 * @return {Number} Index of the found array element
			 */
    var findIndex = function (_accounts, _key, _value) {
      var index = -1;
      _accounts.forEach(function (el, i) {
        if (_accounts[i][_key] === _value) {
          index = i;
        }
      });
      return index;
    };
    /**
			 * Check if the 'accounts' localStorage exist
			 * @return {Boolean}
			 */
    var storageExist = function () {
      return localStorage.accounts && JSON.parse(localStorage.accounts) instanceof Array;
    };
    /**
			 * Returns the list of all accounts
			 * @return {Array}
			 */
    this.getAll = function () {
      return storageExist() ? JSON.parse(localStorage.accounts) : [];
    };
    /**
			 * Removes the 'accounts' localStorage
			 */
    this.removeAll = function () {
      localStorage.removeItem('accounts');
    };
    /**
			 * Send a token for validation
			 * if '_token' param is not passed, validates the default token
			 * @param  {String} _token
			 */
    var validate = function (_token, extraParams) {
      if (_token) {
        websocketService.authenticate(_token, extraParams);
      } else {
        var accountList = this.getAll();
        var defaultAccountIndex = findIndex(accountList, 'is_default', true);
        // If default account exist
        if (defaultAccountIndex > -1) {
          var token = accountList[defaultAccountIndex].token;
          websocketService.authenticate(token, extraParams);
        }
      }
    };
    this.validate = function (_token, extraParams) {
      if (!_token) {
        var accountList = this.getAll();
        var defaultAccountIndex = findIndex(accountList, 'is_default', true);
        // If default account exist
        if (defaultAccountIndex > -1) {
          _token = accountList[defaultAccountIndex].token;
        }
      }
      validate(_token, extraParams);  // setInterval(function() {
                                      // 	validate(_token);
                                      // }, 1000);
    };
    /**
			 * Add an account to the 'accounts' localStorage
			 * @param {Object} _account
			 */
    this.add = function (_account) {
      var account = {
          id: _account.loginid,
          token: _account.token,
          currency: _account.currency,
          email: _account.email,
          is_default: false
        };
      var accountList = this.getAll();
      accountList.push(account);
      localStorage.accounts = JSON.stringify(accountList);
    };
    /**
			 * Removes an account from 'accounts' localStorage
			 * Doesn't remove the default account
			 * @param  {String} _token
			 */
    this.remove = function (_token) {
      var accountList = this.getAll();
      var index = findIndex(accountList, 'token', _token);
      // If the token exist and is not the default token
      if (index > -1 && accountList[index].is_default !== true) {
        accountList.splice(index, 1);
        localStorage.accounts = JSON.stringify(accountList);
      }
    };
    /**
			 * Set the passed token as the default account
			 * @param {String} _token
			 */
    this.setDefault = function (_token) {
      var accountList = this.getAll();
      var index = findIndex(accountList, 'token', _token);
      // Make sure the token exist
      if (index > -1) {
        accountList.forEach(function (el, i) {
          accountList[i].is_default = accountList[i].token === _token ? true : false;
        });
        localStorage.accounts = JSON.stringify(accountList);
      }
    };
    /**
			 * Check if the default account exist
			 * @return {Boolean}
			 */
    this.hasDefault = function () {
      var accountList = this.getAll();
      var index = findIndex(accountList, 'is_default', true);
      return index > -1 ? true : false;
    };
    /**
			 * Returns the default account
			 * @return {Object}
			 */
    this.getDefault = function () {
      var accountList = this.getAll();
      var index = findIndex(accountList, 'is_default', true);
      return accountList[index];
    };
    /**
			 * Check if the token/account is unique
			 * Only one token for each account is allowed
			 * @param  {String}  _id : loginid
			 * @return {Boolean}
			 */
    this.isUnique = function (_id) {
      var accountList = this.getAll();
      var index = findIndex(accountList, 'id', _id);
      return index > -1 ? false : true;
    };
  }
]);
/**
 * @name alertService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 */
angular.module('binary').service('alertService', [
  '$translate',
  '$ionicPopup',
  '$rootScope',
  function ($translate, $ionicPopup, $rootScope) {
    var displayAlert = function (_title, _message) {
      if (navigator.notification === undefined) {
        var alertPopup = $ionicPopup.alert({
            title: _title,
            template: _message
          });
      } else {
        navigator.notification.alert(_message, null, _title, 'OK');
      }
    };
    var displayConfirmation = function (_title, _message, _buttons, _callback) {
      if (navigator.notification === undefined) {
        var confirmPopup = $ionicPopup.confirm({
            title: _title,
            template: _message
          });
        confirmPopup.then(_callback);
      } else {
        navigator.notification.confirm(_message, _callback, _title, _buttons);
      }
    };
    this.displayError = function (_message) {
      $translate(['alert.error']).then(function (translation) {
        displayAlert(translation['alert.error'], _message);
      });
    };
    this.displaySymbolWarning = function (_message, _callback) {
      $translate([
        'alert.warning',
        _message
      ]).then(function (translation) {
        displayAlert(translation['alert.warning'], translation[_message]);
      });
    };
    this.accountError = {
      tokenNotValid: function () {
        $translate([
          'alert.error',
          'alert.not_valid'
        ]).then(function (translation) {
          displayAlert(translation['alert.error'], translation['alert.not_valid']);  //navigator.notification.alert(translation['alert.not_valid'], null, translation['alert.error'], 'OK');
        });
      },
      tokenNotAuthenticated: function () {
        $translate([
          'alert.error',
          'alert.not_auth'
        ]).then(function (translation) {
          displayAlert(translation['alert.error'], translation['alert.not_auth']);
        });
      },
      tokenNotUnique: function () {
        $translate([
          'alert.error',
          'alert.not_unique'
        ]).then(function (translation) {
          displayAlert(translation['alert.error'], translation['alert.not_unique']);
        });
      }
    };
    this.contractError = {
      notAvailable: function () {
        $translate([
          'alert.error',
          'alert.contract_error'
        ]).then(function (translation) {
          displayAlert(translation['alert.error'], translation['alert.contract_error']);
        });
      }
    };
    this.optionsError = {
      noTick: function () {
        $translate([
          'alert.error',
          'alert.no_tick'
        ]).then(function (translation) {
          displayAlert(translation['alert.error'], translation['alert.no_tick']);
        });
      }
    };
    this.displayAlert = function (_title, _message) {
      displayAlert(_title, _message);
    };
    this.confirmAccountRemoval = function (_token) {
      $translate([
        'alert.remove_token_title',
        'alert.remove_token_content'
      ]).then(function (translation) {
        displayConfirmation(translation['alert.remove_token_title'], translation['alert.remove_token_content'], [
          'Yes',
          'No'
        ], function (res) {
          if (!(typeof res === 'boolean')) {
            if (res == 1)
              res == true;
            else
              res = false;
          }
          if (res) {
            console.log('You are sure');
            $rootScope.$broadcast('token:remove', _token);
          }
        });
      });
    };
    this.confirmRemoveAllAccount = function (_callback) {
      $translate([
        'alert.remove_all_tokens_title',
        'alert.remove_all_tokens_content'
      ]).then(function (translation) {
        displayConfirmation(translation['alert.remove_all_tokens_title'], translation['alert.remove_all_tokens_content'], [
          'Yes',
          'No'
        ], _callback);
      });
    };
    this.confirmExit = function (_callback) {
      $translate([
        'app.exit_title',
        'app.exit_confirmation'
      ]).then(function (translation) {
        displayConfirmation(translation['app.exit_title'], translation['app.exit_confirmation'], [
          'Yes',
          'No'
        ], _callback);
      });
    };
  }
]);
/**
 * @name appStateService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 05/02/2016
 * @copyright Binary Ltd
 * Keeping state of the app in this factory
 */
angular.module('binary').factory('appStateService', function () {
  var factory = {};
  factory.tradeMode = true;
  factory.purchaseMode = false;
  factory.isLoggedin = false;
  factory.waitForProposal = false;
  return factory;
});
/**
 * @name appVersionService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/20/2016
 * @copyright Binary Ltd
 */
angular.module('binary').factory('appVersionService', [
  '$http',
  function ($http) {
    var appVersion = {};
    function getAppVersion() {
      return $http.get('js/config.json');
    }
    appVersion.getAppVersion = getAppVersion;
    return appVersion;
  }
]);
/**
 * @name chartService 
 * @author Amin Marashi
 * @contributors []
 * @since 11/25/2015
 * @copyright Binary Ltd
 */
angular.module('binary').factory('chartService', [
  '$rootScope',
  function ($rootScope) {
    var localHistory, chartDrawer, contractCtrls = [];
    /* Define ChartJS Options */
    var reversedIndex = function reversedIndex(i) {
      return chartGlobals.tickCount - 1 - i;
    };
    var distribute = function distribute(i) {
      var distance = Math.ceil(chartGlobals.tickCount / chartGlobals.minTickCount);
      if (reversedIndex(i) % distance === 0) {
        return true;
      } else {
        return false;
      }
    };
    var chartGlobals;
    var setChartGlobals = function setChartGlobals() {
      chartGlobals = {
        chartJS: null,
        capacity: 600,
        maxTickCount: 50,
        hideLabelsThreshold: 15,
        tickCount: 15,
        minTickCount: 5,
        chartData: {
          labels: [],
          labelsFilter: function (index) {
            return !distribute(index);
          },
          datasets: [{
              strokeColor: 'orange',
              pointColor: 'orange',
              pointStrokeColor: '#fff',
              data: []
            }]
        },
        chartOptions: {
          animation: false,
          bezierCurve: false,
          datasetFill: false,
          showTooltips: false,
          keepAspectRatio: false,
          scaleShowLabels: false
        }
      };
    };
    setChartGlobals();
    /* End of Define ChartJS Options */
    var utils = {
        zeroPad: function zeroPad(num) {
          if (num < 10) {
            return '0' + num;
          } else {
            return num.toString();
          }
        },
        getTickTime: function getTickTime(tick) {
          var date = new Date(tick * 1000);
          return date.getUTCHours() + ':' + utils.zeroPad(date.getUTCMinutes()) + ':' + utils.zeroPad(date.getUTCSeconds());
        },
        isDefined: function isDefined(obj) {
          if (typeof obj === 'undefined' || obj === null) {
            return false;
          } else {
            return true;
          }
        },
        setObjValue: function setObjValue(obj, attr, value, condition) {
          if (utils.isDefined(obj)) {
            if (utils.isDefined(condition)) {
              if (condition) {
                obj[attr] = value;
              }
            } else if (typeof obj[attr] === 'undefined') {
              obj[attr] = value;
            }
          }
        },
        fractionalLength: function fractionalLength(floatNumber) {
          var stringNumber = floatNumber.toString(), decimalLength = stringNumber.indexOf('.');
          return stringNumber.length - decimalLength - 1;
        },
        maxFractionalLength: function maxFractionalLength(floatNumbers) {
          var max = 0;
          floatNumbers.forEach(function (number) {
            max = max < utils.fractionalLength(number) ? utils.fractionalLength(number) : max;
          });
          return max;
        },
        lastDigit: function lastDigit(num) {
          return parseInt(num.toString().slice(-1)[0]);
        },
        conditions: {
          CALL: function condition(barrier, price) {
            return parseFloat(price) > parseFloat(barrier);
          },
          PUT: function condition(barrier, price) {
            return parseFloat(price) < parseFloat(barrier);
          },
          DIGITMATCH: function condition(barrier, price) {
            return utils.lastDigit(barrier) === utils.lastDigit(price);
          },
          DIGITDIFF: function condition(barrier, price) {
            return utils.lastDigit(barrier) !== utils.lastDigit(price);
          },
          DIGITEVEN: function condition(barrier, price) {
            return utils.lastDigit(price) % 2 === 0;
          },
          DIGITODD: function condition(barrier, price) {
            return utils.lastDigit(price) % 2 !== 0;
          },
          DIGITUNDER: function condition(barrier, price) {
            return utils.lastDigit(price) < parseInt(barrier);
          },
          DIGITOVER: function condition(barrier, price) {
            return utils.lastDigit(price) > parseInt(barrier);
          }
        },
        digitTrade: function digitTrade(contract) {
          if (contract.type.indexOf('DIGIT') === 0) {
            return true;
          }
          return false;
        },
        getRelativeIndex: function getRelativeIndex(absoluteIndex, dataIndex) {
          return absoluteIndex - (chartDrawer.getCapacity() - (chartDrawer.getTickCount() + chartDrawer.getDataIndex()));
        },
        getAbsoluteIndex: function getAbsoluteIndex(relativeIndex, dataIndex) {
          return relativeIndex + (chartDrawer.getCapacity() - (chartDrawer.getTickCount() + chartDrawer.getDataIndex()));
        }
      };
    var Stepper = function Stepper() {
      var tickDistance = 0, startingPosition = 0, startingDataIndex = 0, started = false, previousTime = 0;
      var setStartPosition = function setStartPosition(dataIndex, position) {
        startingPosition = position;
        startingDataIndex = dataIndex;
        started = true;
      };
      var stepCount = function stepCount(dataIndex, position) {
        if (!started) {
          return 0;
        }
        return startingDataIndex + Math.floor((position - startingPosition) / tickDistance) - dataIndex;
      };
      var setDistance = function setDistance(canvas, tickCount) {
        if (canvas !== null) {
          tickDistance = Math.ceil(canvas.offsetWidth / tickCount);
        }
      };
      var getDistance = function getDistance() {
        return tickDistance;
      };
      var isStep = function isStep(e, tickCount) {
        if (e.timeStamp - previousTime > 100) {
          previousTime = e.timeStamp;
          return true;
        }
        return false;
      };
      var stop = function stop() {
        started = false;
      };
      return {
        isStep: isStep,
        stop: stop,
        setDistance: setDistance,
        getDistance: getDistance,
        setStartPosition: setStartPosition,
        stepCount: stepCount
      };
    };
    var LocalHistory = function LocalHistory(capacity) {
      var historyData = [];
      var addTick = function addTick(tick) {
        if (parseInt(tick.epoch) > parseInt(historyData.slice(-1)[0].time)) {
          historyData.push({
            time: tick.epoch,
            price: tick.quote
          });
          historyData.shift();
        }
      };
      var updateHistoryArray = function updateHistoryArray(historyArray, history) {
        var times = history.times, prices = history.prices;
        var compare = function compare(a, b) {
          var timea = parseInt(a.time), timeb = parseInt(b.time);
          if (timea < timeb) {
            return -1;
          } else if (timea > timeb) {
            return 1;
          } else {
            return 0;
          }
        };
        var seenTimes = [];
        times.forEach(function (time, index) {
          if (seenTimes.indexOf(time) < 0) {
            seenTimes.push(time);
            historyArray.push({
              time: time,
              price: prices[index]
            });
          }
        });
        times.sort(compare);
      };
      var addHistory = function addHistory(history) {
        historyData = [];
        updateHistoryArray(historyData, history);
      };
      var getHistory = function getHistory(dataIndex, count, callback) {
        var end = capacity - dataIndex, start = end - count;
        if (start >= 0) {
          callback(historyData.slice(start, end));
        } else {
          callback([]);
        }
      };
      return {
        getHistory: getHistory,
        addTick: addTick,
        addHistory: addHistory
      };
    };
    var ContractCtrl = function ContractCtrl(contract) {
      var broadcastable = true;
      var setNotBroadcastable = function setNotBroadcastable() {
        return broadcastable = false;
      };
      var isFinished = function isFinished() {
        return utils.isDefined(contract.exitSpot);
      };
      var getContract = function getContract() {
        return contract;
      };
      var resetSpotShowing = function resetSpotShowing() {
        contract.showingEntrySpot = false;
        contract.showingExitSpot = false;
      };
      var hasEntrySpot = function hasEntrySpot() {
        if (utils.isDefined(contract.entrySpotIndex)) {
          return true;
        } else {
          return false;
        }
      };
      var hasExitSpot = function hasExitSpot() {
        if (utils.isDefined(contract.exitSpotIndex)) {
          return true;
        } else {
          return false;
        }
      };
      var betweenExistingSpots = function betweenExistingSpots(time) {
        if (hasEntrySpot() && time >= contract.entrySpotTime && (!hasExitSpot() || time <= contract.exitSpot)) {
          return true;
        } else {
          return false;
        }
      };
      var isSpot = function isSpot(i) {
        if (contract.showingEntrySpot && contract.entrySpotIndex === utils.getAbsoluteIndex(i)) {
          return true;
        }
        if (contract.showingExitSpot && contract.exitSpotIndex === utils.getAbsoluteIndex(i)) {
          return true;
        }
        return false;
      };
      var getEntrySpotPoint = function getEntrySpotPoint(points) {
        var result;
        if (contract.showingEntrySpot) {
          result = points[utils.getRelativeIndex(contract.entrySpotIndex)];
        }
        return result;
      };
      var getExitSpotPoint = function getExitSpotPoint(points) {
        var result;
        if (contract.showingExitSpot) {
          result = points[utils.getRelativeIndex(contract.exitSpotIndex)];
        }
        return result;
      };
      var isEntrySpot = function isEntrySpot(time) {
        if (hasEntrySpot()) {
          if (time === contract.entrySpotTime) {
            return true;
          } else {
            return false;
          }
        } else {
          if (time >= contract.startTime) {
            return true;
          } else {
            return false;
          }
        }
      };
      var isExitSpot = function isExitSpot(time, index) {
        if (hasExitSpot()) {
          if (time === contract.exitSpot) {
            return true;
          } else {
            return false;
          }
        } else {
          if (hasEntrySpot() && index === contract.entrySpotIndex + contract.duration) {
            return true;
          } else {
            return false;
          }
        }
      };
      var viewSpots = function viewSpots(index, tickTime) {
        if (isEntrySpot(tickTime)) {
          contract.showingEntrySpot = true;
          if (!utils.digitTrade(contract) && !hasExitSpot()) {
            chartDrawer.addGridLine({
              color: 'blue',
              label: 'barrier: ' + contract.barrier,
              orientation: 'horizontal',
              index: index
            });
          }
        } else if (isExitSpot(tickTime, utils.getAbsoluteIndex(index))) {
          contract.showingExitSpot = true;
        }
      };
      var addSpots = function addSpots(index, tickTime, tickPrice) {
        if (isEntrySpot(tickTime) || betweenExistingSpots(tickTime)) {
          if (isEntrySpot(tickTime)) {
            utils.setObjValue(contract, 'barrier', tickPrice, !utils.digitTrade(contract));
            utils.setObjValue(contract, 'entrySpotTime', tickTime, !hasEntrySpot());
          } else if (isExitSpot(tickTime, index)) {
            utils.setObjValue(contract, 'exitSpot', tickTime, !hasExitSpot());
          }
          utils.setObjValue(contract, 'entrySpotIndex', index, isEntrySpot(tickTime));
          utils.setObjValue(contract, 'exitSpotIndex', index, isExitSpot(tickTime, index));
        }
      };
      var viewRegions = function viewRegions() {
        if (hasEntrySpot()) {
          var color = contract.result === 'win' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
          if (contract.showingExitSpot) {
            var start = utils.getRelativeIndex(contract.entrySpotIndex);
            start = start < 0 ? 0 : start;
            if (!utils.isDefined(contract.region)) {
              contract.region = {
                color: color,
                start: start
              };
            } else {
              contract.region.color = color;
              contract.region.start = start;
            }
            contract.region.end = utils.getRelativeIndex(contract.exitSpotIndex);
            chartDrawer.addRegion(contract.region);
          } else if (contract.showingEntrySpot) {
            if (!utils.isDefined(contract.region)) {
              contract.region = {
                color: color,
                start: utils.getRelativeIndex(contract.entrySpotIndex)
              };
            } else {
              contract.region.color = color;
              contract.region.start = utils.getRelativeIndex(contract.entrySpotIndex);
            }
            chartDrawer.addRegion(contract.region);
          } else {
            chartDrawer.removeRegion(contract.region);
          }
        }
      };
      var addRegions = function addRegions(lastTime, lastPrice) {
        if (hasEntrySpot()) {
          if (betweenExistingSpots(lastTime)) {
            if (utils.conditions[contract.type](contract.barrier, lastPrice)) {
              contract.result = 'win';
            } else {
              contract.result = 'lose';
            }
            if (isFinished() && broadcastable) {
              contractCtrls.forEach(function (contractctrl, index) {
                var oldContract = contractctrl.getContract();
                if (contract !== oldContract && !contractctrl.isFinished()) {
                  setNotBroadcastable();
                }
              });
              if (broadcastable) {
                $rootScope.$broadcast('contract:finished', contract);
              }
            }
          }
        }
      };
      return {
        setNotBroadcastable: setNotBroadcastable,
        isFinished: isFinished,
        getContract: getContract,
        isSpot: isSpot,
        betweenExistingSpots: betweenExistingSpots,
        resetSpotShowing: resetSpotShowing,
        addSpots: addSpots,
        addRegions: addRegions,
        viewSpots: viewSpots,
        viewRegions: viewRegions,
        getEntrySpotPoint: getEntrySpotPoint,
        getExitSpotPoint: getExitSpotPoint
      };
    };
    var ChartDrawer = function ChartDrawer() {
      var dataIndex = 0, canvas, ctx, dragging = false, zooming = false, stepper = Stepper();
      var isLastPoint = function isLastPoint(i) {
        if (reversedIndex(i) === 0) {
          return true;
        } else {
          return false;
        }
      };
      var hideLabels = function hideLabels() {
        if (chartGlobals.tickCount >= chartGlobals.hideLabelsThreshold) {
          return true;
        } else {
          return false;
        }
      };
      var showingHistory = function showingHistory() {
        if (dataIndex === 0) {
          return false;
        } else {
          return true;
        }
      };
      var getLabelColor = function getLabelColor(index) {
        var color = 'black';
        if (!showingHistory() && isLastPoint(index)) {
          color = 'green';
        }
        contractCtrls.forEach(function (contract) {
          if (contract.isSpot(index)) {
            color = 'blue';
          }
        });
        return color;
      };
      var getDotColor = function getDotColor(value, index) {
        var color;
        contractCtrls.forEach(function (contract) {
          if (contract.betweenExistingSpots(value)) {
            color = 'blue';
          }
        });
        if (utils.isDefined(color)) {
          return color;
        }
        if (isLastPoint(index) && !showingHistory()) {
          color = 'green';
        } else {
          color = 'orange';
        }
        return color;
      };
      var drawRegion = function drawRegion(thisChart, region) {
        var height = thisChart.scale.endPoint - thisChart.scale.startPoint + 12,
          // + 12 to size up the region to the top
          length, end, start;
        start = thisChart.datasets[0].points[region.start].x;
        if (utils.isDefined(region.end)) {
          end = thisChart.datasets[0].points[region.end].x;
        } else {
          end = thisChart.datasets[0].points.slice(-1)[0].x;
        }
        if (end <= start) {
          return;
        }
        length = end - start;
        ctx.fillStyle = region.color;
        ctx.fillRect(start, thisChart.scale.startPoint - 12, length, height);  // begin the region from the top
      };
      var getLabelSize = function getLabelSize(ctx, point) {
        return {
          width: ctx.measureText(point.value).width,
          height: parseInt(ctx.font)
        };
      };
      var overlapping = function overlapping(point1, point2) {
        return point1.s < point2.e && point1.e > point2.s || point2.s < point1.e && point2.e > point1.s;
      };
      var overlapping2d = function overlapping2d(point1, point2) {
        var point1Size = getLabelSize(ctx, point1);
        var point2Size = getLabelSize(ctx, point2);
        var overlappingY = overlapping({
            s: point1.y,
            e: point1.y + point1Size.height
          }, {
            s: point2.y,
            e: point2.y + point2Size.height
          });
        var overlappingX = overlapping({
            s: point1.x,
            e: point1.x + point1Size.width
          }, {
            s: point2.x,
            e: point2.x + point2Size.width
          });
        return overlappingX && overlappingY;
      };
      var findSpots = function findSpots(points) {
        var entries = [], exits = [];
        contractCtrls.forEach(function (contract) {
          var entry, exit;
          entry = contract.getEntrySpotPoint(points);
          exit = contract.getExitSpotPoint(points);
          if (utils.isDefined(entry)) {
            entries.push(entry);
          }
          if (utils.isDefined(exit)) {
            exits.push(exit);
          }
        });
        return {
          entries: entries,
          exits: exits
        };
      };
      var withoutConflict = function withoutConflict(toShow, point) {
        var result = true;
        toShow.forEach(function (toShowPoint, index) {
          if (overlapping2d(toShowPoint, point)) {
            result = false;
          }
        });
        return result;
      };
      var toShowLabels = function toShowLabels(points) {
        var toShow = [];
        var spots = findSpots(points);
        // This is our priority: 1. exit spot, 2. entry spot, 3. last value, 4. others (right to left)
        spots.exits.forEach(function (exit, index) {
          toShow.push(exit);
        });
        spots.entries.forEach(function (entry, index) {
          if (withoutConflict(toShow, entry)) {
            toShow.push(entry);
          }
        });
        var lastPoint = points.slice(-1)[0];
        if (!showingHistory() && withoutConflict(toShow, lastPoint)) {
          toShow.push(lastPoint);
        }
        // add other labels from right to left
        if (!hideLabels()) {
          for (var i = points.length - 1; i >= 0; i--) {
            if (withoutConflict(toShow, points[i])) {
              toShow.push(points[i]);
            }
          }
        }
        toShow.forEach(function (toShowPoint, index) {
          toShowPoint.shown = true;
        });
      };
      var drawLabel = function drawLabel(point, index) {
        if (index !== 0 && utils.isDefined(point.shown) && point.shown) {
          ctx.fillStyle = getLabelColor(index);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          var padding = 0;
          var valueWidth = getLabelSize(ctx, point).width;
          if (isLastPoint(index)) {
            padding = valueWidth < 45 ? 0 : valueWidth - 45;
          }
          ctx.fillText(point.value, point.x - padding, point.y - 1);
        }
      };
      var drawGridLine = function drawGridLine(thisChart, gridLine) {
        var point = thisChart.datasets[0].points[gridLine.index];
        var scale = thisChart.scale;
        ctx.beginPath();
        if (gridLine.orientation === 'vertical') {
          ctx.moveTo(point.x, scale.startPoint + 24);
          ctx.strokeStyle = gridLine.color;
          ctx.fillStyle = gridLine.color;
          ctx.lineTo(point.x, scale.endPoint);
          ctx.stroke();
          ctx.textAlign = 'center';
          ctx.fillText(gridLine.label, point.x, scale.startPoint + 12);
        } else if (gridLine.orientation === 'horizontal') {
          ctx.moveTo(scale.startPoint, point.y);
          ctx.strokeStyle = gridLine.color;
          ctx.fillStyle = gridLine.color;
          ctx.lineTo(thisChart.chart.width, point.y);
          ctx.stroke();
          ctx.textAlign = 'center';
          var labelWidth = ctx.measureText(gridLine.label).width;
          ctx.fillText(gridLine.label, parseInt(labelWidth / 2) + 5, point.y - 1);
        }
      };
      /* Override ChartJS Defaults */
      Chart.CustomScale = Chart.Scale.extend({
        initialize: function () {
          var longestText = function (ctx, font, arrayOfStrings) {
            ctx.font = font;
            var longest = 0;
            Chart.helpers.each(arrayOfStrings, function (string) {
              var textWidth = ctx.measureText(string).width;
              longest = textWidth > longest ? textWidth : longest;
            });
            return longest;
          };
          this.calculateXLabelRotation = function () {
            this.ctx.font = this.font;
            var lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width;
            this.xScalePaddingRight = lastWidth / 2 + 3;
            this.xLabelRotation = 0;
            if (this.display) {
              var originalLabelWidth = longestText(this.ctx, this.font, this.xLabels);
              this.xLabelWidth = originalLabelWidth;
            } else {
              this.xLabelWidth = 0;
              this.xScalePaddingRight = this.padding;
            }
            this.xScalePaddingLeft = 0;
          };
          Chart.Scale.prototype.initialize.apply(this, arguments);
        },
        draw: function () {
          var helpers = Chart.helpers;
          var each = helpers.each;
          var aliasPixel = helpers.aliasPixel;
          var ctx = this.ctx, yLabelGap = (this.endPoint - this.startPoint) / this.steps, xStart = Math.round(this.xScalePaddingLeft);
          if (this.display) {
            ctx.fillStyle = this.textColor;
            ctx.font = this.font;
            each(this.yLabels, function (labelString, index) {
              var yLabelCenter = this.endPoint - yLabelGap * index, linePositionY = Math.round(yLabelCenter);
              ctx.textAlign = 'right';
              ctx.textBaseline = 'middle';
              if (this.showLabels) {
                ctx.fillText(labelString, xStart - 10, yLabelCenter);
              }
              ctx.beginPath();
              if (index > 0) {
                ctx.lineWidth = this.gridLineWidth;
                ctx.strokeStyle = this.gridLineColor;
              } else {
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lineColor;
              }
              linePositionY += helpers.aliasPixel(ctx.lineWidth);
              ctx.moveTo(xStart, linePositionY);
              ctx.lineTo(this.width, linePositionY);
              ctx.stroke();
              ctx.closePath();
              ctx.lineWidth = this.lineWidth;
              ctx.strokeStyle = this.lineColor;
              ctx.beginPath();
              ctx.moveTo(xStart - 5, linePositionY);
              ctx.lineTo(xStart, linePositionY);
              ctx.stroke();
              ctx.closePath();
            }, this);
            each(this.xLabels, function (label, index) {
              var filtered = false;
              if (typeof this.labelsFilter === 'function' && this.labelsFilter(index)) {
                filtered = true;
              }
              var xPos = this.calculateX(index) + aliasPixel(this.lineWidth), linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth);
              ctx.beginPath();
              if (index > 0) {
                ctx.lineWidth = this.gridLineWidth;
                ctx.strokeStyle = this.gridLineColor;
              } else {
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lineColor;
              }
              ctx.moveTo(linePos, this.endPoint);
              ctx.lineTo(linePos, this.startPoint - 12);
              ctx.stroke();
              ctx.closePath();
              ctx.lineWidth = this.lineWidth;
              ctx.strokeStyle = this.lineColor;
              ctx.beginPath();
              ctx.moveTo(linePos, this.endPoint);
              if (filtered) {
                ctx.lineTo(linePos, this.endPoint);
              } else {
                ctx.lineTo(linePos, this.endPoint + 5);
              }
              ctx.stroke();
              ctx.closePath();
              ctx.save();
              ctx.translate(xPos, this.endPoint + 8);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              if (!filtered) {
                ctx.fillText(label, 0, 0);
              }
              ctx.restore();
            }, this);
          }
        }
      });
      Chart.types.Line.extend({
        name: 'LineChartSpots',
        initialize: function (data) {
          this.options.labelsFilter = data.labelsFilter || null;
          Chart.types.Line.prototype.initialize.apply(this, arguments);
        },
        draw: function () {
          var dataset = this.datasets[0];
          var thisChart = this;
          dataset.points.forEach(function (point, index) {
            point.fillColor = getDotColor(chartGlobals.chartData.epochLabels[index], index);
          });
          Chart.types.Line.prototype.draw.apply(this, arguments);
          toShowLabels(dataset.points);
          dataset.points.forEach(function (point, index) {
            drawLabel(point, index);
          });
          if (utils.isDefined(this.options.regions)) {
            this.options.regions.forEach(function (region) {
              drawRegion(thisChart, region);
            });
          }
          if (utils.isDefined(this.options.gridLines)) {
            this.options.gridLines.forEach(function (gridLine) {
              drawGridLine(thisChart, gridLine);
            });
          }
        },
        buildScale: function (labels) {
          var helpers = Chart.helpers;
          var self = this;
          var dataTotal = function () {
            var values = [];
            self.eachPoints(function (point) {
              values.push(point.value);
            });
            return values;
          };
          var scaleOptions = {
              templateString: this.options.scaleLabel,
              height: this.chart.height,
              width: this.chart.width,
              ctx: this.chart.ctx,
              textColor: this.options.scaleFontColor,
              fontSize: this.options.scaleFontSize,
              labelsFilter: this.options.labelsFilter,
              fontStyle: this.options.scaleFontStyle,
              fontFamily: this.options.scaleFontFamily,
              valuesCount: labels.length,
              beginAtZero: this.options.scaleBeginAtZero,
              integersOnly: this.options.scaleIntegersOnly,
              calculateYRange: function (currentHeight) {
                var updatedRanges = helpers.calculateScaleRange(dataTotal(), currentHeight, this.fontSize, this.beginAtZero, this.integersOnly);
                helpers.extend(this, updatedRanges);
              },
              xLabels: labels,
              font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
              lineWidth: this.options.scaleLineWidth,
              lineColor: this.options.scaleLineColor,
              gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
              gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : 'rgba(0,0,0,0)',
              padding: this.options.showScale ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
              showLabels: this.options.scaleShowLabels,
              display: this.options.showScale
            };
          if (this.options.scaleOverride) {
            helpers.extend(scaleOptions, {
              calculateYRange: helpers.noop,
              steps: this.options.scaleSteps,
              stepValue: this.options.scaleStepWidth,
              min: this.options.scaleStartValue,
              max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
            });
          }
          this.scale = new Chart.CustomScale(scaleOptions);
        }
      });
      /* End of Override ChartJS Defaults */
      var destroy = function destroy() {
        chartGlobals.chartJS.destroy();
        setChartGlobals();
        canvas = null;
        ctx = null;
        dataIndex = 0;
        dragging = false;
        zooming = false;
        stepper = null;
      };
      var drawChart = function drawChart(chartID) {
        canvas = document.getElementById(chartID);
        if (canvas !== null) {
          ctx = canvas.getContext('2d');
          stepper = Stepper();
          stepper.setDistance(canvas, chartGlobals.tickCount);
        }
      };
      var findRegion = function findRegion(region) {
        if (utils.isDefined(chartGlobals.chartOptions.regions)) {
          return chartGlobals.chartOptions.regions.indexOf(region);
        } else {
          return -1;
        }
      };
      var addRegion = function addRegion(region) {
        if (!utils.isDefined(chartGlobals.chartOptions.regions)) {
          chartGlobals.chartOptions.regions = [];
        }
        if (findRegion(region) < 0) {
          chartGlobals.chartOptions.regions.push(region);
        }
      };
      var removeRegion = function removeRegion(region) {
        var regionIndex = findRegion(region);
        if (regionIndex >= 0) {
          chartGlobals.chartOptions.regions.splice(regionIndex, 1);
        }
      };
      var dragStart = function dragStart(e) {
        stepper.setStartPosition(dataIndex, e.center.x);
        dragging = true;
      };
      var dragEnd = function dragEnd(e) {
        if (!zooming) {
          move(stepper.stepCount(dataIndex, e.center.x));
        }
        stepper.stop();
        dragging = false;
      };
      var zoomStart = function zoomStart() {
        zooming = true;
      };
      var zoomEnd = function zoomEnd() {
        zooming = false;
      };
      var addGridLine = function addGridLine(gridLine) {
        if (!utils.isDefined(chartGlobals.chartOptions.gridLines)) {
          chartGlobals.chartOptions.gridLines = [];
        }
        chartGlobals.chartOptions.gridLines.push(gridLine);
      };
      var updateChartPoints = function updateChartPoints(times, values) {
        chartGlobals.chartData.labels = [];
        chartGlobals.chartData.epochLabels = times;
        times.forEach(function (time, index) {
          chartGlobals.chartData.labels.push(utils.getTickTime(time));
        });
        chartGlobals.chartData.datasets[0].data = values;
        if (utils.isDefined(chartGlobals.chartJS)) {
          chartGlobals.chartJS.destroy();
        }
        if (utils.isDefined(ctx)) {
          var chartObj = new Chart(ctx);
          chartGlobals.chartJS = chartObj.LineChartSpots(chartGlobals.chartData, chartGlobals.chartOptions);
        }
      };
      // depends on updateContracts call
      var updateChart = function updateChart(ticks) {
        chartGlobals.chartOptions.gridLines = [];
        contractCtrls.forEach(function (contract) {
          contract.resetSpotShowing();
        });
        var times = [], prices = [];
        ticks.forEach(function (tick, index) {
          var tickTime = parseInt(tick.time);
          contractCtrls.forEach(function (contract) {
            contract.viewSpots(index, tickTime);
          });
          times.push(tickTime);
          prices.push(tick.price);
        });
        contractCtrls.forEach(function (contract) {
          contract.viewRegions();
        });
        updateChartPoints(times, prices);
      };
      var updateContracts = function updateContracts(ticks) {
        var lastTime, lastPrice;
        ticks.forEach(function (tick, index) {
          var tickTime = parseInt(tick.time);
          var tickPrice = tick.price;
          contractCtrls.forEach(function (contract) {
            contract.addSpots(index, tickTime, tickPrice);
          });
          lastTime = parseInt(tick.time);
          lastPrice = tick.price;
        });
        contractCtrls.forEach(function (contract) {
          contract.addRegions(lastTime, lastPrice);
        });
      };
      var addTick = function addTick(tick) {
        if (utils.isDefined(localHistory)) {
          localHistory.addTick(tick);
          localHistory.getHistory(0, chartGlobals.capacity, updateContracts);
          if (dataIndex === 0 && !dragging && !zooming) {
            localHistory.getHistory(dataIndex, chartGlobals.tickCount, updateChart);
          } else {
            move(1, false);
          }
        }
      };
      var addHistory = function addHistory(history) {
        if (!utils.isDefined(localHistory)) {
          localHistory = LocalHistory(chartGlobals.capacity);
        }
        localHistory.addHistory(history);
        localHistory.getHistory(0, chartGlobals.capacity, updateContracts);
        localHistory.getHistory(dataIndex, chartGlobals.tickCount, updateChart);
      };
      var addCandles = function addCandles(candles) {
      };
      var addOhlc = function addOhlc(ohlc) {
      };
      var zoom = function zoom(direction) {
        var newTickCount;
        var condition;
        if (direction === 'in') {
          newTickCount = parseInt(chartGlobals.tickCount / 1.2);
          condition = newTickCount > chartGlobals.minTickCount;
        } else if (direction === 'out') {
          newTickCount = parseInt(chartGlobals.tickCount * 1.2);
          condition = newTickCount < chartGlobals.maxTickCount;
        } else {
          return;
        }
        if (condition) {
          chartGlobals.tickCount = newTickCount;
          localHistory.getHistory(dataIndex, chartGlobals.tickCount, updateChart);
          stepper.setDistance(canvas, chartGlobals.tickCount);
        }
      };
      var zoomOut = function zoomOut() {
        zoom('out');
      };
      var zoomIn = function zoomIn() {
        zoom('in');
      };
      var move = function move(steps, update) {
        if (steps === 0) {
          return;
        }
        var testDataIndex = dataIndex + steps;
        if (testDataIndex < 0) {
          // overflow
          testDataIndex = 0;
        } else if (testDataIndex >= chartGlobals.capacity - chartGlobals.tickCount) {
          // underflow
          testDataIndex = chartGlobals.capacity - chartGlobals.tickCount - 1;
        }
        if (testDataIndex !== dataIndex) {
          dataIndex = testDataIndex;
          if (!utils.isDefined(update) || update) {
            localHistory.getHistory(dataIndex, chartGlobals.tickCount, updateChart);
          }
        }
      };
      var drag = function drag(e) {
        if (!zooming && stepper.isStep(e, chartGlobals.tickCount)) {
          move(stepper.stepCount(dataIndex, e.center.x));
        }
      };
      var getCapacity = function getCapacity() {
        return chartGlobals.capacity;
      };
      var getTickCount = function getTickCount() {
        return chartGlobals.tickCount;
      };
      var getDataIndex = function getDataIndex() {
        return dataIndex;
      };
      var addContract = function addContract(_contract) {
        if (_contract) {
          if (utils.digitTrade(_contract)) {
            _contract.duration -= 1;
          }
          contractCtrls.push(ContractCtrl(_contract));
          dataIndex = 0;
        }
      };
      var historyInterface = {
          addTick: addTick,
          addHistory: addHistory,
          addCandles: addCandles,
          addOhlc: addOhlc
        };
      return {
        dragStart: dragStart,
        dragEnd: dragEnd,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomStart: zoomStart,
        zoomEnd: zoomEnd,
        dragRight: drag,
        dragLeft: drag,
        getCapacity: getCapacity,
        getTickCount: getTickCount,
        getDataIndex: getDataIndex,
        addContract: addContract,
        historyInterface: historyInterface,
        addGridLine: addGridLine,
        addRegion: addRegion,
        removeRegion: removeRegion,
        drawChart: drawChart,
        destroy: destroy
      };
    };
    var drawChart = function drawChart(chartID) {
      chartDrawer.drawChart(chartID);
    };
    var destroy = function destroy() {
      chartDrawer.destroy();
      contractCtrls.forEach(function (contractctrl, index) {
        contractctrl.setNotBroadcastable();
      });
      localHistory = null;
    };
    chartDrawer = ChartDrawer();
    return {
      destroy: destroy,
      drawChart: drawChart,
      dragStart: chartDrawer.dragStart,
      dragEnd: chartDrawer.dragEnd,
      zoomIn: chartDrawer.zoomIn,
      zoomOut: chartDrawer.zoomOut,
      zoomStart: chartDrawer.zoomStart,
      zoomEnd: chartDrawer.zoomEnd,
      dragRight: chartDrawer.dragRight,
      dragLeft: chartDrawer.dragLeft,
      getCapacity: chartDrawer.getCapacity,
      addContract: chartDrawer.addContract,
      historyInterface: chartDrawer.historyInterface
    };
  }
]);
/**
 * @name cleanupService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/22/2015
 * @copyright Binary Ltd
 *
 */
angular.module('binary').service('cleanupService', [
  '$translate',
  'proposalService',
  function ($translate, proposalService) {
    this.run = function () {
      proposalService.remove();
    };
  }
]);
/**
 * @name delayService
 * @author Amin Marashi
 * @contributors []
 * @since 01/21/2016
 * @copyright Binary Ltd
 *
 */
angular.module('binary').factory('delayService', function () {
  var functions = {};
  var runTimestamps = {};
  var FunctionController = function FunctionController(delayedFunction, args, name) {
    var timeoutId = 0;
    return {
      run: function run(minimumDelay) {
        var runFunc = function runFunc() {
          runTimestamps[name] = new Date().getTime();
          delayedFunction.apply(this, args);
        };
        if (minimumDelay !== 0) {
          timeoutId = setTimeout(function () {
            runFunc();
          }, minimumDelay);
        } else {
          runFunc();
        }
      },
      cancel: function cancel() {
        clearTimeout(timeoutId);
      }
    };
  };
  return {
    update: function update(name, delayedFunction, minimumDelay, args) {
      var now = new Date().getTime();
      if (functions.hasOwnProperty(name)) {
        var remainingTime = minimumDelay - (now - runTimestamps[name]);
        if (remainingTime > 0) {
          minimumDelay = remainingTime;
        } else {
          minimumDelay = 0;
        }
        functions[name].cancel();
      } else {
        minimumDelay = 0;
        runTimestamps[name] = now;
      }
      functions[name] = FunctionController(delayedFunction, args, name);
      functions[name].run(minimumDelay);
    },
    remove: function (name) {
      if (functions.hasOwnProperty(name)) {
        functions[name].cancel();
        delete functions[name];
        delete runTimestamps[name];
      }
    }
  };
});
/**
 * @name languageService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 *
 */
angular.module('binary').service('languageService', [
  '$rootScope',
  '$translate',
  'cleanupService',
  function ($rootScope, $translate, cleanupService) {
    /**
			 * Update default languge in local storage
			 * Changes the app language
			 * @param  {String} _language [description]
			 */
    this.update = function (_language) {
      localStorage.language = _language;
      $rootScope.$broadcast('language:updated');
      this.set(_language);
    };
    /**
			 * Read the language from local storage
			 * if exists update the app's language
			 */
    this.set = function (_language) {
      if (!_language) {
        var language = localStorage.language || 'en';
      } else {
        var language = _language;
      }
      cleanupService.run();
      $rootScope.$broadcast('language:updated');
      $translate.use(language);
    };
    // TODO: remove
    this.read = function () {
      var language = localStorage['language'];
      return language ? language : 'en';
    };
    this.remove = function () {
      localStorage.removeItem('language');
      cleanupService.run();
    };
  }
]);
/**
 * @name cleanupService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/31/2015
 * @copyright Binary Ltd
 *
 */
angular.module('binary').factory('localStorageService', function () {
  var service = {};
  /**
			 * find a {key,value} in an array of objects and return its index
			 * returns -1 if not found
			 * @param  {Array of Objects} _accounts
			 * @param  {String} _key
			 * @param  {String, Number, Boolean} _value
			 * @return {Number} Index of the found array element
			 */
  var findIndex = function (_accounts, _key, _value) {
    var index = -1;
    _accounts.forEach(function (el, i) {
      if (_accounts[i][_key] === _value) {
        index = i;
      }
    });
    return index;
  };
  service.removeToken = function removeToken(token) {
    if (localStorage.hasOwnProperty('accounts')) {
      var accounts = JSON.parse(localStorage.accounts);
      var tokenIndex = findIndex(accounts, 'token', token);
      if (tokenIndex > -1) {
        accounts.splice(tokenIndex);
        localStorage.accounts = JSON.stringify(accounts);
      }
    }
  };
  service.getDefaultToken = function () {
    if (localStorage.accounts && JSON.parse(localStorage.accounts) instanceof Array) {
      var accounts = JSON.parse(localStorage.accounts);
      var index = findIndex(accounts, 'is_default', true);
      if (index > -1) {
        return accounts[index].token;
      }
    }
    return null;
  };
  return service;
});
/**
 * @name tradeService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */
angular.module('binary').service('marketService', [
  'websocketService',
  'proposalService',
  'config',
  function (websocketService, proposalService, config) {
    var regroup = function regroup(symbols) {
      var groups = {
          index: [
            'R_100',
            'R_25',
            'R_50',
            'R_75'
          ],
          BEARBULL: [
            'RDBEAR',
            'RDBULL'
          ],
          MOONSUN: [
            'RDMOON',
            'RDSUN'
          ],
          MARSVENUS: [
            'RDMARS',
            'RDVENUS'
          ],
          YANGYIN: [
            'RDYANG',
            'RDYIN'
          ]
        };
      var result = [], itemIndices = [];
      Object.keys(groups).forEach(function (key) {
        var tmp = [], first = -1;
        symbols.forEach(function (item, index) {
          if (item.symbol == groups[key][0]) {
            first = index;
          }
        });
        if (first < 0) {
          return;
        } else {
          groups[key].forEach(function (item, index) {
            var itemIndex = -1;
            symbols.forEach(function (item, i) {
              if (item.symbol == groups[key][index]) {
                itemIndex = i;
              }
            });
            if (itemIndex >= 0) {
              tmp.push(symbols[itemIndex]);
              itemIndices.push(itemIndex);
            }
          });
          tmp.sort();
          result = result.concat(tmp);
        }
      });
      symbols.forEach(function (symbol, index) {
        if (itemIndices.indexOf(index) < 0) {
          result.push(symbol);
        }
      });
      return result;
    };
    var reorder = function reorder(symbols) {
      symbols.sort(function (a, b) {
        if (a.display_name > b.display_name) {
          return 1;
        } else if (a.display_name < b.display_name) {
          return -1;
        }
        return 0;
      });
      symbols = regroup(symbols);
      return symbols;
    };
    this.fixOrder = function () {
      if (!sessionStorage.active_symbols) {
        return;
      }
      var symbols = JSON.parse(sessionStorage.active_symbols);
      Object.keys(symbols).forEach(function (key) {
        symbols[key] = reorder(symbols[key]);
      });
      sessionStorage.active_symbols = JSON.stringify(symbols);
    };
    this.getActiveMarkets = function () {
      if (!sessionStorage.active_symbols) {
        return [];
      }
      var data = JSON.parse(sessionStorage.active_symbols);
      return Object.keys(data);
    };
    this.getAllSymbolsForAMarket = function (_market) {
      if (!_market || !sessionStorage.active_symbols || !sessionStorage.asset_index) {
        return [];
      }
      var activeSymbols = JSON.parse(sessionStorage.active_symbols)[_market];
      var assetIndex = JSON.parse(sessionStorage.asset_index);
      var indexes = config.assetIndexes;
      var result = [];
      activeSymbols.map(function (market) {
        for (i = 0; i < assetIndex.length; i++) {
          if (market.symbol === assetIndex[i][indexes.symbol]) {
            var assetContracts = assetIndex[i][indexes.contracts];
            for (var c = 0; c < assetContracts.length; c++) {
              if (assetContracts[c][indexes.contractFrom].indexOf('t') !== -1) {
                result.push(market);
                break;
              }
            }
            break;  // do not loop through remained assets, since the related asset_index has been found but is not supporting ticks
          }
        }
        assetIndex.splice(i, 1);  // to shorten the list for the next loop
      });
      return result;
    };
    this.getSymbolDetails = function (_symbol) {
      websocketService.sendRequestFor.contractsForSymbol(_symbol);
    };
    this.getDefault = {
      market: function (_market) {
        var proposal = proposalService.get();
        if (proposal && proposal.passthrough && proposal.passthrough.market && _market[proposal.passthrough.market]) {
          return proposal.passthrough.market;
        }
        //return _market.random ? 'random' : 'forex';
        return _.findKey(_market, function (o) {
          return o;
        });
      },
      symbol: function (_market, _symbols) {
        var proposal = proposalService.get();
        if (proposal && proposal.passthrough && proposal.passthrough.market && proposal.symbol && proposal.passthrough.market == _market) {
          return proposal.symbol;
        }
        return _symbols[0].symbol;
      },
      tradeType: function (_tradeTypes) {
        if (_.isEmpty(_tradeTypes)) {
          return null;
        }
        var proposal = proposalService.get();
        var contractType = proposal.contract_type;
        var selectedTradeType = _tradeTypes[0].value;
        _tradeTypes.forEach(function (el, i) {
          if (el.value == contractType) {
            selectedTradeType = contractType;
            return;
          }
        });
        return selectedTradeType;
      },
      tick: function () {
        var proposal = proposalService.get();
        return proposal.duration ? proposal.duration : 5;
      },
      digit: function () {
        var proposal = proposalService.get();
        return proposal.barrier ? proposal.barrier : 0;
      },
      basis: function () {
        var proposal = proposalService.get();
        return proposal.basis ? proposal.basis : 'payout';
      },
      amount: function () {
        var proposal = proposalService.get();
        if (!isNaN(proposal.amount)) {
          return proposal.amount;
        }
        return 5;
      }
    };
    this.getTradeTypes = function (_symbol) {
      var tradeTypes = config.tradeTypes;
      var finalTradeTypes = [];
      tradeTypes.forEach(function (el, i) {
        for (var key in _symbol) {
          if (_symbol.hasOwnProperty(key)) {
            // Find the tradeType in _symbol list
            if (el.value === key) {
              var hasTicks = false;
              // Loop through all _symbols of a trade type
              for (var j = 0; j < _symbol[key].length; j++) {
                var minDuration = _symbol[key][j].min_contract_duration;
                if (minDuration && minDuration.toString().match(/^\d+t$/)) {
                  hasTicks = true;
                }
              }
              if (hasTicks) {
                finalTradeTypes.push(el);
              }
            }
          }
        }
      });
      return finalTradeTypes;
    };
    this.removeActiveSymbols = function () {
      sessionStorage.active_symbols = null;
    };
    this.removeAssetIndex = function () {
      sessionStorage.asset_index = null;
    };
    this.hasActiveSymobols = function () {
      return sessionStorage.active_symbols;
    };
    this.hasAssetIndex = function () {
      return sessionStorage.asset_index;
    };
  }
]);
/**
 * @name proposalService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 */
angular.module('binary').service('proposalService', [
  'websocketService',
  'appStateService',
  function (websocketService, appStateService) {
    var createProposal = function (_data) {
      var proposal = {
          subscribe: 1,
          proposal: 1,
          symbol: _data.symbol,
          contract_type: _data.contract_type,
          duration: _data.duration,
          basis: _data.basis,
          currency: _data.currency || 'USD',
          amount: isNaN(_data.amount) || _data.amount == 0 ? 0 : _data.amount || 5,
          duration_unit: 't',
          passthrough: _data.passthrough
        };
      if ([
          'PUT',
          'CALL',
          'DIGITEVEN',
          'DIGITODD'
        ].indexOf(_data.contract_type) > -1) {
        delete _data.digit;
        delete _data.barrier;
      } else if (_data.digit >= 0) {
        proposal.barrier = _data.digit;
      } else if (_data.barrier >= 0) {
        proposal.barrier = _data.barrier;
      }
      return proposal;
    };
    this.update = function (_proposal) {
      if (_proposal) {
        localStorage.proposal = JSON.stringify(createProposal(_proposal));
      }
    };
    this.send = function (_oldId) {
      websocketService.sendRequestFor.forgetProposals();
      websocketService.sendRequestFor.proposal(JSON.parse(localStorage.proposal));
      appStateService.waitForProposal = true;
    };
    this.get = function () {
      if (localStorage.proposal) {
        return JSON.parse(localStorage.proposal);
      }
      return false;
    };
    this.remove = function () {
      localStorage.removeItem('proposal');
    };
    this.getCurrencies = function () {
      websocketService.sendRequestFor.currencies();
    };
  }
]);
/**
 * @name websocketService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */
angular.module('binary').factory('websocketService', [
  '$rootScope',
  'localStorageService',
  'alertService',
  'appStateService',
  function ($rootScope, localStorageService, alertService, appStateService) {
    var dataStream = '';
    var messageBuffer = [];
    var waitForConnection = function (callback) {
      if (dataStream.readyState === 3) {
        init();
        setTimeout(function () {
          waitForConnection(callback);
        }, 1000);
      } else if (dataStream.readyState === 1) {
        callback();
      } else if (!(dataStream instanceof WebSocket)) {
        init();
        setTimeout(function () {
          waitForConnection(callback);
        }, 1000);
      } else {
        setTimeout(function () {
          waitForConnection(callback);
        }, 1000);
      }
    };
    var sendMessage = function (_data) {
      waitForConnection(function () {
        dataStream.send(JSON.stringify(_data));
      });
    };
    var init = function () {
      var language = localStorage.language || 'en';
      appStateService.isLoggedin = false;
      dataStream = new WebSocket('wss://ws.binaryws.com/websockets/v3?l=' + language);
      dataStream.onopen = function () {
        sendMessage({ ping: 1 });
        // CLEANME
        // Authorize the default token if it's exist
        var token = localStorageService.getDefaultToken();
        if (token) {
          var data = {
              authorize: token,
              passthrough: { type: 'reopen-connection' }
            };
          sendMessage(data);
        }
        console.log('socket is opened');
        $rootScope.$broadcast('connection:ready');  // if(typeof(analytics) !== "undefined"){
                                                    // 	analytics.trackEvent('WebSocket', 'OpenConnection', 'OpenConnection', 25);
                                                    // }
                                                    //dataStream.send(JSON.stringify({ping: 1}));
      };
      dataStream.onmessage = function (message) {
        receiveMessage(message);
      };
      dataStream.onclose = function (e) {
        console.log('socket is closed ', e);
        init();
        console.log('socket is reopened');
        appStateService.isLoggedin = false;
        $rootScope.$broadcast('connection:reopened');
      };
      dataStream.onerror = function (e) {
        //console.log('error in socket ', e);
        if (e.target.readyState == 3) {
          $rootScope.$broadcast('connection:error');
        }
        appStateService.isLoggedin = false;
      };
    };
    $rootScope.$on('language:updated', function () {
      init();
    });
    var receiveMessage = function (_response) {
      var message = JSON.parse(_response.data);
      if (message) {
        var messageType = message.msg_type;
        switch (messageType) {
        case 'authorize':
          if (message.authorize) {
            message.authorize.token = message.echo_req.authorize;
            window._trackJs.userId = message.authorize.loginid;
            appStateService.isLoggedin = true;
            $rootScope.$broadcast('authorize', message.authorize, message['req_id'], message['passthrough']);
          } else {
            if (message.hasOwnProperty('error') && message.error.code === 'InvalidToken') {
              localStorageService.removeToken(message.echo_req.authorize);
            }
            $rootScope.$broadcast('authorize', false);
            appStateService.isLoggedin = false;
          }
          break;
        case 'active_symbols':
          var markets = message.active_symbols;
          var groupedMarkets = _.groupBy(markets, 'market');
          var openMarkets = {};
          for (var key in groupedMarkets) {
            if (groupedMarkets.hasOwnProperty(key)) {
              if (groupedMarkets[key][0].exchange_is_open == 1) {
                openMarkets[key] = groupedMarkets[key];
              }
            }
          }
          if (!sessionStorage.hasOwnProperty('active_symbols') || sessionStorage.active_symbols != JSON.stringify(openMarkets)) {
            sessionStorage.active_symbols = JSON.stringify(openMarkets);
            $rootScope.$broadcast('symbols:updated');
          }
          break;
        case 'asset_index':
          if (!sessionStorage.hasOwnProperty('asset_index') || sessionStorage.asset_index != JSON.stringify(message.asset_index)) {
            sessionStorage.asset_index = JSON.stringify(message.asset_index);
            $rootScope.$broadcast('assetIndex:updated');
          }
          break;
        case 'payout_currencies':
          //sessionStorage.currencies = JSON.stringify(message.payout_currencies);
          $rootScope.$broadcast('currencies', message.payout_currencies);
          break;
        case 'proposal':
          if (message.proposal) {
            $rootScope.$broadcast('proposal', message.proposal);
          } else if (message.error) {
            $rootScope.$broadcast('proposal:error', message.error);
          }
          break;
        case 'contracts_for':
          var symbol = message.echo_req.contracts_for;
          var groupedSymbol = _.groupBy(message.contracts_for.available, 'contract_type');
          $rootScope.$broadcast('symbol', groupedSymbol);
          break;
        case 'buy':
          if (message.error) {
            $rootScope.$broadcast('purchase:error', message.error);
            alertService.displayError(message.error.message);
          } else {
            $rootScope.$broadcast('purchase', message);
          }
          break;
        case 'balance':
          if (!(message.error && message.error.code === 'AlreadySubscribed')) {
            $rootScope.$broadcast('balance', message.balance);
          }
          break;
        case 'tick':
          $rootScope.$broadcast('tick', message);
          break;
        case 'history':
          $rootScope.$broadcast('history', message);
          break;
        case 'candles':
          $rootScope.$broadcast('candles', message);
          break;
        case 'ohlc':
          $rootScope.$broadcast('ohlc', message);
          break;
        case 'portfolio':
          $rootScope.$broadcast('portfolio', message.portfolio);
          break;
        case 'profit_table':
          $rootScope.$broadcast('profit_table:update', message.profit_table, message.echo_req.passthrough);
          break;
        case 'sell_expired':
          $rootScope.$broadcast('sell:expired', message.sell_expired);
          break;
        case 'proposal_open_contract':
          $rootScope.$broadcast('proposal:open-contract', message.proposal_open_contract);
          break;
        default:  //console.log('another message type: ', message);
        }
      }
    };
    var websocketService = {};
    websocketService.init = function () {
      setInterval(function restart() {
        if (!dataStream || dataStream.readyState === 3) {
          init();
        }
        return restart;
      }(), 1000);
    };
    websocketService.authenticate = function (_token, extraParams) {
      extraParams = null || extraParams;
      appStateService.isLoggedin = false;
      var data = { authorize: _token };
      for (key in extraParams) {
        if (extraParams.hasOwnProperty(key)) {
          data[key] = extraParams[key];
        }
      }
      sendMessage(data);
    };
    websocketService.sendRequestFor = {
      symbols: function () {
        var data = { active_symbols: 'brief' };
        sendMessage(data);
      },
      assetIndex: function () {
        var data = { asset_index: 1 };
        sendMessage(data);
      },
      currencies: function () {
        var data = { payout_currencies: 1 };
        sendMessage(data);
      },
      contractsForSymbol: function (_symbol) {
        var data = { contracts_for: _symbol };
        sendMessage(data);
      },
      ticksForSymbol: function (_symbol) {
        var data = { ticks: _symbol };
        sendMessage(data);
      },
      forgetAll: function (_stream) {
        var data = { forget_all: _stream };
        sendMessage(data);
      },
      forgetStream: function (_id) {
        var data = { forget: _id };
        sendMessage(data);
      },
      forgetProposals: function () {
        var data = { forget_all: 'proposal' };
        sendMessage(data);
      },
      forgetTicks: function () {
        var data = { forget_all: 'ticks' };
        sendMessage(data);
      },
      proposal: function (_proposal) {
        sendMessage(_proposal);
      },
      purchase: function (_proposalId, price) {
        var data = {
            buy: _proposalId,
            price: price || 0
          };
        sendMessage(data);
      },
      balance: function () {
        var data = {
            balance: 1,
            subscribe: 1
          };
        sendMessage(data);
      },
      portfolio: function () {
        var data = { portfolio: 1 };
        sendMessage(data);
      },
      profitTable: function (params) {
        var data = { profit_table: 1 };
        for (key in params) {
          if (params.hasOwnProperty(key)) {
            data[key] = params[key];
          }
        }
        sendMessage(data);
      },
      ticksHistory: function (data) {
        // data is the whole JSON convertable object parameter for the ticks_history API call
        if (data.ticks_history) {
          sendMessage(data);
        }
      },
      openContract: function (contractId, extraParams) {
        var data = {};
        data.proposal_open_contract = 1;
        if (contractId) {
          data.contract_id = contractId;
        }
        for (key in extraParams) {
          if (extraParams.hasOwnProperty(key)) {
            data[key] = extraParams[key];
          }
        }
        sendMessage(data);
      },
      sellExpiredContract: function () {
        var data = { sell_expired: 1 };
        sendMessage(data);
      }
    };
    return websocketService;
  }
]);
/**
 * @name changeAccount
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('changeAccount', [
  'accountService',
  'websocketService',
  '$state',
  'appStateService',
  function (accountService, websocketService, $state, appStateService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/accounts/change-account.template.html',
      link: function (scope, element) {
        /**
				 * On load:
				 * Open the websocket
				 * If default account is set, send it for validation
				 */
        var init = function () {
          scope.accounts = accountService.getAll();
          scope.selectedAccount = accountService.getDefault().token;
        };
        var updateSymbols = function () {
          // Wait untile the login progress is finished
          if (!appStateService.isLoggedin) {
            setTimeout(updateSymbols, 500);
          } else {
            websocketService.sendRequestFor.symbols();
            websocketService.sendRequestFor.assetIndex();
          }
        };
        init();
        scope.updateAccount = function (_selectedAccount) {
          scope.setDataLoaded(false);
          accountService.setDefault(_selectedAccount);
          accountService.validate();
          updateSymbols();
        };
        scope.navigateToManageAccounts = function () {
          $state.go('accounts');
        };
      }
    };
  }
]);
/**
 * @name changeAccount
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('manageAccounts', [
  'accountService',
  'alertService',
  'cleanupService',
  '$state',
  'languageService',
  'marketService',
  'proposalService',
  'appStateService',
  function (accountService, alertService, cleanupService, $state, languageService, marketService, proposalService, appStateService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/accounts/manage-accounts.template.html',
      link: function (scope, element) {
        var requestId = null;
        scope.accounts = accountService.getAll();
        scope.$on('authorize', function (e, response, reqId) {
          // TODO: Add spinner
          scope.showSpinner = false;
          if (reqId === requestId) {
            if (response) {
              if (accountService.isUnique(response.loginid)) {
                accountService.add(response);
                accountService.setDefault(response.token);
                scope.accounts = accountService.getAll();
                if (!scope.$$phase) {
                  scope.$apply();
                }
              } else {
                if (scope.settingDefault) {
                  scope.settingDefault = false;
                } else {
                  alertService.accountError.tokenNotUnique();
                }
              }
              // reloading language setting
              languageService.set();
            } else {
              alertService.accountError.tokenNotAuthenticated();
            }
          }
        });
        scope.$on('token:remove', function (e, response) {
          accountService.remove(response);
          scope.accounts = accountService.getAll();
          if (!scope.$$phase) {
            scope.$apply();
          }
        });
        scope.addAccount = function (_token) {
          requestId = new Date().getTime();
          scope.showSpinner = false;
          // Validate the token
          if (_token && _token.length === 15) {
            scope.showSpinner = true;
            accountService.validate(_token, { req_id: requestId });
          } else {
            alertService.accountError.tokenNotValid();
          }
        };
        scope.removeAccount = function (_token) {
          alertService.confirmAccountRemoval(_token);
        };
        scope.setAccountAsDefault = function (_token) {
          requestId = new Date().getTime();
          scope.settingDefault = true;
          proposalService.remove();
          marketService.removeActiveSymbols();
          marketService.removeAssetIndex();
          appStateService.isLoggedin = false;
          accountService.setDefault(_token);
          accountService.validate(null, { req_id: requestId });
          scope.accounts = accountService.getAll();
        };
      }
    };
  }
]);
/**
 * @name signin
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 * @description directive used to display the login form
 */
angular.module('binary').directive('signin', [
  'accountService',
  'languageService',
  'websocketService',
  'alertService',
  '$state',
  '$ionicPopup',
  function (accountService, languageService, websocketService, alertService, $state, $ionicPopup) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/accounts/signin.template.html',
      link: function (scope, element) {
        /**
				 * On load:
				 * Open the websocket
				 * If default account is set, send it for validation
				 */
        var init = function () {
          websocketService.init();
          //					if (accountService.hasDefault()) {
          //						accountService.validate();
          //					}
          //websocketService.sendRequestFor.symbols();
          //websocketService.sendRequestFor.assetIndex();
          scope.language = languageService.read();
        };
        init();
        scope.$on('authorize', function (e, response) {
          scope.showSpinner = false;
          if (response) {
            if (accountService.isUnique(response.loginid)) {
              accountService.add(response);
              accountService.setDefault(response.token);
            }
            languageService.set();
            scope.token = '';
            $state.go('options');
          } else {
            alertService.accountError.tokenNotAuthenticated();
          }
        });
        /**
				 * SignIn button: event handler
				 * @param  {String} _token 15char token
				 */
        scope.signIn = function () {
          var _token = scope.token;
          // Set the user's language
          languageService.update(scope.language);
          // Validate the token
          scope.showSpinner = false;
          if (_token && _token.length === 15) {
            scope.showSpinner = true;
            websocketService.authenticate(_token);
          } else {
            alertService.accountError.tokenNotValid();
          }
        };
        scope.changeLanguage = function () {
          languageService.update(scope.language);
        };
      }
    };
  }
]);
/**
 * @name appUpdate
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/07/2016
 * @copyright Binary Ltd
 */
angular.module('binary').directive('appUpdate', [
  '$ionicPlatform',
  function ($ionicPlatform) {
    return {
      scope: {},
      restrict: 'E',
      templateUrl: 'templates/components/codepush/app-update.template.html',
      link: function (scope, element, attrs, ngModel) {
        scope.hide = function () {
          scope.isShown = false;
          scope.showSpinner = false;
          scope.isDownloading = false;
          if (!scope.$$phase && !scope.$root.$$phase) {
            scope.$apply();
          }
        };
        // Use codepush to check new update and install it.
        $ionicPlatform.ready(function () {
          scope.isShown = false;
          scope.showSpinner = false;
          scope.isDownloading = true;
          scope.progress = 0;
          if (window.codePush) {
            codePush.sync(function (syncStatus) {
              scope.isShown = true;
              scope.showSpinner = false;
              scope.isDownloading = false;
              switch (syncStatus) {
              // Result (final) statuses
              case SyncStatus.UPDATE_INSTALLED:
                //alertService.displayAlert("Update","The update was installed successfully.");
                scope.isDownloading = false;
                scope.message = 'update.installed';
                setTimeout(scope.hide, 5000);
                break;
              case SyncStatus.UP_TO_DATE:
                //console.log("The application is up to date.");
                scope.message = 'update.up_to_date';
                setTimeout(scope.hide, 5000);
                break;
              case SyncStatus.UPDATE_IGNORED:
                //alertService.displayAlert("Update","The user decided not to install the optional update.");
                break;
              case SyncStatus.ERROR:
                //alertService.displayAlert("Update","An error occured while checking for updates");
                scope.isDownloading = false;
                scope.message = 'update.error';
                setTimeout(scope.hide, 5000);
                break;
              // Intermediate (non final) statuses
              case SyncStatus.CHECKING_FOR_UPDATE:
                //console.log("Checking for update.");
                scope.message = 'update.check_for_update';
                scope.showSpinner = true;
                break;
              case SyncStatus.AWAITING_USER_ACTION:
                //console.log("Alerting user.");
                break;
              case SyncStatus.DOWNLOADING_PACKAGE:
                //console.log("Downloading package.");
                scope.isDownloading = true;
                scope.message = 'update.downloading';
                break;
              case SyncStatus.INSTALLING_UPDATE:
                //console.log("Installing update");
                scope.message = 'installing';
                scope.showSpinner = true;
                break;
              }
              if (!scope.$$phase && !scope.$root.$$phase) {
                scope.$apply();
              }
            }, {
              installMode: InstallMode.IMMEDIATE,
              updateDialog: true
            }, function (downloadProgress) {
              //console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes + " bytes.");
              scope.progress = downloadProgress.receivedBytes * 100 / downloadProgress.totalBytes;
              if (!scope.$$phase && !scope.$root.$$phase) {
                scope.$apply();
              }
            });
          }
        });
      }
    };
  }
]);
/**
 * @name digitsOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('digitsOption', [
  'marketService',
  function (marketService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/options/digits.template.html',
      link: function (scope, element, attrs) {
        scope.attrs = attrs;
        var hideDigit = function hideDigit(hideDigit) {
          var digitIndex = scope.digits.indexOf(hideDigit);
          if (digitIndex < 0) {
            return;
          }
          scope.digits.splice(digitIndex, 1);
          if (scope.$parent.selected.digit == hideDigit) {
            scope.$parent.selected.digit = scope.digits[0];
          }
        };
        scope.digits = [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9
        ];
        scope.$parent.selected.digit = marketService.getDefault.digit();
        scope.$parent.$watch('hideDigit', function (value) {
          if (scope.$parent != null) {
            scope.digits = [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ];
            scope.$parent.selected.digit = marketService.getDefault.digit();
            if (!isNaN(value)) {
              hideDigit(parseInt(value));
            }
          }
        });
        scope.updateDigit = function (_digit) {
          scope.$parent.selected.digit = _digit;
        };
        scope.getNgDisabled = function () {
          if (scope.attrs.ngDisabled) {
            return scope.$eval(scope.attrs.ngDisabled);
          }
          return false;
        };
      }
    };
  }
]);
/**
 * @name marketsOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('marketsOption', [
  'marketService',
  'proposalService',
  'alertService',
  function (marketService, proposalService, alertService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/options/markets.template.html',
      link: function (scope, element) {
        scope.showSymbolWarning = true;
        /**
				 * Get all symbols for the selected market
				 * @param  {String} _market Selected Market
				 */
        var updateSymbols = function (_market) {
          scope.symbols = marketService.getAllSymbolsForAMarket(_market);
          //marketService.getActiveTickSymbolsForMarket(_market);
          if (scope.symbols.length > 0) {
            scope.$parent.selected.symbol = marketService.getDefault.symbol(_market, scope.symbols);
            marketService.getSymbolDetails(scope.$parent.selected.symbol);
          } else {
            // If there is not any symbol that has tick support, a empty array broadcast for symbol
            scope.$broadcast('symbol', []);
            if (scope.showSymbolWarning) {
              scope.showSymbolWarning = false;
              alertService.displaySymbolWarning('alert.no_underlying');
              scope.$watch(function () {
                return scope.$parent.selected.market;
              }, function (newVal, oldVal) {
                if (newVal !== oldVal)
                  scope.showSymbolWarning = true;
              });
            }
          }
          if (!scope.$$phase) {
            scope.$apply();
          }
        };
        /**
				 * init function - to run on the page load
				 * Get forex and random markets
				 * Set the default/selected market
				 */
        var init = function () {
          if (marketService.hasActiveSymobols() && marketService.hasAssetIndex()) {
            try {
              marketService.fixOrder();
              var markets = marketService.getActiveMarkets();
              scope.market = { random: markets.indexOf('random') !== -1 ? true : false };
              scope.$parent.selected.market = marketService.getDefault.market(scope.market);
              updateSymbols(scope.$parent.selected.market);
              if (!scope.$$phase) {
                scope.$apply();
              }
            } catch (error) {
              console.log(error);
            }
          }
        };
        init();
        scope.$on('symbols:updated', function (e, _symbol) {
          init();
        });
        scope.$on('assetIndex:updated', function (e, _symbol) {
          //updateSymbols(scope.$parent.selected.market);
          init();
        });
        scope.updateMarket = function (_market) {
          // To disable "Let's trade" button until all data is loaded
          scope.setDataLoaded(false);
          scope.$parent.selected.market = _market;
          updateSymbols(scope.$parent.selected.market);
        };
      }
    };
  }
]);
/**
 * @name payoutStakeOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('payoutStakeOption', [
  'marketService',
  function (marketService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/options/payout-stake.template.html',
      link: function (scope, element) {
        scope.$parent.selected.basis = marketService.getDefault.basis();
        scope.updateBasis = function (_basis) {
          scope.$parent.selected.basis = _basis;
        };
      }
    };
  }
]);
/**
 * @name symbolsOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('symbolsOption', [
  'marketService',
  'alertService',
  'config',
  function (marketService, alertService, config) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/options/symbols.template.html',
      link: function (scope, element) {
        scope.tradeTypes = config.tradeTypes;
        scope.$on('symbol', function (e, _symbol) {
          if (!_.isEmpty(_symbol)) {
            scope.tradeTypes = marketService.getTradeTypes(_symbol);
            scope.$parent.selected.tradeType = marketService.getDefault.tradeType(scope.tradeTypes);
            // Assigning "true" to isDataLoaded to enable "Let's trade" button
            scope.setDataLoaded(true);
          } else {
            // Assigning "false" to isDataLoaded to disable "Let's trade" button
            scope.setDataLoaded(true, false);
          }
          if (!scope.$$phase) {
            scope.$apply();
          }
        });
        scope.updateSymbol = function (_selectedSymbol) {
          scope.$parent.selected.symbol = _selectedSymbol;
          marketService.getSymbolDetails(scope.$parent.selected.symbol);
        };
      }
    };
  }
]);
/**
 * @name ticksOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('ticksOption', [
  'marketService',
  function (marketService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/options/ticks.template.html',
      link: function (scope, element) {
        scope.ticks = [
          5,
          6,
          7,
          8,
          9,
          10
        ];
        scope.$parent.selected.tick = marketService.getDefault.tick();
        scope.updateTick = function (_tick) {
          scope.$parent.selected.tick = _tick;
        };
      }
    };
  }
]);
/**
 * @name tradeCategory
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/12/2016
 * @copyright Binary Ltd
 */
angular.module('binary').directive('tradeCategory', [
  'marketService',
  'config',
  '$ionicScrollDelegate',
  function (marketService, config, $ionicScrollDelegate) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/options/trade-category.template.html',
      link: function (scope, element) {
        scope.tradeCategories = config.tradeCategories;
        scope.$parent.$watch('scope.tradeTypes', function (_newValue, _oldValue) {
          var categories = Object.keys(_.groupBy(_newValue, 'category'));
          scope.tradeCategories = _.filter(config.tradeCategories, function (o) {
            return categories.indexOf(o.value);
          });
        });
        scope.$parent.$watch('selected', function (value) {
          if (value.tradeType) {
            var tradeTypeObj = _.find(config.tradeTypes, [
                'value',
                value.tradeType
              ]);
            scope.updateTradeType(tradeTypeObj.category);
          }
        }, true);
        scope.updateTradeType = function (_tradeCategory) {
          var tradeType = _.find(config.tradeTypes, [
              'category',
              _tradeCategory
            ]);
          scope.$parent.selected.tradeType = tradeType.value;
          scope.$parent.selected.tradeCategory = _tradeCategory;
          scope.$parent.displayDigits = false;
          scope.$parent.hideDigit = '';
          if (tradeType.digits === true) {
            if (_tradeCategory == 'OVER/UNDER') {
              if (scope.$parent.selected.digit == 9) {
                scope.$parent.selected.tradeType = 'DIGITUNDER';
              } else {
                scope.$parent.selected.tradeType = 'DIGITOVER';
              }
            }
            scope.$parent.displayDigits = true;
            // Set the digit and barrier for the first time that the digits are enabled
            if (!scope.$parent.selected.barrier && !scope.$parent.selected.digit) {
              scope.$parent.selected.digit = 0;
            }
          }
        };
        scope.$parent.$watch(function () {
          var digitsVisible = angular.element(document).find('digits-option').hasClass('ng-hide');
          return digitsVisible;
        }, function () {
          $ionicScrollDelegate.resize();
        }, false);
      }
    };
  }
]);
/**
 * @name contractSummary
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('contractSummary', [
  'websocketService',
  function (websocketService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/trades/contract-summary.template.html',
      link: function (scope, element) {
        scope.basis = scope.$parent.proposalToSend.basis || 'payout';
        scope.backToOptionPage = function () {
          $('.contract-purchase button').attr('disabled', false);
          scope.setTradeMode(true);
        };
      }
    };
  }
]);
/**
 * @name longCode
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('longCode', [
  'websocketService',
  function (websocketService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/trades/longcode.template.html',
      link: function (scope, element) {
        scope.$parent.$watch('proposalRecieved', function (_proposal) {
          scope.longcode = _proposal ? _proposal.longcode : '';
        });
      }
    };
  }
]);
/**
 * @name payout
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('payout', [
  'websocketService',
  'marketService',
  'proposalService',
  'delayService',
  'appStateService',
  function (websocketService, marketService, proposalService, delayService, appStateService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/trades/payout.template.html',
      link: function (scope, element) {
        var minimumUpdateDelay = 1000;
        scope.basis = scope.$parent.proposalToSend.basis || 'payout';
        scope.amount = marketService.getDefault.amount();
        if (scope.amount == 0) {
          scope.amount = 5;
          updateProposal();
        }
        scope.proposalError = null;
        proposalService.send();
        scope.$on('$destroy', function () {
          delayService.remove('updateProposal');
        });
        scope.$parent.$watch('proposalRecieved', function (_proposal) {
          if (_proposal) {
            var netProfit = parseFloat(_proposal.payout) - parseFloat(_proposal.ask_price);
            _proposal.netProfit = isNaN(netProfit) || netProfit < 0 ? '0' : netProfit.toFixed(2);
            scope.proposal = _proposal;
            scope.proposalError = null;
            if (scope.$parent && scope.$parent.purchaseFrom) {
              scope.$parent.purchaseFrom.amount.$setValidity('InvalidAmount', true);
            }
            if (!scope.$$phase) {
              scope.$apply();
            }
          }
        });
        scope.$on('purchase:error', function (e, error) {
          if (scope.$parent.purchaseFrom) {
            scope.$parent.purchaseFrom.amount.$setValidity('InvalidAmount', false);
          }
          if (!scope.$$phase) {
            scope.$apply();
          }
        });
        scope.$on('proposal:error', function (e, error) {
          scope.proposalError = error;
          if (scope.$parent.purchaseFrom) {
            scope.$parent.purchaseFrom.amount.$setValidity('InvalidAmount', false);
          }
          if (!scope.$$phase) {
            scope.$apply();
          }
        });
        function roundNumber(_newAmount, _oldAmount) {
          var parsed = parseFloat(_newAmount, 10);
          if (parsed !== parsed) {
            return _oldAmount;
          }
          return Math.round(parsed * 100) / 100;
        }
        ;
        function updateProposal() {
          var proposal = proposalService.get();
          if (proposal) {
            proposal.amount = parseFloat(scope.amount, 10);
            proposalService.update(proposal);
            proposalService.send(scope.proposal && scope.proposal.id ? scope.proposal.id : null);
          }
        }
        ;
        scope.delayedUpdateProposal = function delayedUpdateProposal() {
          appStateService.waitForProposal = true;
          if (!scope.$$phase) {
            scope.$apply();
          }
          delayService.update('updateProposal', updateProposal, minimumUpdateDelay);
        };
        scope.updateAmount = function (_form) {
          scope.delayedUpdateProposal();
        };
        // TODO: limit to the account balance for stake
        // TODO: figure out how to handle it for payout
        scope.addAmount = function () {
          var amount = parseFloat(scope.amount);
          if (isNaN(amount)) {
            amount = 0;
          }
          scope.amount = amount < 100000 ? Number(amount + 1).toFixed(2) : 100000;
        };
        scope.subtractAmount = function () {
          var amount = parseFloat(scope.amount);
          scope.amount = amount > 2 ? Number(amount - 1).toFixed(2) : 1;
        };
        scope.isObjectEmpty = function (_obj) {
          return _.isEmpty(_obj);
        };
      }
    };
  }
]);
/**
 * @name purchase
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('purchase', [
  'websocketService',
  'alertService',
  '$rootScope',
  'appStateService',
  function (websocketService, alertService, $rootScope, appStateService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/trades/purchase.template.html',
      link: function (scope, element, attrs) {
        scope.attrs = attrs;
        scope.title = attrs.title ? attrs.title : 'trade.buy';
        scope.purchase = function () {
          $('.contract-purchase button').attr('disabled', true);
          appStateService.purchaseMode = true;
          websocketService.sendRequestFor.purchase(scope.$parent.proposalRecieved.id, scope.$parent.proposalRecieved.ask_price);
          // Send statistic to Google Analytics
          if (typeof analytics !== 'undefined') {
            var proposal = JSON.parse(localStorage.proposal);
            analytics.trackEvent(scope.$parent.account.loginid, proposal.symbol, proposal.contract_type, scope.$parent.proposalRecieved.payout);
          }
        };
        scope.getNgDisabled = function () {
          if (scope.attrs['ngDisabled']) {
            //                        if(scope.attrs['ngDisabled'][0] != '!'){
            //                            return eval('scope.' + scope.attrs['ngDisabled']);
            //                        }
            //                        else{
            //                            return eval('!scope.' + scope.attrs['ngDisabled'].slice(1, scope.attrs['ngDisabled'].length));
            //                        }
            //
            return scope.$eval(scope.attrs['ngDisabled']);
          }
          return false;
        };
      }
    };
  }
]);
/**
 * @name tradeContractChart
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('tradeContractChart', [
  'websocketService',
  'chartService',
  function (websocketService, chartService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/trades/trade-contract-chart.template.html',
      link: function (scope, element) {
        var sendRequestForTicksHistory = function sendRequestForTicksHistory() {
          var symbol = scope.$parent.proposalToSend.symbol;
          websocketService.sendRequestFor.forgetTicks();
          websocketService.sendRequestFor.ticksHistory({
            'ticks_history': symbol,
            'end': 'latest',
            'count': chartService.getCapacity(),
            'subscribe': 1
          });
        };
        var init = function () {
          var chartID = 'tradeContractChart';
          chartService.drawChart(chartID);
          scope.$parent.chartDragLeft = chartService.dragLeft;
          scope.$parent.chartDragRight = chartService.dragRight;
          scope.$parent.chartTouch = chartService.dragStart;
          scope.$parent.chartRelease = chartService.dragEnd;
          scope.$parent.chartPinchIn = chartService.zoomOut;
          scope.$parent.chartPinchOut = chartService.zoomIn;
          scope.$parent.chartPinchStart = chartService.zoomStart;
          scope.$parent.chartPinchEnd = chartService.zoomEnd;
          sendRequestForTicksHistory();
        };
        init();
        scope.$on('$destroy', function (e, value) {
          chartService.destroy();
        });
        scope.$on('portfolio', function (e, portfolio) {
          var contractId = scope.$parent.contract.contract_id;
          if (typeof contractId !== 'undefined') {
            portfolio.contracts.forEach(function (contract) {
              if (contract.contract_id == contractId) {
                chartService.addContract({
                  startTime: contract.date_start + 1,
                  duration: parseInt(scope.$parent.proposalToSend.duration),
                  type: scope.$parent.proposalToSend.contract_type,
                  barrier: scope.$parent.proposalToSend.barrier
                });
              }
            });
          }
        });
        scope.$on('tick', function (e, feed) {
          if (feed && feed.echo_req.ticks_history === scope.$parent.proposalToSend.symbol) {
            chartService.historyInterface.addTick(feed.tick);
          } else {
            websocketService.sendRequestFor.forgetStream(feed.tick.id);
          }
        });
        scope.$on('history', function (e, feed) {
          if (feed && feed.echo_req.ticks_history === scope.$parent.proposalToSend.symbol) {
            chartService.historyInterface.addHistory(feed.history);
          }
        });
        scope.$on('candles', function (e, feed) {
          if (feed) {
            chartService.historyInterface.addCandles(feed.candles);
          }
        });
        scope.$on('ohlc', function (e, feed) {
          if (feed) {
            chartService.historyInterface.addOhlc(feed.ohlc);
          }
        });
        scope.$on('connection:ready', function (e) {
          sendRequestForTicksHistory();
        });
      }
    };
  }
]);
/**
 * @name tradeType
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/12/2016
 * @copyright Binary Ltd
 */
angular.module('binary').directive('tradeType', [
  'config',
  'proposalService',
  function (config, proposalService) {
    return {
      restrict: 'E',
      templateUrl: 'templates/components/trades/trade-type.template.html',
      scope: { proposal: '=' },
      link: function (scope, element) {
        function init() {
          scope.tradeCategory = _.find(config.tradeTypes, [
            'value',
            scope.proposal.contract_type
          ]).category;
          scope.tradeTypes = _.filter(config.tradeTypes, [
            'category',
            scope.tradeCategory
          ]);
        }
        function updateProposal(_tradeType) {
          scope.proposal = proposalService.get();
          if (scope.proposal) {
            scope.proposal.contract_type = _tradeType;
            proposalService.update(scope.proposal);
            proposalService.send(scope.proposal && scope.proposal.id ? scope.proposal.id : null);
          }
        }
        scope.changeTradeType = function () {
          updateProposal(scope.proposal.contract_type);
        };
        scope.checkDigitsConditions = function (_tradeType) {
          if (_tradeType === 'DIGITOVER' && scope.proposal.barrier == 9) {
            return true;
          } else if (_tradeType === 'DIGITUNDER' && scope.proposal.barrier == 0) {
            return true;
          }
          return false;
        };
        init();
      }
    };
  }
]);
/**
 * @name websocketService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/14/2016
 * @copyright Binary Ltd
 * Directive to show application version
 */
angular.module('binary').directive('appVersion', [
  '$ionicPlatform',
  'appVersionService',
  function ($ionicPlatform, appVersionService) {
    return {
      scope: { class: '@' },
      restrict: 'E',
      templateUrl: 'templates/components/utils/app-version.template.html',
      link: function (scope) {
        $ionicPlatform.ready(function () {
          if (window.cordova) {
            cordova.getAppVersion(function (version) {
              scope.appVersion = version;
            }, function (err) {
              console.log(err);
            });
          } else {
            appVersionService.getAppVersion().success(function (data) {
              scope.appVersion = data.version;
            }).error(function (data) {
              scope.appVersion = '0.0.0';
            });
          }
        });
      }
    };
  }
]);
/**
 * @name connectionError
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/04/2016
 * @copyright Binary Ltd
 */
angular.module('binary').directive('connectionStatus', function () {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'templates/components/utils/connection-status.template.html',
    link: function (scope, element, attrs, ngModel) {
      scope.isConnectionError = false;
      scope.$on('connection:error', function () {
        scope.isConnectionError = true;
        if (!scope.$$phase) {
          scope.$apply();
        }
      });
      scope.$on('connection:ready', function () {
        scope.isConnectionError = false;
        if (!scope.$$phase) {
          scope.$apply();
        }
      });
    }
  };
});
/**
 * @name logoSpinner
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/18/2016
 * @copyright Binary Ltd
 */
angular.module('binary').directive('logoSpinner', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: { start: '=' },
    templateUrl: 'templates/components/utils/logo-spinner.template.html'
  };
});
/**
 * @name onLongPress
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/09/2016
 * @copyright Binary Ltd
 * @example <button on-long-press="onLongPress()" on-touch-end="onTouchEnd()" repetitive="true" interval="300"> button </button
 */
angular.module('binary').directive('onLongPress', [
  '$timeout',
  '$interval',
  function ($timeout, $interval) {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {
        var timer = 0;
        var interval = attrs.interval ? Number(attrs.interval) : 300;
        var startPress = function (evt) {
          // Locally scoped variable that will keep track of the long press
          scope.longPress = true;
          if (attrs.repetitive && attrs.repetitive === 'true') {
            // run the function befor repeating in the interval
            scope.$eval(attrs.onLongPress);
            timer = $interval(function () {
              if (scope.longPress) {
                // If the touchend event hasn't fired,
                // apply the function given in on the element's on-long-press attribute
                scope.$eval(attrs.onLongPress);
              }
            }, interval);
          } else {
            // We'll set a timeout for 600 ms for a long press
            timer = $timeout(function () {
              if (scope.longPress) {
                // If the touchend event hasn't fired,
                // apply the function given in on the element's on-long-press attribute
                scope.$eval(attrs.onLongPress);
              }
            }, interval);
          }
        };
        var endPress = function (evt) {
          // Prevent the onLongPress event from firing
          scope.longPress = false;
          if (attrs.repetitive && attrs.repetitive === 'true') {
            $interval.cancel(timer);
          } else {
            $timeout.cancel(timer);
          }
          timer = undefined;
          // If there is an on-touch-end function attached to this element, apply it
          if (attrs.onTouchEnd) {
            scope.$apply(function () {
              scope.$eval(attrs.onTouchEnd);
            });
          }
        };
        elm.bind('touchstart', startPress);
        elm.bind('touchend', endPress);
        elm.bind('mousedown', startPress);
        elm.bind('mouseup', endPress);
      }
    };
  }
]);
/**
 * @name stringToNumber
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/29/2015
 * @copyright Binary Ltd
 */
angular.module('binary').directive('stringToNumber', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (value) {
        return '' + parseFloat(parseFloat(value).toFixed(2));
      });
      ngModel.$formatters.push(function (value) {
        return parseFloat(value, 10);
      });
    }
  };
});