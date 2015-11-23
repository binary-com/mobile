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
						/*
							getLastHistoryData(end<end of the time in epoch>, count){...}
							returns the list of elements if could find `count' elements before `end' time
							else returns null
						*/			
						var getLastHistoryData = function getLastHistoryData(end, count){
							var historyDataStart = historyData[0].time,
									lastHistoryData = [],
									endingDataIndex = findElementByAttr(historyData, 'time', end, function compare(a, b){
										return (a==b)?true:(a==b+1)?true:(b==a+1)?true:false;
									});					

							if ( end <= historyDataStart || endingDataIndex < count ) {
								return null;
							}
							for (var j = endingDataIndex; j >= 0 && endingDataIndex - j < count ; j--) {
								lastHistoryData.push(historyData[j]);
							}
							if (lastHistoryData.length == count){
								return lastHistoryData.reverse();
							}	else {
								return null;
							}
						};

						// Functions to retrieve history data
						// Usage: getHistory(end<epoch>, count, callback<function>);
						var getHistory = function getHistory(end, count, callback) {
							var lastHistoryData = getLastHistoryData(end, count);
							if ( lastHistoryData ) {
								callback( lastHistoryData );
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
						point: {
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
							ticksPerSecond = 2,
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
					
					var PageController = function PageController(time, step){
						var changePage = function changePage(pageNumber, now){
							if (now) {
								time = now;
							}
							localHistory.getHistory( time - pageNumber * step, pageTickCount, updateChartForHistory);
						};
						return {
							changePage: changePage
						};
					};

					var pageController;
					// Usage: addTick(tick:<tick object>);
					var addTick = function addTick(tick){
						if (localHistory) {
							localHistory.addTick(tick);
							if (pageController) {
								pageController.changePage(pageNumber, tick.epoch);
							}
						}
					};

					// Usage: addHistory(history:<history object>);
					var addHistory = function addHistory(history){
						// initialize the localHistory
						localHistory = LocalHistory(pageTickCount * pageCount);
						localHistory.addHistory(history);
						pageController = PageController(history.times[history.times.length-1], pageTickCount * ticksPerSecond);
						pageController.changePage(0);
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
						if (pageController) {
							pageController.changePage(pageNumber);
						}
					};

					var nextPage = function nextPage(){
						if (pageNumber < pageCount - 1){
							pageNumber++;
							if (pageController) {
								pageController.changePage(pageNumber);
							}
						}
					};

					var previousPage = function previousPage(){
						if (pageNumber > 0){
							pageNumber--;
							if (pageController) {
								pageController.changePage(pageNumber);
							}
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



















