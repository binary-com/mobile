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

				var ChartGenerator = function ChartGenerator(){
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
								bindto: '#chart',
								transition: {
									duration: 0
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
					// API visible to the public
					return {
						addTick: addTick,
						addOhlc: addOhlc,
						addHistory: addHistory,
						addCandles: addCandles
					};
				};

				scope.chartGenerator = ChartGenerator();

				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol;

					scope.onChartChange = function onChartChange(index){
						websocketService.sendRequestFor.forgetTicks();
						websocketService.sendRequestFor.sendTicksHistory(
							{
								"ticks_history": symbol,
								"end": parseInt(new Date().getTime()/1000) - 30,
								"count": 30,
								"subscribe": 1
							}
						);
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
						scope.chartGenerator.addTick(feed);
					}
				});

				scope.$on('history', function(e, feed){
					if (feed){
						scope.chartGenerator.addHistory(feed);
					}
				});

				scope.$on('candles', function(e, feed){
					if (feed){
						scope.chartGenerator.addCandles(feed);
					}
				});

				scope.$on('ohlc', function(e, feed){
					if (feed){
						scope.chartGenerator.addOhlc(feed);
					}
				});

			}
		};
	}]);



















