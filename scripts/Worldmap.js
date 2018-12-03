
import {log, info, warn, err} from './utils.js'
import {DataLoader} from './DataLoader.js';
import {eventOnMouseOver, eventOnMouseOut, eventOnMouseClick} from './mouseEvents.js'

/*
    A worldmap object
 */
export class Worldmap {

  constructor(svg) {

        //  g groups drawn elements so that applying a transformation
        //  to g applies it to all its children
        this.svg = svg;
        this.g = this.svg.append("g");
        this.loader = new DataLoader();

        // Zoom definition
        this.currentZoomTransform = "matrix(1 0 0 1 0 0)"    // identity svg transform
        this.zoom_handler = d3.zoom()
            .scaleExtent([1,15])
            .on("zoom", this.applyZoom.bind(this))
        this.svg.call(this.zoom_handler)

        // Define outline and behavior when it resolves
        this.outlinePromise = this.loader.loadMapOutline();
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

        // Define events
        this.currentTimestamps = new Set();
        this.loadedEvents = {};
        this.flatEvents = [];

        // Categories selection
        this.currentCategories = new Set();
        this.selectionRadiusFunct = (d) => this.currentCategories.has(d["Class"]) ? "1px" : "0px";
        this.selectionColorFunct = (d) => this.currentCategories.has(d["Class"]) ? "orange" : "gray";

        // Define the div for the tooltip
        this.tooltip = d3.select("body")
          .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        info ("Constructed worldmap");

    }

    updateCategory(category, checked) {

      if (checked) {
        this.currentCategories.add(category);
      } else {
        this.currentCategories.delete(category);
      }

      // Update circles if events are already there
      if (this.flatEvents.length > 0) {

        this.g.selectAll("circle")
          .transition()
            .duration(1000)
            .delay(100)
            .attr("fill", this.selectionColorFunct)
            .attr("r", this.selectionRadiusFunct);
        }
    }

    /*
       Load new data for the overlay if necessary
     */
    updateEvents(timestamp, isForward) {

      if (isForward) {
        this.updateEventsForward(timestamp);
      } else {
        this.updateEventsBackward(timestamp);
      }
    }

    updateEventsForward(timestamp) {

      if (Object.keys(this.loadedEvents).includes(timestamp)) {

        info("Loading from events " + timestamp);

        // Update flatEvents with already loaded data
        this.flatEvents = this.flatEvents.concat(this.loadedEvents[timestamp]);
        this.drawOverlay();

      } else {

        info("Loading from file " + timestamp);

        // Load data // FIXME: remove category
        let data_promise = this.loader.loadEvents(timestamp);

        // Make sure outline already resolved
        Promise.all([this.outlinePromise, data_promise]).then((results) => {

          // Update event data and redraw it
          this.currentTimestamps.add(timestamp);
          this.loadedEvents[timestamp] = results[1];
          this.flatEvents = this.flatEvents.concat(results[1]);
          this.drawOverlay();
        });
      }
    }

    updateEventsBackward(timestamp) {

      // Remove timestamp from current ones
      info("Removing from current " + timestamp);
      this.currentTimestamps.delete(timestamp);

      // Rebuild flatEvents
      this.flatEvents = [];
      for (const timestamp in this.currentTimestamps) {
            this.flatEvents = this.flatEvents.concat(this.loadedEvents[timestamp]);
      }

      this.drawOverlay();
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
          .data(this.flatEvents);

      events.exit().remove();

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

      // Full entering transition // TODO: move all durations and consts to a separate place
      circles
        .transition()
          .duration(750)
          .delay(100)
          .attr("fill", (d) => this.currentCategories.has(d["Class"]) ? "red" : "gray")
          .attr("r", (d) => this.currentCategories.has(d["Class"]) ? "2px" : "0px")
        .transition()
          .duration(1000)
          .attr("fill", this.selectionColorFunct)
          .attr("r", this.selectionRadiusFunct);
    }

}
