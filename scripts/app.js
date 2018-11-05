
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else { // `DOMContentLoaded` already fired
		action();
	}
}

function main() {

    // D3 selections
    const mainSvg = d3.select("#mainSvg");

    // Get SVG dimensions
    const w = mainSvg.style("width").replace("px", "");
    const h = mainSvg.style("height").replace("px", "");
    console.log("[INFO] SVG dimensions (" + w + ", " + h + ")");

    // Init projection and path
    const projection = d3.geoMercator()
        .scale(1)
        .translate([0, 0]);

    const path = d3.geoPath().projection(projection);

    // Load world's geo json
    d3.json("data/geojson/world.json", function(error, json) {

        console.log("[INFO] Processing world geoJson");

        // Compute projection scale and translation based on geo json bounds
        const b = path.bounds(json);
        const scale = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h);
        const translate = [(w - scale * (b[1][0] + b[0][0])) / 2, (h - scale * (b[1][1] + b[0][1])) / 2];

        // Apply to projection
        projection.scale(scale).translate(translate);

        // Enter data points
        mainSvg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path);

        // Load and plot events
        loadEvents(mainSvg, projection);

    });

}

function loadEvents(svg, projection) {

    // Load events
    d3.json("data/gdeltjson/20181105140000.export.json", function(error, json) {

        console.log("[INFO] Processing event data");


        // Enter events data points
        svg.selectAll("circle")
            .data(json)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return projection([d["Long"], d["Lat"]])[0]; })
            .attr("cy", function (d) { return projection([d["Long"], d["Lat"]])[1]; })
            .attr("r", "1px")
            .attr("fill", "red");

    });
}

whenDocumentLoaded(main);

