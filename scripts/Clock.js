
import {log, info, warn, err} from './utils.js';

/*
  This class implements the slider under the map, that models time flow. It can
  be played/paused, or dragged directly by the user.
*/
export class Clock {

  constructor(initDate) {

    // D3 selections
    this.parentSvg = d3.select("#mainSvg")

    this.digitalClock = d3.select("#digital-clock");
    this.displayDate = d3.select("#display-date");
    this.digits = this.digitalClock.selectAll(".digit");

    // Style display date FIXME: font-size does not work in css, why?
    this.displayDate
      .attr("font-size", "30");

    this.positionClock();
    this.update(initDate);
  }

  positionClock() {

    // Position the clock relative to parent svgs
    let parentViewBox = this.parentSvg.attr("viewBox").split(" ");
    this.digitalClock
      .attr("x", parseInt(parentViewBox[0], 10) + parseInt(parentViewBox[2]/2) - this.digitalClock.attr("width")/2)
      .attr("y", 25); // FIXME: not hardcoded
  }

  /*
    This method visually updates the clock
  */
  update(date) {

    // Update display dates
    this.displayDate.text(date.toDateString());

    // Pattern to lit digits
    let digitPattern = [
      [1,0,1,1,0,1,1,1,1,1],
      [1,0,0,0,1,1,1,0,1,1],
      [1,1,1,1,1,0,0,1,1,1],
      [0,0,1,1,1,1,1,0,1,1],
      [1,0,1,0,0,0,1,0,1,0],
      [1,1,0,1,1,1,1,1,1,1],
      [1,0,1,1,0,1,1,0,1,1]
    ];

    // Extract digit values from date
    this.digits = this.digits.data([date.getHours() / 10 | 0,
      date.getHours() % 10,
      date.getMinutes() / 10 | 0,
      date.getMinutes() % 10,
      date.getSeconds() / 10 | 0,
      date.getSeconds() % 10]);

    // List corresponding paths
    this.digits.select("path:nth-child(1)").classed("lit", function(d) { return digitPattern[0][d]; });
    this.digits.select("path:nth-child(2)").classed("lit", function(d) { return digitPattern[1][d]; });
    this.digits.select("path:nth-child(3)").classed("lit", function(d) { return digitPattern[2][d]; });
    this.digits.select("path:nth-child(4)").classed("lit", function(d) { return digitPattern[3][d]; });
    this.digits.select("path:nth-child(5)").classed("lit", function(d) { return digitPattern[4][d]; });
    this.digits.select("path:nth-child(6)").classed("lit", function(d) { return digitPattern[5][d]; });
    this.digits.select("path:nth-child(7)").classed("lit", function(d) { return digitPattern[6][d]; });
  }

}
