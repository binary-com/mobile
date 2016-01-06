/**
 * @name chartService 
 * @author Amin Marashi
 * @contributors []
 * @since 11/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.factory('chartService',
		function($rootScope) {
			var localHistory,
					chartDrawer,
					contracts = [],
					utils = {
						zeroPad : function zeroPad(num){
							if (num < 10){
								return '0' + num;
							} else {
								return num.toString();
							}
						},
						getTickTime : function getTickTime(tick) {
							var date = new Date(tick*1000); 
							return date.getUTCHours() +	':' + utils.zeroPad(date.getUTCMinutes()) + ':' + utils.zeroPad(date.getUTCSeconds());
						},
						isDefined : function isDefined(obj) {
							if ( typeof obj === 'undefined' ) {
								return false;
							} else {
								return true;
							}
						},
						setObjValue : function setObjValue(obj, attr, value, condition) {
							if ( utils.isDefined( obj ) ) {
								if ( utils.isDefined( condition ) ) {
									if ( condition ) {
										obj[attr] = value;
									}
								} else if ( typeof obj[attr] === 'undefined' ) {
									obj[attr] = value;
								}
							}
						},
						fractionalLength : function fractionalLength(floatNumber) {
							var stringNumber = floatNumber.toString(),
									decimalLength = stringNumber.indexOf('.');
							return stringNumber.length - decimalLength - 1;
						},
						maxFractionalLength : function maxFractionalLength(floatNumbers) {
							var max = 0;
							floatNumbers.forEach(function(number){
								max = (max < utils.fractionalLength(number))? utils.fractionalLength(number): max;
							});
							return max;
						},
						lastDigit : function lastDigit(num) {
							return parseInt(num.toString().slice(-1));
						},
						conditions : {
							CALL: function condition(barrier, price) {return parseFloat(price) > parseFloat(barrier);}, 
							PUT: function condition(barrier, price) {return parseFloat(price) < parseFloat(barrier);},
							DIGITMATCH: function condition(barrier, price) {return utils.lastDigit(barrier) == utils.lastDigit(price);},
							DIGITDIFF: function condition(barrier, price) {return utils.lastDigit(barrier) != utils.lastDigit(price);},
							DIGITEVEN: function condition(barrier, price) {return utils.lastDigit(price) % 2 == 0;},
							DIGITODD: function condition(barrier, price) {return utils.lastDigit(price) % 2 != 0;},
							DIGITUNDER: function condition(barrier, price) {return utils.lastDigit(price) < parseInt(barrier);},
							DIGITOVER: function condition(barrier, price) {return utils.lastDigit(price) > parseInt(barrier);},
						},
						digitTrade : function digitTrade(contract) {
							if ( contract.type.indexOf( 'DIGIT' ) == 0 ) {
								return true;
							}
							return false;
						},
						getRelativeIndex : function getRelativeIndex(absoluteIndex, dataIndex) {
							return absoluteIndex - ( chartDrawer.getCapacity() - (chartDrawer.getPageTickCount() + chartDrawer.getDataIndex()) );
						},
						getAbsoluteIndex : function getAbsoluteIndex(relativeIndex, dataIndex) {
							return relativeIndex + ( chartDrawer.getCapacity() - (chartDrawer.getPageTickCount() + chartDrawer.getDataIndex()) );
						},
	 				};
			


			var Stepper = function Stepper() {
				var tickDistance = 0;
				var startingPosition = 0;
				var startingDataIndex = 0;
				var started = false;
				var previousTime = 0;
				var setStartPosition = function setStartPosition (dataIndex, position){
					startingPosition = position;
					startingDataIndex = dataIndex;
					deltaTime = 0;
					started = true;
				};
				var stepCount = function stepCount(dataIndex, position) {
					if ( !started ) {
						return 0;
					}
					return ( startingDataIndex + Math.floor((position - startingPosition)/tickDistance) ) - dataIndex;
				};
				var setDistance = function setDistance(canvas, pageTickCount) {
					if ( canvas !== null ) {
						tickDistance = Math.ceil(canvas.offsetWidth/pageTickCount);
					}
				};
				var getDistance = function getDistance() {
					return tickDistance;
				};
				var isStep = function isStep(e, pageTickCount) {
					if ( e.timeStamp - previousTime > 100 ) {
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
					stepCount: stepCount,
				};
			};

			var LocalHistory = function LocalHistory(capacity){
				var historyData = []; 

				var addTick = function addTick(tick){
					historyData.push({
						time: tick.epoch,
						price: tick.quote
					});
					historyData.shift();
				};


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
			
				var addCandles = function addCandles(candles){
				};

				var addOhlc = function addOhlc (ohlc){
				};

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

			var Contract = function Contract(contract) {

				var resetSpotShowing = function resetSpotShowing() {
					contract.entrySpotShowing = false;
					contract.exitSpotShowing = false;
				};

				var entrySpotReached = function entrySpotReached() {
					if ( utils.isDefined( contract.entrySpotIndex ) ) {
						return true;
					} else {
						return false;
					}
				};

				var exitSpotReached = function exitSpotReached() {
					if ( utils.isDefined( contract.exitSpotIndex ) ) {
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
					if ( contract.entrySpotShowing && Math.abs( contract.entrySpotIndex - i ) == 1 ) {
						return true;
					}
					if ( contract.exitSpotShowing && Math.abs( contract.exitSpotIndex - i ) == 1 ) {
						return true;
					}
					return false;
				};
				
				var isSpot = function isSpot(i) {
					if ( contract.entrySpotShowing && contract.entrySpotIndex == i ) {
						return true;
					}
					if ( contract.exitSpotShowing && contract.exitSpotIndex == i ) {
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
						if ( time >= contract.startTime ) {
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
				
				var viewSpot = function viewSpot(index, tickTime) {
						if ( isEntrySpot( tickTime ) ) {
							contract.entrySpotShowing = true;
							if ( !utils.digitTrade(contract) && !exitSpotReached() ) { 
								chartDrawer.addGridLine({
									color: 'blue', 
									label: 'barrier: '+ contract.barrier, 
									orientation: 'horizontal', 
									index: index
								});
							}
						} else if(isExitSpot(tickTime, utils.getAbsoluteIndex(index)) ) { 
							contract.exitSpotShowing = true;
						}
				};

				var addSpot = function addSpot(index, tickTime, tickPrice) {
					if ( isEntrySpot(tickTime) || betweenSpots(tickTime) ) { 
						if ( isEntrySpot( tickTime ) ) {
							utils.setObjValue(contract, 'barrier', tickPrice);
							utils.setObjValue(contract, 'entrySpot', tickTime, !entrySpotReached());
						} else if(isExitSpot(tickTime, index) ) { 
							utils.setObjValue(contract, 'exitSpot', tickTime, !exitSpotReached());
						}
						utils.setObjValue(contract, 'entrySpotIndex', index, isEntrySpot( tickTime ));
						utils.setObjValue(contract, 'exitSpotIndex', index, isExitSpot( tickTime, index ));
					} 
				}; 

				var viewRegion = function viewRegion() {
					var color = (contract.result == 'win') ? 'rgba(0, 255, 0, 0.2)': 'rgba(255, 0, 0, 0.2)';
						if ( contract.exitSpotShowing ) {
							if ( utils.isDefined(contract.region) ){
								var start = utils.getRelativeIndex(contract.entrySpotIndex);
								contract.region.start = (start < 0)? 0 : start;
								contract.region.end = utils.getRelativeIndex(contract.exitSpotIndex);
								contract.region.color = color;
							}
							chartDrawer.addRegion(contract.region);
						} else if ( contract.entrySpotShowing ) {
							if ( !utils.isDefined(contract.region) ){
								contract.region = {
									color: color,
									start: utils.getRelativeIndex(contract.entrySpotIndex),
								};
							} else {
								contract.region.start = utils.getRelativeIndex(contract.entrySpotIndex);
								contract.region.color = color;
							}
							chartDrawer.addRegion(contract.region);
						} else {
							chartDrawer.removeRegion(contract.region);
						}
				};

				var viewRegions = function viewRegions() {
					if ( entrySpotReached() ) { 
						viewRegion();
					}
				};

				var addRegions = function addRegions(lastTime, lastPrice) {
					if ( entrySpotReached() ) { 
						if ( betweenSpots(lastTime) ) {
							if ( utils.conditions[contract.type](contract.barrier, lastPrice) ) {
								contract.result = 'win';
								$rootScope.$broadcast("contract:finished", contract);
							} else {
								contract.result = 'lose';
								$rootScope.$broadcast("contract:finished", contract);
							}
						}
					}
				};

				return {
					isSpot: isSpot,
					betweenSpots: betweenSpots,
					nearSpots: nearSpots,
					resetSpotShowing: resetSpotShowing,
					addSpot: addSpot,
					addRegions: addRegions,
					viewSpot: viewSpot,
					viewRegions: viewRegions,
				};

			};

			var ChartDrawer = function ChartDrawer() {
				var dataIndex = 0, 
						canvas,
						ctx,
						chart,
						capacity = 600,
						maximumZoomOut = 50, 
						maximumZoomIn = 5, 
						hideValuesThreshold = 15,
						pageTickCount = 15,
						dragging = false,
						zooming = false,
						updateDisabled = false,
						stepper = Stepper();


				var showPriceIf = function showPriceIf(result, v, condition) {
					utils.setObjValue(result, 'v', v, condition);
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

				var hideValues = function hideValues(){
					if ( pageTickCount >= hideValuesThreshold ) {
						return true;
					} else {
						return false;
					}
				};

				var zoomedIn = function zoomedIn(){
					if ( pageTickCount == maximumZoomIn ) {
						return true;
					} else {
						return false;
					}
				};
				
				var distribute = function distribute(i) {
					var distance = Math.ceil(pageTickCount/maximumZoomIn);
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
						var nearAnySpots = false;
						contracts.forEach(function(contract){
							if ( contract.nearSpots(utils.getAbsoluteIndex(i))	) {
								nearAnySpots = true;
							}
						});
						return nearAnySpots;
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

				var getDotColor = function getDotColor(value, index) {
					var color;
					contracts.forEach(function(contract){
						if ( contract.betweenSpots( value ) ) {
							color = 'blue';
						}
					});
					if ( utils.isDefined(color) ) { 
						return color;
					}
					if (lastElement(index) && !showingHistory()){
						color = 'green';
					} else {
						color = 'orange';
					}
					return color;
				};

				var drawRegion = function drawRegion(region){
					var yHeight = this.scale.endPoint - this.scale.startPoint,
							length,	
							end,	
							start,	
							pointCount = this.datasets[0].points.length;
					start = this.datasets[0].points[region.start].x;
					if ( utils.isDefined(region.end) ) {
						end = this.datasets[0].points[region.end].x;
					} else {
						end = this.datasets[0].points[pointCount - 1].x;
					}
					length = end - start;
					this.chart.ctx.fillStyle = region.color;

					this.chart.ctx.fillRect(start, this.scale.startPoint, length, yHeight);
				};

				var getValueSize = function getValueSize(ctx, point){
					return { 
						width: ctx.measureText(point.value).width,
						height: parseInt(ctx.font)
					};
				};

				var overlapping = function overlapping(point1, point2) {
					return (point1.s < point2.e && point1.e > point2.s)
              || (point2.s < point1.e && point2.e > point1.s);
				}; 

				var overlapping2d = function overlapping2d(point1, point2) {
					var point1Size = getValueSize(ctx, point1);
					var point2Size = getValueSize(ctx, point2);
					var overlappingY = overlapping({s: point1.y - 5, e: point1.y - 5 + point1Size.height}, 
					{s: point2.y - 5, e: point2.y - 5 + point2Size.height});
					var overlappingX = overlapping({s: point1.x, e: point1.x + point1Size.width}, 
					{s: point2.x, e: point2.x + point2Size.width});
					return overlappingX && overlappingY;
				}; 

				
				var findSpots = function findSpots(points){
					var entry, exit;
					points.forEach(function(point, index){
						contracts.forEach(function(contract){
							if (contract.isSpot(utils.getAbsoluteIndex(index))) {
								if ( utils.isDefined(entry) ) {
									exit = point;
								} else {
									entry = point;
								}
							}
						});
					});
					return {entry: entry, exit: exit};
				};

				var okToAdd = function okToAdd(shown, point) {
					var result = true;
					shown.forEach(function(shownPoint, index){
						if ( overlapping2d(shownPoint, point) ) {
							result = false;
						}
					});				
					return result;
				};

				var shownValues = function shownValues(points){
					var shown = [];
					var spots = findSpots(points);
					// This is our priority: 1. exit spot, 2. entry spot, 3. last value, 4. others
					if ( utils.isDefined(spots.exit) ){
						shown.push(spots.exit);
						if ( utils.isDefined(spots.entry) && !overlapping2d(spots.entry, spots.exit) ) {
							shown.push(spots.entry);
						}
					} else if ( utils.isDefined(spots.entry) ) {
						shown.push(spots.entry);
					} 

					var lastElement = points.slice(-1)[0];
					if ( !showingHistory() && okToAdd(shown, lastElement) ) {
						shown.push(lastElement);
					}

					if ( !hideValues() ) {
						points.forEach(function(point, index){
							if ( index != 0 && okToAdd(shown, point) ) {
								shown.push(point);
							}
						});
					}
					return shown;
				};

				var drawLabel = function drawLabel(shownPoints, point, index){
					var result= {};
					var ctx = this.chart.ctx;
					if ( shownPoints.indexOf(point) > -1 ) {
						ctx.fillStyle = 'black';
						ctx.textAlign = "center";
						ctx.textBaseline = "bottom";
						
						var padding = 0;
						var valueWidth = getValueSize(ctx, point).width;
						if ( lastElement(index) ) {
							padding = ( valueWidth < 45) ? 0 : valueWidth - 45;
						}
						ctx.fillText(point.value, point.x - padding, point.y - 5);
					}
				};

				var drawGridLine = function drawGridLine(gridLine) {
					var point = this.datasets[0].points[gridLine.index];
					var scale = this.scale;

					this.chart.ctx.beginPath();
					if ( gridLine.orientation == 'vertical' ) {
						this.chart.ctx.moveTo(point.x, scale.startPoint + 24);
						this.chart.ctx.strokeStyle = gridLine.color;
						this.chart.ctx.fillStyle = 'black';
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
						this.chart.ctx.fillText(gridLine.label, labelWidth, point.y - 5);
					}
				};
	

				Chart.CustomScale = Chart.Scale.extend({
					initialize: function () {
						var longestText = function(ctx,font,arrayOfStrings){
							ctx.font = font;
							var longest = 0;
							Chart.helpers.each(arrayOfStrings,function(string){
								var textWidth = ctx.measureText(string).width;
								longest = (textWidth > longest) ? textWidth : longest;
							});
							return longest;
						};

						this.calculateXLabelRotation = function(){

							this.ctx.font = this.font;

							var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
								lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
								firstRotated,
								lastRotated;


							this.xScalePaddingRight = lastWidth/2 + 3;

							this.xLabelRotation = 0;
							if (this.display){
								var originalLabelWidth = longestText(this.ctx,this.font,this.xLabels),
									cosRotation,
									firstRotatedWidth;
								this.xLabelWidth = originalLabelWidth;
								var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;
							}
							else{
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
						var toRadians = helpers.radians;
						var ctx = this.ctx,
							yLabelGap = (this.endPoint - this.startPoint) / this.steps,
							xStart = Math.round(this.xScalePaddingLeft);
						if (this.display) {
							ctx.fillStyle = this.textColor;
							ctx.font = this.font;
							each(this.yLabels, function (labelString, index) {
								var yLabelCenter = this.endPoint - (yLabelGap * index),
									linePositionY = Math.round(yLabelCenter);

								ctx.textAlign = "right";
								ctx.textBaseline = "middle";
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
								if (typeof this.labelsFilter === "function" && this.labelsFilter(index)) {
									filtered = true;
								}
								var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
									linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth);
								

								ctx.beginPath();

								if (index > 0) {
									ctx.lineWidth = this.gridLineWidth;
									ctx.strokeStyle = this.gridLineColor;
								} else {
									ctx.lineWidth = this.lineWidth;
									ctx.strokeStyle = this.lineColor;
								}
								ctx.moveTo(linePos, this.endPoint);
								ctx.lineTo(linePos, this.startPoint - 3);
								ctx.stroke();
								ctx.closePath();


								ctx.lineWidth = this.lineWidth;
								ctx.strokeStyle = this.lineColor;


								ctx.beginPath();
								ctx.moveTo(linePos, this.endPoint);
								if ( filtered ) {
									ctx.lineTo(linePos, this.endPoint);
								} else {
									ctx.lineTo(linePos, this.endPoint + 10);
								}
								ctx.stroke();
								ctx.closePath();

								ctx.save();
								ctx.translate(xPos, this.endPoint + 8);

								ctx.textAlign = "center";
								ctx.textBaseline = "top";
								if ( !filtered ) {
									ctx.fillText(label, 0, 0);
								}
								ctx.restore();

							}, this);

						}
					}
				});

				Chart.types.Line.extend({
					name: "LineChartSpots",
					initialize: function (data) {
						this.options.labelsFilter = data.labelsFilter || null;
						Chart.types.Line.prototype.initialize.apply(this, arguments);
					},
					draw: function () {
						this.datasets.forEach(function (dataset) {
							dataset.points.forEach(function (point, index) {
								point.fillColor = getDotColor(chartData.epochLabels[index], index);
							});
						});
						Chart.types.Line.prototype.draw.apply(this, arguments);
						var parentChart = this;
						this.datasets.forEach(function (dataset) {
							dataset.points.forEach(function (point, index) {
								drawLabel.call(parentChart, shownValues.call(parentChart, dataset.points), point, index);
							});
						});
						
						if ( utils.isDefined(this.options.regions) ){
							this.options.regions.forEach(function(region){
								drawRegion.call(parentChart, region);
							});
						}

						if (utils.isDefined(this.options.gridLines)){
							this.options.gridLines.forEach(function(gridLine){
								drawGridLine.call(parentChart, gridLine);
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
								var updatedRanges = helpers.calculateScaleRange(
								dataTotal(),
								currentHeight,
								this.fontSize,
								this.beginAtZero,
								this.integersOnly);
								helpers.extend(this, updatedRanges);
							},
							xLabels: labels,
							font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
							lineWidth: this.options.scaleLineWidth,
							lineColor: this.options.scaleLineColor,
							gridLineWidth: (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
							gridLineColor: (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
							padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
							showLabels: this.options.scaleShowLabels,
							display: this.options.showScale
						};

						if (this.options.scaleOverride) {
							helpers.extend(scaleOptions, {
								calculateYRange: helpers.noop,
								steps: this.options.scaleSteps,
								stepValue: this.options.scaleStepWidth,
								min: this.options.scaleStartValue,
								max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
							});
						}

						this.scale = new Chart.CustomScale(scaleOptions);
					}
				});
	
				var chartData = {
					labels: [],
					labelsFilter: function (index) {
						return !distribute(index);
					},
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
					scaleShowLabels: false,
				};

				var drawChart = function drawChart(chartID){
					canvas = document.getElementById(chartID);
					if ( canvas !== null ) {
						ctx = canvas.getContext('2d');
						stepper = Stepper();
						stepper.setDistance(canvas, pageTickCount);
					}
				};

				var findRegion = function findRegion(region){
					if ( utils.isDefined(chartOptions.regions) ) {
						return chartOptions.regions.indexOf(region);
					} else {
						return -1;
					}
				};			

				var addRegion = function addRegion(region){
					if ( !utils.isDefined(chartOptions.regions) ) {
						chartOptions.regions = [];
					}
					if ( findRegion(region) < 0 ) {
						chartOptions.regions.push(region);
					}
				};			

				var removeRegion = function removeRegion(region){
					var regionIndex = findRegion(region);
					if ( regionIndex >= 0) {
						chartOptions.regions.splice(regionIndex, 1);
					}
				};			

				var dragStart = function dragStart(e){
					stepper.setStartPosition(dataIndex, e.center.x);
					dragging = true;
				};

				var dragEnd = function dragEnd(e){
					if ( !zooming ) {
						move(stepper.stepCount( dataIndex, e.center.x ));
					}
					stepper.stop();
					dragging = false;
				};

				var zoomStart = function zoomStart(){
					zooming = true;
				};

				var zoomEnd = function zoomEnd(){
					zooming = false;
				};

				var addGridLine = function addGridLine(gridLine) {
					if ( !utils.isDefined(chartOptions.gridLines) ) {
						chartOptions.gridLines = [];
					}
					chartOptions.gridLines.push(gridLine);
				}
			
				var addArrayToChart = function addArrayToChart(labels, values) {
					chartData.labels = [];
					chartData.epochLabels = labels;
					labels.forEach(function(label, index){
						chartData.labels.push(utils.getTickTime(label));
					});
					
					chartData.datasets[0].data = values;
					if ( utils.isDefined(chart) ) {
						chart.destroy();
					}
					if ( utils.isDefined(ctx) ) {
						chart = new Chart(ctx).LineChartSpots(chartData, chartOptions);
					}
				};

				var updateChart = function updateChart(ticks){
					chartOptions.gridLines = [];
					contracts.forEach(function(contract){
						contract.resetSpotShowing();
					});
					var times = [],
							prices = [];
					
					ticks.forEach(function(tick, index){
						var tickTime = parseInt(tick.time);
						contracts.forEach(function(contract){
							contract.viewSpot(index, tickTime);
						});
						times.push(tickTime);
						prices.push(tick.price);
					});

					contracts.forEach(function(contract){
						contract.viewRegions();
					});

					addArrayToChart(times, prices);
				};

				var updateContracts = function updateContracts(ticks){
					var lastTime,
							lastPrices;
					
					ticks.forEach(function(tick, index){
						var tickTime = parseInt(tick.time);
						var tickPrice = tick.price;
						contracts.forEach(function(contract){
							contract.addSpot(index, tickTime, tickPrice);
						});
						lastTime = parseInt(tick.time);
						lastPrice = tick.price;
					});

					contracts.forEach(function(contract){
						contract.addRegions(lastTime, lastPrice);
					});
				};
				
				var addTick = function addTick(tick){
					if (localHistory && !updateDisabled) {
						localHistory.addTick(tick);
						localHistory.getHistory(0, capacity, updateContracts);
						if ( dataIndex == 0 && !dragging && !zooming ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChart);
						} else {
							move(1, false);
						}
					}
				};

				var addHistory = function addHistory(history){
					if (!localHistory) {
						localHistory = LocalHistory(capacity);
					}
					localHistory.addHistory(history);
					localHistory.getHistory(0, capacity, updateContracts);
					localHistory.getHistory(dataIndex, pageTickCount, updateChart);
				};

				var addCandles = function addCandles(candles){
				};

				var addOhlc = function addOhlc (ohlc){
				};
					
				
				var zoomOut = function zoomOut(){
					var zoomed = parseInt(pageTickCount * 1.2);
					if ( zoomed < maximumZoomOut ){
						pageTickCount = zoomed;
						localHistory.getHistory(dataIndex, pageTickCount, updateChart);
						stepper.setDistance(canvas, pageTickCount);
					}
				};

				var zoomIn = function zoomIn(){
					var zoomed = parseInt(pageTickCount / 1.2);
					if ( zoomed > maximumZoomIn ){
						pageTickCount = zoomed;
						localHistory.getHistory(dataIndex, pageTickCount, updateChart);
						stepper.setDistance(canvas, pageTickCount);
					}
				};

				var move = function move(steps, update){
					if ( steps == 0 ) {
						return;
					}
					var testDataIndex = dataIndex + steps;
					if ( testDataIndex < 0 ) {
						testDataIndex = 0;
					} else if(testDataIndex >= capacity - pageTickCount) {
						testDataIndex = capacity - pageTickCount - 1;
					}
					if ( testDataIndex != dataIndex ){
						dataIndex = testDataIndex;
						if ( !utils.isDefined(update) || update ) {
							localHistory.getHistory(dataIndex, pageTickCount, updateChart);
						}
					}
				};

				var drag = function drag(e) {
					if ( !zooming && stepper.isStep(e, pageTickCount) ) {
						move(stepper.stepCount( dataIndex, e.center.x ));
					}
				};

				var getCapacity = function getCapacity() {
					return capacity;
				};

				var getPageTickCount = function getPageTickCount() {
					return pageTickCount;
				};

				var getDataIndex = function getDataIndex() {
					return dataIndex;
				};

				var addContract = function addContract(_contract) {
					if (_contract) {
						if ( utils.digitTrade(_contract) ) {
							_contract.duration -= 1;
						}
						contracts.push(Contract(_contract));
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
					getPageTickCount: getPageTickCount,
					getDataIndex: getDataIndex,
					addContract: addContract,
					historyInterface: historyInterface,
					addGridLine: addGridLine,
					addRegion: addRegion,
					removeRegion: removeRegion,
					drawChart: drawChart,
				};

			};

			var drawChart = function drawChart(chartID) {
				chartDrawer.drawChart(chartID);
			};
			chartDrawer = ChartDrawer();

			return {
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
	});
