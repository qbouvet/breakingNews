
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else { // `DOMContentLoaded` already fired
		action();
	}
}

function logger (prefix="") {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(prefix)
        console.log.apply(console, args);
    }
}
var log = logger("");
var info = logger("[INFO]")
var warn = logger("[WARN]")
var err = logger("[ERR]")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



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
        this.projection = d3.geoLarrivee().translate([(this.w/2)-60, (this.h/2)+70]).scale(190)
        this.path = d3.geoPath().projection(this.projection);
            // datasets
        this.outlineData = undefined;
        this.overlayData = undefined;
    }
    
        /* Load new data for the countries outline
         */
    updateOutline (jsonpath) {
        d3.json(jsonpath, (error, json) => {
            log(" Map : updating outline with : ", jsonpath);
            if (error != null) {
                err(error)
            }
            this.outlineData = json
            this.redraw()
        });
    }
    
        /* Load new data for the overlay
         */
    updateOverlay (jsonpath) {
        d3.json(jsonpath, (error, json) => {
            log(" Map = updating overlay with : ", jsonpath);
            if (error != null) {
                err(error)
            }
            this.overlayData = json
            this.redraw()
        });
    }
    
    async redraw () {
        log("Redrawing map")
        // check datasets exist
        if (this.outlineData == undefined || this.overlayData == undefined) {
            warn("map redraw() failed because of undefined data (this is likely to happen once at initialization of the object)")
            log("outlineData : ", this.outlineData, "\n", "overlayData : ", this.overlayData)
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
        //info("svg size :", this.w, this.h)
        //info("Transformation : scale=", scale, "translate=", translate)

        this.svg.selectAll("path")
            .data(this.outlineData.features)
            .enter()
                .append("path")
                .attr("d", this.path);
            
        // 2. Draw overlay 
        
        this.svg.selectAll("circle")
            .data([])
            .exit()
                .transition(1000)
                .attr("fill", "black")
                .attr("r", "1px")
                .remove()
        
        await sleep (500)
            
        this.svg.selectAll("circle")
            .data(this.overlayData)
            .enter()
                .append("circle")
                .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0] )
                .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1] )
                .attr("r", "6px")
                .attr("fill", "red")
            .exit()
                .transition(1000)
                .attr("fill", "black")
                .attr("r", "1px")
                .remove()
        
    }

}

function make_bar_chart(){
    var dataset = [80, 100, 56, 120, 180, 30, 40, 120, 160];

    var svgWidth = document.getElementsByClassName("visualize-source")[0].offsetWidth, svgHeight = 200, barPadding = 5;
    var barWidth = (svgWidth / dataset.length);


    var svg = d3.selectAll('.bar-chart')
        .attr("width", svgWidth)
        .attr("height", svgHeight);
        
    var barChart = svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("y", function(d) {
             return svgHeight - d 
        })
        .attr("height", function(d) { 
            return d; 
        })
        .attr("width", barWidth - barPadding)
        .attr("transform", function (d, i) {
            var translate = [barWidth * i, 0]; 
            return "translate("+ translate +")";
        });
}

function main() {
    
    let datasets = ["data/gdeltjson/sample1.json",
                    "data/gdeltjson/sample2.json",
                    "data/gdeltjson/sample3.json",
                    "data/gdeltjson/20181105140000.export.json",
                    "data/gdeltjson/20181105141500.export.json"
                    ]
    let dsindex = 0;

    // Map object
    const mainSvg = d3.select("#mainSvg");
    const map = new worldmap(mainSvg)

    // Load world map
    map.updateOutline("data/geojson/world.json")
    
    // load overlay 
    map.updateOverlay(datasets[dsindex])
    
    // doesn't work -> Maybe we need to remove all data and add it again 
    // (like, if it's already full of data, nothing will happen when you 
    //  enter() the same data, even with a newer projection)
    // window.addEventListener('resize', () => map.redraw())
    
    d3.select("#mainSvg")
        .on("click", () => {
            dsindex = (dsindex + 1) % datasets.length;  
            map.updateOverlay(datasets[dsindex]);
        });
    
    //make a bar chart as place holder
    make_bar_chart()



    

}

whenDocumentLoaded(main);

