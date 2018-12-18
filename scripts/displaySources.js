
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

   // var xScale = d3.scaleLinear()
   //      .domain([0, 100]) // input
   //      .range([0, width - margin.left]); // output

    var xScale = d3.scalePoint().rangeRound([0, width-20])
    xScale.domain(datepoints);

    let aaa = [
                [
                [[1,200],[20, 800], [30,500], [40,5], [50,400],[60,700], [70,100], [80,900]]],
                [[[1,5],[20,30], [30,40], [40,5], [50,40],[60,50], [70,100], [80,10]]],
                [[[1,700],[20,400], [30,400], [40,5], [50,400],[60,700], [70,900], [80,10]]],
                [[[1,700],[20,400], [30,400], [40,5], [50,400],[60,700], [70,900], [80,10]]],
                [[[1,200],[20, 200], [30,500], [40,5], [50,400],[60,300], [70,100], [80,500]]],
             ]

    let bb = chartdata.map(d => d[1].map(a => [a[0].slice(8,12), a[1]]))

    for (var i = 0; i < 5; i++){
        drawSingleChart([bb[i]], height, width, margin, xScale, i)    
    }
    // drawChart(timeseriesData, perSourceCumulativeCount)
//===========================================================================================================
//===========================================================================================================

    // FIXME: max value should not be the maximum cumulative value, but the maximum update value ever encountered

    // compute the max value of the total data, and pass it for axis scaling
    /*let max_total_value = Math.ceil(Array.from(cumulative_data.values()).reduce((x, y) => ( x > y ? x : y )))
    test_line_chart(n, max_total_value, array_data)*/
}


function drawSingleChart(aa, height, width, margin, xScale, index){

    let max_total_value = aa[0].map(d => d[1]).reduce((x, y) => ( x > y ? x : y ))
    let digits_length = Math.log(max_total_value) * Math.LOG10E + 1 | 0;
    let x_axis_space = digits_length * 6

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

   //  // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale));

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis").data([1,2,3,4,5])
        .call(d3.axisLeft(yScale).ticks(4));

    console.log("aaaa: ", aa)
    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
        .data(aa)
        .attr("class", "line") // Assign a class for styling
        .attr("d", line)//(d, z, z1) => (d3.line()(d.map( d => [xScale(d[0]))))))
}

function drawChart(timeseriesData, perSourceCumulativeCount) {

    let max_total_value = Math.ceil(Array.from(perSourceCumulativeCount.values()).reduce((x, y) => ( x > y ? x : y )))
    max_total_value = 1000


    let digits_length = Math.log(max_total_value) * Math.LOG10E + 1 | 0;
    let x_axis_space = digits_length * 6
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

    var x = d3.scalePoint().rangeRound([0, width-x_axis_space])
    x.domain(datepoints);

   var yScale = d3.scaleLinear()
        .domain([0, max_total_value]) // input
        .range([height - margin.bottom, 0]); // output

   var xScale = d3.scaleLinear()
        .domain([0, 100]) // input
        .range([0, width - margin.left]); // output

   //  // 7. d3's line generator
    var line = d3.line()
        .x(function(d) { return xScale(d[0]); }) // set the x values for the line generator
        .y(function(d) { return yScale(d[1]); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    var svg = d3.selectAll(".sourcegraph-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + (margin.left + x_axis_space) + "," + (margin.top) + ")")

   //  // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale));

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(4));


    let bb = chartdata.map(d => d[1].map(a => [a[0].slice(8,12), a[1]]))

    let aa = [
                [[1,200],[20, 800], [30,500], [40,5], [50,400],[60,700], [70,100], [80,900]],
                [[1,700],[20,400], [30,400], [40,5], [50,400],[60,700], [70,900], [80,10]],
                [[1,700],[20,400], [30,400], [40,5], [50,400],[60,700], [70,900], [80,10]],
             ]
    console.log("aaaa: ", aa)
    console.log("bbbbbb: ", bb)
    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
        .data(aa)
        .attr("class", "line") // Assign a class for styling
        .attr("d", line)//(d, z, z1) => (d3.line()(d.map( d => [xScale(d[0]))))))


}



function test_line_chart(max_total_value, perSourceCumulativeCountarray_data){



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
        .x(function(d, i) { console.log("ddddddddd", d[0]); return xScale(d[0]); }) // set the x values for the line generator
        .y(function(d, i) { return yScale(d[1]); }) // set the y values for the line generator
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
