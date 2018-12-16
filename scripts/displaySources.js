
function clean_sources(reset=false){
    $('.visualize-source-container').empty()
    $('.visualize-source-container').show()
    if (reset){
        $('.visualize-source-container').hide()
    }
}

function display_source(data, cumulative_data, timestamps){


    d3.selectAll(".visualize-source-container").style('height', 'calc(100%/' + Array.from(data).length + ')')

    //clean container for later redraw all charts
    clean_sources()

    let array_data = Array.from(data).map(d => {return d[1]})

    var n = Array.from(array_data[0].keys()).length

    var divParent = d3.select('#sidebardiv')
                    .selectAll('div')
                    .data(Array.from(data)).enter()
                    .append('div')
                    .attr('class', "visualize-source-container")
                    // .style('height', height + "px")

    var divMention = d3.selectAll(".visualize-source-container")
                    .append('div')
                    .attr('class', "visualize-source-mention-container")

    var divMentionText = d3.selectAll(".visualize-source-mention-container")
                    .append('div')
                    .attr('class', "visualize-source-mention-text")
                    .text(function (d) {return d[0]})

    var divMentionNum = d3.selectAll(".visualize-source-mention-container")
                    .append('div')
                    .attr('class', "visualize-source-mention-num")
                    .text(function (d) {return cumulative_data.get(d[0])})


    var divMentionChart = d3.selectAll(".visualize-source-container")
                    .append('div')
                    .attr('class', "visualize-source-mention-chart")
                    // .text(function (d) {console.log("d[1]: ", d[1])})


    d3.selectAll(".visualize-source-mention-text")
    .append("img")
    .attr("src", function(d) {return "https://www." + d[0] + "/favicon.ico" })
    .attr("width", 16)
    .attr("height", 16);

    console.log(data);

    // FIXME: max value should not be the maximum cumulative value, but the maximum update value ever encountered

    // compute the max value of the total data, and pass it for axis scaling
    let max_total_value = Math.ceil(Array.from(cumulative_data.values()).reduce((x, y) => ( x > y ? x : y )))
    test_line_chart(n, max_total_value, Array.from(array_data[0].keys()))

}

function xCircle(data) {

    let a = Array.from(data.keys())
    let b = Array.from(data.values())

    var c = a.map(function(e, i) {
        return i;
    });

    return c
}

function yCircle(data) {

    let a = Array.from(data.keys())
    let b = Array.from(data.values())

    var c = a.map(function(e, i) {
        return b[i];
    });
    return c
}

function make_tuples(data, xScale, yScale) {
    // create array of tuples (x, y) to be plotted
    let a = Array.from(data.keys())
    let b = Array.from(data.values())

    var c = a.map(function(e, i) {
        return [xScale(i), yScale(b[i])];
    });

    return c
}
function test_line_chart(n, max_total_value, datepoints){

    let digits_length = Math.log(max_total_value) * Math.LOG10E + 1 | 0;
    let x_axis_space = digits_length * 6
    // var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

    var parentDiv = $(".visualize-source-mention-chart")[0];
    var margin = {top: 10, right: 10, bottom: 10, left: 10}
    var width = parentDiv.clientWidth - margin.left - margin.right;
    var height = parentDiv.clientHeight - margin.top - margin.bottom;

    console.log("dateponts: ", datepoints)

    // 5. X scale will use the index of our data
    var xScaleCategorical = d3.scaleOrdinal()
        .domain(datepoints) // input
        .range([0, width - x_axis_space]); // output

    var xScale = d3.scaleLinear()
        .domain([0,n-1]) // input
        .range([0, width - x_axis_space]); // output

   //  // 6. Y scale will use the randomly generate number
    var yScale = d3.scaleLinear()
        .domain([0, max_total_value]) // input
        .range([height - margin.bottom, 0]); // output

   //  // 7. d3's line generator
    // var line = d3.line((d) => {console.log("diao")})
    //     .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
    //     .y(function(d, a) { return yScale(d.y); }) // set the y values for the line generator
    //     .curve(d3.curveMonotoneX) // apply smoothing to the line

    var svg = d3.selectAll(".visualize-source-mention-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + (margin.left + x_axis_space) + "," + (margin.top) + ")");

   //  // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale).ticks(4));

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(4));

    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
        .attr("class", "line") // Assign a class for styling
        .attr("d", (d) => {return d3.line()(make_tuples(d[1], xScale, yScale))}) // 11. Calls the line generator



    // trying to put circles

    // svg.selectAll(".visualize-source-mention-chart").append("circle")
    //     .attr("class", "dot") // Assign a class for styling
    //     .attr("cx", function(d, i) { return xScale(xCircle(d[1])[i]) })
    //     .attr("cy", function(d, i) { return yScale(yCircle(d[1])[i]) })
    //     .attr("r", 5);
    // // // 12. Appends a circle for each datapoint

}

 export {
    display_source, clean_sources
}
