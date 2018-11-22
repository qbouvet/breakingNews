

export class DateSlider {

  constructor(svg) {

    let INIT_DATE = new Date(2018, 10, 5, 0, 0);
    let END_DATE = new Date(2018, 10, 12, 0, 0);

    // Init svg field
    this.svg = svg;

    // Init margin and dimensions
    this.margin = {top:50, right:50, bottom:0, left:50};
    this.w = svg.style("width").replace("px", "") - this.margin.right - this.margin.left;
    this.h = svg.style("height").replace("px", "") - this.margin.top - this.margin.bottom;

    // Define date range
    this.dateRange = d3.scaleTime()
        .domain([INIT_DATE, END_DATE])
        .range([0, this.w])
        .clamp(true);

    // Define slider
    this.currentValue = 0;

    this.slider = this.svg.append('g')
      .attr("class", "slider")
      .attr("transform", "translate(" + this.margin.left + "," + this.h/2 + ")");

    this.slider.append("line")
        .attr("class", "track")
        .attr("x1", this.dateRange.range()[0])
        .attr("x2", this.dateRange.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            //.on("start.interrupt", function() { this.slider.interrupt(); })
            .on("start drag", function() {
              this.currentValue = d3.event.x;
              update(this.currentValue);//this.dateRange.invert(this.currentValue));
            })
        );

    this.slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
        .data(this.dateRange.ticks(10))
        .enter()
        .append("text")
          .attr("x", this.dateRange)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .text(function(d) { "return formatDateIntoYear(d)"; });

    this.handle = this.slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    this.label = this.slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text("formatDate(startDate)")
        .attr("transform", "translate(0," + (-25) + ")")

    let update = (h) => {

        // update position and text of label according to slider scale
        this.handle.attr("cx", h);
        this.label.attr("x", h)
          .text("formatDate(h)");

          /*
          // filter data set and redraw plot
          let newData = dataset.filter(function(d) {
            return d.date < h;
          })
        drawPlot(newData);*/
      }
  }

/*
var moving = false;
var targetValue = width;
var playButton = d3.select("#play-button");
*/

}
