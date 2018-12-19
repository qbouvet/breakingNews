
import {log, info, warn, err} from './utils.js'

import {D3Handler} from './AnimationStyling.js'



export class SourceGrapher {

    constructor () {
        // Some data structures
        this.d3h = new D3Handler()

        this.drag = d3.drag()
        this.drag.on("end", this.onDragEnd)
        this.drag.on("drag", this.onDragStart)

        this.xScale = undefined
        this.yScale = undefined

    }


    onDragEnd () {
        var pos = d3.mouse(this);
        var x1 = x.invert(bandPos[0]);
        var x2 = x.invert(pos[0]);

        if (x1 < x2) {
            zoomArea.x1 = x1;
            zoomArea.x2 = x2;
        } else {
            zoomArea.x1 = x2;
            zoomArea.x2 = x1;
        }

        var y1 = y.invert(pos[1]);
        var y2 = y.invert(bandPos[1]);

        if (x1 < x2) {
            zoomArea.y1 = y1;
            zoomArea.y2 = y2;
        } else {
            zoomArea.y1 = y2;
            zoomArea.y2 = y1;
        }

        bandPos = [-1, -1];

        d3.select(".band").transition()
            .attr("width", 0)
            .attr("height", 0)
            .attr("x", bandPos[0])
            .attr("y", bandPos[1]);

        zoom();
    }


    onDragStart() {
        var pos = d3.mouse(this);

        if (pos[0] < bandPos[0]) {
            d3.select(".band").
            attr("transform", "translate(" + (pos[0]) + "," + bandPos[1] + ")");
        }
        if (pos[1] < bandPos[1]) {
            d3.select(".band").
            attr("transform", "translate(" + (pos[0]) + "," + pos[1] + ")");
        }
        if (pos[1] < bandPos[1] && pos[0] > bandPos[0]) {
            d3.select(".band").
            attr("transform", "translate(" + (bandPos[0]) + "," + pos[1] + ")");
        }

        //set new position of band when user initializes drag
        if (bandPos[0] == -1) {
            bandPos = pos;
            d3.select(".band").attr("transform", "translate(" + bandPos[0] + "," + bandPos[1] + ")");
        }

        d3.select(".band").transition().duration(1)
            .attr("width", Math.abs(bandPos[0] - pos[0]))
            .attr("height", Math.abs(bandPos[1] - pos[1]));
    }


        /*  Display the top k sources as graphs in the sidebar-
         *  timeseriesData : for the top k sources :
         *      [sourceName, Map(timestamp => mentionsCount)]
         *  cumulative_data : for the top k sources :
         *      [sourceName, totalMentions]
         *  timestamps :
         *      list of all elapsed timestamps
         *  sourceGraphClickCallback :
         *      callback function to be used when clicking on a source graph
         */
    display_source(timeseriesData, perSourceCumulativeCount, timestamps, sourceGraphClickCallback){

            // divs data
        let divData = [...perSourceCumulativeCount.entries()]
        const getSourceName = (thisElement) => thisElement.children[0].innerHTML.split(" - ")[0];

            // Compute selections and update data
        let [enterSel, updateSel, exitSel] = this.d3h.mkSelections(
            d3.selectAll('#sidebardiv').selectAll("div.sourcegraph-container"),
            divData
        )

        // update selection
        updateSel.on("click", (d) => sourceGraphClickCallback(d[0]) )
        updateSel.select(".sourcegraph-text")
                .text( (d) => d[0]+" - "+d[1])
        /*updateSel.select(".sourcegraph-chart")
                .text( "updated") // just for proof of concept*/
        updateSel.select(".sourcegraph-chart")
            .select('svg')
                .attr('id', (d) => "sourcegraph-chart-"+d[0])
            .selectAll('*')
                .remove()

        // Generate container / textbox / svg for each displayed source
        const enterTopLevel = enterSel
            .append('div')
                .attr('class', "sourcegraph-container")
                .on("click", (d) => sourceGraphClickCallback(d[0]) )
        enterTopLevel.append('div')
                .attr('class', "sourcegraph-text")
                .text( (d) => d[0]+" - "+d[1])
        enterTopLevel
            .append('div')
                .attr('class', "sourcegraph-chart")
            .append('svg')
                .attr('id', (d) => "sourcegraph-chart-"+d[0])
                .attr('viewBox', "-20 0 500 220")
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .call(this.drag);
        // exit selection
        exitSel.remove()

        let parentDiv = $(".sourcegraph-chart")[0];
        let margin = {top: 10, right: 10, bottom: 10, left: 10}
        let width = parentDiv.clientWidth - margin.left - margin.right;
        let height = parentDiv.clientHeight - margin.top - margin.bottom;

        const maxMentions = [...timeseriesData.values()].reduce( (acc, value) => {
            const maxMentionsForSource = [...value.values()].reduce( (acc, e) => Math.max(acc,e), 0 )
            return Math.max(acc, maxMentionsForSource)
        }, 0)

        const sourcesNames = [...perSourceCumulativeCount.keys()]
        sourcesNames.forEach( (name) => {
            this.drawChart(name, timeseriesData, maxMentions, width, height, margin)
        })
    }


            /*  Given a source name, will find the suitable container div
             *  and draw the source graph
             */
    drawChart(sourceName, timeseriesData, maxMentions, width, height, margin) { // https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0

            // data
        let datepoints = [...[...timeseriesData.values()][0].keys()].sort()
        let timeseriesArrayData = [...timeseriesData.get(sourceName).entries()]
            // keep only hh:mm
        timeseriesArrayData = timeseriesArrayData.map( (elem) => {
            return [( (parseInt(elem[0]) % 10**6) / 10**2 ).toString(), elem[1]]
        });
        datepoints = datepoints.map( (elem) => {
            return ( (parseInt(elem) % 10**6) / 10**2 ).toString()
        });
        /*const maxMentions = timeseriesArrayData.reduce( (acc, curr) => {
            if (curr[1] > acc) { return curr[1] }
            else { return acc }
        }, 0)*/
        let digits_length = Math.log(maxMentions) * Math.LOG10E + 1 | 0;
        let x_axis_space = digits_length * 6

        // x-scale
        const maxTickNumber = 9
        const modulo = Math.ceil(datepoints.length/maxTickNumber)
        const xAxis_ticks = datepoints.filter( (elem,index) => !(index % modulo) )
        this.xScale = d3.scalePoint()
            .domain(datepoints)
            .rangeRound([0, width-x_axis_space]);

        // y-scale
        this.yScale = d3.scaleLinear()
            .domain([0, maxMentions]) // input
            .range([height - margin.bottom, 0]); // output

        // Line generator
        var line = d3.line()
            .x( (d) => { return this.xScale(d[0]); }) // set the x values for the line generator
            .y( (d) => { return this.yScale(d[1]); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // Data and selections
        let svg = document.getElementById("sourcegraph-chart-"+sourceName)
        svg = d3.select(svg)
            .append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let selPath = svg.selectAll("path")
            .data([timeseriesArrayData])  // here, []
        let selCircles = svg.selectAll("circle")
            .data(timeseriesArrayData)    // here, no []

        // Update viz
        selPath
            .enter()
                .append("path")
            .merge(selPath)
                .attr("class", "line")
                .attr("d", line);
        selCircles
            .enter()
                .append("circle")
            .merge(selCircles)
                .attr("class", "circle")
                .attr("cx", (d) => { return this.xScale(d[0])})
                .attr("cy", (d) => { return this.yScale(d[1])})
                .attr("r", 2)
        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(this.xScale)
                .tickValues(xAxis_ticks)
                .tickFormat( (d,i) => d.length<3 ?
                    "00:"+d[0]+d[1] :
                    d.length < 4 ?
                        "0"+d[0]+":"+d[1]+d[2] :
                        d[0]+d[1]+":"+d[2]+d[3]
                )
            );
        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(this.yScale).ticks(3));
    }

}
