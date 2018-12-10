
export class D3Handler {

  constructor() {

  }

  invisibleCirclesCorrectLocation(circles, projection) {

    circles
      .attr("cx", (d) => projection([d["Long"], d["Lat"]])[0])
      .attr("cy", (d) => projection([d["Long"], d["Lat"]])[1])
      .attr("r", 0)
      //.attr("fill", "grey");
  }

  updateCategorySelection(circles, selected) {

    circles.transition()
      .duration(750)
      //.attr("fill", (d) => selected(d) ? "orange" : "gray")
      .attr("stroke", (d) => selected(d) ? "orange" : "gray")
      .attr("stroke-width", (d) => selected(d) ? 2 : 0)
      .attr("r", (d) => selected(d) ? 1 : 0);
  }

  pulseEntrance(circles, selected) {

    // Pulse stroke
    let highlightedCircles = circles
      .transition()
					.duration(1000)
          .attr("stroke", (d) => selected(d) ? "red" : "gray")
					.attr('stroke-width', (d) => selected(d) ? 0.5 : 0)
					.attr("r", 3);
					//.ease('sine');

    this.updateCategorySelection(highlightedCircles, selected);
  }


}
