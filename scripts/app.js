
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else { // `DOMContentLoaded` already fired
		action();
	}
}

function info () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[INFO]" + " ")
    console.log.apply(console, args);
}
var log = console.log;



    /* A worldmap object
     */ 
class worldmap {
    
    constructor (svg) {
        this.svg = svg
        this.w = this.svg.style("width").replace("px", "");
        this.h = this.svg.style("height").replace("px", "");
            // Init projection and path. Other good looking options : 
            //  - d3.geoMercator().scale(1).translate([0, 0])
            //  - d3.geoLarrivee().translate([(w/2)-60, (h/2)+60]).scale(170)
            //  - d3.geoEckert5().translate([(w/2)-50, (h/2)+40]).scale(250)
        //this.projection = d3.geoMercator().scale(1).translate([0, 0])
        this.projection = d3.geoLarrivee().translate([(this.w/2)-60, (this.h/2)+70]).scale(190)
        this.path = d3.geoPath().projection(this.projection);
            // datasets
        this.outlineData = undefined;
        this.overlayData = undefined;
    }
    
        /* Load new data for the countries outline
         */
    updateOutline (json) {
        info(" updating countries outline");
        this.outlineData = json
        this.redraw()
    }
    
        /* Load new data for the overlay
         */
    updateOverlay (json) {
        info("Map : updating overlay");
        this.overlayData = json
        this.redraw()
    }
    
    redraw () {
        info("Redrawing map")
        // check datasets exist
        if (this.outlineData == undefined || this.overlayData == undefined) {
            console.log("[WARN] map redraw() failed because of undefined data (this is likely to happen once at initialization of the object)")
            //log("outlineData : ", this.outlineData, "\n", "overlayData : ", this.overlayData)
            return
        }
        
        // 1. Draw outline        
            // Compute projection scale and translation based on geo json bounds
        const b = this.path.bounds(this.outlineData);
        this.w = this.svg.style("width").replace("px", "");
        this.h = this.svg.style("height").replace("px", "");
            // use this only with mercator transform
        const scale = .95 / Math.max((b[1][0] - b[0][0]) / this.w, (b[1][1] - b[0][1]) / this.h);
        const translate = [(this.w - scale * (b[1][0] + b[0][0])) / 2, (this.h - scale * (b[1][1] + b[0][1])) / 2];
            // Obtain new projection
        //this.projection.scale(scale).translate(translate);
        //this.path = d3.geoPath().projection(this.projection);
        
        info("svg size :", this.w, this.h)
        info("Transformation : scale=", scale, "translate=", translate)

        this.svg.selectAll("path")
            .data(this.outlineData.features)
            .enter()
                .append("path")
                .attr("d", this.path);
            
        // 2. Draw overlay 
        let selection = this.svg.selectAll("circle")
            .data(this.overlayData)
            
        selection.enter()
            .append("circle")
            .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0] )
            .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1] )
            .attr("r", "6px")
            .attr("fill", "red");
        
        selection.exit()
            .transition(3000)
            .attr("fill", "black")
            .remove()
    }

}


function main() {
    
    datasets = ["data/gdeltjson/sample2.json",
                "data/gdeltjson/sample1.json",
                "data/gdeltjson/20181105140000.export.json", 
                "data/gdeltjson/20181105141500.export.json", 
                "data/gdeltjson/20181105143000.export.json", 
                "data/gdeltjson/20181105144500.export.json", ]
    let dsindex = 0;

    // Map object
    const mainSvg = d3.select("#mainSvg");
    const map = new worldmap(mainSvg)

    // Load world map
    d3.json("data/geojson/world.json", (error, json) => map.updateOutline(json));
    
    // load overlay 
    d3.json(datasets[dsindex], (error, json) => map.updateOverlay(json));
    
    // doesn't work -> Maybe we need to remove all data and add it again 
    // (like, if it's already full of data, nothing will happen when you 
    //  enter() the same data, even with a newer projection)
    // window.addEventListener('resize', () => map.redraw())
    
    
    d3.select("#changeDatasetButton")
        .on("click", () => {
            dsindex = (dsindex + 1) % 4;  
            d3.json(datasets[dsindex], (error, json) => map.updateOverlay(json));
        });
    
    

}

whenDocumentLoaded(main);

