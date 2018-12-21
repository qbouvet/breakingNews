
import {log, info, warn, err} from './utils.js'
import {SortedArray} from './utils.js'


/*
    This class manages the timeflow over the week covered by the dataset, returning incremental timestamps
 */
export class TimeManager {

    constructor() {

        this.msPerUpdate = 15*60000;

        // Initial date of our dataset
        this.INIT_DATE = new Date(2018, 10, 5, 0, 0);
        this.END_DATE = new Date(2018, 10, 5, 23, 45);

        // Init number of updates
        this.NUM_UPDATES = (this.END_DATE - this.INIT_DATE)/this.msPerUpdate;

        this.allTimestamps = new SortedArray([], true);
        for (let i=0; i<this.NUM_UPDATES; i++){
            const clk = this.getUpdateDate(i)
            const tsp = this.dateToTimestamp(clk)
            this.allTimestamps.insert(tsp)
        }
    }

    getUpdateDate(clockValue) {
      return new Date(this.INIT_DATE.getTime() + this.msPerUpdate*clockValue);
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

    static timestampToDate (timestamp) {
        timestamp = timestamp.toString()
        const year = timestamp.slice(0,4)
        const month = timestamp.slice(4,6)
        const day =  timestamp.slice(6,8)
        const hour =  timestamp.slice(8,10)
        const min =  timestamp.slice(10,12)
        const sec = timestamp.slice(12,14)
        info ("timestamp conversion : ", year+"-"+month+"-"+day+"T"+hour+":"+min+":"+sec)
        return new Date(year+"-"+month+"-"+day+"T"+hour+":"+min+":"+sec)
    }

    nextTimestamp (timestamp) {
        if (this.allTimestamps.contains(timestamp)){
            const index = this.allTimestamps.search(timestamp)
            if (index < 0) {
                err ("TimeManager : timestamp not found : ", timestamp)
                return
            } else if (index == this.allTimestamps.size()) {
                warn ("TimeManager : timestamp has no next (is last) : ", timestamp)
                return
            }
            return this.allTimestamps.get(index+1);
        } else {
            err ("TimeManager : not a valid timestamp : ", timestamp)
            return
        }
    }

    prevTimestamp (timestamp) {
        if (this.allTimestamps.contains(timestamp)){
            const index = this.allTimestamps.search(timestamp)
            if (index < 0) {
                err ("TimeManager : timestamp not found : ", timestamp)
                return
            } else if (index == 0) {
                warn ("TimeManager : timestamp has no previous (is first) : ", timestamp)
                return
            }
            return this.allTimestamps.get(index-1);
        } else {
            err ("TimeManager : not a valid timestamp : ", timestamp)
            return
        }
    }


}
