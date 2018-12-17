import {log, info, warn, err} from './utils.js'
import {DataLoader} from './DataLoader.js';
import {display_source, clean_sources} from './displaySources.js'


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

function make_history(mentions, historyMentions, currentTimestamps) {

	let timestamps = Array.from(currentTimestamps)
	var current = timestamps[timestamps.length-1]

	console.log("history mentions: ", historyMentions)
	console.log("current: ", current)

	mentions.forEach(
		(value, mention) => {

			if (mention in historyMentions) {
				historyMentions[mention].set(current, value)
			} else {
				historyMentions[mention] = new Map([[current, value]])
			}
	})

	return historyMentions
}
// function make_history(mentions, historyMentions, currentTimestamps) {

// 	let timestamps = Array.from(currentTimestamps)
// 	let current = timestamps[timestamps.length-1]

// 	mentions.forEach(
// 		(value, mention) => {
// 			if (mention in historyMentions) {
// 				historyMentions[mention].push([value, current])
// 			} else {
// 				historyMentions[mention] = [[value, current]]
// 			}
// 	})

// 	return historyMentions
// }

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
  return sortHistory(top_history)
}

function prepare_mentions_for_sources_to_visualize(cumulativeMentions, loadedMentions, historyMentions, currentTimestamps, k, timestamp, isBackward=false) {
  let source_cumulative_frequency = count_mentions(cumulativeMentions);
  let source_frequency = count_mentions(loadedMentions[timestamp]);

  historyMentions = make_history(source_frequency, historyMentions, currentTimestamps)

  var top_frequency_cumulative = new Map(Array.from(source_cumulative_frequency).slice(0, k));
  var top_history_cumulative = take_top_history(top_frequency_cumulative, historyMentions)

  top_history_cumulative = add_timestamps_to_top_history_map(top_history_cumulative, currentTimestamps)

  if (isBackward) {
    top_history_cumulative = take_top_history_up_to_current_timestamp(top_history_cumulative, currentTimestamps)
  }

  display_source(top_history_cumulative, top_frequency_cumulative, currentTimestamps)
}

export class MentionHandler {

    // Initializes path variables
    constructor() {
    	this.loader = new DataLoader();
    	this.loadedMentions = {};
    	this.historyMentions = {};
    	this.cumulativeMentions = [];
    	this.currentTimestamps = [];
      this.k = 5;
    }

    /*
    	Update mentions
     */
    updateMentions(timestamp, isForward) {

      if (isForward) {
        this.updateMentionsForward(timestamp);
      } else {
        this.updateMentionsBackward(timestamp);
      }
    }

    updateMentionsForward(timestamp) {

      if (Object.keys(this.loadedMentions).includes(timestamp) && (timestamp in this.currentTimestamps)) {

        info("Loading from events " + timestamp);

        // Update flatEvents with already loaded data
        this.cumulativeMentions = this.cumulativeMentions.concat(this.loadedMentions[timestamp]);
        console.log("outside")
      } else {

        info("Loading from file " + timestamp);

        // Load data
        let mentions_promise = this.loader.loadMentions(timestamp);

        // Make sure outline already resolved
        mentions_promise.then((result) => {

          // Update mentions
          console.log("inside")
          this.currentTimestamps.push(timestamp);
          this.loadedMentions[timestamp] = result;
          this.cumulativeMentions = this.cumulativeMentions.concat(result);
          prepare_mentions_for_sources_to_visualize(this.cumulativeMentions, this.loadedMentions, this.historyMentions, this.currentTimestamps, this.k, timestamp)

        });
      }
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

        prepare_mentions_for_sources_to_visualize(this.cumulativeMentions, this.loadedMentions, this.historyMentions, this.currentTimestamps, this.k, timestamp, true)

      } else {
        clean_sources(true)
      }
    }

    reset() {
      this.currentTimestamps = [];
      this.cumulativeMentions = [];
      clean_sources(true)
    }
	
}