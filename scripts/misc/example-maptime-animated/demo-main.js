// https://github.com/maptime-ams/animated-borders-d3js#step-1-empty-website

function main () {
    
    console.log("Starting main")
    
    // select SVG canva & init data structures
    var svgStates = d3.select("svg #states"),
        states = {},
        startYear = 1790,
        currentYear = startYear;
    
    // also select borders
    var svgBoundary = d3.select("svg #boundary")
    
    // center projection (newer states will appear
    var width = window.innerWidth
    var height = window.innerHeight;
    var projection = d3.geo.albersUsa()
                        .translate([width / 2, height / 2]);
    var path = d3.geo.path()
        .projection(projection);
        
    // process boundary data
    d3.json("data/usa.json", function(error, boundary) {
        console.log("processing usa")
        svgBoundary.selectAll("path")
            .data(boundary.features).enter()
                .append("path")
                .attr("d", path)
    });

    // Process states data
    d3.json("data/states.json", function(error, topologies) { 
        console.log("processing states")
        // precompute data for all years
        for (var i = 0; i < topologies.length; i++) {
          states[startYear + i * 10] = topojson.feature(topologies[i], topologies[i].objects.stdin);
        }
        // enter data
        function update() {
            console.log("updating states")
            d3.select("#year").html(currentYear);
            svgStates.selectAll("path") 
                .data(states[currentYear].features).enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", function(d, i) {
                        var name = d.properties.STATENAM.replace(" Territory", "");
                        return colors[name];
                    })
                    .append("svg:title")
                    .text( d =>  d.properties.STATENAM );
        } 
        update()
        d3.select("#slider").call(
            chroniton()
                .domain([new Date(startYear, 1, 1), new Date(startYear + (topologies.length - 1) * 10, 1, 1)])
                .labelFormat( date =>  Math.ceil((date.getFullYear()) / 10) * 10 )
                .width(600)
                .on('change', date =>  { 
                    console.log("change emitted")
                    var newYear = Math.ceil((date.getFullYear()) / 10) * 10; 
                    if (newYear != currentYear) {
                        currentYear = newYear;
                        svgStates.selectAll("path").remove(); 
                        update(); 
                    }
                })
                .playButton(true)
                .playbackRate(0.2)
                .loop(true)
        );
    });
}

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else { // `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(main)
