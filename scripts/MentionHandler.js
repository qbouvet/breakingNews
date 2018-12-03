import {log, info, warn, err} from './utils.js'
import {DataLoader} from './DataLoader.js';
import {make_bar_chart} from './displaySources.js'

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

export class MentionHandler {

    // Initializes path variables
    constructor() {
    	this.loader = new DataLoader();
    	this.loadedMentions = {};
    	this.counterMentions = {};
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

          // Update event data and redraw it
          this.currentTimestamps.add(timestamp);
          this.loadedMentions[timestamp] = result;
          this.cumulativeMentions = this.cumulativeMentions.concat(result);

          var source_cumulative_frequency = count_mentions(this.cumulativeMentions);
          var source_frequency = count_mentions(result);
          info(source_cumulative_frequency)
          info(source_frequency)
          var bars_cumulative = new Map(Array.from(source_cumulative_frequency).slice(0,5));
          var bars = new Map(Array.from(source_frequency).slice(0,5));

          info(bars)
          // info(bars_cumulative)

          make_bar_chart(bars.values())

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