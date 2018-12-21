
import {log, info, warn, err} from './utils.js';
import {whenDocumentLoaded} from './utils.js';
import {sleep} from './utils.js';
import {SortedArray} from './utils.js'
import {MapOrElse} from './utils.js'

import {DataLoader} from './DataLoader.js';
import {Worldmap} from './Worldmap.js';
import {TimeManager} from './TimeManager.js';
import {MentionHandler} from './MentionHandler.js';
import {Controller} from './Controller.js';
import {SelectionMenu} from './SelectionMenu.js';
import {EventsDataBroker} from "./EventsDataBroker.js";
import {InfoPanel} from "./InfoPanelSelections.js";

async function main() {

    const EVENTSBROKER = new EventsDataBroker(new DataLoader());

    const INFO_PANEL = new InfoPanel();
    const MAP = new Worldmap(EVENTSBROKER);
    const MENTIONS_HANDLER = new MentionHandler(EVENTSBROKER, MAP);

    const CONTROLLER = new Controller(
      (timestamp, isForward, updateStepDuration) => MAP.updateEvents(timestamp, isForward, updateStepDuration),
      (timestamp, isForward) => MENTIONS_HANDLER.update(timestamp, isForward),
      (updateStepDuration) => MAP.reset(updateStepDuration),
      (x) => MENTIONS_HANDLER.reset());

}

let xScale = d3.scaleTime()
    .domain([ TimeManager.timestampToDate("20181115000000"),
              TimeManager.timestampToDate("20181115010000") ]) // input
    .rangeRound([0, 100]); // output
err (TimeManager.timestampToDate("20181115000000"))


whenDocumentLoaded(main);
