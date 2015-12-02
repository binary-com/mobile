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
						initialPageTickCount = 15, // maximum zoom out
						minimumPageTickCount = 5, // maximum zoom in
						dragging = false,
						zooming = false,
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
					return date.getUTCHours() +	':' + zeroPad(date.getUTCMinutes()) + ':' + zeroPad(date.getUTCSeconds());
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

				var reversedIndex = function reversedIndex(i) {
					return pageTickCount - 1 - i;
				};

				var lastElement = function lastElement(i){
					if ( reversedIndex(i) == 0 ) {
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
				
				var distribute = function distribute(i) {
					var distance = Math.ceil(pageTickCount/minimumPageTickCount);
					if ( reversedIndex(i) % distance == 0 ) { 
						return true;
					} else {
						return false;
					}
				};
	
				var collisionOccured = function collisionOccured(i){
					if ( zoomedIn() ){
						return false;
					}
					if ( distribute(i) ) { 
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

				var drawGridLine = function drawGridLine(gridLine) {
					var point = this.datasets[0].points[gridLine.index];
					var scale = this.scale;

					// draw line
					this.chart.ctx.beginPath();
					if ( gridLine.orientation == 'vertical' ) {
						this.chart.ctx.moveTo(point.x, scale.startPoint + 24);
						this.chart.ctx.strokeStyle = gridLine.color;
						this.chart.ctx.lineTo(point.x, scale.endPoint);
						this.chart.ctx.stroke();
					
						this.chart.ctx.textAlign = 'center';
						this.chart.ctx.fillText(gridLine.label, point.x, scale.startPoint + 12);
					} else {
						this.chart.ctx.moveTo(scale.startPoint, point.y);
						this.chart.ctx.strokeStyle = gridLine.color;
						this.chart.ctx.fillStyle = 'black';
						this.chart.ctx.lineTo(this.chart.width, point.y);
						this.chart.ctx.stroke();
					
						this.chart.ctx.textAlign = 'center';
						var labelWidth = this.chart.ctx.measureText(gridLine.label).width;
						this.chart.ctx.fillText(gridLine.label, this.chart.width - labelWidth, point.y + 12);
					}
				};
				var drawRegion = function drawRegion(region){
					var yHeight = this.scale.endPoint - this.scale.startPoint,
							length,  
							end,  
							start,  
							pointCount = this.datasets[0].points.length;
					start = this.datasets[0].points[region.start].x;
					if ( isDefined(region.end) ) {
						end = this.datasets[0].points[region.end].x;
					} else {
						end = this.datasets[0].points[pointCount - 1].x;
					}
					length = end - start;
					this.chart.ctx.fillStyle = region.color;

					this.chart.ctx.fillRect(start, this.scale.startPoint, length, yHeight);
				};
				Chart.types.Line.extend({
					name: "LineChartSpots",
					draw: function () {
						Chart.types.Line.prototype.draw.apply(this, arguments);
						var parentChart = this;
						
						if ( isDefined(this.options.regions) ){
							this.options.regions.forEach(function(region){
								drawRegion.call(parentChart, region);
							});
						}

						if (isDefined(this.options.gridLines)){
							this.options.gridLines.forEach(function(gridLine){
								drawGridLine.call(parentChart, gridLine);
							});
						}
					}
				});
	
				var canvas = document.getElementById(chartID),
					ctx = canvas.getContext('2d'),
					chartData = {
						labels: [],
						datasets: [
								{
										strokeColor: "orange",
										pointColor: "orange",
										pointStrokeColor: "#fff",
										data: []
								}
						]
					};

				var chartOptions = {
					animation: false,
					bezierCurve : false,
					datasetFill : false,
					showTooltips: false,
					keepAspectRatio: false,
				};

				var chart = new Chart(ctx).LineChartSpots(chartData, chartOptions);
			
				var dragStart = function dragStart(){
					dragging = true;
				};

				var dragEnd = function dragEnd(){
					dragging = false;
				};

				var zoomStart = function zoomStart(){
					zooming = true;
				};

				var zoomEnd = function zoomEnd(){
					zooming = false;
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

				var addGridLine = function addGridLine(gridLine) {
					if ( !isDefined(chartOptions.gridLines) ) {
						chartOptions.gridLines = [];
					}
					chartOptions.gridLines.push(gridLine);
				}
				var result;
				var addArrayToChart = function addArrayToChart(labels, values) {
					chartData.labels = [];
					labels.forEach(function(label, index){
						chartData.labels.push(getTickTime(label));
					});
					chartData.datasets[0].data = values;
					chart.destroy();
					chart = new Chart(ctx).LineChartSpots(chartData, chartOptions);
				};
				// Usage: updateChartForHistory(ticks:<result array of getHistory call from localHistory>);
				// Usage: updateChartForHistory(ticks:<result array of getHistory call from localHistory>);
				var updateChartForHistory = function updateChartForHistory(ticks){
					var times = [],
							prices = [];
					
					entrySpotShowing = false;
					exitSpotShowing = false;
					chartOptions.gridLines = [];
					ticks.forEach(function(tick, index){
						var tickTime = parseInt(tick.time);
						var tickPrice = parseFloat(tick.price);
						// add entry and exit spots and their grid lines
						if ( isEntrySpot(tickTime) || betweenSpots(tickTime) ) { 
							if ( isEntrySpot( tickTime ) ) {
								entrySpotShowing = true;
								setObjValue(contract, 'barrier', tickPrice);
								setObjValue(contract, 'entrySpot', tickTime, !entrySpotReached());
								if ( !digitTrade() ) { 
									addGridLine({
										color: 'blue', 
										label: 'barrier: '+ contract.barrier, 
										orientation: 'horizontal', 
										index: index
									});
								}
								addGridLine({
									color: 'red', 
									label: 'Entry Spot', 
									orientation: 'vertical', 
									index: index
								});
							} else if(  isExitSpot(tickTime, index) ) { 
								exitSpotShowing = true;
								setObjValue(contract, 'exitSpot', tickTime, !exitSpotReached());
								if ( entrySpotShowing ) {
									addGridLine({
										color: 'red', 
										label: 'Exit Spot', 
										orientation: 'vertical', 
										index: index
									});
								}
							}
							setObjValue(contract, 'entrySpotIndex', index, isEntrySpot( tickTime ));
							setObjValue(contract, 'exitSpotIndex', index, isExitSpot( tickTime, index ));
						} 
						times.push(tickTime);
						prices.push(tickPrice);
					});

					var addRegion = function addRegion(region, end) {
						var color = (region == 'win') ? 'rgba(0, 255, 0, 0.2)': 'rgba(255, 0, 0, 0.2)';
						if ( isDefined(end) ) {
							chartOptions.regions = [{
								color: color, 
								start: contract.entrySpotIndex, 
								end: contract.exitSpotIndex
							}];
						} else {
							chartOptions.regions = [{
								color: color, 
								start: contract.entrySpotIndex, 
							}];
						}
					};

					// add win/lose regions
					var lastTime = times.slice(-1)[0],
							lastPrice = prices.slice(-1)[0];
					if ( entrySpotReached() ) { 
						if ( !exitSpotReached() && betweenSpots(lastTime) ) {
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

					addArrayToChart(times, prices);
				};
				
				// Usage: addTick(tick:<tick object>);
				var addTick = function addTick(tick){
					if (localHistory && !updateDisabled) {
						localHistory.addTick(tick);
						if ( dataIndex == 0 && !dragging && !zooming ) {
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
					if ( dataIndex + pageTickCount < capacity - dragSteps){
						dataIndex += dragSteps;
						if ( !isDefined(update) ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						} else if (update) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChartForHistory);
						}
					}
				};

				var dragRight = function dragRight() {
					if ( !zooming ) {
						next();
					}
				};

				var dragLeft = function dragLeft() {
					if ( !zooming ) {
						previous();
					}
				};

				var previous = function previous(update){
					if (dataIndex >= dragSteps ){
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
					first: first,
					dragRight: dragRight,
					dragLeft: dragLeft,
					getCapacity: getCapacity,
					addContract: addContract,
					historyInterface: historyInterface
				};
			};
			this.makeChart = makeChart;	
	});
