/**
 * @name delayService
 * @author Amin Marashi
 * @contributors []
 * @since 01/21/2016
 * @copyright Binary Ltd
 *
 */

angular
	.module('binary')
	.factory('delayService',
		function () {
			var functions = {};
			var runTimestamps = {};
			var FunctionController = function FunctionController(delayedFunction, args, name) {
				var timeoutId = 0;
				return {
					run: function run(minimumDelay) {
						var runFunc = function runFunc() {
							runTimestamps[name] = new Date()
								.getTime();
							delayedFunction.apply(this, args);
						};

						if (minimumDelay !== 0) {
							timeoutId = setTimeout(function () {
								runFunc();
							}, minimumDelay);
						} else {
							runFunc();
						}
					},
					cancel: function cancel() {
						clearTimeout(timeoutId);
					},
				};
			};
			return {
				update: function update(name, delayedFunction, minimumDelay, args) {
					var now = new Date()
						.getTime();
					if (functions.hasOwnProperty(name)) {
						var remainingTime = minimumDelay - (now - runTimestamps[name]);
						if (remainingTime > 0) {
							minimumDelay = remainingTime;
						} else {
							minimumDelay = 0;
						}
						functions[name].cancel();
					} else {
						minimumDelay = 0;
						runTimestamps[name] = now;
					}
					functions[name] = FunctionController(delayedFunction, args, name);
					functions[name].run(minimumDelay);
				},
				remove: function (name) {
					if (functions.hasOwnProperty(name)) {
						functions[name].cancel();
						delete functions[name];
						delete runTimestamps[name];
					}
				},
			};
		});
