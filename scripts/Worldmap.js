
import {log, info, warn, err} from './utils.js'
import {eventOnMouseOver, eventOnMouseOut, eventOnMouseClick} from './mouseEvents.js'

/*
    A worldmap object
 */
export class Worldmap {

  constructor(svg, outlineJsonPromise) {

        //  g groups drawn elements so that applying a transformation
        //  to g applies it to all its children
        this.svg = svg;
        this.g = this.svg.append("g")

        // Zoom definition
        this.currentZoomTransform = "matrix(1 0 0 1 0 0)"    // identity svg transform
        this.zoom_handler = d3.zoom()
            .scaleExtent([1,8])
            .on("zoom", this.applyZoom.bind(this))
        this.svg.call(this.zoom_handler)

        // Define outline and behavior when it resolves
        this.outlinePromise = outlineJsonPromise;
        this.outlinePromise.then( (result) => {

            if (result==undefined) {
                err ("Map : Undefined outlineData");
                return;
            }

            const w = this.svg.style("width").replace("px", "");
            const h = this.svg.style("height").replace("px", "");
            const scale0 = (w - 1) / 2 / Math.PI;

            this.projection = d3.geoLarrivee()//.fitSize([w, h], result);
            this.path = d3.geoPath().projection(this.projection);

            // Store data and draw outline
            this.outlineData = result;
            this.drawOutline();
        });

        // Define initial overlay data in order to concatenate afterwards
        this.overlayData = [];

        // Define the div for the tooltip
        this.tooltip = d3.select("body")
          .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        info ("Constructed worldmap");
    }

    /*
       Load new data for the  overlay, data promise is attached to field
     */
    updateOverlay(data_promise) {

        // Make sure outline already resolved
        Promise.all([this.outlinePromise, data_promise]).then((results) => {

          // Update event data and redraw it
          this.overlayData = this.overlayData.concat(results[1]);
          this.drawOverlay();
        });
    }

    applyZoom () {
        const transform = d3.event.transform;
        this.currentZoomTransform = transform;
        /*if (transform.k > 1.2) {
            // do something to disable scaling ??
        }*/
        this.g.attr('transform', transform);
    }

    /*
        Draws the countries outline
     */
    drawOutline() {

        const sel = this.g.selectAll("path")
            .data(this.outlineData.features)

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
    drawOverlay() {

        // Enter data
        let events = this.g
            .selectAll("circle")
            .data(this.overlayData);

        // Enter Selection
        let circles = events.enter()
            .append("circle")
              .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0])
              .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1])
              .attr("r", "0px")
              .attr("fill", "grey");

        circles.on('mouseover', (d) => eventOnMouseOver(d, this.tooltip))
               .on('mouseout', (d) => eventOnMouseOut(d, this.tooltip))
               .on('click', (d) => eventOnMouseClick(d, this));

        // Need to separate transition otherwise Tooltips don't work
        circles.transition()
              .duration(500)
              .delay(200)
              .attr("fill", "orange")
              .attr("r", "1px");
    }

}
