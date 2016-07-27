/**
 * @name websocketService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */

angular
	.module('binary')
	.factory('websocketService',
		function($rootScope, localStorageService, alertService, appStateService, $state, config) {
			var dataStream = '';
			var messageBuffer = [];

			var waitForConnection = function(callback) {
				if (!dataStream || dataStream.readyState === 3) {
					init();
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				} else if (dataStream.readyState === 1) {
					callback();
				} else if (!(dataStream instanceof WebSocket)) {
					init();
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				} else {
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				}
			};

			var sendMessage = function(_data) {
				waitForConnection(function() {
					dataStream.send(JSON.stringify(_data));
				});
			};

			var init = function(forced) {
                forced = forced || false;
				var language = localStorage.language || 'en';

                if(dataStream && dataStream.readyState !== 3 && !forced){
                    return;
                }
                else if(dataStream && dataStream.readyState !== 0){
                    dataStream.close();
                }

                dataStream = null;

                appStateService.isLoggedin = false;

                var wsUrl = localStorageService.getWSUrl();
                var appId = localStorageService.getAppId();

                if(!wsUrl){
                    $state.go('home');
                    return;
                }

                wsUrl = wsUrl.replace(/\?l=\w{2}/g, "");

				dataStream = new WebSocket(wsUrl + '?app_id='+ appId +'&l=' + language );

				dataStream.onopen = function() {
                    
                    sendMessage({ping: 1});
                    
                    // Authorize the default token if it's exist
                    var token = localStorageService.getDefaultToken();
                    if(token){
                        var data = {
                            authorize: token,
                            passthrough: {
                                type: "reopen-connection"
                            }
                        };
                        sendMessage(data);

                    }
                    
                    console.log('socket is opened');
                    $rootScope.$broadcast('connection:ready');
					
				};

				dataStream.onmessage = function(message) {
					receiveMessage(message);
				};

				dataStream.onclose = function(e) {
					console.log('socket is closed ', e);
					init();
					console.log('socket is reopened');
                    appStateService.isLoggedin = false;
					$rootScope.$broadcast('connection:reopened');
				};

				dataStream.onerror = function(e) {
					if(e.target.readyState == 3){
						$rootScope.$broadcast('connection:error');
					}
                    appStateService.isLoggedin = false;
				};

			};

			$rootScope.$on('language:updated', function(){
				init(true);
			})


			var websocketService ={};
			websocketService.authenticate = function(_token, extraParams) {
				extraParams = null || extraParams;
                appStateService.isLoggedin = false;

                var data = {
					authorize: _token
				};
                
                for(key in extraParams){
                    if(extraParams.hasOwnProperty(key)){
                        data[key] = extraParams[key];
                    }
                }

				sendMessage(data);
			};

			websocketService.sendRequestFor = {
				symbols: function() {
					var data = {
						active_symbols: "brief"
					};
					sendMessage(data);
				},
				assetIndex: function() {
					var data = {
						asset_index: 1
					};
					sendMessage(data);
				},
				currencies: function() {
					var data = {
						payout_currencies: 1
					};
					sendMessage(data);
				},
				contractsForSymbol: function(_symbol) {
					var data = {
						contracts_for: _symbol
					};
					sendMessage(data);
				},
				ticksForSymbol: function(_symbol) {
					var data = {
						ticks: _symbol
					};
					sendMessage(data);
				},
				forgetAll: function(_stream) {
					var data = {
						forget_all: _stream
					};
					sendMessage(data);
				},
				forgetStream: function(_id) {
					var data = {
						forget: _id
					};
					sendMessage(data);
				},
				forgetProposals: function() {
					var data = {
						forget_all: 'proposal'
					};
					sendMessage(data);
				},
				forgetTicks: function() {
					var data = {
						forget_all: 'ticks'
					};
					sendMessage(data);
				},
				proposal: function(_proposal) {
					sendMessage(_proposal);
				},
				purchase: function(_proposalId, price) {
					var data = {
						buy: _proposalId,
						price: price || 0
					};
					sendMessage(data);
				},
				balance: function() {
					var data = {
						balance: 1,
						subscribe: 1
					};
					sendMessage(data);
				},
				portfolio: function() {
					var data = {
						portfolio: 1
					};
					sendMessage(data);
				},
				profitTable: function(params) {
					var data = {
						profit_table: 1
					};
                    
                    for(key in params){
                        if(params.hasOwnProperty(key)){
                            data[key] = params[key]
                        }
                    }

					sendMessage(data);
				},
				ticksHistory: function(data) {
					// data is the whole JSON convertable object parameter for the ticks_history API call
					if (data.ticks_history) {
						sendMessage(data);
					}
				},
                openContract: function(contractId, extraParams){
                    var data = {};
                    data.proposal_open_contract = 1;
                    
                    if(contractId){
                        data.contract_id = contractId;
                    }

                    for(key in extraParams){
                        if(extraParams.hasOwnProperty(key)){
                            data[key] = extraParams[key]
                        }
                    }

                    sendMessage(data);
                },
                sellExpiredContract: function(){
                    var data = {
                        sell_expired: 1
                    };

                    sendMessage(data);
                }
			};
            
            websocketService.closeConnection = function(){
                if(dataStream){
                    dataStream.close();
                }
            };

			var receiveMessage = function(_response) {
				var message = JSON.parse(_response.data);

				if (message) {
                    if(message.error){
                        if(message.error.code === 'InvalidToken'){
                            localStorageService.manageInvalidToken();
                        }
                    }

                    var messageType = message.msg_type;
                    switch(messageType) {
                        case 'authorize':
                            if (message.authorize) {
                                message.authorize.token = message.echo_req.authorize;
                                window._trackJs.userId = message.authorize.loginid;
                                appStateService.isLoggedin = true;
                                appStateService.scopes = message.authorize.scopes;
                                amplitude.setUserId(message.authorize.loginid);
                                
                                if(_.isEmpty(message.authorize.currency)){
                                    websocketService.sendRequestFor.currencies();
                                } else {
                                    sessionStorage.currency = message.authorize.currency;
                                }

                                $rootScope.$broadcast('authorize', message.authorize, message['req_id'], message['passthrough']);
                            } else {
                                var errorMessage = "Unexpected Error!"
                                if (message.hasOwnProperty('error')) {
                                  localStorageService.removeToken(message.echo_req.authorize);
                                  errorMessage = message.error.message;
                                }
                                $rootScope.$broadcast('authorize', false, errorMessage);
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
                            if ( !sessionStorage.hasOwnProperty('active_symbols') || sessionStorage.active_symbols != JSON.stringify(openMarkets) ) {
                               sessionStorage.active_symbols = JSON.stringify(openMarkets);
                               $rootScope.$broadcast('symbols:updated');
                            }
                            break;
                        case 'asset_index':
                            if ( !sessionStorage.hasOwnProperty('asset_index') || sessionStorage.asset_index != JSON.stringify(message.asset_index) ) {
                              sessionStorage.asset_index = JSON.stringify(message.asset_index);
                              $rootScope.$broadcast('assetIndex:updated');
                            }
                            break;
                        case 'payout_currencies':
                            $rootScope.$broadcast('currencies', message.payout_currencies);
                            break;
                        case 'proposal':
                            if(message.proposal){
                                $rootScope.$broadcast('proposal', message.proposal);
                            }
                            else if(message.error){
                                $rootScope.$broadcast('proposal:error', message.error);
                            }
                            break;
                        case 'contracts_for':
                            var symbol = message.echo_req.contracts_for;
                            var groupedSymbol = _.groupBy(message.contracts_for.available, 'contract_type');
                            $rootScope.$broadcast('symbol', groupedSymbol);
                            break;
                        case 'buy':
                            if(message.error){
                                $rootScope.$broadcast('purchase:error', message.error);
                                alertService.displayError(message.error.message);
                            }
                            else{
                                $rootScope.$broadcast('purchase', message);
                            }
                            break;
                        case 'balance':
                            if(!(message.error && message.error.code === "AlreadySubscribed")){
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
                        default:
                    }
				}
			};

			return websocketService;
	});
