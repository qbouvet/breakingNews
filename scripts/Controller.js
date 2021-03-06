import {Clock} from './Clock.js';
import {ControlMenu} from './ControlMenu.js';
import {TimeManager} from './TimeManager.js';
import {log, info, warn, err} from './utils.js'

/* 
    It handles all the different classes which make up all the logic,
    i.e world map, mention handler
*/
export class Controller {

    constructor(updateZoomCallback, mapUpdateCallback, mentionsUpdateCallback, mapResetCallback, mentionsResetCallback) {
        // Init callbacks
        this.mapUpdate = mapUpdateCallback;
        this.mentionsUpdate = mentionsUpdateCallback;
        this.mapReset = mapResetCallback;
        this.mentionsReset = mentionsResetCallback;

        // Init components
        this.TIME_MANAGER = new TimeManager();
        this.CLOCK = new Clock(this.TIME_MANAGER.INIT_DATE);
        this.CONTROLS = new ControlMenu(updateZoomCallback);

        // Speed components
        this.UPDATE_INTERVAL = 2000;
        this.speedScale = d3.scaleLinear()
        .domain([-2.0, 2.0])
        .range([-2.0, 2.0])
        .clamp(true);

        // Init state machine
        this.interval = 0;
        this.currentState = 'start';
        this.nextState('start');

        // Init UI behavior
        this.CONTROLS.addPlayPauseBehavior(() => this.onPlayPause());
        this.CONTROLS.addForwardBackwardBehavior((forward) => this.onForwardBackward(forward));
        this.CONTROLS.addCollapseBehavior();
        this.CONTROLS.addInfoBehavior();
    }

    nextState(state) {

        clearInterval(this.interval);
        this.currentState = state;

        switch (state) {
            case 'start': {
                this.startState();
                break;
            }

            case 'play': {
                this.playState();
                break;
            }

            case 'pause': {
                this.pauseState();
                break;
            }

            case 'end': {
                this.endState();
                break;
            }

        default:
            err("Should never get here");
        }
    }

    startState() {
        // Current time initialized at -1 to start from time 0 with first update
        this.currentTime = -1;
        this.speed = 1.0;

        this.CONTROLS.updateSpeed(this.speed);
        this.CONTROLS.setForwardEnabled(true);
        this.CONTROLS.setBackwardEnabled(false);
        this.CONTROLS.setPlay();
        this.CLOCK.update(this.TIME_MANAGER.INIT_DATE);
    }

    playState() {

        this.CONTROLS.collapseInfo();
        // Max speedup is x2 
        this.CONTROLS.setBackwardEnabled(!(this.speed === -2));
        this.CONTROLS.setForwardEnabled(!(this.speed === 2));
        this.CONTROLS.setPause();

        let intervalLength = this.UPDATE_INTERVAL / Math.abs(this.speed);
        // Play 00:00 immediatelly, step requires an argument
        this.step(undefined);
        this.interval = setInterval((elapsed) => this.step(elapsed), intervalLength);
    }

    pauseState() {
        // Max speedup is x2
        this.CONTROLS.setBackwardEnabled(!(this.speed === -2));
        this.CONTROLS.setForwardEnabled(!(this.speed === 2));
        this.CONTROLS.setPlay();
    }

    endState() {

        this.CONTROLS.setForwardEnabled(false);
        this.CONTROLS.setBackwardEnabled(false);
        this.CONTROLS.setReload();
    }

    onPlayPause() {

        // Take appropriate action
        switch(this.currentState) {

            case 'start': {
                this.nextState('play');
                break;
            }

            case 'play': {
                this.nextState('pause');
                break;
            }

            case 'pause': {
                this.nextState('play');
                break;
            }

            case 'end': {
                this.mapReset(this.UPDATE_INTERVAL / Math.abs(this.speed))
                this.mentionsReset();
                this.nextState('start');
                break;
            }

            default:
                err("Should never get here");
        }
    }

    onForwardBackward(forward) {

        let updateSpeed = (up) => {

            let speedUpdate = (up) ? this.speed + 1 : this.speed - 1;

            // Skip zero
            if (speedUpdate === 0) {
                speedUpdate = (up) ? 1 : -1;
            }

            this.speed = this.speedScale(speedUpdate);
            this.CONTROLS.updateSpeed(this.speed);
            // Max Speed up is x2
            this.CONTROLS.setBackwardEnabled(!(this.speed === -2));
            this.CONTROLS.setForwardEnabled(!(this.speed === 2));
        }

        switch(this.currentState) {

            case 'start': {
                if (forward) {
                    updateSpeed(forward);
                } else if (!forward & this.speed != 1) {
                    updateSpeed(forward);
                    this.CONTROLS.setBackwardEnabled(false);
                }
                break;
            }

            case 'play': {
                updateSpeed(forward);
                this.nextState('play');
                break;
            }

            case 'pause': {
                updateSpeed(forward);
                break;
            }

            default:
        }

    }

    step(elapsed) {
        // Update current value
        this.currentTime = (this.speed > 0) ? this.currentTime + 1 : this.currentTime - 1;

        if (this.currentTime > this.TIME_MANAGER.NUM_UPDATES) {

            this.nextState('end');

        } else if (this.currentTime < 0) {

            this.mapReset(this.UPDATE_INTERVAL / Math.abs(this.speed))
            this.mentionsReset();
            this.nextState('start');

        } else {
            // Get new date
            let updateDate = this.TIME_MANAGER.getUpdateDate(this.currentTime);

            // Update viz accordingly
            this.CLOCK.update(updateDate);
            this.mapUpdate(TimeManager.dateToTimestamp(updateDate), this.speed > 0, this.UPDATE_INTERVAL / Math.abs(this.speed));
            this.mentionsUpdate(TimeManager.dateToTimestamp(updateDate), this.speed > 0)
        }
    }
}