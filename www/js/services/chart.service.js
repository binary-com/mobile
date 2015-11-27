/**
 * @name chartService 
 * @author Amin Marashi
 * @contributors []
 * @since 11/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.service('chartService',
		function() {
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
					historyData = [];
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
							start = end - count;
					if ( start >= 0 ) {
						callback( historyData.slice( start, end ) );
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

			var localHistory;

			var makeChart = function makeChart(chartID) {
				var dataIndex = 0, 
						capacity = 600,
						initialPageTickCount = 15,
						notDragging = true,
						notZooming = true,
						updateDisabled = false,
						pageTickCount = initialPageTickCount,
						contract;

				var zeroPad = function zeroPad(num){
					if (num < 10){
						return '0' + num;
					} else {
						return num.toString();
					}
				};
				var getTickTime = function getTickTime(tick) {
					var date = new Date(tick*1000); 
					return date.getUTCHours() +  ':' + zeroPad(date.getUTCMinutes()) + ':' + zeroPad(date.getUTCSeconds());
				}

				var chart = c3.generate({
					bindto: chartID,
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
								if (pageTickCount == initialPageTickCount){
									if (pageTickCount - 1 == i) {
										return v;
									}
								} else if ((pageTickCount - i - 1)%Math.ceil(pageTickCount/5) == 0) {
									if (pageTickCount - 1 == i || pageTickCount <= 5) {
										return v;
									}
									if (contract){
										if (!contract.entrySpotIndex) {
											return v;
										}
										if (contract.entrySpotIndex && Math.abs(contract.entrySpotIndex - i) > 1) {
											return v;
										}
										if (contract.exitSpotIndex && Math.abs(contract.exitSpotIndex - i) > 1) {
											return v;
										}
									} else {
										return v;
									}
								}
								if ( contract ) {
									if ( contract.entrySpotIndex && contract.entrySpotIndex == i ) {
										return v;
									}
									if ( contract.exitSpotIndex && contract.exitSpotIndex == i ) {
										return v;
									}
								}
							}
						},
						x: 'time',
						columns: [
							['time'],
							['price']
						],
						color: function (color, d) {
							if (contract) {
								if (d.x >= contract.entrySpot && (!contract.exitSpot || d.x <= contract.exitSpot)) {
									return 'blue';
								}
							}
							if (d.index == pageTickCount - 1 && dataIndex == 0){
								return 'green';
							}	else {
								return 'orange';
							}
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
									max: 7
								},
								format: getTickTime
							} 
						},
						y: {
							show: false
						}
					}
				});
			
				var dragStart = function dragStart(){
					notDragging = false;
				};

				var dragEnd = function dragEnd(){
					notDragging = true;
				};

				var zoomStart = function zoomStart(){
					notDragging = false;
					notZooming = false;
				};

				var zoomEnd = function zoomEnd(){
					notDragging = true;
					notZooming = true;
				};

				var conditions = {
					CALL: function condition(barrier, price) {return barrier < price;}, 
					PUT: function condition(barrier, price) {return barrier > price;},
					DIGITMATCH: function condition(barrier, price) {return barrier.toString().slice(-1) == price.toString().slice(-1);},
					DIGITDIFF: function condition(barrier, price) {return barrier.toString().slice(-1) != price.toString().slice(-1);},
					DIGITEVEN: function condition(barrier, price) {return parseInt(price.toString().slice(-1)) % 2 == 0;},
					DIGITODD: function condition(barrier, price) {return parseInt(price.toString().slice(-1)) % 2 != 0;},
					DIGITUNDER: function condition(barrier, price) {return parseInt(price.toString().slice(-1)) < barrier;},
					DIGITOVER: function condition(barrier, price) {return parseInt(price.toString().slice(-1)) > barrier;},
				};
				var result;
				// Usage: updateChartForHistory(ticks:<result array of getHistory call from localHistory>);
				var updateChartForHistory = function updateChartForHistory(ticks){
					var times = [],
							prices = [],
							gridsX = [],
							gridsY = [],
							distanceFromEntrySpot = 0;
					ticks.forEach(function(tick, index){
						var tickTime = parseInt(tick.time);
						if (contract && tickTime >= contract.entrySpot && (!contract.exitSpot || tickTime <= contract.exitSpot)) { // the entrySpot, here it is
							if (distanceFromEntrySpot == 0) {
								if (!contract.barrier) {
									contract.barrier = parseFloat(tick.price);
								}
								if (!contract.entrySpotIndex) {
									contract.entrySpot = tickTime;
								}
								contract.entrySpotIndex = index;
								gridsY.push({value: contract.barrier, text: 'Barrier: ' + contract.barrier});
								gridsX.push({value: contract.entrySpot, text: 'Entry Spot'});
								distanceFromEntrySpot++;
							} else if(distanceFromEntrySpot == contract.duration) { // this is exitSpot
								gridsX.push({value: tickTime, text: 'Exit Spot'});
								contract.exitSpotIndex = index;
								if (!contract.exitSpot) {
									contract.exitSpot = tickTime;
								}
							} else {
								gridsX.push({value: tickTime});
								distanceFromEntrySpot++;
							}
						} else { // add grid lines after exit spot and before entry spot
							gridsX.push({value: tickTime});
						}
						times.push(tickTime);
						prices.push(parseFloat(tick.price));
					});
					if (contract) { // add win or lose regions
						if (!contract.exitSpot || times.slice(-1)[0] <= contract.exitSpot) {
							if (times.slice(-1)[0] > contract.entrySpot) { 
								if (conditions[contract.type](contract.barrier, prices.slice(-1)[0])) {
									result = 'win';
									chart.regions.remove({classes: ['winRegion', 'loseRegion']});
									chart.regions.add([{axis: 'x', start: contract.entrySpot, class: 'winRegion'}]);
								} else {
									result = 'lose';
									chart.regions.remove({classes: ['winRegion', 'loseRegion']});
									chart.regions.add([{axis: 'x', start: contract.entrySpot, class: 'loseRegion'}]);
								}
							}
						} else {
							chart.regions.remove({classes: ['winRegion', 'loseRegion']});
							chart.regions.add([{axis: 'x', start: contract.entrySpot, end: contract.exitSpot, class: result + 'Region'}]);
						}
					}
					chart.load({
						columns: [
							['time'].concat(times),
							['price'].concat(prices)
						]
					});
					var firstPrice = Math.min.apply(Math, prices),
							lastPrice = Math.max.apply(Math, prices),
							priceStep = ((lastPrice - firstPrice)/(gridsX.length/2));
					for (var i = firstPrice; i<lastPrice + priceStep/2 ; i+=priceStep){
						gridsY.push({value: i});
					}
					chart.xgrids(gridsX);
					chart.ygrids(gridsY);
				};
				
				// Usage: addTick(tick:<tick object>);
				var addTick = function addTick(tick){
					if (localHistory && !updateDisabled) {
						localHistory.addTick(tick);
						if ( notDragging ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					}
				};

				// Usage: addHistory(history:<history object>);
				var addHistory = function addHistory(history){
					// initialize the localHistory
					if (!localHistory) {
						localHistory = LocalHistory(capacity);
					}
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
					
				
				var zoomOut = function zoomOut(){
					if ( pageTickCount < initialPageTickCount ){
						pageTickCount++;						
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
					}
				};

				var zoomIn = function zoomIn(){
					if ( pageTickCount > 5 ){
						pageTickCount--;						
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
					}
				};

				var first = function first(){
					dataIndex = 0;
					localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
				};

				var next = function next(){
					if ( notZooming && dataIndex + pageTickCount < capacity - 2){
						dataIndex += 2;
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
					}
				};

				var previous = function previous(){
					if (notZooming && dataIndex > 1){
						dataIndex -= 2;
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
					}
				};

				var getCapacity = function getCapacity() {
					return capacity;
				};

				var addContract = function addContract(_contract) {
					contract = _contract;
					pageTickCount = contract.duration + 1;
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
					first: first,
					next: next,
					previous: previous,
					getCapacity: getCapacity,
					addContract: addContract,
					historyInterface: historyInterface
				};
			};
			this.makeChart = makeChart;	
	});
