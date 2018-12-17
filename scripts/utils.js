
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else { // `DOMContentLoaded` already fired
		action();
	}
}

function logger(prefix="") {
    return function() {
        let args = Array.prototype.slice.call(arguments);
        args.unshift(prefix);
        console.log.apply(console, args);
    }
}
const log = logger("");
const info = logger("[INFO]");
const warn = logger("[WARN]");
const err = logger("[ERR]");
const toast = console.warn;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*  Modified from :
 *      https://github.com/javascript/sorted-array
 *  - "add-if-not-present" behaviour with the unique=true constructor parameter.
 *  - foreach, map, filter
 */
var SortedArray = (function () {
    var SortedArray = defclass({
        constructor: function (array, unique=true, compare) {
            this.array   = [];
            this.compare = compare || compareDefault;
            this.unique = unique
            var length   = array.length;
            var index    = 0;

            while (index < length) this.insert(array[index++]);
        },
        insert: function (element) {
            var array   = this.array;
            var compare = this.compare;
            var index   = array.length;

            if ( this.unique && this.search (element) != -1 ){
                return
            }

            array.push(element);

            while (index > 0) {
                var i = index, j = --index;

                if (compare(array[i], array[j]) < 0) {
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

            return this;
        },
        search: function (element) {
            var array   = this.array;
            var compare = this.compare;
            var high    = array.length;
            var low     = 0;

            while (high > low) {
                var index    = (high + low) / 2 >>> 0;
                var ordering = compare(array[index], element);

                     if (ordering < 0) low  = index + 1;
                else if (ordering > 0) high = index;
                else return index;
            }

            return -1;
        },
        remove: function (element) {
            var index = this.search(element);
            if (index >= 0) this.array.splice(index, 1);
            return this;
        },
        forEach: function (fct) {
            return this.array.forEach(fct)
        },
        map: function (fct) {
            return this.array.map(fct)
        },
        filter: function (fct) {
            return this.array.filter(fct)
        },
        // name .size() (function) to avoid confusion with .length (property)
        size: function (fct) {
            return this.array.length
        }
    });

    SortedArray.comparing = function (property, array) {
        return new SortedArray(array, function (a, b) {
            return compareDefault(property(a), property(b));
        });
    };

    return SortedArray;

    function defclass(prototype) {
        var constructor = prototype.constructor;
        constructor.prototype = prototype;
        return constructor;
    }

    function compareDefault(a, b) {
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }
}());



export {
    whenDocumentLoaded,
    log, info, warn, err,
    SortedArray,
    sleep
}
