import {log, info, warn, err} from './utils.js'
import {SortedArray} from './utils.js'

import {DataLoader} from './DataLoader.js';
import {make_bar_chart, display_source, clean_sources} from './displaySources.js'





/*******************************************************************************
                    Mentions counter (for graphs)
*******************************************************************************/


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
    		return acc;},
    	counts);

    	// sorted mentions
    	var mapCounts = new Map(Object.entries(counts))
    	const mapSort1 = new Map([...mapCounts.entries()].sort((a, b) => {
    		return b[1] - a[1] }
          ));

    	return mapSort1

    } else {
      return new Map()
    }
}

    /*  Extends the "historic" mention map with the given number of mentions at the given timestamp.
     *  Historic mentions map :
     *      ---[sourceName -> list( (timestamp, nbMentionsAtTimestamp) )]---
     *      [SourceName -> [nbMentions, Map[MentionTime => SortedArray(EVENTIDS)]] ]
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


    /*  Given the top mentions for the current timestamp (in 'top_mentions'),
     *  retrives their historical values serie from historyMentions. i.e. :
     *      [ sourceName => List( (timestamp, nbMentions) ) ]
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


    /*  For each source in 'top_history_cumulative', adds a (timestamp, 0)
     *  value to the historical values if the source had reported no event at that timestamp
     *  and return a sorted resulting [ sourceName => List( (timestamp, nbMentions) ) ]
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
  return top_history
}








/*******************************************************************************
            SOURCE->MENTIONTIME->EVENTID  TRACKING (for heatmap)
*******************************************************************************/


/*  Counts the number of mentions per source,
 *  returns a map [SourceName -> [nbMentions, Map[MentionTime => SortedArray(EVENTIDS)]] ]
 *  sorted by decreasing number of mentions
 */
function gen_sourceTimeEvent_tree (mentions) {
    const sortedArrayFactory = function (array) {return new SortedArray(array, true)}
    let counts = new Map()
    if (mentions.length > 0) {
        mentions.reduce(function (acc, curr) {
            if (acc.has(curr['MentionSourceName'])) {
                const sourceMap = acc.get(curr['MentionSourceName'])
                if (sourceMap.has(curr["MentionTimeDate"])) {
                    sourceMap.get(curr["MentionTimeDate"]).insert(curr["GLOBALEVENTID"]);
                } else {
                    sourceMap.set( curr["MentionTimeDate"], new SortedArray([curr["GLOBALEVENTID"]]) )
                }
            } else {
                acc.set(curr['MentionSourceName'],
                        new Map([[ curr["MentionTimeDate"], new SortedArray([curr["GLOBALEVENTID"]]) ]]) );
            }
            return acc;
        }, counts);
        // fixme : for performance, this could be removed if needed
        counts = new Map([...counts.entries()].sort((entryA, entryB) => {
            return entryB[1][0] - entryA[1][0] // NB : decreasing order
        }));
    }
    //warn("Generated sourceTimeEvent tree :\n", counts)
    return counts
}


    /*  Returns a [SourceName -> [nbMentions, Map[MentionTime => SortedArray(EVENTIDS)]] ]
     *  which is the concatenation of the two arguments (of the same type as ^ )
     *  !!! in-place modification of treeA (?)
     */
function concat_sourceTimeEvent_trees (treeA, treeB) {
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
    //warn("merging : result (treeA):\n", treeA)
}







/*******************************************************************************
                                EXPORTS
*******************************************************************************/


export class MentionHandler {

    // Initializes path variables
    constructor(eventsDataBroker, worldmap) {
    	this.loader = new DataLoader();
            // for mentions counting
    	this.loadedMentions = {};          // mention loaded in memory, but possibly after the viz's current time
    	this.historyMentions = {};         //
    	this.cumulativeMentions = [];      // All mentions that happened before the viz's current time and that have been processed
    	this.currentTimestamps = [];       // all timestamps before/equal to the viz's current time
        this.k = 5;
            // tree for source-time-event tracking
        this.sourceTimeEventTree = new Map();
            // Access to events storage, needed for latLong queries
        this.eventsBroker = eventsDataBroker;
            // To request redraws / masks
        this.worldmap = worldmap;
    }


    /*
    	Update mentions
     */
    updateMentions(timestamp, isForward) {
        if (isForward) {
            if ( !( (Object.keys(this.loadedMentions).includes(timestamp) && (timestamp in this.currentTimestamps)) )) {
                info("Loading mentions file " + timestamp);
                let mentions_promise = this.loader.loadMentions(timestamp);
                mentions_promise.then( (result) => {
                    this.updateMentionsForward(timestamp, result)
                    this.updateSourceTimeEventTracking(timestamp, result)
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


    updateSourceTimeEventTracking (timestamp, result=undefined) {
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


    prepare_mentions_for_sources_to_visualize(cumulativeMentions, loadedMentions, historyMentions, currentTimestamps, k, timestamp, isBackward=false) {
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

        display_source(top_history_cumulative, top_frequency_cumulative, currentTimestamps, this.showSourceEvents.bind(this))
    }


        /*  Returns the array    [eventId, lat, long]
         *  with *only* the events for which we found a Lat/long, i.e those
         *  that bave been added on the map
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
        info("Out of which", coveredEvents.length, "we were able to locate. \nEvents :\n", coveredEvents)
        return coveredEvents
    }

    showSourceEvents (sourceName) {
        let events = this.events_for_source(sourceName)
        this.worldmap.toggleMask(events)
    }
}
