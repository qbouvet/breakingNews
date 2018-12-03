
import {log, info, warn, err} from './utils.js';

/*
  This class implements the slider under the map, that models time flow. It can
  be played/paused, or dragged directly by the user.
*/
export class Slider {

  constructor(svg, maxVal ,updateCallback) {

    // Init svg field and self reference (for call inside callbacks)
    let self = this;
    this.svg = svg;
    this.updateCallback = updateCallback;

    // Init all slider components
    this.initScale(svg, maxVal);
    this.initSlider(self);
    this.initPlayBehaviour(self);
  }

  /*
    Initializes the range used to go from screen coordinates to slider values
  */
  initScale(svg, maxVal) {

    // Init margin and dimensions
    this.margin = {top:20, right:20, bottom:0, left:20};
    this.w = svg.style("width").replace("px", "") - this.margin.right - this.margin.left;
    this.h = svg.style("height").replace("px", "") - this.margin.top - this.margin.bottom;

    // Init max range value (TODO: this should be the number of updates in the dataset)
    this.MAX_VALUE = maxVal;

    // Define scale
    this.sliderRange = d3.scaleLinear()
      .domain([0, this.w])
      .range([0, this.MAX_VALUE])
      .clamp(true);
  }

  /*
    Initializes the slider components (container, line, handle)
  */
  initSlider(self) {

    // Coordinate system = SVG viewbox
        // FIXME : ugly - this doesn't work with d3 selection (that we have in this.svg)
    /*const vbw = document.querySelector("#svg-timeslider").getAttribute("viewBox").split(" ")
    const bbox = document.querySelector("#svg-timeslider").getBBox()
    err(vbw)
    err(bbox)
    let transform = "translate(" + vbw[0] + ", " + vbw[1] + ")"*/

    // Slider container
    this.slider = this.svg.append('g')
      .attr("class", "slider")
      .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + this.h/2) + ")");

    // Slider line
    this.slider.append("line")
        .attr("class", "track")
        .attr("x1", this.sliderRange.domain()[0])
        .attr("x2", this.sliderRange.domain()[1])
      // The invisible overlay is the selectable part
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start drag", () => {self.update(d3.event.x)})
        );

    // Slider handle
    this.handle = this.slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
  }

  /*
    Defines variables and callbacks relative to the play button
  */
  initPlayBehaviour(self) {

    // Play variables
    this.currentValue = 0;
    this.moving = false;
    this.interval = 0;

    // Select "clock" div
    this.clock = d3.select("#play-clock");

    // Define event callbacck
    this.playButton = d3.select("#btn-play")
      .on("click", function() {
          self.flow();
      });
  }

  /*
    Given the x value of the update (either from playing or dragging), updates
    the slider state and calls all necessary actions for the visualization
  */
  update(v) {

    // Get slider value
    this.currentValue = Math.floor(this.sliderRange(v));

    // Update handle position and clock text
    this.handle.attr("cx", this.sliderRange.invert(this.currentValue));

    // Disable button if MAX_VALUE, or re-enable it
    if (this.currentValue >= this.MAX_VALUE) {

      this.playButton.attr('disabled', 'diabled');
      this.moving = false;
      clearInterval(this.interval);
        // FIXME : ugly : can't use the "d3-selected" object, need a document.querySelector() object
      document.querySelector("#btn-play").style.backgroundImage = "url(../css/icons/play.svg)"
    } else {

      this.playButton.attr('disabled', null);
    }

    // Call update callbacks
    this.updateCallback(this.currentValue);
  }

  /*
    Defines the behavior on play button clicks
  */
  flow() {

    const updateDelay = 3000;

    // Define interval callback
    let cb = (elapsed) => {
      //Advance slider by one unit
      this.update(this.sliderRange.invert(this.currentValue + 1));
    };

    // Play pause behavior
    if (this.moving === true) {
      this.moving = false;
      clearInterval(this.interval);
        // FIXME : ugly : can't use the "d3-selected" object, need a document.querySelector() object
      //this.playButton.style.background = "url('./pause.svg')";
      document.querySelector("#btn-play").style.backgroundImage = "url(../css/icons/play.svg)"
    } else {
      this.moving = true;
      this.interval = setInterval(cb, updateDelay);
        // FIXME : ugly : can't use the "d3-selected" object, need a document.querySelector() object
      //this.playButton.style.background = "url('./pause.svg')";
      document.querySelector("#btn-play").style.backgroundImage = "url(../css/icons/pause.svg)";
    }
  }

  updateClock(date) {
    this.clock.text(date);
  }

}
