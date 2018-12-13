
export class ControlMenu {

    constructor() {

      // D3 selections
      this.speedText = d3.select('#simulation-speed');
      this.playBtn = d3.select('#play-btn');
      this.forwardBtn = d3.select('#forward-btn');
      this.backwardBtn = d3.select('#backward-btn');

      // UI
      this.updateSpeed(0);
    }

    addPlayPauseBehavior(callback) {
      this.playBtn.on("click", () => callback());
    }

    addForwardBackwardBehavior(callback) {
      this.forwardBtn.on("click", () => callback(true));
      this.backwardBtn.on("click", () => callback(false));
    }


    addPlayPauseBehavior(callback) {

        let self = this;

        this.playBtn.on("click", () => {

            if (self.playEnabled) {

                if (self.playing) {
                    self.setPause()
                    callback(true);
                } else {
                    self.setPlay()
                    callback(false);
                }
            } else {
                // Reload call
                callback(undefined);
            }
        });
    }

    setPlay() {
        this.playBtn.style("background-image", "url('css/icons/play.svg')")
        this.playing = true;
    }

    setPause() {
        this.playBtn.style("background-image", "url('css/icons/pause.svg')")
        this.playing = false;
    }

    setReload() {
        this.playBtn.style("background-image", "url('css/icons/reload.svg')")
        this.playing = false;   // ?
    }

    setForwardEnabled(enable) {
      let icon = (enable) ? "url('css/icons/forward.svg')" : "url('css/icons/forward-disabled.svg')";
      this.forwardBtn.style("background-image", icon);
    }

    setBackwardEnabled(enable) {
      let icon = (enable) ? "url('css/icons/backward.svg')" : "css/icons/backward-disabled.svg";
      this.backwardBtn.style("background-image", icon);
    }

    updateSpeed(speed) {
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
}
