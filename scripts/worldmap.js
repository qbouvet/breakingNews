
import {log, info, warn, err} from './utils.js'


/*
    A worldmap object
 */
export class Worldmap {
    
constructor(svg, outlineJsonPromise) {

            //  g groups drawn elements so that applying a transformation
            //  to g applies it to all its children
        this.svg = svg;
        this.g = this.svg.append("g")
        
        this.outlineData = outlineJsonPromise;
        
        this.currentZoomTransform = "matrix(1 0 0 1 0 0)"    // identity svg transform
        this.zoom_handler = d3.zoom()
            .scaleExtent([1,8])
            .on("zoom", this.applyZoom.bind(this))
        this.svg.call(this.zoom_handler)
        
        this.outlineData.then( (result) => {
            if (result==undefined) {
                err ("Map : Undefined outlineData")
                return
            }
            
            const w = this.svg.style("width").replace("px", "");
            const h = this.svg.style("height").replace("px", "");
            const scale0 = (w - 1) / 2 / Math.PI;
            
            this.projection = d3.geoLarrivee().fitSize([w, h], result);
            this.path = d3.geoPath().projection(this.projection);
            
            this.outlineData = result
            this.drawOutline(result)
        })
        
        info ("Constructed worldmap")
    }
    
    applyZoom () {
        const transform = d3.event.transform
        this.currentZoomTransform = transform
        this.g.selectAll('path')
            .attr('transform', transform)
        this.g.selectAll('circle')
            .attr('transform', transform)
    }

    /*
       Load new data for the  overlay, data promise is attached to field
     */
    updateOverlay(data_promise) {
        this.overlayData = data_promise;
    }

    /*
        Resolves data promises and acts according to results
     */
    draw() {

        Promise.all([this.outlineData, this.overlayData]).then((results) => {

            if (results[0] === undefined) {

                // Draw nothing if no outline nor overlay was set yet
                err('Draw called on map without outline data');

            } else if (results[1] === undefined) {

                // Draw only outline if no overlay has been set yet
                info('Draw called on map without events');
                this.drawOutline(results[0])

            } else {

                // Draw both outline and overlay
                this.drawOutline(results[0]);
                this.drawOverlay(results[1]);
            }

        })
    }

    /*
        Draws the countries outline
     */
    drawOutline(outlineData) {

        const sel = this.g.selectAll("path")
            .data(outlineData.features)
        
        //Update
        sel.attr("d", this.path);
        // Enter 
        sel.enter()
            .append("path")
            .attr("d", this.path);
        // Exit
        sel.exit()
            .remove()
    }

    /*
        Draws the overlay, with or without new data, complete data update sequence
     */
    drawOverlay(overlayData) {

        let selection = this.g
            .selectAll("circle")
            .data(overlayData);

        // Exit Selection
        selection.exit()
            .transition().duration(200)
                .attr("fill", "grey")
                .attr("r", "4px")
            .transition().duration(300)
                .attr("r", "0px")
            .remove();
        // Update Selection
        selection
            .transition().duration(200)     // 1. copy of exit() selection
                .attr("fill", "grey")
                .attr("r", "4px")
            .transition().duration(300)
                .attr("r", "0px") // alternatively, visibility:hidden
            .transition().duration(50)     // 2. quickly move the invisible point to their correct position
                .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0] )
                .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1] )
            .transition().duration(500)    // 3. copy of enter() selection
                .attr("fill", "green")
                .attr("r", "3px");
        // Enter Selection
        selection.enter()
            .append("circle")
            .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0] )
            .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1] )
            .attr("transform", this.currentZoomTransform)
            .attr("r", "0px")
            .attr("fill", "grey")
            .transition()
                .duration(500)
                .delay(550)
                .attr("fill", "green")
                .attr("r", "3px")
    }

}
