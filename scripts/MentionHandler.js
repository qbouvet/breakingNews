import {log, info, warn, err} from './utils.js'
import {DataLoader} from './DataLoader.js';
import {make_bar_chart, display_source} from './displaySources.js'

function count_mentions(mentions) {
	
	var counts = {}
	info("counting")
	mentions.reduce(function (acc, curr) {
		acc[curr['MentionSourceName']] ? acc[curr['MentionSourceName']]++ : acc[curr['MentionSourceName']] = 1;
		return acc;},
	counts);

	var mapCounts = new Map(Object.entries(counts))
	const mapSort1 = new Map([...mapCounts.entries()].sort((a, b) => {
		return b[1] - a[1] }
      ));

	return mapSort1
}

function make_history(mentions, historyMentions, currentTimestamps) {

	let timestamps = Array.from(currentTimestamps)
	let current = timestamps[timestamps.length-1]

	mentions.forEach(
		(value, mention) => {
			if (mention in historyMentions) {
				historyMentions[mention].push([value, current])
			} else {
				historyMentions[mention] = [[value, current]]
			}
	})

	return historyMentions
}

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

export class MentionHandler {

    // Initializes path variables
    constructor() {
    	this.loader = new DataLoader();
    	this.loadedMentions = {};
    	this.counterMentions = {};
    	this.historyMentions = {};
    	this.cumulativeMentions = [];
    	this.currentTimestamps = new Set();
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

      if (Object.keys(this.loadedMentions).includes(timestamp)) {

        info("Loading from events " + timestamp);

        // Update flatEvents with already loaded data
        this.cumulativeMentions = this.cumulativeMentions.concat(this.loadedMentions[timestamp]);
      } else {

        info("Loading from file " + timestamp);

        // Load data
        let mentions_promise = this.loader.loadMentions(timestamp);

        // Make sure outline already resolved
        mentions_promise.then((result) => {

          // Update mentions
          this.currentTimestamps.add(timestamp);
          this.loadedMentions[timestamp] = result;
          this.cumulativeMentions = this.cumulativeMentions.concat(result);

          var source_cumulative_frequency = count_mentions(this.cumulativeMentions);
          var source_frequency = count_mentions(result);

		  this.historyMentions = make_history(source_frequency, this.historyMentions, this.currentTimestamps)

          var bars_cumulative = new Map(Array.from(source_cumulative_frequency).slice(0,5));
          var bars = new Map(Array.from(source_frequency).slice(0,5));

          var top_history_cumulative = take_top_history(bars_cumulative, this.historyMentions)
          var top_history = take_top_history(bars, this.historyMentions)

          display_source(top_history_cumulative)

        });
      }
    }

    updateMentionsBackward(timestamp) {

      // Remove timestamp from current ones
      info("Removing from current " + timestamp);
      this.currentTimestamps.delete(timestamp);

      // Rebuild flatEvents
      this.flatEvents = [];
      for (const timestamp in this.currentTimestamps) {
            this.flatEvents = this.flatEvents.concat(this.loadedMentions[timestamp]);
      }
    }
	
}