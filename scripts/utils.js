/*
    Utility functions:
    Display info, errors, warninings
    Implementation of sorted array
*/

function whenDocumentLoaded(action) {

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else { // `DOMContentLoaded` already fired
        action();
    }
}

function logger(prefix = "") {
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

// Map with getOrElse
class MapOrElse extends Map {
    getOrElse(key, defaultValue) {
        if (super.has(key)) {
            return super.get(key)
        } else {
            return defaultValue
        }
    }
}

/*  
    Modified from :
    https://github.com/javascript/sorted-array
    - "add-if-not-present" behaviour with the unique=true constructor parameter.
    - foreach, map, filter
*/
let SortedArray = (function() {

    let SortedArray = defclass({

        constructor: function(array, unique = true, compare) {
            this.array = [];
            this.compare = compare || compareDefault;
            this.unique = unique
            let length = array.length;
            let index = 0;

            while (index < length) this.insert(array[index++]);
        },

        insert: function(element) {
            let array = this.array;
            let compare = this.compare;
            let index = array.length;

            if (this.unique && this.search(element) != -1) {
                return
            }

            array.push(element);

            while (index > 0) {
                let i = index,
                    j = --index;

                if (compare(array[i], array[j]) < 0) {
                    let temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

            return this;
        },

        search: function(element) {

            let array = this.array;
            let compare = this.compare;
            let high = array.length;
            let low = 0;

            while (high > low) {
                let index = (high + low) / 2 >>> 0;
                let ordering = compare(array[index], element);

                if (ordering < 0) low = index + 1;
                else if (ordering > 0) high = index;
                else return index;
            }

            return -1;
        },

        remove: function(element) {
            let index = this.search(element);
            if (index >= 0) this.array.splice(index, 1);
            return this;
        },

        get: function(index) {
            return this.array[index]
        },

        contains: function(element) {
            return this.search(element) >= 0
        },

        forEach: function(fct) {
            return this.array.forEach(fct)
        },

        map: function(fct) {
            return this.array.map(fct)
        },

        filter: function(fct) {
            return this.array.filter(fct)
        },

        // Name .size() (function) to avoid confusion with .length (property)
        size: function(fct) {
            return this.array.length
        }
    });

    SortedArray.comparing = function(property, array) {
        return new SortedArray(array, function(a, b) {
            return compareDefault(property(a), property(b));
        });
    };

    return SortedArray;

    function defclass(prototype) {
        let constructor = prototype.constructor;
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
    MapOrElse,
    sleep
}