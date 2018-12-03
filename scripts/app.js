
import {log, info, warn, err} from './utils.js';
import {whenDocumentLoaded} from './utils.js';

import {sleep} from './utils.js';
import {DataLoader} from './DataLoader.js';
import {Worldmap} from './Worldmap.js';
import {TimeManager} from './TimeManager.js';
import {MentionHandler} from './MentionHandler.js';
import {Slider} from './Slider.js';

async function main() {

    // Select svgs
    const mainSvg = d3.select("#mainSvg");
    const sliderSvg = d3.select("#svg-timeslider");

    // Create Map object
    const map = new Worldmap(mainSvg);

    // Init time manager that will generate timestamps and dates
    const timeManager = new TimeManager();

    // Init mentions handler, in order to manage the sources evolution over time
    const mentionHandler = new MentionHandler();

    // Create Slider object and callback for date change
    let timeUpdateCallback = (sliderTime, oldTime) => {

      // Detect direction of change
      let isForward = (sliderTime > oldTime);

      // Get ordered update list from TimeManager
      let dateList = timeManager.getSortedUpdateDateList(oldTime, sliderTime);

      // Update map accordingly
      dateList.forEach((d) => {
        slider.updateClock(d);
        map.updateEvents(timeManager.dateToTimestamp(d), isForward);
        mentionHandler.updateMentions(timeManager.dateToTimestamp(d), isForward);
      });
    }

    // Define slider
    const slider = new Slider(sliderSvg, timeManager.NUM_UPDATES, timeUpdateCallback);

    // Define selection buttons behavior // FIXME: just temp example, we need to decide on data
    let categories = [1, 2, 3, 4];

    for (const c of categories) {
      let checkbox = d3.select("#c" + c);
      checkbox.on("change", () => {
          map.updateCategory(c, checkbox.property("checked"));
        });
    }

}

whenDocumentLoaded(main);
