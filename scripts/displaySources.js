
import {log, info, warn, err} from './utils.js'

import {D3Handler} from './AnimationStyling.js'


const d3h = new D3Handler()


function clean_sources(reset=false){
    $('div.sourcegraph-container').empty()
    $('div.sourcegraph-container').show()
    if (reset){
        $('div.sourcegraph-container').hide()
    }
}


function sortMapByKeys(history_value) {

  const mapSort1 = new Map([...history_value.entries()].sort((a, b) => {
    return a[0] - b[0] }
      ));

  return mapSort1;
}

function make_scale(max, height, bottom) {

    var yScale = d3.scaleLinear()
        .domain([0, max]) // input
        .range([height - bottom, 0]);

    return yScale
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
function display_source(timeseriesData, perSourceCumulativeCount, timestamps, sourceGraphClickCallback){
        // divs data
    let divData = [...perSourceCumulativeCount.entries()]
    const getSourceName = (thisElement) => thisElement.children[0].innerHTML.split(" - ")[0];

        // Compute selections and update data
    let [enterSel, updateSel, exitSel] = d3h.mkSelections(
        d3.selectAll('#sidebardiv').selectAll("div.sourcegraph-container"),
        divData
    )
        // update selection
    updateSel.on("click", (d) => sourceGraphClickCallback(d[0]) )
    updateSel.select(".sourcegraph-text")
            .text( (d) => d[0]+" - "+d[1])

    updateSel.select(".sourcegraph-chart")
             .select('svg').remove()

        // enter selection has 2 children -> 2 sub-selections
    const enterTopLevel = enterSel
        .append('div')
            .attr('class', "sourcegraph-container")
            .on("click", (d) => sourceGraphClickCallback(d[0]) )

    enterTopLevel.append('div')
            .attr('class', "sourcegraph-text")
            .text( (d) => d[0]+" - "+d[1])
    enterTopLevel.append('div')
            .attr('class', "sourcegraph-chart")
            .attr('id', (d, i) => "sourcegraph-id" + i)
        // exit selection
    exitSel.remove()

    /*const chartdivs = d3.selectAll(".sourcegraph-chart")._groups[0]
    chartdivs.forEach( (div) => {
        // div.__data__
        drawChart(div, timeseriesData, div.__data__[0])
    })*/

    // drawChart(timeseriesData, perSourceCumulativeCount)

    // var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

    var parentDiv = $(".sourcegraph-chart")[0];
    var margin = {top: 10, right: 10, bottom: 10, left: 10}
    var width = parentDiv.clientWidth - margin.left - margin.right;
    var height = parentDiv.clientHeight - margin.top - margin.bottom;


    let chartdata = [...timeseriesData.entries()].map( (entry) => {
        return [entry[0], [...entry[1].entries()]]
    })

    let max_scale = Array.from(timeseriesData.values()).map(d => Array.from(d.values())).map(d => Math.max(...d))

    let array_scales = []
    for (var i = 0; i < 5; i++){
        array_scales.push(make_scale(max_scale[i], height, margin.bottom))
    }

    console.log("max_scale: ", max_scale)
    console.log("array_scales: ", array_scales)


    // Sort Map(timestamp => count) by increasing order of timestamps for display in graph
    let sorted_data = Array.from(timeseriesData).map((x) => [x[0], sortMapByKeys(x[1])])
    let datepoints = Array.from(sorted_data[0][1].keys()).sort().map(d => d.slice(8,12))

    let chart_data_prepared_to_plot = chartdata.map(d => d[1].map(a => [a[0].slice(8,12), a[1]]))

    for (var i = 0; i < 5; i++){
        drawSingleChart(chart_data_prepared_to_plot[i], height, width, margin, datepoints, i)    
    }
    // drawChart(timeseriesData, perSourceCumulativeCount)
//===========================================================================================================
//===========================================================================================================

    // FIXME: max value should not be the maximum cumulative value, but the maximum update value ever encountered

    // compute the max value of the total data, and pass it for axis scaling
    /*let max_total_value = Math.ceil(Array.from(cumulative_data.values()).reduce((x, y) => ( x > y ? x : y )))
    test_line_chart(n, max_total_value, array_data)*/
}


function drawSingleChart(aa, height, width, margin, datepoints, index){

    let max_total_value = aa.map(d => d[1]).reduce((x, y) => ( x > y ? x : y ))
    let digits_length = Math.log(max_total_value) * Math.LOG10E + 1 | 0;
    let x_axis_space = digits_length * 6

    var xScale = d3.scalePoint().rangeRound([0, width-x_axis_space])
        xScale.domain(datepoints);

  var yScale = d3.scaleLinear()
        .domain([0, max_total_value]) // input
        .range([height - margin.bottom, 0]); // output

   //  // 7. d3's line generator
    var line = d3.line()
        .x(function(d) { console.log("X: ", d[0]); return xScale(d[0]); }) // set the x values for the line generator
        .y(function(d) { console.log("Y: ", d[1]); return yScale(d[1]); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    var svg = d3.select("#sourcegraph-id"+index)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + (margin.left + x_axis_space) + "," + (margin.top) + ")")


    let datepoints_length = (Math.log(datepoints.length) * Math.LOG10E + 1 | 0)-1;
    let ticks = xScale.domain().filter(function(d,i){ return !(i% (10**datepoints_length)); })            

   //  // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale).tickValues(ticks));

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis").data([1,2,3,4,5])
        .call(d3.axisLeft(yScale).ticks(4));

    console.log("aaaa: ", aa)
    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
        .data([aa])
        .attr("class", "line") // Assign a class for styling
        .attr("d", line)//(d, z, z1) => (d3.line()(d.map( d => [xScale(d[0]))))))

    svg.selectAll(".dot")
    .data(aa).enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => {console.log("cx: ", d[0]); return xScale(d[0])})
    .attr("cy", (d) => {console.log("cy: ", d[1]); return yScale(d[1])})
    .attr("r", 3.5);
}


export {
    display_source, clean_sources
}
