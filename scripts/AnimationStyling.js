import {eventOnMouseOver, eventOnMouseOut, eventOnMouseClick} from './mouseEvents.js'
import {log, info, warn, err} from './utils.js'

/*
    Handler of D3 for the world map. 
    All logic regarding D3 for the visualization on the world map.
*/
export class D3Handler {

    constructor() {
      this.EventPointOpacity = 0.5;

    }

    /*  
        Given a D3 DOM selection (e.g. 'this.g.selectAll("circle")')
        and some data, generates the enter, update, and exit selections
     
        We only want to append one element to our enter selection, we
        can pass it as "appendElem", and a merge selection will be returned
        as well
    */
    mkSelections (domObjectSelection, data, enterAppend=undefined) {
        const updateSel = domObjectSelection.data(data);
        const exitSel = updateSel.exit()
        if (enterAppend == undefined) {
            const enterSel = updateSel.enter()
            return [enterSel, updateSel, exitSel]
        } else {
            const enterSel = updateSel.enter().append(enterAppend)
            const mergeSel = updateSel.merge(enterSel)
            return [enterSel, updateSel, mergeSel, exitSel]
        }
    }

    /*  
        Places invisible points (r=0) according to the projection
        To be combined with a "pop-in" transition
     */
    invisibleCirclesCorrectLocation(circles, projection) {

        circles
            .attr("cx", (d) => projection([d["Long"], d["Lat"]])[0])
            .attr("cy", (d) => projection([d["Long"], d["Lat"]])[1])
            .attr("r", 0)
    }

    // Apply the point style of events to the selection, non-animated
    applyEventPointStyleStatic (selection, projection, colorMapping) {

        selection
            .attr("cx", (d) => projection([d["Long"], d["Lat"]])[0])
            .attr("cy", (d) => projection([d["Long"], d["Lat"]])[1])
            .attr("fill-opacity", this.EventPointOpacity)
            .attr("fill", (d) => colorMapping(d))
            .attr("stroke-width", 0.05)
            .attr("stroke", (d) => colorMapping(d))
            .attr("r", 0.3);
    }

    updateCategorySelection(circles, selected, colorMapping, updateStepDuration) {

        circles.transition()
            .duration(updateStepDuration/2)
            .attr("fill", (d) => selected(d) ? colorMapping(d) : "gray")
            .attr("r", (d) => selected(d) ? 0.3 : 0);

        circles
            .attr("fill-opacity", this.EventPointOpacity)
            .attr("stroke-width", 0.05)
            .attr("stroke", (d) => colorMapping(d));
    }

    pulseEntrance(circles, selected, colorMapping, updateStepDuration) {
        // Pulse stroke
        let highlightedCircles = circles
            .transition().duration(updateStepDuration/2)
            .attr("fill", (d) => selected(d) ? "red" : "gray")
            .attr("r", (d) => selected(d) ? 2 : 0);

        this.updateCategorySelection(highlightedCircles, selected, colorMapping, updateStepDuration);
    }

    // Lazy heatmap : stack many large, transparent circles with added offset
    easyHeatMap (dataSelection, projection, opacity, radius, maxOffset=0.5) {
        const randOffset = () => maxOffset*(Math.random()-0.5)*2
        dataSelection
            .attr("cx", (elem) => projection( [elem["Long"], elem["Lat"]] )[0] + randOffset() )
            .attr("cy", (elem) => projection( [elem["Long"], elem["Lat"]] )[1] + randOffset() )
            .attr("fill-opacity", opacity)
            .attr("r", radius)
            .attr("stroke-width", 0)
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('click', () => {})
    }
}