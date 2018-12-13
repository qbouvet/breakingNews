
import {log, info, warn, err} from './utils.js'
import {DataLoader} from './DataLoader.js';
import {D3Handler} from './AnimationStyling.js'
import {eventOnMouseOver, eventOnMouseOut, eventOnMouseClick} from './mouseEvents.js'
import {SelectionMenu} from './SelectionMenu.js';

/*
    A worldmap object
 */
export class Worldmap {

    constructor(eventsDataBroker) {

        //  g groups drawn elements so that applying a transformation
        //  to g applies it to all its children
        this.svg = d3.select("#mainSvg");;
        this.g = d3.select("#mapContent");
        this.loader = new DataLoader();
        this.D3 = new D3Handler();

        // Zoom definition
        let w = this.svg.style("width").replace("px", "");
        let h = this.svg.style("height").replace("px", "");
        this.currentZoomTransform = "matrix(1 0 0 1 0 0)"    // identity svg transform
        this.zoom_handler = d3.zoom()
            .scaleExtent([1,15])
            .translateExtent([[0, 0], [w, h]])
            .on("zoom", this.applyZoom.bind(this))
        this.svg.call(this.zoom_handler)
        this.zoomScalingRatio = 1.0;

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
        this.eventsBroker = eventsDataBroker;
        this.currentTimestamps = [];
        //this.loadedEvents = {};
        this.flatEvents = [];

        // Categories selection
        this.SELECTION = new SelectionMenu((selectionCheck) => this.updateSelection(selectionCheck));

        // Define the div for the tooltip
        this.tooltip = d3.select("body")
          .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        info ("Constructed worldmap");

    }

    reset(updateStepDuration) {
      this.currentTimestamps = [];
      this.flatEvents = [];

      this.drawOverlay(updateStepDuration);
    }

    updateSelection(selectionCheck) {

      // Update circles if events are already there
      if (this.flatEvents.length > 0) this.D3.updateCategorySelection(this.g.selectAll("circle"), selectionCheck, 100); //FIXME: keep hardcoded?
    }

    /*
       Add or remove events to map depending on direction of update
     */
    updateEvents(timestamp, isForward, updateStepDuration) {
      isForward ? this.updateEventsForward(timestamp, updateStepDuration) : this.updateEventsBackward(timestamp, updateStepDuration);
    }

    updateEventsForward(timestamp, updateStepDuration) {
        function _process(timestamp, results=undefined) {
            this.currentTimestamps.push(timestamp);
            if (results == undefined) {
                this.flatEvents = this.flatEvents.concat(this.eventsBroker.loadedEvents(timestamp));
            } else {
                this.flatEvents = this.flatEvents.concat(results[1]);
            }
            this.drawOverlay(updateStepDuration);
        }

        if (this.eventsBroker.has(timestamp)) {
            _process.bind(this)(timestamp)
        } else {
            let data_promise = this.eventsBroker.load(timestamp)
            Promise.all([this.outlinePromise, data_promise]).then((results) => {
                _process.bind(this)(timestamp, results)
            })
        }
    }

    updateEventsBackward(timestamp, updateStepDuration) {

      // Remove timestamp from current ones
      info("Removing from currentTiemstamps " + timestamp);
      this.currentTimestamps.pop();
      info(" currentTimestamps : \n", this.currentTimestamps)

      // Rebuild flatEvents
      this.flatEvents = [];
      for (const t of this.currentTimestamps) {
         let tmp = this.eventsBroker.loadedEvents(t)
         this.flatEvents = this.flatEvents.concat(tmp);
      }
      this.drawOverlay(updateStepDuration);
    }

    applyZoom () {
        const transform = d3.event.transform;
        this.currentZoomTransform = transform;
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
    drawOverlay(updateStepDuration) {

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
      this.D3.pulseEntrance(circles, (d) => this.SELECTION.checkSelected(d), updateStepDuration);
    }

}
