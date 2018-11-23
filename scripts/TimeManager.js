
import {log, info, warn, err} from './utils.js'


/*
    This class manages the timeflow over the week covered by the dataset, returning incremental timestamps
 */
export class TimeManager {

    constructor() {

        this.msPerUpdate = 15*60000;

        // Initial date of our dataset
        this.INIT_DATE = new Date(2018, 10, 5, 0, 0);
        this.END_DATE = new Date(2018, 10, 12, 0, 0);

        // Init number of updates
        this.NUM_UPDATES = (this.END_DATE - this.INIT_DATE)/this.msPerUpdate;
    }

    getUpdateDate(sliderValue) {
      return new Date(this.INIT_DATE.getTime() + this.msPerUpdate*sliderValue);
    }

    dateToTimestamp(date) {

        // Transform to string with leading zeros
        let pad = (num, size) => {
            let s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        };

        return date.getFullYear() + pad(date.getMonth() + 1, 2) +
            pad(date.getDate(), 2) + pad(date.getHours(), 2) +
            pad(date.getMinutes(), 2) + "00";
    }
}
