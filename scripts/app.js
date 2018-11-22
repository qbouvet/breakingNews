
import {log, info, warn, err} from './utils.js';

import {whenDocumentLoaded} from './utils.js';
import {DataLoader} from './dataLoader.js';
import {Worldmap} from './worldmap.js';
import {TimeManager} from './timeManager.js';
import {DateSlider} from './dateSlider.js'

import {sleep} from './utils.js';

function main() {

    // Select svgs
    const mainSvg = d3.select("#mainSvg");
    const sliderSvg = d3.select("#playSvg");

    // Data loading utilities
    const loader = new DataLoader();

    // Create Map object
    const map = new Worldmap(mainSvg, loader.loadMapOutline());

    // Create DateSlider object
    const slider = new DateSlider(sliderSvg);

    // Init time manager that will walk over week
    // TODO: detect end of week (undefined timestamp)
    const timeManager = new TimeManager();

    // Change file on click
    d3.select("#mainSvg")
        .on("click", () => {
            let t = timeManager.next();
            info(t);
            map.updateOverlay(loader.loadEvents(t, 1));
        });
}

whenDocumentLoaded(main);
