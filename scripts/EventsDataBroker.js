import {log, info, warn, err} from './utils.js'
import {SortedArray} from './utils.js'

import {DataLoader} from './DataLoader.js';


    /* This class holds the event data in one place and provides function for Others
     * classes to access it
     */
export class EventsDataBroker {

    constructor (dataLoader) {
            // Dataloader for file access
        this.loader = dataLoader;
            // timestamp => events map
        this.loadedEvents = new Map();
            // not sure we need it
        this.currentTimestamps = new SortedArray([], true);
        this.flatEvents = [];
            // hack to make getLatLong() faster
        this.smallestEventID = 800011820
    }

        // checks if events for a given timestampe have already been loaded
    has (timestamp) {
        return this.loadedEvents.has(timestamp)
    }

        // lists all loaded timestamps
    loadedTimestamps () {
        return this.loadedEvents.keys()
    }

        // return loaded events straight away or load then return if not loaded
    loadedEvents (timestamp) {
        if (this.loadedEvents.has(timestamp)) {
            return this.loadedEvents.get(timestamp)
        } else {
            err("EventDataBroker doesn't have timestamp :", timestamp)
        }
    }

        // loads a timestamp as a promise
    load (timestamp) {
        if (this.loadedEvents.has(timestamp)) {
            // return with already loaded data
            return new Promise(function(resolve, reject) {
                resolve(this.loadedEvents.get(timestamp))
            })
        } else {
            let p = this.loader.loadEvents(timestamp);
            // cache data
            p.then( (results) => {
                info("EventDataBroker loaded ", timestamp)
                this.loadedEvents.set(timestamp, results)
                return results
            })
            // return loading data
            return p
        }
    }

        //  Returns the lattitude / longitude of an event, if this event is loaded
        // ! exhaustive search
    getLatLong(eventId) {
        if (eventId < this.smallestEventID) {
            return [undefined, undefined]
        }
        for (const k of this.loadedEvents.keys()) {
            const arr = this.loadedEvents.get(k)
            for (let i=0; i < arr.length; i++) {
                if (arr[i]["ID"] == eventId) {
                    return [arr[i]["Lat"], arr[i]["Long"]]
                }
            }
        }
        return [undefined, undefined]
    }

}
