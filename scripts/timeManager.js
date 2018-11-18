
import {log, info, warn, err} from './utils.js'


/*
    This class manages the timeflow over the week covered by the dataset, returning incremental timestamps
 */
export class TimeManager {

    constructor() {

        // Initial date of our dataset
        this.INIT_DATE = new Date(2018, 10, 5, 0, 0);
        this.END_DATE = new Date(2018, 10, 12, 0, 0);
        this.time = this.INIT_DATE;
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

    next() {

        // Data set is over
        if (this.time.getTime() === this.END_DATE.getTime()) {
            return undefined;
        }

        // Get timestamp of current time
        let toReturn = this.dateToTimestamp(this.time);

        // Increment time by 15 minutes
        this.time = new Date(this.time.getTime() + 15*60000);

        return toReturn;
    }
}
