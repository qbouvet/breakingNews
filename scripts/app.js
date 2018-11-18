
import {log, info, warn, err} from './utils.js';

import {whenDocumentLoaded} from './utils.js';
import {DataLoader} from './dataloader.js';
import {Worldmap} from './worldmap.js';
import {TimeManager} from './timeManager.js';

import {sleep} from './utils.js';



function main() {

    // Select main svg
    const mainSvg = d3.select("#mainSvg");

    // Data loading utilities
    const loader = new DataLoader();

    // Create Map object
    const map = new Worldmap(mainSvg, loader.loadMapOutline());

    // Outline and draw
    map.draw();

    // Init time manager that will walk over week 
    // TODO: detect end of week (undefined timestamp)
    const timeManager = new TimeManager();

    // Change file on click
    d3.select("#mainSvg")
        .on("click", () => {
            let t = timeManager.next();
            info(t);
            map.updateOverlay(loader.loadEvents(t, 1));
            map.draw();
        });
}

whenDocumentLoaded(main);

