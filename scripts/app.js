
import {log, info, warn, err} from './utils.js';
import {whenDocumentLoaded} from './utils.js';

import {DataLoader} from './DataLoader.js';
import {Worldmap} from './Worldmap.js';
import {TimeManager} from './TimeManager.js';
import {Slider} from './Slider.js'

function main() {

    // Select svgs
    const mainSvg = d3.select("#mainSvg");
    const sliderSvg = d3.select("#playSvg");

    // Data loading utilities
    const loader = new DataLoader();

    // Create Map object
    const map = new Worldmap(mainSvg, loader.loadMapOutline());

    // Init time manager that will generate timestamps and dates
    const timeManager = new TimeManager();

    // Create Slider object and callback for date change
    let timeUpdateCallback = (sliderTime) => {

      // Translate slider value into update timestamp
      let date = timeManager.getUpdateDate(sliderTime);
      let timestamp = timeManager.dateToTimestamp(date);

      // Update clock
      slider.updateClock(date);

      // Load data
      info("Loading timestamp " + timestamp);
      map.updateOverlay(loader.loadEvents(timestamp, 1));
    };

    // Define slider
    const slider = new Slider(sliderSvg, timeManager.NUM_UPDATES, timeUpdateCallback);
}

whenDocumentLoaded(main);
