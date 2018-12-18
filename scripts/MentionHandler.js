import {log, info, warn, err} from './utils.js'
import {SortedArray} from './utils.js'
import {MapOrElse} from './utils.js'

import {DataLoader} from './DataLoader.js';
import {display_source, clean_sources} from './displaySources.js'
import {TimeManager} from './TimeManager.js';




/*******************************************************************************
                    Mentions counter (for graphs)
*******************************************************************************/

const timeMgr = new TimeManager()

function sortMapByKeys(history_value) {
  const mapSort1 = new Map([...history_value.entries()].sort((a, b) => {
    return a[0] - b[0] }
      ));
  return mapSort1;
}


function sortHistory(history) {
  history.forEach((value, key) => {
    value = sortMapByKeys(value)
    history[key] = value
  })
  return history
}

    // THIS SEEMS BROKEN ?
    // (run is in debugger, mapSort1 is always undefined)
    /*  Counts the number of mentions per source,
     *  ---returns a map [SourceName -> mentionCount] sorted by mentioncount---
     *  returns a map [SourceName -> [nbMentions, Map[MentionTime => SortedArray(EVENTIDS)]] ]
     *  sorted by decreasing nbMentions
     */
function count_mentions(mentions) {
    if (mentions.length > 0){
        var counts = {}
        info("counting")
        mentions.reduce(function (acc, curr) {
            acc[curr['MentionSourceName']] ? acc[curr['MentionSourceName']]++ : acc[curr['MentionSourceName']] = 1;
            return acc;
        },counts);

        // sorted mentions
        var mapCounts = new Map(Object.entries(counts))
        const mapSort1 = new Map([...mapCounts.entries()].sort((a, b) => {
            return b[1] - a[1]
        }));
        return mapSort1
    } else {
         return new Map()
    }
}

    /*  Extends the "historic" mention map with the given number of mentions at the given timestamp.
     *  Historic mentions map is :
     *      Map( sourceName => Map(timestamp, mentionsCount))
     */
function make_history(mentions, historyMentions, currentTimestamps) {

     let timestamps = Array.from(currentTimestamps)
     const current = timestamps[timestamps.length-1]

     //console.log("history mentions: ", historyMentions)
     //console.log("current: ", current)

     mentions.forEach( // mention is made of [key => value] == [sourceName => Map[MentionTime => SortedArray[EventIds]]]
     	(value, key) => {
     		if (key in historyMentions) {
     			historyMentions[key].set(current, value)
     		} else {
     			historyMentions[key] = new Map([[current, value]])
     		}
     })

     return historyMentions
}


    /*  Returns a map of the top 5 sources :
     *      Map( sourceName => Map(timestamp, mentionsCount) )
     *  Filter historyMentions by only keeping sources in top_mentions.
     */
function take_top_history(top_mentions, historyMentions) {
    var top_mentions_map = new Map()
    top_mentions.forEach(
        (value, mention) => {
            if (mention in historyMentions) {
                top_mentions_map.set(mention, historyMentions[mention])
            } else {
                console.log("there is a big problem")
            }
    })

    return top_mentions_map
}


    /*  Adds (timestamp, 0) for each missing timestamp in 'top_history_cumulative'
     *  Returns :
     *      Map( sourceName => Map(timestamp => count) )
     */
function add_timestamps_to_top_history_map(top_history_cumulative, currentTimestamps) {
         top_history_cumulative.forEach((value, source) => {
             currentTimestamps.forEach( time => {
                 if (value.has(time)){
                     // console.log(value.get(time))
                 } else {
                     value.set(time, 0)
                 }
             })
         })
         top_history_cumulative = sortHistory(top_history_cumulative)
         return top_history_cumulative
     }


    /* (?) Trims out of top_history_cumulative entries whose timestamp is
     * (?) after the current time
     *     Used only then going backwards
     *     returns (probably) :
     * (?)     Map( sourceName => Map(timestamp => count) )
     */
function take_top_history_up_to_current_timestamp(top_history_cumulative, currentTimestamps) {
  let top_history = new Map()
  top_history_cumulative.forEach((value, source) => {
    currentTimestamps.forEach( time => {
      if (top_history.has(source)) {
        if (value.has(time)) {
          top_history.get(source).set(time, value.get(time))
        }
      } else {
        if (value.has(time)) {
          let my_map = new Map()
          my_map.set(time, value.get(time))
          top_history.set(source, my_map)
        }
      }
    })
  })
  return sortHistory(top_history)
}







/*******************************************************************************
            SOURCE->MENTIONTIME->EVENTID  TRACKING (for heatmap)
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
function updateCumulativeMentions (cumulativeMentions, newMentions, timestamp) {
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
    constructor(eventsDataBroker, worldmap) {

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

            // visulization parameter : number of displayed source graphs
        this.k = 5;

            // for mentions counting
    	this.loadedMentions = {};          // mention loaded in memory, but possibly after the viz's current time
    	this.historyMentions = {};         //
    	this.cumulativeMentions = [];      // All mentions that happened before the viz's current time and that have been processed
    	this.currentTimestamps = [];       // all timestamps before/equal to the viz's current time
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
                    this.sourceCumulatedMentions = updateCumulativeMentions (this.sourceCumulatedMentions, new_sourceTimeEvent, timestamp)
                    this.currentTime = timestamp
                    this.loadedTimestamps.set(timestamp, result)
                })
                .then( (result) => {
                    err ("here, we should call redraw")
                });
            } else {
                info("Mention file already loaded (forward) for timestamp : " + timestamp);
                this.currentTime = timestamp;
            }
        } else {
            info("Mention file already loaded (backward) for timestamp : " + timestamp);
            this.currentTime = timestamp;
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


    prepare_v2 (timestamp, k) {

        const sourcesEvents = this.getTopSourcesAndEvents(timestamp, k)     // Map( sourceName => Map( timestamp => [eventsID] )
        const cumulatedMentions = this.getCumulatedMentions(timestamp, k)      // Map( sourceName => overallCount )
        const liveTimestamps = this.getElapsedTimestamps(timestamp)         // list of timestamps to display
        const timeseries = this.getTopSourcesTimeSeries(timestamp, k)   // Map( sourceName => Map(timestamp => count) )

        display_source(timeseries,          // Map( sourceName => Map(timestamp => count) )
                        cumulatedMentions,            // Map( sourceName => overallCount )
                        liveTimestamps,            // list of timestamps to display
                        this.countryColorChart.bind(this))      // country colormap callback function
    }




/*=================================================================================================================
    Update mentions
    =============*/

    /*  Update mentions
    */
    updateMentions(timestamp, isForward) {
        this.update(timestamp, isForward)
        if (isForward) {
            if ( !( (Object.keys(this.loadedMentions).includes(timestamp) && (timestamp in this.currentTimestamps)) )) {
                info("Loading mentions file " + timestamp);
                let mentions_promise = this.loader.loadMentions(timestamp);
                mentions_promise.then( (result) => {
                    this.updateMentionsForward(timestamp, result)
                    //this.updateSourceTimeEventTree(timestamp, result)
                });
            } else {
                this.updateMentionsForward(timestamp, undefined)
                this.updateSourceTimeEventTracking(timestamp, undefined)
            }
        } else { // backwards
            this.updateMentionsBackward(timestamp);
        }
    }

    updateMentionsForward (timestamp, fileLoadResult=undefined) {
            // that mean we loaded a data file with a promise -> we need to update mentions
        if (fileLoadResult != undefined) {
            this.currentTimestamps.push(timestamp);
            this.loadedMentions[timestamp] = fileLoadResult;
        }
            // updateMensionsForward :
            // Update flatEvents with already loaded data
        this.cumulativeMentions = this.cumulativeMentions.concat(this.loadedMentions[timestamp]);
            // idem
        if (fileLoadResult != undefined) {
            // that mean we loaded a data file with a promise -> we need to update mentions
            this.prepare_mentions_for_sources_to_visualize(this.cumulativeMentions, this.loadedMentions, this.historyMentions, this.currentTimestamps, this.k, timestamp)
        }
    }


    updateSourceTimeEventTree (timestamp, result=undefined) {
        if (result != undefined) {
            let new_sourceTimeEvent = gen_sourceTimeEvent_tree (this.loadedMentions[timestamp])
            concat_sourceTimeEvent_trees(this.sourceTimeEventTree, new_sourceTimeEvent)
            //err(this.sourceTimeEventTree)
        }
        // else didn't load new file => nothing to do, data structure is built already
    }

    updateMentionsBackward(timestamp) {

      // Remove timestamp from current ones
      info("Removing from current " + timestamp);
      this.currentTimestamps.pop();
      this.cumulativeMentions = [];

      if (this.currentTimestamps.length > 0){

        let last_timestamp = this.currentTimestamps[this.currentTimestamps.length-1]
        let result = []

        result = this.loadedMentions[last_timestamp]
            // Rebuild flatEvents
        for (const timestamp of this.currentTimestamps) {
          this.cumulativeMentions = this.cumulativeMentions.concat(this.loadedMentions[timestamp]);
        }

        this.prepare_mentions_for_sources_to_visualize(this.cumulativeMentions, this.loadedMentions, this.historyMentions, this.currentTimestamps, this.k, timestamp, true)

      } else {
        clean_sources(true)
      }
    }

    reset() {
      this.currentTimestamps = [];
      this.cumulativeMentions = [];
      clean_sources(true)
    }

    prepare_mentions_for_sources_to_visualize(  cumulativeMentions,
                                                loadedMentions,
                                                historyMentions,
                                                currentTimestamps,
                                                k,
                                                timestamp,
                                                isBackward=false) {


            // prepare [sourceName => nbMentions]
        let source_cumulative_frequency = count_mentions(cumulativeMentions);
        let source_frequency = count_mentions(loadedMentions[timestamp]);

            // extend historyMentions (the argument) with the newly calculated [sourceName => nbMentions]
        historyMentions = make_history(source_frequency, historyMentions, currentTimestamps)

            // keep the k most busy sources over cumulative mentions, and take the matching history
        var top_frequency_cumulative = new Map(Array.from(source_cumulative_frequency).slice(0, k));
        var top_history_cumulative = take_top_history(top_frequency_cumulative, historyMentions)

            // fill the gaps in timestamps with (timestamp, 0) pairs
        top_history_cumulative = add_timestamps_to_top_history_map(top_history_cumulative, currentTimestamps)

        if (isBackward) {
            top_history_cumulative = take_top_history_up_to_current_timestamp(top_history_cumulative, currentTimestamps)
        }

        const sourcesEvents = this.getTopSourcesAndEvents(timestamp, k)     // Map( sourceName => Map( timestamp => [eventsID] )
        const cumulatedMentions = this.getCumulatedMentions(timestamp, k)      // Map( sourceName => overallCount )
        const liveTimestamps = this.getElapsedTimestamps(timestamp)         // list of timestamps to display
        const timeseries = this.getTopSourcesTimeSeries(timestamp, k)   // Map( sourceName => Map(timestamp => count) )

        display_source(timeseries,          // Map( sourceName => Map(timestamp => count) )
                        cumulatedMentions,            // Map( sourceName => overallCount )
                        liveTimestamps,            // list of timestamps to display
                        this.countryColorChart.bind(this))      // country colormap callback function

        return

        /*display_source(top_history_cumulative,              // Map( sourceName => Map(timestamp => count) )
                        top_frequency_cumulative,           // Map( sourceName => overallCount )
                        currentTimestamps,                  // list of timestamps to display
                        this.countryColorChart.bind(this))  // country colormap callback function*/
    }











/*=================================================================================================================
    Display stuff
    =============*/

        /*  Queries the EventsDataBroker for events reported by the source
         *  Returns :
         *      SortedArray(Events) (unique elements)
         */
    events_for_source (sourceName) {
        let coveredEventsIds = new SortedArray([], true)
        if (this.sourceTimeEventTree.has(sourceName)) {
            this.sourceTimeEventTree.get(sourceName).forEach( (value, key) => {
                //err("key:", key, "value:", value)
                value.forEach( (eventId) => {
                    coveredEventsIds.insert(eventId)
                })
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

    countryColorChart (sourceName) {
        const events = this.events_for_source(sourceName)
        const [count, max] = this.countEventsByCountry(events)
        this.worldmap.toggleCountryColorChart (count, max)
    }
}
