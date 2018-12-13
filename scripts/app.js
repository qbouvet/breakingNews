
import {log, info, warn, err} from './utils.js';
import {whenDocumentLoaded} from './utils.js';
import {sleep} from './utils.js';
import {SortedArray} from './utils.js'

import {DataLoader} from './DataLoader.js';
import {Worldmap} from './Worldmap.js';
import {TimeManager} from './TimeManager.js';
import {MentionHandler} from './MentionHandler.js';
import {Controller} from './Controller.js';
import {SelectionMenu} from './SelectionMenu.js';
import {EventsDataBroker} from "./EventsDataBroker.js";

async function main() {

    const eventsBroker = new EventsDataBroker(new DataLoader());

    const MAP = new Worldmap(eventsBroker);
    const MENTIONS_HANDLER = new MentionHandler(eventsBroker);

    const CONTROLLER = new Controller(
      (timestamp, isForward, updateStepDuration) => MAP.updateEvents(timestamp, isForward, updateStepDuration),
      (timestamp, isForward) => MENTIONS_HANDLER.updateMentions(timestamp, isForward),
      (updateStepDuration) => MAP.reset(updateStepDuration),
      (x) => MENTIONS_HANDLER.reset());

}

whenDocumentLoaded(main);
