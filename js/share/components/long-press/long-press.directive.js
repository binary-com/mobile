(function() {
    angular.module("binary.share.components.long-press.directives").directive("onLongPress", LongPress);

    LongPress.$inject = ["$timeout", "$interval"];

    function LongPress($timeout, $interval) {
        const directive = {
            restrict: "A",
            link
        };

        function link(scope, elm, attrs) {
            let timer = 0;
            const interval = attrs.interval ? Number(attrs.interval) : 300;
            scope.longPress = false;

            const startPress = function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                // Locally scoped variable that will keep track of the long press
                scope.longPress = true;

                if (attrs.repetitive && attrs.repetitive === "true") {
                    // run the function befor repeating in the interval
                    scope.$eval(attrs.onLongPress);

                    timer = $interval(() => {
                        if (scope.longPress) {
                            // If the touchend event hasn't fired,
                            // apply the function given in on the element's on-long-press attribute
                            scope.$eval(attrs.onLongPress);
                        }
                    }, interval);
                } else {
                    // We'll set a timeout for 600 ms for a long press
                    timer = $timeout(() => {
                        if (scope.longPress) {
                            // If the touchend event hasn't fired,
                            // apply the function given in on the element's on-long-press attribute
                            scope.$eval(attrs.onLongPress);
                        }
                    }, interval);
                }
            };

            const endPress = function(evt) {
                // Prevent the onLongPress event from firing
                scope.longPress = false;

                if (attrs.repetitive && attrs.repetitive === "true") {
                    $interval.cancel(timer);
                } else {
                    $timeout.cancel(timer);
                }

                timer = undefined;

                // If there is an on-touch-end function attached to this element, apply it
                if (attrs.onTouchEnd) {
                    scope.$apply(() => {
                        scope.$eval(attrs.onTouchEnd);
                    });
                }
            };

            elm.bind("touchstart", startPress);
            elm.bind("touchend", endPress);
            elm.bind("mousedown", startPress);
            elm.bind("mouseup", endPress);
        }

        return directive;
    }
})();
