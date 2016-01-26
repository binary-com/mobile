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
					var elapsedTime = new Date().getTime() - delayedFunctionObject.lastUpdateTime;
					if (elapsedTime < delayedFunctionObject.minimumDelay) {
						if (delayedFunctionObject.lastUpdateIntervalID !== 0) {
							clearTimeout(delayedFunctionObject.lastUpdateIntervalID);
						}
						delayedFunctionObject.lastUpdateIntervalID = setTimeout(function () {
							delayedFunctionObject.delayedFunction.apply(this, delayedFunctionObject.args);
						}, delayedFunctionObject.minimumDelay - elapsedTime);
					} else {
						delayedFunctionObject.lastUpdateIntervalID = 0;
						delayedFunctionObject.lastUpdateTime = new Date().getTime();
						delayedFunctionObject.delayedFunction.apply(this, delayedFunctionObject.args);
					}
				}
			};
            
            this.remove = function(name, delayedFunction){
                if(this.functions.hasOwnProperty(name) && delayedFunction !== 'undefined'){
                    delete this.functions[name];
                }
            }
		});
