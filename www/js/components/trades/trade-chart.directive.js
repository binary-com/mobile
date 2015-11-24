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

				var ChartGenerator = function ChartGenerator(capacity, initialPageTickCount){
					var dataIndex = 0, 
							capacity = 600,
							updateEnabled = true,
							pageTickCount = initialPageTickCount,
							localHistory;
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
						// Usage: getHistory(dataIndex, count, callback<function>);
						var getHistory = function getHistory(dataIndex, count, callback) {
							var end = capacity - dataIndex,
									start = end - (count - 1);
							if ( start >= 0 ) {
								callback( historyData.slice( start, end) );
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
						interaction: {
							enabled: false
						},
						size: {
							height: 150
						},
						data: {
							labels: {
								format: function(v, id, i, j) {
									if ((pageTickCount - i - 2)%parseInt(pageTickCount/10) == 0) {
										return v;
									}
								}
							},
							x: 'time',
							columns: [
								['time'],
								['price']
							],
							color: function (color, d) {
								if (d.index == pageTickCount - 2 && dataIndex == 0){
									return 'green';
								}	else {
									return 'orange';
								}
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
								padding: {
									left: 1,
									right: 1,
								},
								show: true,
								tick: {
									culling: {
										max: parseInt(pageTickCount/3.5) 
									},
									format: function (x) { 
										var date = new Date(x*1000), 
												dateString = date.toLocaleTimeString();
										return dateString.slice(0, dateString.length-3);
									}
								} 
							},
							y: {
								show: false
							}
						}
					});


					
					var disableUpdate = function disableUpdate(){
						updateEnabled = false;
					};

					var enableUpdate = function enableUpdate(){
						updateEnabled = true;
					};
				
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
							if ( updateEnabled ) {
								localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
							}
						}
					};

					// Usage: addHistory(history:<history object>);
					var addHistory = function addHistory(history){
						// initialize the localHistory
						localHistory = LocalHistory(capacity);
						localHistory.addHistory(history);
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
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
					
					var zoomIn = function zoomIn(){
						if ( pageTickCount < initialPageTickCount ){
							pageTickCount++;						
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					};

					var zoomOut = function zoomOut(){
						if ( pageTickCount > 10 ){
							pageTickCount--;						
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					};

					var first = function first(){
						dataIndex = 0;
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
					};

					var next = function next(){
						if (dataIndex + pageTickCount < capacity - 2){
							dataIndex += 2;
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					};

					var previous = function previous(){
						if (dataIndex > 1){
							dataIndex -= 2;
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					};

					return {
						historyInterface: historyInterface,
						disableUpdate: disableUpdate,
						enableUpdate: enableUpdate,
						zoomIn: zoomIn,
						zoomOut: zoomOut,
						first: first,
						next: next,
						previous: previous
					};
					
				};
				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol,
							capacity = 600, 
							pageEntries = 30;
					scope.chartGenerator = ChartGenerator(capacity, pageEntries);
					scope.$parent.chartDragLeft = scope.chartGenerator.previous;
					scope.$parent.chartDragRight = scope.chartGenerator.next;
					scope.$parent.chartTouch = scope.chartGenerator.disableUpdate;
					scope.$parent.chartRelease = scope.chartGenerator.enableUpdate;
					scope.$parent.chartPinchIn = scope.chartGenerator.zoomIn;
					scope.$parent.chartPinchOut = scope.chartGenerator.zoomOut;
					scope.$parent.chartPinchStart = scope.chartGenerator.disableUpdate;
					scope.$parent.chartPinchEnd = scope.chartGenerator.enableUpdate;

					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.ticksHistory(
						{
							"ticks_history": symbol,
							"end": "latest",
							"count": capacity + 1,
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



















