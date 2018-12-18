
import {D3Handler} from './AnimationStyling.js'


const d3h = new D3Handler()


function clean_sources(reset=false){
    $('.sourcegraph-container').empty()
    $('.sourcegraph-container').show()
    if (reset){
        $('.sourcegraph-container').hide()
    }
}


function sortMapByKeys(history_value) {

  const mapSort1 = new Map([...history_value.entries()].sort((a, b) => {
    return a[0] - b[0] }
      ));

  return mapSort1;
}


    /*  Display the top k sources as graphs in the sidebar-
     *      data : for the top k sources :
     *          [sourceName, Map(timestamp => mentionsCount)]
     *      cumulative_data : for the top k sources :
     *          [sourceName, totalMentions]
     *      timestamps :
     *          list of all elapsed timestamps
     *      sourceGraphClickCallback :
     *          callback function to be used when clicking on a source graph
     */
function display_source(data, cumulative_data, timestamps, sourceGraphClickCallback){

        // Sort Map(timestamp => count) by increasing order of timestamps for display in graph
    let sorted_data = Array.from(data).map((x) => [x[0], sortMapByKeys(x[1])])

        //clean container for later redraw all charts
    //clean_sources()

        // [Map(timestamp => count)]
    let array_data = Array.from(data).map(d => {return d[1]})

        // divs data
    let divData = [...cumulative_data.entries()]
    const getSourceName = (thisElement) => thisElement.children[0].innerHTML.split(" - ")[0];

    /*let [enterSel, updateSel, exitSel] = d3h.mkSelections(
        d3.select('#sidebardiv').select('div'),
        divData
    )
    */

    let selection = d3.selectAll('#sidebardiv').selectAll("div.sourcegraph-container").data(divData)

    selection
        .on("click", (d) => function (d) {
            // 'this' is the 'div' we're operating on
            const sourceName = d[0]
            sourceGraphClickCallback(sourceName)
        })
        .select(".sourcegraph-text")
            .text( (d) => d[0]+" - "+d[1])
        .append('div')
            .attr('class', "sourcegraph-chart")

    selection.enter()
        .append('div')
            .attr('class', "sourcegraph-container")
            .on("click", (d) => function (d) {
                // 'this' is the 'div' we're operating on
                const sourceName = d[0]
                sourceGraphClickCallback(sourceName)
            })
        .append('div')
            .attr('class', "sourcegraph-text")
            .text( (d) => d[0]+" - "+d[1])
        .append('div')
            .attr('class', "sourcegraph-chart")

    selection.exit().remove()

    return

        //number of sources to display
    var n = Array.from(array_data[0].keys()).length

    var divParent = d3.select('#sidebardiv')
                    .selectAll('div')
                    .data(sorted_data).enter()
                    .append('div')
                    .attr('class', "sourcegraph-container")

    var divMention = d3.selectAll(".sourcegraph-container")
        .append ('div')
        .attr('class', "sourcegraph-text")
            .text(function (d) {return d[0]+" - "+cumulative_data.get(d[0])})

    var divMentionChart = d3.selectAll(".sourcegraph-container")
        .append('div')
            .attr('class', "sourcegraph-chart")

    // "country colorChart on click" behaviour
    d3.selectAll(".sourcegraph-container")
        .on("click", function () {
            // 'this' is the 'div' we're operating on
            const sourceName = getSourceName(this)
            sourceGraphClickCallback(sourceName)
    })

    console.log(data);

    // FIXME: max value should not be the maximum cumulative value, but the maximum update value ever encountered

    // compute the max value of the total data, and pass it for axis scaling
    let max_total_value = Math.ceil(Array.from(cumulative_data.values()).reduce((x, y) => ( x > y ? x : y )))
    test_line_chart(n, max_total_value, array_data)
}


function xCircle(data) {
    let a = Array.from(data.keys())
    // var c = a.map(function(e, i) {
    //     return e;
    // });

    return a
}


function yCircle(data) {

    // let a = Array.from(data.keys())
    let b = Array.from(data.values())
    return b
}


function make_tuples(data, xScale, yScale) {

    console.log("dataaaa: ", data)
    // create array of tuples (x, y) to be plotted
    let a = Array.from(data.keys()).map(d => d.slice(8,12))

    console.log("keys: ", a)

    let b = Array.from(data.values())

    console.log("values: ", b)


    var c = a.map(function(e, i) {
        return [xScale(e), yScale(b[i])];
    });

    return c
}



function test_line_chart(n, max_total_value, array_data){

    let digits_length = Math.log(max_total_value) * Math.LOG10E + 1 | 0;
    let x_axis_space = digits_length * 6
    // var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

    var parentDiv = $(".sourcegraph-chart")[0];
    var margin = {top: 10, right: 10, bottom: 10, left: 10}
    var width = parentDiv.clientWidth - margin.left - margin.right;
    var height = parentDiv.clientHeight - margin.top - margin.bottom;

    let datepoints = Array.from(array_data[0].keys()).sort().map(d => d.slice(8,12))

    console.log("datepoints: ", datepoints)
    // datepoints = datepoints.map(d => d.slice(8,12))

    var x = d3.scalePoint().rangeRound([0, width-x_axis_space])
    x.domain(datepoints);
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

    var line = d3.line()
        .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
        .y(function(d, i) { return yScale(i); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    var svg = d3.selectAll(".sourcegraph-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + (margin.left + x_axis_space) + "," + (margin.top) + ")");

   //  // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x));

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(4));

    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
        .attr("class", "line") // Assign a class for styling
        .attr("d", (d) => (d3.line()(make_tuples(d[1], x, yScale)))) // 11. Calls the line generator


    svg.selectAll(".circle")
      .data(svg.data()).enter().append("circle")
        .attr("class", "dot")
        .attr("cx", line.x())
        .attr("cy", line.y())
        .attr("r", 3.5);

    // trying to put circles
    // svg.selectAll(".visualize-source-mention-chart").append("circle")
    //     .attr("class", "dot") // Assign a class for styling
    //     .attr("cx", function(d, i) { return x(xCircle(d[1])[i]) })
    //     .attr("cy", function(d, i) { return yScale(yCircle(d[1])[i]) })
    //     .attr("r", 5);
    // 12. Appends a circle for each datapoint

}

 export {
    display_source, clean_sources
}
