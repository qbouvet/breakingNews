
import {log, info, warn, err} from './utils.js'
import {DataLoader} from './DataLoader.js';
import {D3Handler} from './AnimationStyling.js'
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
        this.D3 = new D3Handler();

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
        this.selected = (d) => this.currentCategories.has(d["Class"]);

        // Define the div for the tooltip
        this.tooltip = d3.select("body")
          .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        info ("Constructed worldmap");

    }

    /*
      Called when one of the checkboxes is checked or unchecked, updates current selection
    */
    updateCategory(category, checked) {

      // Add or remove from categories
      checked ? this.currentCategories.add(category) : this.currentCategories.delete(category);

      // Update circles if events are already there
      if (this.flatEvents.length > 0) this.D3.updateCategorySelection(this.g.selectAll("circle"), this.selected);
    }

    /*
       Add or remove events to map depending on direction of update
     */
    updateEvents(timestamp, isForward) {
      isForward ? this.updateEventsForward(timestamp) : this.updateEventsBackward(timestamp);
    }

    updateEventsForward(timestamp) {

      if (Object.keys(this.loadedEvents).includes(timestamp)) {

        // Update flatEvents with already loaded data
        info("Loading from events " + timestamp);
        this.flatEvents = this.flatEvents.concat(this.loadedEvents[timestamp]);
        
        this.drawOverlay();

      } else {

        info("Loading from file " + timestamp);
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

      // Exit selection
      events.exit().remove();

      // Enter Selection
      let circles = events.enter()
          .append("circle");

      // Place invisible events on map
      this.D3.invisibleCirclesCorrectLocation(circles, this.projection);

      circles.on('mouseover', (d) => eventOnMouseOver(d, this.tooltip))
             .on('mouseout', (d) => eventOnMouseOut(d, this.tooltip))
             .on('click', (d) => eventOnMouseClick(d, this));

      // Full entering transition
      this.D3.pulseEntrance(circles, this.selected);
    }

}
