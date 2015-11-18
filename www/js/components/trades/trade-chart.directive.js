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

				var ChartGenerator = function ChartGenerator(chartID){
					// add the feed data in this feed_list
					var feed_list;
					var init_feed_list = function init_feed_list(feed){
						if (feed.msg_type == 'history'){
							feed_list = {
								quote: [],
								epoch: []
							};
						} else {
							feed_list = {
								ohlc: [],
								epoch: []
							};
						}
					}
					// Generate empty chart to begin with
					var chart = c3.generate({
								bindto: chartID,
								transition: {
									duration: 0
								},
								size: {
									height: 150
								},
								data: {
									x: 'epoch',
									columns: [
										['epoch'],
										['quote']
									],
									colors: {
										quote: 'orange'
									},
									selection: {
										enabled: true
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
								},
								zoom: {
									enabled: (chartID == '#realtimeChart')? false: true
								},
								interaction: {
									enabled: (chartID == '#realtimeChart')? false: true
								}
							});
					var removeExtraEntries = function removeExtraEntries(maxEntries){
						if (feed_list.quote){
							if (feed_list.quote.length > maxEntries){
								feed_list.quote.shift();
								feed_list.epoch.shift();
							}
						} else {
							feed_list.ohlc.shift();
							feed_list.epoch.shift();
						}
					};
					var addTick = function addTick(feed){
						var tick = feed.tick;
						feed_list.quote.push(tick.quote);
						feed_list.epoch.push(tick.epoch);
						removeExtraEntries(feed.echo_req.count);
						// x = epoch, y = quote
						chart.load({
							columns: [
								['epoch'].concat(feed_list.epoch),
								['quote'].concat(feed_list.quote)
							]
						});
					};
					var	addOhlc = function addHistory(feed){ 
						var ohlc = feed.ohlc;
						var last_ohlc = feed_list.epoch.length - 1;
						if (feed.msg_type == 'ohlc' && ohlc.open_time == feed_list.epoch[last_ohlc]){
							feed_list.ohlc[last_ohlc] = ohlc;
						} else {
							feed_list.epoch.push(ohlc.epoch);
							feed_list.ohlc.push(ohlc);
						}
						removeExtraEntries(feed.echo_req.count);
						// unfortunately C3 does not support ohlc charts, this have to be implemented using D3
						chart.load({
							columns: [
								['epoch'].concat(feed_list.epoch),
								['quote'].concat(feed_list.ohlc)
							]
						});
					};
					var	addHistory = function addHistory(feed){ 
						init_feed_list(feed);
						var history = feed.history,
								times = history.times,
								prices = history.prices;
						times.forEach(function(time, index){
							var newFeed = Object.create(feed);
							newFeed.echo_req = {
								count: feed.echo_req.count
							}
							newFeed.tick = {
								epoch: time,
								quote: prices[index]
							};
							addTick(newFeed);
						});
					};
					var	addCandles = function addCandles(feed){ 
						init_feed_list(feed);
						var candles = feed.candles;
						candles.forEach(function(candle){
							var newFeed = Object.create(feed);
							newFeed.echo_req = {
								count: feed.echo_req.count
							}
							newFeed.tick = candle;
							addOhlc(newFeed);
						});
					};
					var clearChart = function clearChart(){
						if (feed_list.quote) {
							init_feed_list({msg_type: 'history'});
							chart.unload('quote');
						} else {
							init_feed_list({msg_type: 'candles'});
							chart.unload('ohlc');
						}
					}
					// API visible to the public
					return {
						clearChart: clearChart,
						addTick: addTick,
						addOhlc: addOhlc,
						addHistory: addHistory,
						addCandles: addCandles
					};
				};
				var modifyHistoryCharts = function ModifyHistoryCharts(){
					var newChart = function newChart(){
						
					};
					return {
						newChart: newChart,
						removeChart: removeChart
					};
				};
				
				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol;
					var maxEntries = 30,
							minutes = 10,
							oldest = minutes/(maxEntries/60) 
					scope.charts = {
						slides: [
							{
								id: 'realtimeChart',
								time: 'realtime'
							}
						]
					};
					for (var i=1; i<= oldest; i++) {
						scope.charts.slides = [{
							id: 'historyChart' + i,
							time: '' + i*maxEntries/60 + ' minutes ago'
						}].concat(scope.charts.slides);
					}
					scope.$parent.slideBoxDelicate.update();
					scope.onChartChange = function onChartChange(index){
						var reversedIndex = (scope.charts.slides.length - 1) - index;
						if (reversedIndex === 0 && !scope.charts.hasOwnProperty('realtimeChart')){
							scope.charts.realtimeChart = ChartGenerator('#realtimeChart');
						} else {
							var historyChartID = 'historyChart' + (reversedIndex);
							if (!scope.charts.hasOwnProperty(historyChartID)){
								scope.charts[historyChartID] = ChartGenerator('#' + historyChartID);
							}
							if (reversedIndex > 1) {
								scope.charts['historyChart' + (reversedIndex-1)].clearChart();
							}
							if (reversedIndex < 20 && scope.charts.hasOwnProperty('historyChart' + (reversedIndex+1))) {
								scope.charts['historyChart' + (reversedIndex+1)].clearChart();
							}
							websocketService.sendRequestFor.forgetTicks();
							websocketService.sendRequestFor.sendTicksHistory(
								{
									"ticks_history": symbol,
									"end": parseInt(new Date().getTime()/1000) - maxEntries * reversedIndex,
									"count": maxEntries,
									"passthrough": {
										"historyChartID": historyChartID,
									}
								}
							);
						}
						return index;
					};

					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.sendTicksHistory(
						{
							"ticks_history": symbol,
							"end": "latest",
							"count": 30,
							"subscribe": 1
						}
					);
				};

				init();

				scope.$on('tick', function(e, feed){
					if (feed){
						scope.charts.realtimeChart.addTick(feed);
					}
				});

				scope.$on('history', function(e, feed){
					if (feed){
						chartID = 'realtimeChart';
						if (feed.echo_req.passthrough) {
							chartID = feed.echo_req.passthrough.historyChartID;
						} else {
							scope.$parent.slideBoxDelicate.slide(scope.charts.slides.length - 1);
						}
						scope.charts[chartID].addHistory(feed);
					}
				});

				scope.$on('candles', function(e, feed){
					if (feed){
						scope.charts.realtimeChart.addCandles(feed);
					}
				});

				scope.$on('ohlc', function(e, feed){
					if (feed){
						scope.charts.realtimeChart.addOhlc(feed);
					}
				});
			}
		};
	}]);



















