
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
const log = logger("");
const info = logger("[INFO]")
const warn = logger("[WARN]")
const err = logger("[ERR]")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



    /* A worldmap object
     */ 
class worldmap {
    
    constructor (svg, outlinejson) {
        
        this.svg = svg

            // Scaling is now done when drawing the outline 
            // since we need the dataset to compute boundaries
        this.projection = undefined;
        this.path = undefined;
        this.outlineReady = false;
        
            // datasets
        this.outlineData = undefined;
        this.overlayData = undefined;
    }
    
        /*  Draws the countries outline, with or without new data-
         */
    drawOutline (jsonpath=null) {
        var _draw = (outlineData) => {
            log ("Map : drawing outline")

                // scaling should be done at each draw
            this.w = this.svg.style("width").replace("px", "");
            this.h = this.svg.style("height").replace("px", "");
            this.projection = d3.geoLarrivee().fitSize([this.w, this.h], outlineData)
            this.path = d3.geoPath().projection(this.projection);

            this.svg.selectAll("path")
                .data(outlineData.features)
                .enter()
                    .append("path")
                    .attr("d", this.path);
                    
            this.outlineReady = true;
            if (this.overlayData != undefined) {
                this.drawOverlay()
            }
        }
        if (jsonpath===null) {_draw(this.outlineData)}
        else {
            d3.json(jsonpath, (error, outlineData) => {
                if (error != null) {err(error)}
                log("Map : updating outline -> ", jsonpath);
                _draw(outlineData)
                this.outlineData = outlineData
            });
        }
    }
        
        /*  Draws the overlay, with or without new data
         *  Complete data update sequence
         */
    drawOverlay (jsonpath=null) {
        var _draw = (overlayData) => {
            var selection = d3.select("#mainSvg")
                .selectAll("circle")
                .data(overlayData)
            // exit selection
            selection.exit()    
                .transition().duration(500)
                    .attr("fill", "black")
                    .attr("r", "9px") 
                .transition().duration(2000)
                    .attr("r", "1px")
                .remove();   
            // update selection
            selection         
                .transition().duration(500)     // 1. copy of exit() selection 
                    .attr("fill", "black")
                    .attr("r", "9px") 
                .transition().duration(500)
                    .attr("r", "1px")
                /*.transition().duration(10)
                    // !! hidden must absolutely be kept in it own transition
                    .attr("visibility", "hidden")  */
                .transition().duration(500)     // 2. quickly move the invisible point to their correct position
                    .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0] )
                    .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1] )
                .transition().duration(3000)    // 3. copy of enter() selection
                    .attr("fill", "green") 
                    .attr("r", "6px")    
            // enter selection
            selection.enter()   
                .append("circle")
                .attr("cx", (d) => this.projection([d["Long"], d["Lat"]])[0] )
                .attr("cy", (d) => this.projection([d["Long"], d["Lat"]])[1] )
                .attr("r", "0px")   
                .attr("fill", "grey")
                .transition().duration(3000)
                    .delay(1500)
                    .attr("r", "6px")
                    .attr("fill", "red")
        }
        if (jsonpath===null) {_draw(this.overlayData)}
        else {
            d3.json(jsonpath, (error, overlayData) => {
                if (error != null) {err(error)}
                log("Map : updating overlay -> ", jsonpath);
                if (this.outlineData !== undefined) {
                    // draw the overlay *only* after the outline
                    _draw(overlayData)
                }
                this.overlayData = overlayData
            });
        }
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
    
    let datasets = ["data/gdeltjson/sample3.json",
                    "data/gdeltjson/20181105140000.export.json",
                    "data/gdeltjson/20181105141500.export.json"
                    ]
    let dsindex = 0;

    // Map object
    const mainSvg = d3.select("#mainSvg");
    const map = new worldmap(mainSvg)

    // Load world map
    map.drawOutline("data/geojson/world.json")
    
    // load overlay 
    map.drawOverlay(datasets[dsindex])
    
    // doesn't work -> Maybe we need to remove all data and add it again 
    // (like, if it's already full of data, nothing will happen when you 
    //  enter() the same data, even with a newer projection)
    // window.addEventListener('resize', () => map.redraw())
    
    d3.select("#mainSvg")
        .on("click", () => {
            dsindex = (dsindex + 1) % datasets.length;  
            map.drawOverlay(datasets[dsindex]);
        });
    
    //make a bar chart as place holder
    make_bar_chart()
}

whenDocumentLoaded(main);


