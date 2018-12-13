
export class D3Handler {

  constructor() {

  }

  invisibleCirclesCorrectLocation(circles, projection) {

    let longp = Math.random();
    let latp = Math.random();

    circles
      .attr("cx", (d) => projection([d["Long"], d["Lat"]])[0] + longp)
      .attr("cy", (d) => projection([d["Long"], d["Lat"]])[1] + latp)
      .attr("r", 0)
  }

  updateCategorySelection(circles, selected, updateStepDuration) {

    circles.transition()
      .duration(updateStepDuration/2)
      .attr("fill", (d) => selected(d) ? "#FFA500" : "gray")
      .attr("r", (d) => selected(d) ? 0.5 : 0);

    circles
      .attr("fill-opacity", 0.5)
      .attr("stroke-width", 0.05)
      .attr("stroke", "#FFA500");
  }

  pulseEntrance(circles, selected, updateStepDuration) {

    // Pulse stroke
    let highlightedCircles = circles
      .transition()
					.duration(updateStepDuration/2)
          .attr("fill", (d) => selected(d) ? "red" : "gray")
					.attr("r", (d) => selected(d) ? 2 : 0);

    this.updateCategorySelection(highlightedCircles, selected, updateStepDuration);
  }


}
