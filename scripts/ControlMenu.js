
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

    addForwardBackwardBehavior(callback) {
      this.forwardBtn.on("click", () => callback(true));
      this.backwardBtn.on("click", () => callback(false));
    }

    addPlayPauseBehavior(callback) {
        this.playBtn.on("click", () => callback());
    }

    setPlay() {
        this.playBtn.style("background-image", "url('css/icons/play.svg')")
    }

    setPause() {
        this.playBtn.style("background-image", "url('css/icons/pause.svg')")
    }

    setReload() {
        this.playBtn.style("background-image", "url('css/icons/reload.svg')")
    }

    setForwardEnabled(enable) {
      let icon = (enable) ? "url('css/icons/forward.svg')" : "url('css/icons/forward-disabled.svg')";
      this.forwardBtn.style("background-image", icon);
    }

    setBackwardEnabled(enable) {
      let icon = (enable) ? "url('css/icons/backward.svg')" : "url('css/icons/backward-disabled.svg')";
      this.backwardBtn.style("background-image", icon);
    }

    updateSpeed(speed) {
      this.speedText
        .text(speed + "x")
        .attr("font-size", "10");
    }

    collapseInfo() {
      let sidebardiv = document.querySelector("#sidebardiv");
      let infodiv = document.querySelector("#informationdiv");
      sidebardiv.style.display = "block";
      infodiv.style.display = "none";
    }

    addInfoBehavior() {
      document.querySelector("#btn-info").addEventListener("click", () => {
          console.log("ahiiooooo")
          let sidebardiv = document.querySelector("#sidebardiv");
          let infodiv = document.querySelector("#informationdiv");
          let display = infodiv.style.display;
          sidebardiv.style.display = (display === "block") ? "block" : "none";
          infodiv.style.display = (display === "block") ? "none" : "block";
      });
    }

    addCollapseBehavior() {
      document.querySelector("#btn-maximize").addEventListener("click", () => {
          const settingsdiv = document.querySelector("#settingsdiv")
          const display = settingsdiv.style.display
          settingsdiv.style.display = (display === "none") ? "block" : "none";
      });
    }
}
