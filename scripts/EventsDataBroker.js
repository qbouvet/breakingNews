import {log, info, warn, err} from './utils.js'
import {SortedArray} from './utils.js'

import {DataLoader} from './DataLoader.js';

/* 
    This class holds the event data in one place and provides function for Others
    classes to access it
*/
class EventsDataBroker {

    constructor (dataLoader) {
        // Dataloader for file access
        this.loader = dataLoader;
        // timestamp => events map
        this.loadedEventsMap = new Map();
        // Hack to make getLatLong() faster
        this.smallestEventID = 800011820
        // Maximum point offset, 0.01° ~< 1km
        // Overlap is worse than a little bit of inacuracy for what we want to show
        this.maxPointOffset = 0.1;
    }

    // Checks if events for a given timestampe have already been loaded
    has (timestamp) {
        return this.loadedEventsMap.has(timestamp)
    }

    // Lists all loaded timestamps
    loadedTimestamps () {
        return this.loadedEventsMap.keys()
    }

    // Return loaded events straight away or load then return if not loaded
    loadedEvents (timestamp) {
        if (this.loadedEventsMap.has(timestamp)) {
            return this.loadedEventsMap.get(timestamp)
        } else {
            err("EventDataBroker doesn't have timestamp :", timestamp)
        }
    }

    // Loads a timestamp as a promise
    load (timestamp) {
        if (this.loadedEventsMap.has(timestamp)) {
            // Return with already loaded data
            return new Promise(function(resolve, reject) {
                resolve(this.loadedEventsMap.get(timestamp))
            })
        } else {
            let p = this.loader.loadEvents(timestamp);
            // Cache data
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
            // Return loading data
            return p
        }
    }

    //  Returns the lattitude / longitude of an event, if this event is loaded
    // ! exhaustive search
    getEventById(eventId) {
        if (eventId < this.smallestEventID) {
            return undefined
        }
        for (const timestamp of this.loadedEventsMap.keys()) {
            const eventsMapForTimestamp = this.loadedEventsMap.get(timestamp)
            for (let i=0; i < eventsMapForTimestamp.length; i++) {
                if (eventsMapForTimestamp[i]["ID"] == eventId) {
                    return eventsMapForTimestamp[i];
                }
            }
        }
        return undefined
    }

}


// Maps country names from world.json to contry names of the event dataset
const cmap = new Map([
    ["republic of congo", "democratic republic of the congo"],
    ["republic of serbia", "serbia (general),"],
    ["united states of america", "united states"]
])

cmap.getOrElse = function (key, defaultVal) {
    if (this.has(key)) {
        return this.get(key)
    } else {
        return defaultVal
    }
}

function matchCountryNames (cname) {
    const res = cmap.getOrElse (cname, cname)
    return res
}

export {EventsDataBroker, matchCountryNames}