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
        this.loadedEventsMap = new Map();
            // Not used yet
        /*this.currentTimestamps = new SortedArray([], true);
        this.flatEvents = [];*/
            // hack to make getLatLong() faster
        this.smallestEventID = 800011820
            // maximum point offset, 0.01° ~< 1km
        this.maxPointOffset = 0.02
    }

        // checks if events for a given timestampe have already been loaded
    has (timestamp) {
        return this.loadedEventsMap.has(timestamp)
    }

        // lists all loaded timestamps
    loadedTimestamps () {
        return this.loadedEventsMap.keys()
    }

        // return loaded events straight away or load then return if not loaded
    loadedEvents (timestamp) {
        if (this.loadedEventsMap.has(timestamp)) {
            return this.loadedEventsMap.get(timestamp)
        } else {
            err("EventDataBroker doesn't have timestamp :", timestamp)
        }
    }

        // loads a timestamp as a promise
    load (timestamp) {
        if (this.loadedEventsMap.has(timestamp)) {
            // return with already loaded data
            return new Promise(function(resolve, reject) {
                resolve(this.loadedEventsMap.get(timestamp))
            })
        } else {
            let p = this.loader.loadEvents(timestamp);
            // cache data
                // +/-0.01 in lattitude/longitude ~= +/- 1km
            const randSmallOffset = () => this.maxPointOffset*(Math.random()-0.5)*2
            p.then( (results) => {
                info("EventDataBroker loaded ", timestamp)
                results = results.map( (elem) => {
                    elem["Lat"] = elem["Lat"] + randSmallOffset()
                    elem["Long"] = elem["Long"] + randSmallOffset()
                    return elem
                })
                this.loadedEventsMap.set(timestamp, results)
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
        for (const k of this.loadedEventsMap.keys()) {
            const arr = this.loadedEventsMap.get(k)
            for (let i=0; i < arr.length; i++) {
                if (arr[i]["ID"] == eventId) {
                    return [arr[i]["Lat"], arr[i]["Long"]]
                }
            }
        }
        return [undefined, undefined]
    }

}
