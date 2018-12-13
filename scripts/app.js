
import {log, info, warn, err} from './utils.js';
import {whenDocumentLoaded} from './utils.js';

import {sleep} from './utils.js';
import {DataLoader} from './DataLoader.js';
import {Worldmap} from './Worldmap.js';
import {TimeManager} from './TimeManager.js';
import {MentionHandler} from './MentionHandler.js';
import {Controller} from './Controller.js';
import {SelectionMenu} from './SelectionMenu.js';

async function main() {

    const MAP = new Worldmap();
    const MENTIONS_HANDLER = new MentionHandler();

    const CONTROLLER = new Controller(
      (timestamp, isForward, updateStepDuration) => MAP.updateEvents(timestamp, isForward, updateStepDuration),
      (timestamp, isForward) => MENTIONS_HANDLER.updateMentions(timestamp, isForward),
      (updateStepDuration) => MAP.reset(updateStepDuration),
      (x) => MENTIONS_HANDLER.reset());

    /* Define selection buttons behavior // FIXME: just temp example, we need to decide on data
    let categories = [1, 2, 3, 4];

    for (const c of categories) {
      let checkbox = d3.select("#c" + c);
      checkbox.on("change", () => {
          MAP.updateCategory(c, checkbox.property("checked"), 1000, 1.0); // FIXME remove hardcoded and put step duration
        });
    }
    */

}

whenDocumentLoaded(main);
