
import {log, info, warn, err} from './utils.js'

import {D3Handler} from './AnimationStyling.js'
import {TimeManager} from './TimeManager.js'


let dragManagerMaker = function (xScale, yScale, bandselectCallback) {

    let bandPos = [undefined, undefined]

    function onDrag() {

        const draggedElem = this

        let pos = d3.mouse(this)[0];    // only care about x component
        let svg = d3.select(this).select('svg')

        function rectAttributes(selection){
            err("Running rectAttributes")
            warn("rect : ", bandPos)
            selection
                /*.attr("height", draggedElem.height)
                .attr("width", bandPos[1]-bandPos[0])
                .attr("x", bandPos[0])
                .attr("y", 0)
                .attr("opacity", 0.3)
                .attr("fill", "black")*/
                .attr("height", "97%")
                .attr("width", bandPos[1]-bandPos[0])
                .attr("x", bandPos[0])
                .attr("y", 0)
                .attr("opacity", 0.5)
                .attr("fill", "black")
        }

        // If no drag currently registered, register
        if (bandPos[0] == undefined) {
            bandPos[0] = pos
            bandPos[1] = pos

            let selection = svg.append("rect")
            rectAttributes(selection)

        // Else, update registered drag move
        } else {
            if (pos<bandPos[0]) {
                bandPos[0] = pos
            } else {
                bandPos[1] = pos
            }

            let selection = svg.select("rect")
            rectAttributes(selection)
        }
    }

    function onDragEnd () {

        let pos = d3.mouse(this)[0];    // only care about x component
        let svg = d3.select(this).select('svg')

        if (xScale==undefined || yScale==undefined) {
            warn ("dragEnd : scaled are undefined")
            return
        }

        var timeStart = xScale.invert(bandPos[0]);
        var timeEnd = xScale.invert(bandPos[1]);
        err ("Drag selected : ", timeStart, timeEnd)

        bandPos = [-1, -1];
        svg.select("rect").remove()

        const sourceName = this.innerText.split(" ")[0]
        bandselectCallback(sourceName, timeStart, timeEnd)
    }

    return {onDrag, onDragEnd}

}


export class SourceGrapher {

    constructor (worldmapRef) {
        // Some data structures
        this.d3h = new D3Handler()
        this.worldmapRef = worldmapRef;

        this.xScale = undefined
        this.yScale = undefined

        this.drag = d3.drag()
        this.dragger = dragManagerMaker(undefined, undefined, this.worldmapRef)
        this.drag.on("drag", this.dragger.onDrag)
        this.drag.on("end", this.dragger.onDragEnd)

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
    display_source(timeseriesData, perSourceCumulativeCount, timestamps, sourceBandselectCallback){

            // divs data
        let divData = [...perSourceCumulativeCount.entries()]
        const getSourceName = (thisElement) => thisElement.children[0].innerHTML.split(" - ")[0];

            // Compute selections and update data
        let [enterSel, updateSel, exitSel] = this.d3h.mkSelections(
            d3.selectAll('#sidebardiv').selectAll("div.sourcegraph-container"),
            divData
        )

        // update selection
        //updateSel.on("click", (d) => sourceGraphClickCallback(d[0]) )
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
                .call(this.drag);
        enterTopLevel.append('div')
                .attr('class', "sourcegraph-text")
                .text( (d) => d[0]+" - "+d[1])
        enterTopLevel
            .append('div')
                .attr('class', "sourcegraph-chart")
            .append('svg')
                .attr('id', (d) => "sourcegraph-chart-"+d[0])
                .attr('viewBox', "-20 0 530 170")
                .attr('preserveAspectRatio', 'xMidYMid meet')
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
            this.drawChart(name, timeseriesData, maxMentions, width, height, margin, sourceBandselectCallback)
        })
    }


            /*  Given a source name, will find the suitable container div
             *  and draw the source graph
             */
    drawChart(sourceName, timeseriesData, maxMentions, width, height, margin, sourceBandselectCallback) { // https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0

            // some data
        let datepoints = [...[...timeseriesData.values()][0].keys()].sort()
        let timeseriesArrayData = [...timeseriesData.get(sourceName).entries()]
            // keep only hh:mm
        /*timeseriesArrayData = timeseriesArrayData.map( (elem) => {
            return [( (parseInt(elem[0]) % 10**6) / 10**2 ).toString(), elem[1]]
        });
        datepoints = datepoints.map( (elem) => {
            return ( (parseInt(elem) % 10**6) / 10**2 ).toString()
        });*/
        let digits_length = Math.log(maxMentions) * Math.LOG10E + 1 | 0;
        let x_axis_space = digits_length * 6

        // x-scale
        const maxTickNumber = 9
        const modulo = Math.ceil(datepoints.length/maxTickNumber)
        this.xScale = d3.scaleTime()
            .domain([ TimeManager.timestampToDate(datepoints[0]),
                      TimeManager.timestampToDate(datepoints[datepoints.length-1]) ]) // input
            .rangeRound([0, width-x_axis_space]); // output

        // y-scale
        this.yScale = d3.scaleLinear()
            .domain([0, maxMentions]) // input
            .range([height - margin.bottom, 0]); // output

        // with x and y scales, create dragManager
        this.dragger = dragManagerMaker(this.xScale, this.yScale, sourceBandselectCallback);
        this.drag.on("drag", this.dragger.onDrag)
        this.drag.on("end", this.dragger.onDragEnd)

        // Line generator
        var line = d3.line()
            .x( (d) => { return this.xScale(TimeManager.timestampToDate(d[0])); }) // set the x values for the line generator
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
                    .ticks(5)
                    .tickFormat( (d,i) => {
                        d = TimeManager.dateToTimestamp(d).toString().slice(8,12)
                        return d.length<3 ?
                                    "00:"+d[0]+d[1] :
                                    d.length < 4 ?
                                        "0"+d[0]+":"+d[1]+d[2] :
                                        d[0]+d[1]+":"+d[2]+d[3]
                    })
            );
        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(this.yScale).ticks(3));
    }

}
