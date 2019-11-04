/**
 * @name chartService
 * @author Amin Marashi
 * @contributors []
 * @since 11/25/2015
 * @copyright Binary Ltd
 */

angular.module("binary").factory("chartService", $rootScope => {
    let localHistory;
    let chartDrawer;
    let contractCtrls = [];

    /* Define ChartJS Options */
    const reversedIndex = function reversedIndex(i) {
        return chartGlobals.tickCount - 1 - i;
    };

    const distribute = function distribute(i) {
        const distance = Math.ceil(chartGlobals.tickCount / chartGlobals.minTickCount);
        if (reversedIndex(i) % distance === 0) {
            return true;
        }
        return false;
    };

    let chartGlobals;
    const setChartGlobals = function setChartGlobals() {
        chartGlobals = {
            chartJS            : null,
            capacity           : 600,
            maxTickCount       : 50,
            hideLabelsThreshold: 15,
            tickCount          : 15,
            minTickCount       : 5,
            chartData          : {
                labels: [],
                labelsFilter(index) {
                    return !distribute(index);
                },
                datasets: [
                    {
                        strokeColor     : "#7cb5ec",
                        pointColor      : "#7cb5ec",
                        pointStrokeColor: "#7cb5ec",
                        data            : []
                    }
                ]
            },
            chartOptions: {
                animation         : false,
                bezierCurve       : false,
                datasetFill       : false,
                showTooltips      : false,
                keepAspectRatio   : false,
                scaleShowLabels   : false,
                scaleFontSize     : 10,
                pointDotRadius    : 3, // original 4
                datasetStrokeWidth: 2 // original 2
            }
        };
    };
    setChartGlobals();
    /* End of Define ChartJS Options */

    const utils = {
        zeroPad: function zeroPad(num) {
            if (num < 10) {
                return `0${num}`;
            }
            return num.toString();
        },
        getTickTime: function getTickTime(tick) {
            const date = new Date(tick * 1000);
            return `${date.getUTCHours()}:${utils.zeroPad(date.getUTCMinutes())}:${utils.zeroPad(
                date.getUTCSeconds()
            )}`;
        },
        isDefined: function isDefined(obj) {
            if (typeof obj === "undefined" || obj === null) {
                return false;
            }
            return true;
        },
        setObjValue: function setObjValue(obj, attr, value, condition) {
            if (utils.isDefined(obj)) {
                if (utils.isDefined(condition)) {
                    if (condition) {
                        obj[attr] = value;
                    }
                } else if (typeof obj[attr] === "undefined") {
                    obj[attr] = value;
                }
            }
        },
        fractionalLength: function fractionalLength(floatNumber) {
            const stringNumber = floatNumber.toString();
            const decimalLength = stringNumber.indexOf(".");
            return stringNumber.length - decimalLength - 1;
        },
        maxFractionalLength: function maxFractionalLength(floatNumbers) {
            let max = 0;
            floatNumbers.forEach(number => {
                max = max < utils.fractionalLength(number) ? utils.fractionalLength(number) : max;
            });
            return max;
        },
        lastDigit: function lastDigit(num) {
            return parseInt(num.toString().slice(-1)[0]);
        },
        average: function average(list) {
            const decimalPointLength = utils.fractionalLength(list[0]) + 1;
            return parseFloat(list.reduce((a, b) => (+a) + (+b), 0) / list.length).toFixed(decimalPointLength);
        },
        conditions: {
            CALL: function condition(barrier, price) {
                return parseFloat(price) > parseFloat(barrier);
            },
            PUT: function condition(barrier, price) {
                return parseFloat(price) < parseFloat(barrier);
            },
            CALLHL: function condition(barrier, price) {
                // Higher/Lower CALL
                return parseFloat(price) > parseFloat(barrier);
            },
            PUTHL: function condition(barrier, price) {
                // Higher/Lower PUT
                return parseFloat(price) < parseFloat(barrier);
            },
            DIGITMATCH: function condition(barrier, price) {
                return utils.lastDigit(parseInt(barrier)) === utils.lastDigit(price);
            },
            DIGITDIFF: function condition(barrier, price) {
                return utils.lastDigit(parseInt(barrier)) !== utils.lastDigit(price);
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
            ASIANU: function condition(barrier, price, priceList) {
                const avg = utils.average(priceList);

                return parseFloat(price) > avg;
            },
            ASIAND: function condition(barrier, price, priceList) {
                const avg = utils.average(priceList);

                return parseFloat(price) < avg;
            },
            TICKHIGH: function condition(barrier, price, priceList, selectedTick) {
                return priceList[selectedTick - 1] && !_.find(priceList, val => val > priceList[selectedTick - 1]);
            },
            TICKLOW: function condition(barrier, price, priceList, selectedTick) {
                return priceList[selectedTick - 1] && !_.find(priceList, val => val < priceList[selectedTick - 1]);
            }
        },
        digitTrade: function digitTrade(contract) {
            if (contract.type.indexOf("DIGIT") === 0) {
                return true;
            }
            return false;
        },
        asianGame: function asianGame(contract) {
            if (contract.type.indexOf("ASIAN") === 0) {
                return true;
            }
            return false;
        },
        higherLowerTrade: function higherLowerTrade(contract) {
            if (["PUTHL", "CALLHL"].indexOf(contract.type) > -1 && !_.isEmpty(contract.barrier)) {
                return true;
            }
            return false;
        },
        highLowTrade: function highLowTrade(contract) {
            if (["TICKLOW", "TICKHIGH"].indexOf(contract.type) > -1) {
                return true;
            }
            return false;
        },
        getRelativeIndex: function getRelativeIndex(absoluteIndex, dataIndex) {
            return (
                absoluteIndex - (chartDrawer.getCapacity() - (chartDrawer.getTickCount() + chartDrawer.getDataIndex()))
            );
        },
        getAbsoluteIndex: function getAbsoluteIndex(relativeIndex, dataIndex) {
            return (
                relativeIndex + (chartDrawer.getCapacity() - (chartDrawer.getTickCount() + chartDrawer.getDataIndex()))
            );
        }
    };

    const Stepper = function Stepper() {
        let tickDistance = 0;
        let startingPosition = 0;
        let startingDataIndex = 0;
        let started = false;
        let previousTime = 0;

        const setStartPosition = function setStartPosition(dataIndex, position) {
            startingPosition = position;
            startingDataIndex = dataIndex;
            started = true;
        };

        const stepCount = function stepCount(dataIndex, position) {
            if (!started) {
                return 0;
            }
            return startingDataIndex + Math.floor((position - startingPosition) / tickDistance) - dataIndex;
        };

        const setDistance = function setDistance(canvas, tickCount) {
            if (canvas !== null) {
                tickDistance = Math.ceil(canvas.offsetWidth / tickCount);
            }
        };

        const getDistance = function getDistance() {
            return tickDistance;
        };

        const isStep = function isStep(e, tickCount) {
            if (e.timeStamp - previousTime > 100) {
                previousTime = e.timeStamp;
                return true;
            }
            return false;
        };

        const stop = function stop() {
            started = false;
        };

        return {
            isStep,
            stop,
            setDistance,
            getDistance,
            setStartPosition,
            stepCount
        };
    };

    const LocalHistory = function LocalHistory(capacity) {
        let historyData = [];

        const addTick = function addTick(tick) {
            const options = JSON.parse(localStorage.options);
            const pip = options.underlying.pip;
            const fractionalLength = utils.fractionalLength(pip);
            if (parseInt(tick.epoch) > parseInt(historyData.slice(-1)[0].time)) {
                historyData.push({
                    time : tick.epoch,
                    price: parseFloat(tick.quote).toFixed(fractionalLength)
                });
                historyData.shift();
            }
        };

        const updateHistoryArray = function updateHistoryArray(historyArray, history) {
            const times = history.times;
            const prices = history.prices;
            const compare = function compare(a, b) {
                const timea = parseInt(a.time);
                const timeb = parseInt(b.time);
                if (timea < timeb) {
                    return -1;
                } else if (timea > timeb) {
                    return 1;
                }
                return 0;
            };
            const seenTimes = [];
            times.forEach((time, index) => {
                if (seenTimes.indexOf(time) < 0) {
                    seenTimes.push(time);
                    historyArray.push({
                        time,
                        price: prices[index]
                    });
                }
            });
            times.sort(compare);
        };

        const addHistory = function addHistory(history) {
            historyData = [];
            contractCtrls.forEach(contract => {
                contract.removeRegion();
            });
            contractCtrls = [];
            updateHistoryArray(historyData, history);
        };

        const getHistory = function getHistory(dataIndex, count, callback) {
            const end = capacity - dataIndex;
            const start = end - count;
            if (start >= 0) {
                callback(historyData.slice(start, end));
            } else {
                callback([]);
            }
        };

        return {
            getHistory,
            addTick,
            addHistory
        };
    };

    const ContractCtrl = function ContractCtrl(contract) {
        let broadcastable = true;
        let tickPriceList = [];

        const setNotBroadcastable = function setNotBroadcastable() {
            return (broadcastable = false);
        };

        const getBroadcastable = function getBroadcastable() {
            return broadcastable;
        };

        const isFinished = function isFinished() {
            return utils.isDefined(contract.exitSpot);
        };

        const getContract = function getContract() {
            return contract;
        };

        const resetSpotShowing = function resetSpotShowing() {
            contract.showingEntrySpot = false;
            contract.showingExitSpot = false;
        };

        const hasEntrySpot = function hasEntrySpot() {
            if (utils.isDefined(contract.entrySpotIndex)) {
                return true;
            }
            return false;
        };

        const hasExitSpot = function hasExitSpot() {
            if (utils.isDefined(contract.exitSpotIndex)) {
                return true;
            }
            return false;
        };

        const betweenExistingSpots = function betweenExistingSpots(time) {
            if (hasEntrySpot() && time >= contract.entrySpotTime && (!hasExitSpot() || time <= contract.exitSpot)) {
                return true;
            }
            return false;
        };

        const isSpot = function isSpot(i) {
            if (contract.showingEntrySpot && contract.entrySpotIndex === utils.getAbsoluteIndex(i)) {
                return true;
            }
            if (contract.showingExitSpot && contract.exitSpotIndex === utils.getAbsoluteIndex(i)) {
                return true;
            }
            return false;
        };

        const getEntrySpotPoint = function getEntrySpotPoint(points) {
            let result;
            if (contract.showingEntrySpot) {
                result = points[utils.getRelativeIndex(contract.entrySpotIndex)];
            }
            return result;
        };

        const getExitSpotPoint = function getExitSpotPoint(points) {
            let result;
            if (contract.showingExitSpot) {
                result = points[utils.getRelativeIndex(contract.exitSpotIndex)];
            }
            return result;
        };

        const isEntrySpot = function isEntrySpot(time) {
            if (hasEntrySpot()) {
                if (time === contract.entrySpotTime) {
                    return true;
                }
                return false;
            }
            if (time >= contract.startTime) {
                return true;
            }
            return false;
        };

        const isExitSpot = function isExitSpot(time, index) {
            if (hasExitSpot()) {
                if (time === contract.exitSpot) {
                    return true;
                }
                return false;
            }
            if (hasEntrySpot() && index === contract.entrySpotIndex + contract.duration) {
                return true;
            }
            return false;
        };

        const viewSpots = function viewSpots(index, tickTime) {
            if (isEntrySpot(tickTime)) {
                contract.showingEntrySpot = true;
                if (!utils.digitTrade(contract) && !utils.asianGame(contract) && !hasExitSpot()) {
                    chartDrawer.addGridLine({
                        color      : "#2E8836",
                        label      : `barrier: ${contract.barrier}`,
                        orientation: "horizontal",
                        type       : "barrier",
                        index
                    });
                } else if (utils.asianGame(contract) && tickPriceList.length > 0 && !hasExitSpot()) {
                    chartDrawer.addGridLine({
                        color      : "#2E8836",
                        label      : `Average: ${utils.average(tickPriceList)}`,
                        orientation: "horizontal",
                        type       : "average",
                        firstIndex : index,
                        index      : index + (tickPriceList.length - 1)
                    });
                }
            }

            if (isExitSpot(tickTime, utils.getAbsoluteIndex(index))) {
                contract.showingExitSpot = true;
            }
        };

        const addSpots = function addSpots(index, tickTime, tickPrice) {
            if (isEntrySpot(tickTime) || betweenExistingSpots(tickTime)) {
                if (isEntrySpot(tickTime)) {
                    let barrier = tickPrice;
                    if (utils.higherLowerTrade(contract)) {
                        contract.offset = contract.offset || contract.barrier;
                        barrier = Number(tickPrice) + Number(contract.offset);
                        barrier = utils.digitTrade(contract) ?
                            contract.barrier : barrier.toFixed(utils.fractionalLength(tickPrice));
                    }
                    utils.setObjValue(contract, "barrier", barrier, !utils.digitTrade(contract));
                    utils.setObjValue(contract, "entrySpotPrice", tickPrice, true);
                    utils.setObjValue(contract, "entrySpotTime", tickTime, !hasEntrySpot());
                    utils.setObjValue(contract, "entrySpotIndex", index, true);
                }

                if (isExitSpot(tickTime, index)) {
                    utils.setObjValue(contract, "exitSpot", tickTime, !hasExitSpot());
                    utils.setObjValue(contract, "exitSpotIndex", index, true);
                }

                // tickPriceList.push(tickPrice);
            }
        };

        const viewRegions = function viewRegions() {
            if (hasEntrySpot()) {
                const color = contract.result === "win" ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)";
                if (contract.showingExitSpot) {
                    let start = utils.getRelativeIndex(contract.entrySpotIndex);
                    start = start < 0 ? 0 : start;
                    if (!utils.isDefined(contract.region)) {
                        contract.region = {
                            color,
                            start
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
                            color,
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

        const addRegions = function addRegions(lastTime, lastPrice) {
            const options = JSON.parse(localStorage.options);
            const pip = options.underlying.pip;
            const fractionalLength = utils.fractionalLength(pip);

            if (hasEntrySpot() && broadcastable) {
                const isLastTickAfterExit = contract.exitSpot && lastTime > contract.exitSpot;
                if (tickPriceList.length === 0) {
                    if (contract.entrySpotTime !== lastTime && betweenExistingSpots(lastTime)) {
                        const entrySpotPrice = parseFloat(contract.entrySpotPrice).toFixed(fractionalLength);
                        const barrier = utils.digitTrade(contract) ?
                            contract.barrier : parseFloat(contract.barrier).toFixed(fractionalLength);
                        tickPriceList.push(entrySpotPrice);

                        if (utils.conditions[contract.type](barrier, entrySpotPrice,
                            tickPriceList, contract.selectedTick)) {
                            contract.result = "win";
                        } else {
                            contract.result = "lose";
                        }
                        $rootScope.$broadcast("contract:spot", contract, entrySpotPrice);
                    } else if (isLastTickAfterExit) {
                        tickPriceList.push(contract.entrySpotPrice);
                    } else {
                        tickPriceList.push(parseFloat(lastPrice).toFixed(fractionalLength));
                    }
                } else {
                    tickPriceList.push(parseFloat(lastPrice).toFixed(fractionalLength));
                }

                if (betweenExistingSpots(lastTime) || isLastTickAfterExit) {
                    const barrier = parseFloat(contract.barrier).toFixed(fractionalLength);
                    const lastPriceFloat = isLastTickAfterExit
                        ? tickPriceList.slice(-2)[0]
                        : parseFloat(lastPrice).toFixed(fractionalLength);

                    if (utils.conditions[contract.type](barrier, lastPriceFloat,
                        tickPriceList, contract.selectedTick)) {
                        contract.result = "win";
                    } else {
                        contract.result = "lose";
                    }

                    $rootScope.$broadcast("contract:spot", contract, lastPriceFloat);

                    if (isFinished() && broadcastable) {
                        tickPriceList = [];
                        contractCtrls.forEach((contractctrl, index) => {
                            const oldContract = contractctrl.getContract();
                            if (contract !== oldContract && !contractctrl.isFinished()) {
                                setNotBroadcastable();
                            }
                        });
                        if (broadcastable) {
                            $rootScope.$broadcast("contract:finished", contract);
                        }
                        setNotBroadcastable();
                    }
                }
            }
        };

        const removeRegion = function removeRegion() {
            chartDrawer.removeRegion(contract.region);
        };

        return {
            getBroadcastable,
            setNotBroadcastable,
            isFinished,
            getContract,
            isSpot,
            betweenExistingSpots,
            resetSpotShowing,
            addSpots,
            addRegions,
            removeRegion,
            viewSpots,
            viewRegions,
            getEntrySpotPoint,
            getExitSpotPoint
        };
    };

    const ChartDrawer = function ChartDrawer() {
        let dataIndex = 0;
        let canvas;
        let ctx;
        let dragging = false;
        let zooming = false;
        let stepper = Stepper();

        const isLastPoint = function isLastPoint(i) {
            if (reversedIndex(i) === 0) {
                return true;
            }
            return false;
        };

        const hideLabels = function hideLabels() {
            if (chartGlobals.tickCount >= chartGlobals.hideLabelsThreshold) {
                return true;
            }
            return false;
        };

        const showingHistory = function showingHistory() {
            if (dataIndex === 0) {
                return false;
            }
            return true;
        };

        const getLabelColor = function getLabelColor(index) {
            let color = "black";
            if (!showingHistory() && isLastPoint(index)) {
                color = "#2E8836";
            }
            contractCtrls.forEach(contract => {
                if (contract.isSpot(index)) {
                    color = "#818183";
                }
            });
            return color;
        };

        const getDotColor = function getDotColor(value, index) {
            let color;
            contractCtrls.forEach(contract => {
                if (contract.betweenExistingSpots(value)) {
                    color = "#7cb5ec";
                }
            });
            if (utils.isDefined(color)) {
                return color;
            }
            if (isLastPoint(index) && !showingHistory()) {
                color = "#2E8836";
            } else {
                color = "#7cb5ec";
            }
            return color;
        };

        const drawRegion = function drawRegion(thisChart, region) {
            const height = thisChart.scale.endPoint - thisChart.scale.startPoint + 12; // + 12 to size up the region to the top
            let end;

            let start = thisChart.datasets[0].points[region.start].x;
            if (utils.isDefined(region.end)) {
                end = thisChart.datasets[0].points[region.end].x;
            } else {
                end = thisChart.datasets[0].points.slice(-1)[0].x;
            }
            if (end < start) {
                return;
            } else if (end === start) {
                start -= 2; // subtract 2 from start to make the region visible when the duration is 1 tick
            }
            const length = (end - start) || 6; // set the region length to 6 whenever the duration is 1 tick
            ctx.fillStyle = region.color;
            ctx.fillRect(start, thisChart.scale.startPoint - 12, length, height); // begin the region from the top
        };

        const getLabelSize = function getLabelSize(ctx, point) {
            return {
                width : ctx.measureText(point.value).width,
                height: parseInt(ctx.font)
            };
        };

        const overlapping = function overlapping(point1, point2) {
            return (point1.s < point2.e && point1.e > point2.s) || (point2.s < point1.e && point2.e > point1.s);
        };

        const overlapping2d = function overlapping2d(point1, point2) {
            const point1Size = getLabelSize(ctx, point1);
            const point2Size = getLabelSize(ctx, point2);
            const overlappingY = overlapping(
                {
                    s: point1.y,
                    e: point1.y + point1Size.height
                },
                {
                    s: point2.y,
                    e: point2.y + point2Size.height
                }
            );
            const overlappingX = overlapping(
                {
                    s: point1.x,
                    e: point1.x + point1Size.width
                },
                {
                    s: point2.x,
                    e: point2.x + point2Size.width
                }
            );
            return overlappingX && overlappingY;
        };

        const findSpots = function findSpots(points) {
            const entries = [];
            const exits = [];
            contractCtrls.forEach(contract => {
                const entry = contract.getEntrySpotPoint(points);
                const exit = contract.getExitSpotPoint(points);
                if (utils.isDefined(entry)) {
                    entries.push(entry);
                }
                if (utils.isDefined(exit)) {
                    exits.push(exit);
                }
            });
            return {
                entries,
                exits
            };
        };

        const withoutConflict = function withoutConflict(toShow, point) {
            let result = true;
            toShow.forEach((toShowPoint, index) => {
                if (overlapping2d(toShowPoint, point)) {
                    result = false;
                }
            });
            return result;
        };

        const toShowLabels = function toShowLabels(points) {
            const toShow = [];
            const spots = findSpots(points);
            // This is our priority: 1. exit spot, 2. entry spot, 3. last value, 4. others (right to left)

            spots.exits.forEach((exit, index) => {
                toShow.push(exit);
            });

            spots.entries.forEach((entry, index) => {
                if (withoutConflict(toShow, entry)) {
                    toShow.push(entry);
                }
            });

            const lastPoint = points.slice(-1)[0];
            if (!showingHistory() && withoutConflict(toShow, lastPoint)) {
                toShow.push(lastPoint);
            }
            // add other labels from right to left
            if (!hideLabels()) {
                for (let i = points.length - 1; i >= 0; i--) {
                    if (withoutConflict(toShow, points[i])) {
                        toShow.push(points[i]);
                    }
                }
            }
            toShow.forEach((toShowPoint, index) => {
                if(!_.isEmpty(toShowPoint)){
                    toShowPoint.shown = true;
                }
            });
        };

        const drawLabel = function drawLabel(point, index) {
            if (index !== 0 && utils.isDefined(point.shown) && point.shown) {
                ctx.fillStyle = getLabelColor(index);
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";

                let padding = 0;
                const valueWidth = getLabelSize(ctx, point).width;
                if (isLastPoint(index)) {
                    padding = valueWidth < 45 ? 0 : valueWidth - 45;
                }
                ctx.fillText(point.value, point.x - padding, point.y - 1);
            }
        };

        const drawLastTickLabel = function(point, index) {
            if (index !== 0 && utils.isDefined(point.shown) && point.shown) {
                const marginX = 10;
                const marginY = 30;
                const padding = 5;
                const fontSize = 12;
                ctx.font = ctx.font.replace(/\d+px/, `${fontSize}px`);
                const value = ctx.measureText(point.value);
                value.height = fontSize;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = point.labelFillColor.toString();
                ctx.fillRect(
                    canvas.offsetWidth - (marginX + padding + value.width),
                    canvas.offsetHeight - (marginY + value.height + padding),
                    2 * padding + value.width,
                    2 * padding + value.height
                );
                if (ctx.fillStyle === "#C2C2C2") {
                    ctx.fillStyle = "#000";
                } else {
                    ctx.fillStyle = "#FFF";
                }
                ctx.fillText(
                    point.value,
                    canvas.offsetWidth - (marginX + value.width / 2),
                    canvas.offsetHeight - marginY
                );
            }
        };

        const drawGridLine = function drawGridLine(thisChart, gridLine) {
            const point = thisChart.datasets[0].points[gridLine.index];
            const scale = thisChart.scale;

            ctx.beginPath();
            if (gridLine.orientation === "vertical") {
                ctx.moveTo(point.x, scale.startPoint + 24);
                ctx.strokeStyle = gridLine.color;
                ctx.fillStyle = gridLine.color;
                ctx.lineTo(point.x, scale.endPoint);
                ctx.stroke();

                ctx.textAlign = "center";
                ctx.fillText(gridLine.label, point.x, scale.startPoint + 12);
            } else if (gridLine.orientation === "horizontal") {
                let yPoint = point.y;
                if (gridLine.type === "average" && gridLine.index !== gridLine.firstIndex) {
                    const firstPoint = thisChart.datasets[0].points[gridLine.firstIndex];
                    yPoint = (firstPoint.y + point.y) / 2;
                }

                ctx.moveTo(scale.startPoint, yPoint);

                ctx.strokeStyle = gridLine.color;
                ctx.fillStyle = gridLine.color;
                ctx.lineTo(thisChart.chart.width, yPoint);
                ctx.stroke();

                ctx.textAlign = "center";
                const labelWidth = ctx.measureText(gridLine.label).width;
                ctx.fillText(gridLine.label, parseInt(labelWidth / 2) + 5, yPoint - 1);
            }
        };

        /* Override ChartJS Defaults */
        Chart.CustomScale = Chart.Scale.extend({
            initialize() {
                const longestText = function(ctx, font, arrayOfStrings) {
                    ctx.font = font;
                    let longest = 0;
                    Chart.helpers.each(arrayOfStrings, string => {
                        const textWidth = ctx.measureText(string).width;
                        longest = textWidth > longest ? textWidth : longest;
                    });
                    return longest;
                };

                this.calculateXLabelRotation = function() {
                    this.ctx.font = this.font;

                    const lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width;

                    this.xScalePaddingRight = lastWidth / 2 + 3;

                    this.xLabelRotation = 0;
                    if (this.display) {
                        const originalLabelWidth = longestText(this.ctx, this.font, this.xLabels);
                        this.xLabelWidth = originalLabelWidth;
                    } else {
                        this.xLabelWidth = 0;
                        this.xScalePaddingRight = this.padding;
                    }
                    this.xScalePaddingLeft = 0;
                };
                Chart.Scale.prototype.initialize.apply(this, arguments);
            },
            draw() {
                const helpers = Chart.helpers;
                const each = helpers.each;
                const aliasPixel = helpers.aliasPixel;
                const ctx = this.ctx;
                const yLabelGap = (this.endPoint - this.startPoint) / this.steps;
                const xStart = Math.round(this.xScalePaddingLeft);
                if (this.display) {
                    ctx.fillStyle = this.textColor;
                    ctx.font = this.font;
                    each(
                        this.yLabels,
                        function(labelString, index) {
                            const yLabelCenter = this.endPoint - yLabelGap * index;
                            let linePositionY = Math.round(yLabelCenter);

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
                        },
                        this
                    );

                    each(
                        this.xLabels,
                        function(label, index) {
                            let filtered = false;
                            if (typeof this.labelsFilter === "function" && this.labelsFilter(index)) {
                                filtered = true;
                            }
                            const xPos = this.calculateX(index) + aliasPixel(this.lineWidth);
                            const linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) +
                            aliasPixel(this.lineWidth);

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
                        },
                        this
                    );
                }
            }
        });

        Chart.types.Line.extend({
            name: "LineChartSpots",
            initialize(data) {
                this.options.labelsFilter = data.labelsFilter || null;
                Chart.types.Line.prototype.initialize.apply(this, arguments);
            },
            draw() {
                const dataset = this.datasets[0];
                const thisChart = this;

                dataset.points.forEach((point, index) => {
                    point.fillColor = getDotColor(chartGlobals.chartData.epochLabels[index], index);
                });

                Chart.types.Line.prototype.draw.apply(this, arguments);
                toShowLabels(dataset.points);
                dataset.points.forEach((point, index) => {
                    drawLabel(point, index);
                });

                if (utils.isDefined(this.options.regions)) {
                    this.options.regions.forEach(region => {
                        drawRegion(thisChart, region);
                    });
                }

                if (utils.isDefined(this.options.gridLines)) {
                    this.options.gridLines.forEach(gridLine => {
                        drawGridLine(thisChart, gridLine);
                    });
                }
            },
            buildScale(labels) {
                const helpers = Chart.helpers;
                const self = this;

                const dataTotal = function() {
                    const values = [];
                    self.eachPoints(point => {
                        values.push(point.value);
                    });
                    return values;
                };
                const scaleOptions = {
                    templateString: this.options.scaleLabel,
                    height        : this.chart.height,
                    width         : this.chart.width,
                    ctx           : this.chart.ctx,
                    textColor     : this.options.scaleFontColor,
                    fontSize      : this.options.scaleFontSize,
                    labelsFilter  : this.options.labelsFilter,
                    fontStyle     : this.options.scaleFontStyle,
                    fontFamily    : this.options.scaleFontFamily,
                    valuesCount   : labels.length,
                    beginAtZero   : this.options.scaleBeginAtZero,
                    integersOnly  : this.options.scaleIntegersOnly,
                    calculateYRange(currentHeight) {
                        const updatedRanges = helpers.calculateScaleRange(
                            dataTotal(),
                            currentHeight,
                            this.fontSize,
                            this.beginAtZero,
                            this.integersOnly
                        );
                        helpers.extend(this, updatedRanges);
                    },
                    xLabels: labels,
                    font   : helpers.fontString(
                        this.options.scaleFontSize,
                        this.options.scaleFontStyle,
                        this.options.scaleFontFamily
                    ),
                    lineWidth    : this.options.scaleLineWidth,
                    lineColor    : this.options.scaleLineColor,
                    gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
                    gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                    padding      : this.options.showScale
                        ? 0
                        : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                    showLabels: this.options.scaleShowLabels,
                    display   : this.options.showScale
                };

                if (this.options.scaleOverride) {
                    helpers.extend(scaleOptions, {
                        calculateYRange: helpers.noop,
                        steps          : this.options.scaleSteps,
                        stepValue      : this.options.scaleStepWidth,
                        min            : this.options.scaleStartValue,
                        max            : this.options.scaleStartValue
                                          + this.options.scaleSteps * this.options.scaleStepWidth
                    });
                }

                this.scale = new Chart.CustomScale(scaleOptions);
            }
        });
        /* End of Override ChartJS Defaults */

        const destroy = function destroy() {
            if (chartGlobals.chartJS) {
                chartGlobals.chartJS.destroy();
                setChartGlobals();
                canvas = null;
                ctx = null;
                dataIndex = 0;
                dragging = false;
                zooming = false;
                stepper = null;
            }
        };

        const drawChart = function drawChart(chartID) {
            canvas = document.getElementById(chartID);
            if (canvas !== null) {
                ctx = canvas.getContext("2d");
                stepper = Stepper();
                stepper.setDistance(canvas, chartGlobals.tickCount);
            }
        };

        const findRegion = function findRegion(region) {
            if (utils.isDefined(chartGlobals.chartOptions.regions)) {
                return chartGlobals.chartOptions.regions.indexOf(region);
            }
            return -1;
        };

        const addRegion = function addRegion(region) {
            if (!utils.isDefined(chartGlobals.chartOptions.regions)) {
                chartGlobals.chartOptions.regions = [];
            }
            if (findRegion(region) < 0) {
                chartGlobals.chartOptions.regions.push(region);
            }
        };

        const removeRegion = function removeRegion(region) {
            const regionIndex = findRegion(region);
            if (regionIndex >= 0) {
                chartGlobals.chartOptions.regions.splice(regionIndex, 1);
            }
        };

        const dragStart = function dragStart(e) {
            if (!_.isEmpty(stepper)) {
                stepper.setStartPosition(dataIndex, e.center.x);
                dragging = true;
            }
        };

        const dragEnd = function dragEnd(e) {
            if (!_.isEmpty(stepper)) {
                if (!zooming) {
                    move(stepper.stepCount(dataIndex, e.center.x));
                }
                stepper.stop();
                dragging = false;
            }
        };

        const zoomStart = function zoomStart() {
            zooming = true;
        };

        const zoomEnd = function zoomEnd() {
            zooming = false;
        };

        const addGridLine = function addGridLine(gridLine) {
            if (!utils.isDefined(chartGlobals.chartOptions.gridLines)) {
                chartGlobals.chartOptions.gridLines = [];
            }
            chartGlobals.chartOptions.gridLines.push(gridLine);
        };

        const updateChartPoints = function updateChartPoints(times, values) {
            chartGlobals.chartData.labels = [];
            chartGlobals.chartData.epochLabels = times;
            times.forEach((time, index) => {
                chartGlobals.chartData.labels.push(utils.getTickTime(time));
            });

            chartGlobals.chartData.datasets[0].data = values;
            if (utils.isDefined(chartGlobals.chartJS)) {
                chartGlobals.chartJS.destroy();
            }
            if (utils.isDefined(ctx)) {
                const chartObj = new Chart(ctx);
                chartGlobals.chartJS = chartObj.LineChartSpots(chartGlobals.chartData, chartGlobals.chartOptions);
            }
        };

        // depends on updateContracts call
        const updateChart = function updateChart(ticks) {
            chartGlobals.chartOptions.gridLines = [];
            contractCtrls.forEach(contract => {
                contract.resetSpotShowing();
            });
            const times = [];
            const prices = [];

            ticks.forEach((tick, index) => {
                const tickTime = parseInt(tick.time);
                contractCtrls.forEach(contract => {
                    contract.viewSpots(index, tickTime);
                });
                times.push(tickTime);
                prices.push(tick.price);
            });

            contractCtrls.forEach(contract => {
                contract.viewRegions();
            });

            updateChartPoints(times, prices);
        };

        const updateContracts = function updateContracts(ticks) {
            let lastTime;
            let lastPrice;

            ticks.forEach((tick, index) => {
                const tickTime = parseInt(tick.time);
                const tickPrice = tick.price;
                contractCtrls.forEach(contract => {
                    contract.addSpots(index, tickTime, tickPrice);
                });
                lastTime = parseInt(tick.time);
                lastPrice = tick.price;
            });

            contractCtrls.forEach(contract => {
                contract.addRegions(lastTime, lastPrice);
            });
        };

        const addTick = function addTick(tick) {
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

        const addHistory = function addHistory(history) {
            if (!utils.isDefined(localHistory)) {
                localHistory = LocalHistory(chartGlobals.capacity);
            }
            localHistory.addHistory(history);
            localHistory.getHistory(0, chartGlobals.capacity, updateContracts);
            localHistory.getHistory(dataIndex, chartGlobals.tickCount, updateChart);
        };

        const addCandles = function addCandles(candles) {};

        const addOhlc = function addOhlc(ohlc) {};

        const zoom = function zoom(direction) {
            let newTickCount;
            let condition;
            if (direction === "in") {
                newTickCount = parseInt(chartGlobals.tickCount / 1.2);
                condition = newTickCount > chartGlobals.minTickCount;
            } else if (direction === "out") {
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

        const zoomOut = function zoomOut() {
            zoom("out");
        };

        const zoomIn = function zoomIn() {
            zoom("in");
        };

        const move = function move(steps, update) {
            if (steps === 0) {
                return;
            }
            let testDataIndex = dataIndex + steps;
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

        const drag = function drag(e) {
            if (!_.isEmpty(stepper)) {
                if (!zooming && stepper.isStep(e, chartGlobals.tickCount)) {
                    move(stepper.stepCount(dataIndex, e.center.x));
                }
            }
        };

        const getCapacity = function getCapacity() {
            return chartGlobals.capacity;
        };

        const getTickCount = function getTickCount() {
            return chartGlobals.tickCount;
        };

        const getDataIndex = function getDataIndex() {
            return dataIndex;
        };

        const addContract = function addContract(_contract) {
            if (_contract) {
                if (utils.digitTrade(_contract) || utils.asianGame(_contract) || utils.highLowTrade(_contract)) {
                    _contract.duration -= 1;
                }
                contractCtrls.push(ContractCtrl(_contract));
                dataIndex = 0;
            }
        };

        const historyInterface = {
            addTick,
            addHistory,
            addCandles,
            addOhlc
        };

        return {
            dragStart,
            dragEnd,
            zoomIn,
            zoomOut,
            zoomStart,
            zoomEnd,
            dragRight: drag,
            dragLeft : drag,
            getCapacity,
            getTickCount,
            getDataIndex,
            addContract,
            historyInterface,
            addGridLine,
            addRegion,
            removeRegion,
            drawChart,
            destroy
        };
    };

    const drawChart = function drawChart(chartID) {
        chartDrawer.drawChart(chartID);
    };

    const destroy = function destroy() {
        chartDrawer.destroy();
        contractCtrls.forEach((contractctrl, index) => {
            contractctrl.setNotBroadcastable();
        });
        localHistory = null;
    };

    chartDrawer = ChartDrawer();

    return {
        destroy,
        drawChart,
        dragStart       : chartDrawer.dragStart,
        dragEnd         : chartDrawer.dragEnd,
        zoomIn          : chartDrawer.zoomIn,
        zoomOut         : chartDrawer.zoomOut,
        zoomStart       : chartDrawer.zoomStart,
        zoomEnd         : chartDrawer.zoomEnd,
        dragRight       : chartDrawer.dragRight,
        dragLeft        : chartDrawer.dragLeft,
        getCapacity     : chartDrawer.getCapacity,
        addContract     : chartDrawer.addContract,
        historyInterface: chartDrawer.historyInterface
    };
});
