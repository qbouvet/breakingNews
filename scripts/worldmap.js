function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else { // `DOMContentLoaded` already fired
		action();
	}
}


function main() {
    
    var width = window.innerWidth,
        height = window.innerHeight
    
    var svgCountries = d3.select("#worldmap"),
        g = d3.select("#countries")
    
    /*  Other options : 
     *      - geoNaturalEarth1, geoEquirectangular 
     *  https://github.com/d3/d3-geo/blob/master/README.md#cylindrical-projections
     *      - ginzburg viii, eckert III/IV
     *  https://www.jasondavies.com/maps/transition/
     */
    var projection = d3.geoEqualEarth()
        .translate([width / 2, 30 + height / 2])
        .scale(250)
    var path = d3.geoPath()
        .projection(projection);
    
    d3.json("../data/geojson/world-countries-lowres.geojson", function(error, jsondata) {
        console.log("processing countries")
        svgCountries.selectAll("path")
            .data(jsondata.features)
            .enter()
            .append("path")
                .attr("d", path)
    });
}

whenDocumentLoaded(main)

