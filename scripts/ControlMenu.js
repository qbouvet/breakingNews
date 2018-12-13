
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

    setPlay() {
      this.playBtn.attr("xlink:href", "../css/icons/play.svg");
    }

    setPause() {
      this.playBtn.attr("xlink:href", "../css/icons/pause.svg");
    }

    setReload() {
      this.playBtn.attr("xlink:href", "../css/icons/reload.svg");
    }

    setForwardEnabled(enable) {
      let icon = (enable) ? "../css/icons/forward.svg" : "../css/icons/forward-disabled.svg";
      this.forwardBtn.attr("xlink:href", icon);
    }

    setBackwardEnabled(enable) {
      let icon = (enable) ? "../css/icons/backward.svg" : "../css/icons/backward-disabled.svg";
      this.backwardBtn.attr("xlink:href", icon);
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
