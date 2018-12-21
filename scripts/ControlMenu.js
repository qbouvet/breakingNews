
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

      let forwardBtn = this.forwardBtn;
      let backwardBtn = this.backwardBtn;

      let disabled = (forward) => {
        let oldIcon = forward ? forwardBtn.style("background-image") : backwardBtn.style("background-image");
        return oldIcon.includes("disabled");
      };

      forwardBtn.on("mouseover", () => {
        if (!disabled(true)) forwardBtn.style("background-image", "url('css/icons/forward-highlighted.svg')")
      }).on("mouseout", () => {
        if (!disabled(true)) forwardBtn.style("background-image", "url('css/icons/forward.svg')")
      }).on("mousedown", () => {
        if (!disabled(true)) forwardBtn.style("background-image", "url('css/icons/forward-darker.svg')")
      }).on("mouseup", () => {
        if (!disabled(true)) forwardBtn.style("background-image", "url('css/icons/forward.svg')")
      });

      backwardBtn.on("mouseover", () => {
        if (!disabled(false)) backwardBtn.style("background-image", "url('css/icons/backward-highlighted.svg')")
      }).on("mouseout", () => {
        if (!disabled(false)) backwardBtn.style("background-image", "url('css/icons/backward.svg')")
      }).on("mousedown", () => {
        if (!disabled(false)) backwardBtn.style("background-image", "url('css/icons/backward-darker.svg')")
      }).on("mouseup", () => {
        if (!disabled(false)) backwardBtn.style("background-image", "url('css/icons/backward.svg')")
      });

    }

    addPlayPauseBehavior(callback) {
        this.playBtn.on("click", () => callback());

        let playBtn = this.playBtn;
        let old = () => {
          let oldIcon = playBtn.style("background-image");
          return (oldIcon.includes("play")) ? "play" : (oldIcon.includes("pause")) ? "pause" : "reload";
        };

        playBtn.on("mouseover", () => {
          playBtn.style("background-image", "url('css/icons/" + old() + "-highlighted.svg')")
        }).on("mouseout", () => {
          playBtn.style("background-image", "url('css/icons/" + old() + ".svg')")
        }).on("mousedown", () => {
          playBtn.style("background-image", "url('css/icons/" + old() + "-darker.svg')")
        }).on("mouseup", () => {
          playBtn.style("background-image", "url('css/icons/" + old() + ".svg')")
        });
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

      let infoBtn = d3.select('#btn-info');
      infoBtn.on("mouseover", () => {
        infoBtn.style("background-image", "url('css/icons/info-highlighted.png')")
      }).on("mouseout", () => {
        infoBtn.style("background-image", "url('css/icons/info.png')")
      }).on("mousedown", () => {
        infoBtn.style("background-image", "url('css/icons/info-darker.png')")
      }).on("mouseup", () => {
        infoBtn.style("background-image", "url('css/icons/info.png')")
      });
    }

    addCollapseBehavior() {
      document.querySelector("#btn-maximize").addEventListener("click", () => {
          const settingsdiv = document.querySelector("#settingsdiv")
          const display = settingsdiv.style.display
          settingsdiv.style.display = (display === "none") ? "block" : "none";
      });

      let maxBtn = d3.select('#btn-maximize');
      maxBtn.on("mouseover", () => {
        maxBtn.style("background-image", "url('css/icons/maximize-highlighted.png')")
      }).on("mouseout", () => {
        maxBtn.style("background-image", "url('css/icons/maximize.png')")
      }).on("mousedown", () => {
        maxBtn.style("background-image", "url('css/icons/maximize-darker.png')")
      }).on("mouseup", () => {
        maxBtn.style("background-image", "url('css/icons/maximize.png')")
      });
    }
}
