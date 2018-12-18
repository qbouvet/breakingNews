
export class InfoPanel {

  constructor() {

    let play = d3.select("#play-btn");
    let forward = d3.select("#forward-btn");
    let backward = d3.select("#backward-btn");
    let speed = d3.select("#simulation-speed");
    let clock = d3.select("#clock-border");
    let settings = d3.select("#settingsdiv");
    let classes = d3.selectAll(".quadclass-header");

    let oldPlay, oldForward, oldBackward, oldSpeed, oldClock, oldSettings, oldClass;

    // On hover of day text
    d3.select("#i-clock")
      .on("mouseover", () => {
        oldClock = clock.style("stroke");
        clock.style("stroke", "white");
      })
      .on("mouseout", () => {
        clock.style("stroke", oldClock);
      });

    // On hover of play button text
    d3.select("#i-play")
      .on("mouseover", () => {
        oldPlay = play.style("background-image");
        play.style("background-image", "url('css/icons/play-highlighted.svg')");
      })
      .on("mouseout", () => {
        play.style("background-image", oldPlay);
      });

    // On hover of controls text
    d3.select("#i-controls")
      .on("mouseover", () => {
        oldForward = forward.style("background-image");
        forward.style("background-image", "url('css/icons/forward-highlighted.svg')");
        oldBackward = backward.style("background-image");
        backward.style("background-image", "url('css/icons/backward-highlighted.svg')");
        oldSpeed = speed.style("color");
        speed.style("color", "white");
      })
      .on("mouseout", () => {
        forward.style("background-image", oldForward);
        backward.style("background-image", oldBackward);
        speed.style("color", oldSpeed);
      });

    // On hover of selection text
    d3.select("#i-selection")
      .on("mouseover", () => {
        oldSettings = settings.style("border");
        settings.style("border", "solid white 3px");
      })
      .on("mouseout", () => {
        settings.style("border", oldSettings);
      });

    // On hover of classes text
    d3.select("#i-classes")
      .on("mouseover", () => {
        oldClass = classes.style("border");
        classes.style("border", "solid white 3px");
      })
      .on("mouseout", () => {
        classes.style("border", oldClass);
      });
  }
}
