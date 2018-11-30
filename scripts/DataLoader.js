
import {log, info, warn, err} from './utils.js'

/*  Use this class to get the paths to data files. If project directory structure changes, this is the only place to modify.
 *  !!! This is not exported (yet) (only DataLoader is) !!!
 */
class DataPaths {

    // Initializes path variables
    constructor() {

        // Folders
        this.DATA_FOLDER = 'data/';
        this.MAP_FOLDER = 'geojson/';
        this.GDELT_FOLDER = 'gdelt/';

        // Gdelt folders
        this.EVENTS = 'events/';
        this.MENTIONS = 'mentions/';

        // Files
        this.WORLDMAP = 'world-nofiji-nohawaii';

        // Others
        this.JSON = '.json';
    }

    // Return path to geojson
    mapOutline() {
        return this.DATA_FOLDER + this.MAP_FOLDER + this.WORLDMAP + this.JSON;
    }

    // Return path to an event update file
    eventUpdate(timestamp) {
        return this.DATA_FOLDER + this.GDELT_FOLDER + this.EVENTS + timestamp + this.JSON;
    }

    // Return path to a mention update file
    mentionUpdate(timestamp) {
        return this.DATA_FOLDER + this.GDELT_FOLDER + this.MENTIONS + timestamp + this.JSON;
    }
}


/*
    This class loads the json files containing data and returns promises with the data
 */
export class DataLoader {

    constructor() {
        this.dataPaths = new DataPaths();
    }

    // Load outline data and return it wrapped in promise
    loadMapOutline() {
        return this.load(this.dataPaths.mapOutline());
    }

    loadEvents(timestamp) {
        return this.load(this.dataPaths.eventUpdate(timestamp));
    }

    loadMentions(timestamp) {
        return this.load(this.dataPaths.mentionUpdate(timestamp));
    }

    load(path) {
        return new Promise(function(resolve, reject) {
            d3.json(path, function(error, data) {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
}
