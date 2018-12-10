
export class D3Handler {

  constructor() {

  }

  invisibleCirclesCorrectLocation(circles, projection) {

    circles
      .attr("cx", (d) => projection([d["Long"], d["Lat"]])[0])
      .attr("cy", (d) => projection([d["Long"], d["Lat"]])[1])
      .attr("r", 0)
  }

  updateCategorySelection(circles, selected, updateStepDuration, scaleRatio) {

    circles.transition()
      .duration(updateStepDuration/2)
      .attr("fill", (d) => selected(d) ? "#FFA500" : "gray")
      .attr("r", (d) => selected(d) ? 1/scaleRatio : 0);
  }

  pulseEntrance(circles, selected, updateStepDuration, scaleRatio) {

    // Pulse stroke
    let highlightedCircles = circles
      .transition()
					.duration(updateStepDuration/2)
          .attr("fill", (d) => selected(d) ? "red" : "gray")
					.attr("r", (d) => selected(d) ? 2/scaleRatio : 0);

    this.updateCategorySelection(highlightedCircles, selected, updateStepDuration, scaleRatio);
  }

  scaleCircles(circles, selected, scaleRatio) {

    circles.transition()
      .duration(0)
      .attr("fill", (d) => selected(d) ? "#FFA500" : "gray")
      .attr("r", (d) => selected(d) ? 1/scaleRatio : 0);
  }


}
