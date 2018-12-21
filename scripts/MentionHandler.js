import {log, info, warn, err} from './utils.js'
import {SortedArray} from './utils.js'
import {MapOrElse} from './utils.js'

import {DataLoader} from './DataLoader.js';
import {SourceGrapher} from './displaySources.js'
import {TimeManager} from './TimeManager.js';




/*******************************************************************************
            SOURCE->MENTIONTIME->EVENTID  TRACKING
*******************************************************************************/

    // SHOULD BE BUG-FREE
    /*  Counts the number of mentions per source,
     *  returns a Map(SourceName -> Map(MentionTime => SortedArray[EVENTIDS]) )
     *  sorted by decreasing number of mentions
     */
function gen_sourceTimeEvent_tree (mentions) {
        // TODO : NON-UNIQUE sorted array
    const sortedArrayFactory = function (array) {return new SortedArray(array, true)}
    let mentionsCountPerSource = new Map()
    if (mentions.length > 0) {
        mentions.reduce(function (acc, currMention) {
            if (acc.has(currMention['MentionSourceName'])) {
                    // Map(timestamp => SortedArray(eventsID) )
                const sourceToMentionsMap = acc.get(currMention['MentionSourceName'])
                if (sourceToMentionsMap.has(currMention["MentionTimeDate"])) {
                    sourceToMentionsMap.get(currMention["MentionTimeDate"]).insert(currMention["GLOBALEVENTID"]);
                } else {
                    sourceToMentionsMap.set( currMention["MentionTimeDate"], new SortedArray([currMention["GLOBALEVENTID"]]) )
                }
            } else {
                acc.set(currMention['MentionSourceName'],
                        new Map([[ currMention["MentionTimeDate"], new SortedArray([currMention["GLOBALEVENTID"]]) ]]) );
            }
            return acc;
        }, mentionsCountPerSource);
        // fixme : for performance, this could be removed if needed
        mentionsCountPerSource = new Map([...mentionsCountPerSource.entries()]
            .sort((entryA, entryB) => {
                return entryB[1][0] - entryA[1][0] // NB : decreasing order
            })
        );
    }
    //warn("Generated sourceTimeEvent tree :\n", counts)
    return mentionsCountPerSource
}


    // SHOULD BE BUG-FREE
    /*  Returns a Map(SourceName -> Map(timestamp => SortedArray[EVENTIDS]) )
     *  which is the concatenation of the two arguments (of the same type as ^ )
     *  !!! in-place modification of treeA (?)
     */
function concat_sourceTimeEvent_trees (treeA, treeB) {
    if (treeA.size <= 0 || treeB.size <= 0) {
        if (treeA.size <= 0 && treeB.size <= 0) {
            return new Map()
        } else if (treeB.size <= 0 ){
            return treeA
        } else {
            return treeB
        }
    }
    //warn("merging :\ntreeA:", treeA, "\ntreeB:", treeB)
    treeB.forEach( (timeEventMap, sourceName) => {
        if (treeA.has(sourceName)) {
            const sourceTree = treeA.get(sourceName)
            timeEventMap.forEach( (eventIdsArray, mentionTime) => {
                if (sourceTree.has(mentionTime)) {
                    eventIdsArray.forEach( (eventId) => {sourceTree.get(mentionTime).insert(eventId)} )
                } else {
                    sourceTree.set(mentionTime, eventIdsArray)
                }
            })
        } else {
            treeA.set(sourceName, treeB.get(sourceName))
        }
    });
    return treeA
    //warn("merging : result (treeA):\n", treeA)
}


    // HAS BEEN RELATIVELY DEBUGGED
    /*  Cumulative mentions :
     *      Map(SourceName -> Map(timestamp => cumulatedCount )
     *  contains for each source, the number of cumulated mentions as of 'timestamp'
     *  newMentions :
     *      Map(SourceName -> Map(timestamp => SortedArray[EVENTIDS]) )
     *  contains new mentions
     */
function updateCumulativeMentions (timeMgr, cumulativeMentions, newMentions, timestamp) {
        // add the content of newMentions to cumulativeMentions
    newMentions.forEach ( (value, key) => { // key=sourceName, Map(timestamp => SortedArray[EVENTIDS])
        if (cumulativeMentions.has(key)) {
            const cumulativeMentionsForSource = cumulativeMentions.get(key)
            const prevTimestamp = timeMgr.prevTimestamp(timestamp)
            const previousCount = prevTimestamp==undefined ? 0 : cumulativeMentionsForSource.getOrElse(prevTimestamp, 0)
            const debug = [...value.entries()] // get first value
            const currentCount = previousCount + [...value.entries()][0][1].size()   //complicated way to read the first value
            cumulativeMentions.get(key).set(timestamp, currentCount)
        } else {
            const newMap = new MapOrElse();
            const currentCount = value.get(parseInt(timestamp)).size()
            newMap.set(timestamp, currentCount)
            cumulativeMentions.set(key, newMap)
        }
    });
        // Update all elements of cumulativeMentions that didn't have any new mentions this period
    cumulativeMentions.forEach( (value, key) => {
        if (!value.has(timestamp)) {
            value.set(timestamp, value.get(timeMgr.prevTimestamp(timestamp)))
        }
    });
    return cumulativeMentions;
}




/*******************************************************************************
                                EXPORTS
*******************************************************************************/


export class MentionHandler {

    // Initializes path variables
    constructor(eventsDataBroker, worldmap, timeManagerRef) {

            // data access
        this.loader = new DataLoader();

            // core data structures :
        this.sourceTimeEventTree = new MapOrElse();     // Map( SourceName => Map(timestamp => eventsId))
                                                        // used to retrieve a source's eventsID at a given timestamp
        this.sourceCumulatedMentions = new MapOrElse(); // Map( sourceName => Map(timestamp => cumulatedMentionsCount)
                                                        // used to find the most prolific source at each timestamp
        this.loadedTimestamps = new Map();              // Map( timestamp => mentions )
                                                        // Keep track of which files were loaded
        this.currentTime = undefined

            // Access to events storage, needed for latLong queries
        this.eventsBroker = eventsDataBroker;
            // To request redraws / masks
        this.worldmap = worldmap;
            // draw graphs
        this.sourceGrapher = new SourceGrapher(worldmap)
            // query timestamp
        this.timeManagerRef = timeManagerRef

            // visulization parameter : number of displayed source graphs
        this.k = 20;
    }

    /*  Update data structures to a new currentTime
     */
    update(timestamp, isForward) {
        if (isForward) {
            if ( ! this.loadedTimestamps.has(timestamp)) {
                info("Loading mentions file for timestamp : " + timestamp);
                const mentions_promise = this.loader.loadMentions(timestamp);
                mentions_promise
                .then( (result) => {    // update data structures
                    const new_sourceTimeEvent = gen_sourceTimeEvent_tree (result)
                    this.sourceTimeEventTree = concat_sourceTimeEvent_trees(this.sourceTimeEventTree, new_sourceTimeEvent)
                    this.sourceCumulatedMentions = updateCumulativeMentions (this.timeManagerRef, this.sourceCumulatedMentions, new_sourceTimeEvent, timestamp)
                    this.currentTime = timestamp
                    this.loadedTimestamps.set(timestamp, result)
                })
                .then( (result) => {
                    this.draw_graphs(timestamp, this.k)
                });
            } else {
                info("Mention file already loaded (forward) for timestamp : " + timestamp);
                this.currentTime = timestamp;
                this.draw_graphs(timestamp, this.k)
            }
        } else {
            info("Mention file already loaded (backward) for timestamp : " + timestamp);
            this.currentTime = timestamp;
            this.draw_graphs(timestamp, this.k)
        }
    }

    // SHOULD BE BUG FREE
    /*  Returns in an array all elapsed timestamps from time 0 to currentTime
     *  Be default, will use this.currentTime, but can also accept it as argument
     */
    getElapsedTimestamps (time=undefined) {
        if (time == undefined) {
            return [...this.loadedTimestamps.keys()].filter ( (t) => t<=this.currentTime)
        } else {
            return [...this.loadedTimestamps.keys()].filter ( (t) => t<=time)
        }
    }

        // HAS BEEN RELATIVELY DEBUGGED
        /*  Returns the k most "prolific at time timestamp" new sources and their events :
         *      [sourceName , Map( timestamps => eventsIDs )]
         */
    getTopSourcesAndEvents (timestamp, k) {
            // sort cumulativeMentions according to cumulative amount of mentions at time 'timestamp'
            // use it to get our top sources
        const tmp = [...this.sourceCumulatedMentions.entries()].sort((a, b) => {
            return b[1].get(timestamp) -a[1].get(timestamp) // decreasing order
        });
        const topSourcesCumulatedMentions = (k > tmp.length) ?
            tmp : tmp.slice(0, k)
            // topsources : Map(SourceName => cumulatedCount)
        const topSources = topSourcesCumulatedMentions.map( (elem) => elem[0] );
            // For each sourceName in the top sources
        const res = topSources.map( (sourceName) => {
                // for each [timestamp, SortedArray[EventIds]] in timeEventTree[sourceName], drop it if timestamp > timestamp
            const filteredSourceTimeEventTree = [...this.sourceTimeEventTree.get(sourceName).entries()].filter( (elem) => {
                return elem[0] <= parseInt(timestamp)
            })
            /*const filteredSourceTimeEventTree = [...this.sourceTimeEventTree.get(sourceName).entries()].map( (elem) => {
                    // for each [sourceName => Map(timestamp, [eventIDs]) ]
                const eventsMentionnedBeforeTimestamp = [...elem[1].entries()].filter( (entry) => entry[1] <= timestamp )
                const tmpres = new MapOrElse(eventsMentionnedBeforeTimestamp)
                [elem[0], tmpres]
            })*/
            const tmp3 = new MapOrElse(filteredSourceTimeEventTree)    // recreate a map from the array of entries
            return [sourceName, tmp3]
        })
        return new MapOrElse(res)
    }

        // SHOULD BE RELATIVELY BUG-FREE
        /*  Returns (by querying this.sourceCumulatedMentions) :
         *      [ Source => OverallCount ]
         *  As is at time 'timestamp', for the k top sources (optional)
         */
    getCumulatedMentions (timestamp, k=undefined) {
        const tmp = [...this.sourceCumulatedMentions.entries()].map( (entry) => {
            return [entry[0], entry[1].getOrElse(timestamp, 0)]
        })
        if (k==undefined) {
            // !! Not sorted (intended to be re-wrapped in a Map)
            return new MapOrElse(tmp)
        } else {
            // sort and slice
            return new MapOrElse (tmp
                .sort((a, b) => b[1]-a[1] ) // decreasing order
                .slice(0, k)
            )
        }
    }

        // SHOULD BE RELATIVEL BUG-FREE
        /*  Returns the 0-padded time serie for the top k sources :
         *      Map(SourceName => Map(Timestamp => count))
         *  0-padded = if there we no mentions as time t, a tuple (t => 0) is
         *  added to the map
         *  Accepts a pre-computed 'topSourcesAndEvents' map to avoid redondant
         *  computations :
         *      Map( sourceName => Map(timestamp => sortedArray[EventsID]))
         */
    getTopSourcesTimeSeries (timestamp, k, topSourcesAndEvents=undefined) {
        if (topSourcesAndEvents==undefined) {
            topSourcesAndEvents = this.getTopSourcesAndEvents(timestamp, k)
        }
        return new MapOrElse([...topSourcesAndEvents.entries()].map( (entry) => {
            return [entry[0], new MapOrElse(
                this.getElapsedTimestamps().map( (t) => [t, entry[1].getOrElse(parseInt(t),new SortedArray([])).size()] )
            )]
        }))
    }


    draw_graphs (timestamp, k) {

        const sourcesEvents = this.getTopSourcesAndEvents(timestamp, k)     // Map( sourceName => Map( timestamp => [eventsID] )
        const cumulatedMentions = this.getCumulatedMentions(timestamp, k)      // Map( sourceName => overallCount )
        const liveTimestamps = this.getElapsedTimestamps(timestamp)         // list of timestamps to display
        const timeseries = this.getTopSourcesTimeSeries(timestamp, k)   // Map( sourceName => Map(timestamp => count) )

        this.sourceGrapher.display_source(
                        timeseries,          // Map( sourceName => Map(timestamp => count) )
                        cumulatedMentions,            // Map( sourceName => overallCount )
                        liveTimestamps,            // list of timestamps to display
                        this.countryColorChart.bind(this)      // country colormap callback function
        )
    }






/*=================================================================================================================
    Viz stuff
    =========*/

        /*  Queries the EventsDataBroker for events reported by the source
         *  Returns :
         *      SortedArray(Events) (unique elements)
         */
    events_for_source (sourceName, liveTimestamps) {
        let coveredEventsIds = new SortedArray([], true)
        if (this.sourceTimeEventTree.has(sourceName)) {
            this.sourceTimeEventTree.get(sourceName).forEach( (value, key) => {
                //err("key:", key, "value:", value)
                if (liveTimestamps.includes(key.toString())) {
                    value.forEach( (eventId) => {
                        coveredEventsIds.insert(eventId)
                    })
                }
            })
        }
        info("Source : ", sourceName, "covered", coveredEventsIds.size(), "events.\nIDs : \n", coveredEventsIds)
        let tmp = coveredEventsIds.map( (id) => {
            const event = this.eventsBroker.getEventById(id)
            return event;
        })
        let coveredEvents = tmp.filter( (event) => event!=undefined)
        info("Out of which", coveredEvents.length, "we were able to identify (=find by ID). \nEvents :\n", coveredEvents)
        return coveredEvents
    }

    easyHeatmap (sourceName) {
        let events = this.events_for_source(sourceName)
        this.worldmap.toggleEasyHeatmap(events)
    }

    countEventsByCountry (events) {
        let count = new Map()
        events.forEach( (e) =>  {
            const loc = e["Action_Location"].split(", ")
            const country = loc[loc.length -1].toLowerCase()
            if (count.has(country)) {
                 count.set(country, count.get(country)+1)
            } else {
                count.set(country, 1)
            }
        });
        const max = Array.from(count.values()).reduce( (a, b) => Math.max(a,b), 1)
        count.getOrElse = function (key, defaultVal) {
            if (this.has(key)) {
                return this.get(key)
            } else {
                return defaultVal
            }
        }
        return [count, max];
    }

    countryColorChart (sourceName, timeStart, timeEnd) {
            // find the matching timestamps
        function roundTimestamp (date, round="down") {
            let tsp = TimeManager.dateToTimestamp(date)
            let fixedPart = tsp.slice(0, 8)
            let hour = tsp.slice(8, 10)
            let min = parseInt(tsp.slice(10, 12))
            if (round=="up") {
                return min>=45 ? fixedPart+parseInt(hour+1).toString+"0000" :
                        min>= 30 ? fixedPart+hour+"4500" :
                            min>=15 ? fixedPart+hour+"3000" : fixedPart+hour+"1500"
            } else {
                return min<=15 ? fixedPart+hour+"0000" :
                        min<= 30 ? fixedPart+hour+"1500" :
                            min<=45 ? fixedPart+hour+"3000" : fixedPart+hour+"4500"
            }
        }
        let timestampStart = roundTimestamp(timeStart, "up")
        let timestampEnd = roundTimestamp(timeEnd, "down")
        timestampStart = this.timeManagerRef.clampBelow(timestampStart)
        timestampEnd = this.timeManagerRef.clampAbove(timestampEnd)

        if (parseInt(timestampEnd) < parseInt(timestampStart)) {
            // This is normal if the user didn't select any datapoint in his band selection
            warn ("band-select : no timestamp selected")
            return
        }
        info ("Coloring countries, timestamps", timestampStart, timestampEnd)
        let liveTimestamps = []
        liveTimestamps.push(timestampStart)
        let lastTimestamp = liveTimestamps[liveTimestamps.length-1]
        while (lastTimestamp != timestampEnd) {
            lastTimestamp = this.timeManagerRef.nextTimestamp(lastTimestamp)
            liveTimestamps.push(lastTimestamp)
        }
            // count events for selected timestamps
        const events = this.events_for_source(sourceName, liveTimestamps)
        info ("Found", events.length, "events\n", events)
        const [count, max] = this.countEventsByCountry(events)
            // call to draw with the data
        this.worldmap.drawCountryColorChart (count, max)
    }
}
