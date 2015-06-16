'use strict';



module.exports = {

    // Determines whether there have been any changes in the window size or layout.
    // We need the reactivator to be a Singleton. We can't have tangled async code.
    // 
    //  Params:
    //      callback -- function that receives the spareHeight in the window.
    //
    newReactivator: function  (callback) {

        var COUNTER_DEFAULT  = 10,
            INTERVAL_DEFAULT = 100,
            CLASSNAME        = 'container';

        return (function () { 

            // Variables available across calls to the reactivator.
            var counter,
                intervalID,
                innerHeight,
                lowest;

            // Function returned to the caller of newReactivator...
            return function () {

                counter = COUNTER_DEFAULT;


                if (intervalID) { return; } // Keep on keeping on, with your refreshed counter.


                intervalID = window.setInterval(function() {

                    innerHeight = window.innerHeight;
                    lowest      = document.getElementsByClassName(CLASSNAME)[0]
                                          .getBoundingClientRect().bottom;

                    if(lowest !== innerHeight) {
                        callback(innerHeight - lowest);
                        
                        // This could cause problems. Maybe just use counter???
                        window.clearInterval(intervalID); 
                        intervalID = null;
                    }

                    if(!(--counter)) { 
                        window.clearInterval(intervalID); 
                        intervalID = null;
                    }

                }, INTERVAL_DEFAULT);
            };
        }());
    }
};

