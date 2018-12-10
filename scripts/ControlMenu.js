
export class ControlMenu {

    constructor(initSpeed) {

      // D3 selections
      this.parentSvg = d3.select("#mainSvg");

      this.controlMenu = d3.select('#control-menu');
      this.selectionMenu = d3.select('#selection-menu');
      this.speedText = d3.select('#simulation-speed');

      this.playBtn = d3.select('#play-btn');
      this.forwardBtn = d3.select('#forward-btn');
      this.backwardBtn = d3.select('#backward-btn');
      this.resetBtn = d3.select('#refresh-btn');

      // UI
      this.updateSpeedText(initSpeed);

      // State
      this.playing = false;
      this.forwardEnabled = true;
      this.backwardEnabled = true;
      this.playEnabled = true;
    }

    updateSpeedText(speed) {
      this.speedText
        .text(speed + "x")
        .attr("font-size", "10");
    }

    addCollapseBehavior() {
      document.querySelector("#btn-maximize").addEventListener("click", () => {
          const settingsdiv = document.querySelector("#settingsdiv")
          const display = settingsdiv.style.display
          settingsdiv.style.display = (display === "none") ? "block" : "none";
      });
    }

    addPlayPauseBehavior(callback) {

      let self = this;

      this.playBtn.on("click", () => {

        if (self.playEnabled) {

          if (self.playing) {
            self.playBtn.attr("xlink:href", "../css/icons/play.svg");
            self.playing = false;
            callback(true);
          } else {
            self.playBtn.attr("xlink:href", "../css/icons/pause.svg");
            self.playing = true;
            callback(false);
          }
        } else {
          // Reload call
          callback(undefined);
        }
      });
    }

    enablePlay(enable) {
      this.playEnabled = enable;
      let icon = (enable) ? "../css/icons/play.svg" : "../css/icons/reload.svg";
      this.playBtn.attr("xlink:href", icon);
    }

    //FIXME: add end of day behavior

    addForwardBackwardBehavior(callback) {

      this.forwardBtn.on("click", () => {
        if (this.forwardEnabled) {
          callback(true);
        }
      });

      this.backwardBtn.on("click", () => {
        if (this.backwardEnabled) {
          callback(false);
        }
      });
    }

    enableForward(enable) {
      this.forwardEnabled = enable;
      let icon = (enable) ? "../css/icons/forward.svg" : "../css/icons/forward-disabled.svg";
      this.forwardBtn.attr("xlink:href", icon);
    }

    enableBackward(enable) {
      this.backwardEnabled = enable;
      let icon = (enable) ? "../css/icons/backward.svg" : "../css/icons/backward-disabled.svg";
      this.backwardBtn.attr("xlink:href", icon);
    }
}
