import {Clock} from './Clock.js';
import {ControlMenu} from './ControlMenu.js';
import {TimeManager} from './TimeManager.js';

export class Controller {

  // TODO: implement reset behavior for mentions
  constructor(mapUpdateCallback, mentionsUpdateCallback, mapResetCallback, mentionsResetCallback) {

      // Init callbacks
      this.mapUpdate = mapUpdateCallback;
      this.mentionsUpdate = mentionsUpdateCallback;
      this.mapReset = mapResetCallback;
      this.mentionsReset = mentionsResetCallback;

      // Init State
      this.playing = false;
      this.interval = 0;
      this.currentTime = 0;
      this.speedIndex = 5;
      this.UPDATE_INTERVAL = 2000;
      this.endOfDay = false;

      // Speed scale
      this.speedArray = [-4.0, -2.0, -1.0, -0.5, 0.5, 1.0, 2.0, 4.0];
      this.speedIndexScale = d3.scaleLinear()
        .domain([0, 7])
        .range([0, 7])
        .clamp(true);

      // Time manager
      this.TIME_MANAGER = new TimeManager();

      // UI parts
      this.CLOCK = new Clock(this.TIME_MANAGER.INIT_DATE);
      this.CONTROLS = new ControlMenu(this.speedArray[this.speedIndex]);

      // Init UI behavior
      this.CONTROLS.addPlayPauseBehavior((play) => this.onPlayPause(play));
      this.CONTROLS.addForwardBackwardBehavior((forward) => this.onForwardBackward(forward));
      this.CONTROLS.addCollapseBehavior();
  }

  reset() {

    this.speedIndex = 5;
    this.CONTROLS.updateSpeedText(this.speedArray[this.speedIndex]);

    this.currentTime = 0;

    this.mapReset(this.UPDATE_INTERVAL / Math.abs(this.speedArray[this.speedIndex]));
    //this.mentionsReset();

    this.CONTROLS.enablePlay(true);
    this.CONTROLS.enableForward(true);
    this.CONTROLS.enableBackward(true);
    this.CLOCK.update(this.TIME_MANAGER.INIT_DATE);

    this.endOfDay = false;
  }

  onPlayPause(play) {

    if (this.endOfDay) {
      this.reset();
    } else {

      if (this.playing) {
        this.playing = false;
        clearInterval(this.interval);
      } else {
        this.playing = true;
        let intervalLength = this.UPDATE_INTERVAL / Math.abs(this.speedArray[this.speedIndex]);
        this.interval = setInterval((elapsed) => this.step(elapsed), intervalLength);
      }
    }
  }

  step(elapsed) {

    // Update current value
    this.currentTime = (this.speedArray[this.speedIndex] > 0) ? this.currentTime + 1 : this.currentTime - 1; // FIXME add backward logic

    // Disable button if MAX_VALUE, or re-enable it FIXME: restart?
    if (this.currentTime >= 10) {//this.TIME_MANAGER.NUM_UPDATES) {

      this.playing = false;
      this.endOfDay = true;
      clearInterval(this.interval);

      this.CONTROLS.enablePlay(false);
      this.CONTROLS.enableForward(false);
      this.CONTROLS.enableBackward(false);
    }

    // Get new date
    let updateDate = this.TIME_MANAGER.getUpdateDate(this.currentTime);

    // Update viz accordingly
    this.CLOCK.update(updateDate);
    this.mapUpdate(this.TIME_MANAGER.dateToTimestamp(updateDate), this.speedArray[this.speedIndex] > 0, this.UPDATE_INTERVAL / Math.abs(this.speedArray[this.speedIndex]));
    //MENTIONS_HANDLER.updateMentions(TIME_MANAGER.dateToTimestamp(updateDate), isForward);
  }

  onForwardBackward(forward) {

    if (!this.endOfDay) {

      let speedUpdate = (forward) ? this.speedIndex + 1 : this.speedIndex - 1;
      this.speedIndex = this.speedIndexScale(speedUpdate);
      this.CONTROLS.updateSpeedText(this.speedArray[this.speedIndex]);

      if (this.playing) {
        clearInterval(this.interval);
        let intervalLength = this.UPDATE_INTERVAL / Math.abs(this.speedArray[this.speedIndex]);
        this.interval = setInterval((elapsed) => this.step(elapsed), intervalLength);
      }

      // Disable/enable buttons if necessary
      (this.speedIndex === 0) ? this.CONTROLS.enableBackward(false) : this.CONTROLS.enableBackward(true);
      (this.speedIndex === (this.speedArray.length - 1)) ? this.CONTROLS.enableForward(false) : this.CONTROLS.enableForward(true);
    }
  }

}
