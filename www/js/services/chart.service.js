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
						minimumPageTickCount = 5, // maximum zoom in
						notDragging = true,
						notZooming = true,
						updateDisabled = false,
						pageTickCount = initialPageTickCount,
						entrySpotShowing = false,
						exitSpotShowing = false,
						dragSteps = 1,
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
				};

				var isDefined = function isDefined(obj) {
					if ( typeof obj === 'undefined' ) {
						return false;
					} else {
						return true;
					}
				};

				var setObjValue = function setObjValue(obj, attr, value, condition) {
					if ( isDefined( obj ) ) {
						if ( isDefined( condition ) ) {
							if ( condition ) {
								obj[attr] = value;
							}
						} else if ( typeof obj[attr] === 'undefined' ) {
							obj[attr] = value;
						}
					}
				};

				var showPriceIf = function showPriceIf(result, v, condition) {
					setObjValue(result, 'v', v, condition);
				};

				var inversedIndex = function inversedIndex(i) {
					return pageTickCount - 1 - i;
				};

				var lastElement = function lastElement(i){
					if ( inversedIndex(i) == 0 ) {
						return true;
					} else {
						return false;
					}
				};

				var zoomedOut = function zoomedOut(){
					if ( pageTickCount == initialPageTickCount ) {
						return true;
					} else {
						return false;
					}
				};

				var zoomedIn = function zoomedIn(){
					if ( pageTickCount == minimumPageTickCount ) {
						return true;
					} else {
						return false;
					}
				};
				
				var entrySpotReached = function entrySpotReached() {
					if ( contract && isDefined( contract.entrySpotIndex ) ) {
						return true;
					} else {
						return false;
					}
				};

				var exitSpotReached = function exitSpotReached() {
					if ( contract && isDefined( contract.exitSpotIndex ) ) {
						return true;
					} else {
						return false;
					}
				};

				var betweenSpots = function betweenSpots(time) {
					if ( entrySpotReached() && time >= contract.entrySpot && ( !exitSpotReached() || time <= contract.exitSpot ) ) {
						return true;
					} else {
						return false;
					}
				};

				var nearSpots = function nearSpots(i) {
					if ( entrySpotShowing && Math.abs( contract.entrySpotIndex - i ) == 1 ) {
						return true;
					}
					if ( exitSpotShowing && Math.abs( contract.exitSpotIndex - i ) == 1 ) {
						return true;
					}
					return false;
				};
				
				var isSpot = function isSpot(i) {
					if ( entrySpotShowing && contract.entrySpotIndex == i ) {
						return true;
					}
					if ( exitSpotShowing && contract.exitSpotIndex == i ) {
						return true;
					}
					return false;
				};

				var isEntrySpot = function isEntrySpot(time) {
					if ( entrySpotReached() ) {
						if ( time == contract.entrySpot ) {
							return true;
						} else {
							return false;
						}
					} else {
						if ( contract && time >= contract.startTime ) {
							return true;
						} else {
							return false;
						}
					}
				};

				var isExitSpot = function isExitSpot(time, index) {
					if ( exitSpotReached() ) {
						if ( time == contract.exitSpot ) {
							return true;
						} else {
							return false;
						}
					} else {
						if ( entrySpotReached() && index == contract.entrySpotIndex + contract.duration ) {
							return true;
						} else {
							return false;
						}
					}
				};

				var collisionOccured = function collisionOccured(i){
					if ( zoomedIn() ){
						return false;
					}
					var distance = Math.ceil(pageTickCount/minimumPageTickCount);
					if ( inversedIndex(i) % distance == 0 ) { // distribute with distance
						if ( nearSpots(i)	) {
							return true;
						} else {
							return false;	
						}
					} else {
						return true;
					}
				};
	
				var showingHistory = function showingHistory() {
					if ( dataIndex == 0 ) {
						return false;
					} else {
						return true;
					}
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
								var result= {v: null};
								showPriceIf(result, v, lastElement(i));
								showPriceIf(result, v, isSpot(i));
								if ( !zoomedOut() ){ 
									showPriceIf(result, v, !collisionOccured(i));
								}
								return result.v;
							}
						},
						x: 'time',
						columns: [
							['time'],
							['price']
						],
						color: function (color, d) {
							if ( betweenSpots( d.x ) ) {
								return 'blue';
							}
							if (lastElement(d.index) && !showingHistory()){
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

				var digitTrade = function digitTrade() {
					if ( contract.type.indexOf( 'DIGIT' ) == 0 ) {
						return true;
					}
					return false;
				};

				var result;

				// Usage: updateChartForHistory(ticks:<result array of getHistory call from localHistory>);
				var updateChartForHistory = function updateChartForHistory(ticks){
					var times = [],
							prices = [],
							gridsX = [],
							gridsY = [];
					
					entrySpotShowing = false;
					exitSpotShowing = false;
					ticks.forEach(function(tick, index){
						var tickTime = parseInt(tick.time);
						var tickPrice = parseFloat(tick.price);
						// add entry and exit spots and their grid lines
						if ( isEntrySpot(tickTime) || betweenSpots(tickTime) ) { 
							if ( isEntrySpot( tickTime ) ) {
								entrySpotShowing = true;
								setObjValue(contract, 'barrier', tickPrice);
								setObjValue(contract, 'entrySpot', tickTime, !entrySpotReached());
								if ( digitTrade() ) { 
									gridsY.push({value: contract.barrier, text: 'Barrier: ' + contract.barrier});
								}
								gridsX.push({value: contract.entrySpot, text: 'Entry Spot'});
							} else if( isExitSpot(tickTime, index) ) { 
								exitSpotShowing = true;
								setObjValue(contract, 'exitSpot', tickTime, !exitSpotReached());
								if ( entrySpotShowing ) {
									gridsX.push({value: contract.exitSpot, text: 'Exit Spot'});
								} else {
									gridsX.push({value: tickTime});
								}
							} else {
								gridsX.push({value: tickTime});
							}
						} else { 
							gridsX.push({value: tickTime});
						}
						setObjValue(contract, 'entrySpotIndex', index, isEntrySpot( tickTime ));
						setObjValue(contract, 'exitSpotIndex', index, isExitSpot( tickTime, index ));
						times.push(tickTime);
						prices.push(tickPrice);
					});

					var addRegion = function addRegion(region, end) {
						if ( isDefined(end) ) {
							chart.regions.remove({classes: ['winRegion', 'loseRegion']});
							chart.regions.add([{axis: 'x', start: contract.entrySpot, end: contract.exitSpot, class: region + 'Region'}]);
						} else {
							chart.regions.remove({classes: ['winRegion', 'loseRegion']});
							chart.regions.add([{axis: 'x', start: contract.entrySpot, class: region + 'Region'}]);
						}
					};

					// add win/lose regions
					var lastTime = times.slice(-1)[0],
							lastPrice = prices.slice(-1)[0];
					if ( entrySpotReached() ) { 
						if ( betweenSpots(lastTime) ) {
							if ( conditions[contract.type](contract.barrier, lastPrice) ) {
								result = 'win';
							} else {
								result = 'lose';
							}
							addRegion(result);
						} else {
							addRegion(result, true);
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
						if ( dataIndex == 0 && notDragging ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						} else {
							next(false);
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
					if ( pageTickCount > minimumPageTickCount ){
						pageTickCount--;						
						localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
					}
				};

				var first = function first(){
					dataIndex = 0;
					localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
				};

				var next = function next(update){
					if ( notZooming && dataIndex + pageTickCount < capacity - dragSteps){
						dataIndex += dragSteps;
						if ( !isDefined(update) ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						} else if (update) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					}
				};

				var previous = function previous(update){
					if (notZooming && dataIndex >= dragSteps ){
						dataIndex -= dragSteps;
						if ( !isDefined(update) ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						} else if (update) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					}
				};

				var getCapacity = function getCapacity() {
					return capacity;
				};

				var addContract = function addContract(_contract) {
					if (_contract) {
						contract = _contract;
						if ( digitTrade() ) {
							contract.duration -= 1;
						}
						pageTickCount = contract.duration + 1;
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
