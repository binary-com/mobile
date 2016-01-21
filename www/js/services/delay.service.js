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
			this.functions = {};
			this.update = function update(name, delayedFunction, minimumDelay, args) {
				if (!this.functions.hasOwnProperty(name) && typeof delayedFunction !== 'undefined') {
					this.functions[name] = {
						minimumDelay: minimumDelay,
						lastUpdateIntervalID: 0,
						lastUpdateTime: new Date()
							.getTime(),
						delayedFunction: delayedFunction,
						args: args,
					};
					delayedFunction.apply(this, args);
				} else {
					var delayedFunctionObject = this.functions[name];
					if (delayedFunctionObject.lastUpdateIntervalID !== 0) {
						if (new Date()
							.getTime() - delayedFunctionObject.lastUpdateTime < delayedFunctionObject.minimumDelay) {
							clearTimeout(delayedFunctionObject.lastUpdateIntervalID);
						}
					}
					delayedFunctionObject.lastUpdateIntervalID = setTimeout(function () {
						delayedFunctionObject.delayedFunction.apply(this, delayedFunctionObject.args);
					}, delayedFunctionObject.minimumDelay);
					delayedFunctionObject.lastUpdateTime = new Date()
						.getTime();
				}
			};
		});
