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
		function ($rootScope) {

			var localHistory,
				chartDrawer,
				contractCtrls = [];

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
							strokeColor: "#e98024",
							pointColor: "#e98024",
							pointStrokeColor: "#fff",
							data: []
						}]
					},
					chartOptions: {
						animation: false,
						bezierCurve: false,
						datasetFill: false,
						showTooltips: false,
						keepAspectRatio: false,
						scaleShowLabels: false,
						pointDotRadius: 3, //original 4
						datasetStrokeWidth: 2, //original 2
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
					var stringNumber = floatNumber.toString(),
						decimalLength = stringNumber.indexOf('.');
					return stringNumber.length - decimalLength - 1;
				},
				maxFractionalLength: function maxFractionalLength(floatNumbers) {
					var max = 0;
					floatNumbers.forEach(function (number) {
						max = (max < utils.fractionalLength(number)) ? utils.fractionalLength(number) : max;
					});
					return max;
				},
				lastDigit: function lastDigit(num) {
					return parseInt(num.toString()
						.slice(-1)[0]);
				},
                average: function average(list){
                    var decimalPointLength = utils.fractionalLength(list[0]) + 1;
                    return parseFloat(list.reduce(function(a, b){ return a + b;}, 0) / list.length).toFixed(decimalPointLength);
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
					},
                    ASIANU: function condition(barrier, price, priceList){
                        var avg = utils.average(priceList);

                        return parseFloat(price) > avg;
                    },
                    ASIAND: function condition(barrier, price, priceList){
                        var avg = utils.average(priceList);

                        return parseFloat(price) < avg;
                    }
				},
				digitTrade: function digitTrade(contract) {
					if (contract.type.indexOf('DIGIT') === 0) {
						return true;
					}
					return false;
				},
                asianGame: function asianGame(contract){
                    if(contract.type.indexOf('ASIAN') === 0){
                        return true;
                    }
                    return false;
                },
				getRelativeIndex: function getRelativeIndex(absoluteIndex, dataIndex) {
					return absoluteIndex - (chartDrawer.getCapacity() - (chartDrawer.getTickCount() + chartDrawer.getDataIndex()));
				},
				getAbsoluteIndex: function getAbsoluteIndex(relativeIndex, dataIndex) {
					return relativeIndex + (chartDrawer.getCapacity() - (chartDrawer.getTickCount() + chartDrawer.getDataIndex()));
				},
			};

			var Stepper = function Stepper() {

				var tickDistance = 0,
					startingPosition = 0,
					startingDataIndex = 0,
					started = false,
					previousTime = 0;

				var setStartPosition = function setStartPosition(dataIndex, position) {
					startingPosition = position;
					startingDataIndex = dataIndex;
					started = true;
				};

				var stepCount = function stepCount(dataIndex, position) {
					if (!started) {
						return 0;
					}
					return (startingDataIndex + Math.floor((position - startingPosition) / tickDistance)) - dataIndex;
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
					stepCount: stepCount,
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
					var times = history.times,
						prices = history.prices;
					var compare = function compare(a, b) {
						var timea = parseInt(a.time),
							timeb = parseInt(b.time);
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
					var end = capacity - dataIndex,
						start = end - count;
					if (start >= 0) {
						callback(historyData.slice(start, end));
					} else {
						callback([]);
					}
				};

				return {
					getHistory: getHistory,
					addTick: addTick,
					addHistory: addHistory,
				};

			};

			var ContractCtrl = function ContractCtrl(contract) {

				var broadcastable = true;
                var tickPriceList = [];

				var setNotBroadcastable = function setNotBroadcastable(){
					return broadcastable = false;
				};

				var isFinished = function isFinished(){
					return utils.isDefined(contract.exitSpot);
				};

				var getContract = function getContract(){
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
						if (!utils.digitTrade(contract) && !utils.asianGame(contract) && !hasExitSpot()) {
							chartDrawer.addGridLine({
								color: '#818183',
								label: 'barrier: ' + contract.barrier,
								orientation: 'horizontal',
                                type: 'barrier',
								index: index
							});
						} else if (utils.asianGame(contract) && tickPriceList.length > 0 && !hasExitSpot()){
							chartDrawer.addGridLine({
								color: '#818183',
								label: 'Average: ' + utils.average(tickPriceList),
								orientation: 'horizontal',
                                type: 'average',
                                firstIndex: index,
								index: index + (tickPriceList.length - 1)
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

                        //tickPriceList.push(tickPrice);
					}
				};

				var viewRegions = function viewRegions() {
					if (hasEntrySpot()) {
						var color = (contract.result === 'win') ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
						if (contract.showingExitSpot) {
							var start = utils.getRelativeIndex(contract.entrySpotIndex);
							start = (start < 0) ? 0 : start;
							if (!utils.isDefined(contract.region)) {
								contract.region = {
									color: color,
									start: start,
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
									start: utils.getRelativeIndex(contract.entrySpotIndex),
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

                        if(tickPriceList.length === 0){
                            tickPriceList.push(parseFloat(contract.barrier));
                        } else {
                            tickPriceList.push(parseFloat(lastPrice));
                        }

						if (betweenExistingSpots(lastTime)) {
							if (utils.conditions[contract.type](contract.barrier, lastPrice, tickPriceList)) {
								contract.result = 'win';
							} else {
								contract.result = 'lose';
							}
							if ( isFinished() && broadcastable ) {
                                tickPriceList = []
								contractCtrls.forEach(function(contractctrl, index){
									var oldContract = contractctrl.getContract();
									if ( contract !== oldContract && !contractctrl.isFinished() ) {
										setNotBroadcastable();
									}
								});
								if ( broadcastable ) {
									$rootScope.$broadcast("contract:finished", contract);
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
					getExitSpotPoint: getExitSpotPoint,
				};

			};

			var ChartDrawer = function ChartDrawer() {
				var dataIndex = 0,
					canvas,
					ctx,
					dragging = false,
					zooming = false,
					stepper = Stepper();


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
							color = '#818183';
						}
					});
					return color;
				};

				var getDotColor = function getDotColor(value, index) {
					var color;
					contractCtrls.forEach(function (contract) {
						if (contract.betweenExistingSpots(value)) {
							color = '#e98024';
						}
					});
					if (utils.isDefined(color)) {
						return color;
					}
					if (isLastPoint(index) && !showingHistory()) {
						color = 'green';
					} else {
						color = '#e98024';
					}
					return color;
				};

				var drawRegion = function drawRegion(thisChart, region) {
					var height = thisChart.scale.endPoint - thisChart.scale.startPoint + 12, // + 12 to size up the region to the top
						length,
						end,
						start;

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
					ctx.fillRect(start, thisChart.scale.startPoint - 12, length, height); // begin the region from the top
				};

				var getLabelSize = function getLabelSize(ctx, point) {
					return {
						width: ctx.measureText(point.value)
							.width,
						height: parseInt(ctx.font)
					};
				};

				var overlapping = function overlapping(point1, point2) {
					return (point1.s < point2.e && point1.e > point2.s) || (point2.s < point1.e && point2.e > point1.s);
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
					var entries = [],
						exits = [];
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
						ctx.textAlign = "center";
						ctx.textBaseline = "bottom";

						var padding = 0;
						var valueWidth = getLabelSize(ctx, point)
							.width;
						if (isLastPoint(index)) {
							padding = (valueWidth < 45) ? 0 : valueWidth - 45;
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
                        var yPoint = point.y;
                        if(gridLine.type === 'average' && gridLine.index !== gridLine.firstIndex){
                            firstPoint = thisChart.datasets[0].points[gridLine.firstIndex];
                            yPoint = (firstPoint.y + point.y) / 2;
                        }

					    ctx.moveTo(scale.startPoint, yPoint);
                        
						ctx.strokeStyle = gridLine.color;
						ctx.fillStyle = gridLine.color;
						ctx.lineTo(thisChart.chart.width, yPoint);
						ctx.stroke();

						ctx.textAlign = 'center';
						var labelWidth = ctx.measureText(gridLine.label)
							.width;
						ctx.fillText(gridLine.label, parseInt(labelWidth / 2) + 5, yPoint - 1);
					}
				};

				/* Override ChartJS Defaults */
				Chart.CustomScale = Chart.Scale.extend({
					initialize: function () {
						var longestText = function (ctx, font, arrayOfStrings) {
							ctx.font = font;
							var longest = 0;
							Chart.helpers.each(arrayOfStrings, function (string) {
								var textWidth = ctx.measureText(string)
									.width;
								longest = (textWidth > longest) ? textWidth : longest;
							});
							return longest;
						};

						this.calculateXLabelRotation = function () {

							this.ctx.font = this.font;

							var lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1])
								.width;


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

								ctx.textAlign = "center";
								ctx.textBaseline = "top";
								if (!filtered) {
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
					var times = [],
						prices = [];

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
					var lastTime,
						lastPrice;

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

				var addCandles = function addCandles(candles) {};

				var addOhlc = function addOhlc(ohlc) {};


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
					if (testDataIndex < 0) { // overflow
						testDataIndex = 0;
					} else if (testDataIndex >= chartGlobals.capacity - chartGlobals.tickCount) { // underflow
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
						if (utils.digitTrade(_contract) || utils.asianGame(_contract)) {
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
					destroy: destroy,
				};

			};

			var drawChart = function drawChart(chartID) {
				chartDrawer.drawChart(chartID);
			};

			var destroy = function destroy() {
				chartDrawer.destroy();
				contractCtrls.forEach(function(contractctrl, index){
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
		});
