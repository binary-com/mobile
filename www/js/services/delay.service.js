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
	.service('delayService',
		function () {
			var functions = {};
			var FunctionFactory = function FunctionFactory(delayedFunction, args, id) {
				var cancelled = false,
					timeoutEnded = false;
				return {
					cancel: function cancel() {
						cancelled = true;
					},
					run: function run(functionFactory, minimumDelay) {
						console.log("run", minimumDelay);
						var runFunc = function runFunc() {
							functionFactory.timestamp = new Date()
								.getTime();
							timeoutEnded = true;
							delayedFunction.apply(this, args);
						};

						if (minimumDelay !== 0) {
							setTimeout(function () {
								if (!cancelled) {

									console.log('with delay:', id);
									runFunc();
								}
							}, minimumDelay);
						} else {
							console.log('without delay:', id);
							runFunc();
						}
					},
					executed: function executed() {
						return timeoutEnded;
					},
					getID: function getID() {
						return id;
					},
				};
			};
			this.update = function update(name, delayedFunction, minimumDelay, args) {
				if (functions.hasOwnProperty(name)) {
					var lastFunction = functions[name].func;
					var now = new Date()
						.getTime();
					console.log(lastFunction.executed());
					if (!lastFunction.executed()) {
						lastFunction.cancel();
					}
					if (now - functions[name].timestamp > minimumDelay) {
						minimumDelay = 0;
					}
				} else {
					functions[name] = {
						func: FunctionFactory(delayedFunction, args, new Date()
							.getTime()),
						timestamp: 0
					};
				}
				functions[name].func = FunctionFactory(delayedFunction, args, new Date()
					.getTime());
				functions[name].func.run(functions[name], minimumDelay);
			};

			this.remove = function (name) {
				if (functions.hasOwnProperty(name)) {
					delete functions[name];
				}
			};
		});
