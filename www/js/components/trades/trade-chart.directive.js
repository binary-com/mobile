/**
 * @name tradeChart
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeChart',[
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/trade-chart.template.html',
			link: function(scope, element) {

				var ChartGenerator = function ChartGenerator(pageCount, pageTickCount){
					/*
						LocalHistory(capacity<history capacity in ticks>)
					*/
					var LocalHistory = function LocalHistory(capacity){
						/* 
							historyData is initialized with a call to get `capacity' number of past prices,
							after the initialization this historyData only gets updates from ticks
						*/
						var historyData = []; 

						// Usage: addTick(tick:<tick object>);
						var addTick = function addTick(tick){
							historyData.push({
								time: tick.epoch,
								price: tick.quote
							});
							historyData.shift();
						};


						// Usage: updateHistoryArray(historyArray, history:<history object>);
						var updateHistoryArray = function updateHistoryArray(historyArray, history){
							var times = history.times, 
									prices = history.prices;
							times.forEach(function(time, index){
								historyArray.push({
									time: time,
									price: prices[index] 
								});
							});
						};
						// Usage: addHistory(history:<history object>);
						var addHistory = function addHistory(history){
							updateHistoryArray(historyData, history);
						};
						
						var findElementByAttr = function findElementByAttr(array, attr, expected, compare) {
							if (!compare) {
								compare = function compare(a, b){
									return (a==b)?true:false;
								}
							}
							var foundIndex = -1;
							for (var i = 0; i < array.length; i++ ) {
								if (array[i].hasOwnProperty(attr) && compare(array[i][attr], expected)) {
									foundIndex = i;
								}
							}
							return foundIndex;
						};
					
						// Usage: addCandles(candles:<candle object>);
						var addCandles = function addCandles(candles){
							// addCandles definition here
						};

						// Usage: addOhlc(ohlc:<ohlc object>);
						var addOhlc = function addOhlc (ohlc){
							// addCandles definition here
						};

						// Functions to retrieve history data
						// Usage: getHistory(pageNumber, count, callback<function>);
						var getHistory = function getHistory(pageNumber, count, callback) {
							var start = historyData.length - (pageNumber + 1) * count;
							if ( start >= 0 ) {
								callback( historyData.slice( start, start+count) );
							} else {
								callback( [] );
							}
						};

						return {
							getHistory: getHistory, 
							addTick: addTick,
							addHistory: addHistory,
							addCandles: addCandles,
							addOhlc: addOhlc
						};

					};

					var chart = c3.generate({
						bindto: '#chart',
						transition: {
							duration: 0
						},
						size: {
							height: 150
						},
						data: {
							x: 'time',
							columns: [
								['time'],
								['price']
							],
							colors: {
								price: 'orange'
							}
						},
						grid:{
							x: {
								show: true
							},
							y: {
								show: true
							}
						},
						legend: {
							show: false
						},
						axis: {
							x: {
								show: false
							},
							y: {
								show: false
							}
						}
					});


					var pageNumber = 0, 
							localHistory;
				
					// Usage: updateChartForHistory(ticks:<result array of getHistory call from localHistory>);
					var updateChartForHistory = function updateChartForHistory(ticks){
						var times = []
								prices = [];
						ticks.forEach(function(tick){
							times.push(tick.time);
							prices.push(tick.price);
						});
						chart.load({
							columns: [
								['time'].concat(times),
								['price'].concat(prices)
							]
						});
					};
					
					// Usage: addTick(tick:<tick object>);
					var addTick = function addTick(tick){
						if (localHistory) {
							localHistory.addTick(tick);
							localHistory.getHistory(pageNumber, pageTickCount, updateChartForHistory);
						}
					};

					// Usage: addHistory(history:<history object>);
					var addHistory = function addHistory(history){
						// initialize the localHistory
						localHistory = LocalHistory(pageTickCount * pageCount);
						localHistory.addHistory(history);
						localHistory.getHistory(pageNumber, pageTickCount, updateChartForHistory);
					};

					// Usage: addCandles(candles:<candle object>);
					var addCandles = function addCandles(candles){
						// addCandles definition here
					};

					// Usage: addOhlc(ohlc:<ohlc object>);
					var addOhlc = function addOhlc (ohlc){
						// addCandles definition here
					};
						
					historyInterface = {
						addTick: addTick,
						addHistory: addHistory,
						addCandles: addCandles,
						addOhlc: addOhlc
					};
					
					var firstPage = function firstPage(){
						pageNumber = 0;
						localHistory.getHistory(pageNumber, pageTickCount, updateChartForHistory);
					};

					var nextPage = function nextPage(){
						if (pageNumber < pageCount - 1){
							pageNumber++;
							localHistory.getHistory(pageNumber, pageTickCount, updateChartForHistory);
						}
					};

					var previousPage = function previousPage(){
						if (pageNumber > 0){
							pageNumber--;
							localHistory.getHistory(pageNumber, pageTickCount, updateChartForHistory);
						}
					};

					var getPage = function getPage(){
						return pageNumber + 1;
					}

					return {
						historyInterface: historyInterface,
						getPage: getPage,
						firstPage: firstPage,
						nextPage: nextPage,
						previousPage: previousPage
					};
					
				};
				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol,
							pageCount = 20, 
							pageEntries = 30;
					scope.chartGenerator = ChartGenerator(pageCount, pageEntries);
					scope.$parent.chartSwipeLeft = scope.chartGenerator.previousPage;
					scope.$parent.chartSwipeRight = scope.chartGenerator.nextPage;
					scope.chartPage = scope.chartGenerator.getPage;

					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.ticksHistory(
						{
							"ticks_history": symbol,
							"end": "latest",
							"count": pageCount * pageEntries + 1,
							"subscribe": 1
						}
					);
				};

				init();

				scope.$on('tick', function(e, feed){
					if (feed){
						scope.chartGenerator.historyInterface.addTick(feed.tick);
					}
				});

				scope.$on('history', function(e, feed){
					if (feed){
						scope.chartGenerator.historyInterface.addHistory(feed.history);
					}
				});

				scope.$on('candles', function(e, feed){
					if (feed){
						scope.chartGenerator.historyInterface.addCandles(feed.candles);
					}
				});

				scope.$on('ohlc', function(e, feed){
					if (feed){
						scope.chartGenerator.historyInterface.addOhlc(feed.ohlc);
					}
				});
			}
		};
	}]);



















