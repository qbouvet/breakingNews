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
    d3.json("data/geojson/world.json", function(error, jsondata) {

        console.log("[INFO] Processing world geoJson");

        // Compute projection scale and translation based on geo json bounds
        const b = path.bounds(jsondata);
        const scale = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h);
        const translate = [(w - scale * (b[1][0] + b[0][0])) / 2, (h - scale * (b[1][1] + b[0][1])) / 2];

        // Apply to projection
        projection.scale(scale).translate(translate);

        // Enter data points
        mainSvg.selectAll("path")
            .data(jsondata.features)
            .enter()
            .append("path")
            .attr("d", path);
    });
}

whenDocumentLoaded(main);

