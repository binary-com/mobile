/**
 * @name contractSummary
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('contractSummary',[
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/contract-summary.template.html',
			link: function(scope, element) {
				var chartGenerator = function chartGenerator(maxEntries){
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
							]
						}
					});
					// add the feed data in this feed_list
					var feed_list = {
						quote: [],
						epoch: []
					};
					var removeExtraEntries = function removeExtraEntries(){
						if (feed_list.quote.length > maxEntries){
							feed_list.quote.shift();
							feed_list.epoch.shift();
						}
					}
					return {
						addTick : function addTick(tick){
							feed_list.quote.push(tick.quote);
							feed_list.epoch.push(tick.epoch);
							removeExtraEntries();
							// x = epoch, y = quote
							chart.load({
								columns: [
									['epoch'].concat(feed_list.epoch),
									['quote'].concat(feed_list.quote)
								]
							});
							}

					};
				};

				scope.chartGenerator = chartGenerator(15);


<<<<<<< HEAD:www/js/components/trades/chart.directive.js
				scope.$parent.$watch('tick', function(value){
					scope.chartGenerator.addTick(value);
					console.log('current tick: ', value);
				});

=======
>>>>>>> master:www/js/components/trades/contract-summary.directive.js
			}
		};
	}]);



















