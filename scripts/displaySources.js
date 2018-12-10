
function add_charts(data) {
    data.forEach(
    (value, mention) => {
        var objTo = document.getElementsByClassName('active')[1]

        var divtest = document.createElement("div");
        divtest.className = "visualize-source-container"

        var divtest0 = document.createElement("div");
        divtest0.className = "visualize-source-mention"

        var divtest1 = document.createElement("div");        
        divtest1.className = "visualize-source-mention-chart"

        var svgtest0 = document.createElement("svg")
        svgtest0.className = "bar-chart"
        svgtest0.setAttribute("xmlns", "http://www.w3.org/2000/svg")

        divtest1.appendChild(svgtest0)
        divtest.appendChild(divtest0)
        divtest.appendChild(divtest1)
        objTo.appendChild(divtest)
    })
}

function addDiv(data) {
    var source_container = document.getElementsByClassName('visualize-source-container')

    if (source_container.length === 0){
        add_charts(data)

        data.forEach((value, mention) => {
            console.log("value: ", value)
            make_bar_chart(value.map((x,y) => x[0]))
        })
    } else {

        var index_container = 0
        data.forEach(
            (value, mention) => {
                var chart_container = source_container[index_container]
                $(chart_container).empty()

                var divtest0 = document.createElement("div");
                divtest0.className = "visualize-source-mention"
                divtest0.innerHTML = "1"

                var divtest1 = document.createElement("div");
                divtest1.className = "visualize-source-mention-chart"

                var svgtest0 = document.createElement("svg")
                svgtest0.className = "bar-chart"

                chart_container.appendChild(divtest0)

                divtest1.appendChild(svgtest0)
                chart_container.appendChild(divtest1)

                make_bar_chart(value.map((x,y) => x[0]))

                index_container++
        })
    }
}

function display_source(data, cumulative_data, timestamps){

    // var mention_number = Array.from(data.values(), (x, y) => x[0][0])
    // var mention_timestamp = Array.from(data.values(), (x, y) => x[0][1])

    console.log("data: ", data)
    console.log("cumumulative_data: ", cumulative_data) 
    $('.visualize-source-container').css('height', 'calc(100%/' + Array.from(data).length + ')');
    $('.visualize-source-container').empty()




    var divParent = d3.select('#sidebardiv')
                    .selectAll('div')
                    .data(Array.from(data)).enter()
                    .append('div')
                    .attr('class', "visualize-source-container")
                    // .style('height', height + "px")

    var divMention = d3.selectAll(".visualize-source-container")
                    .append('div')
                    .attr('class', "visualize-source-mention")
                    .text(function (d) {return d[0]})


    var divMentionChart = d3.selectAll(".visualize-source-container")
                    .append('div')
                    .attr('class', "visualize-source-mention-chart")
                    .text(function (d) {return d[1]})




    // data.forEach((value, source) => {
    //     timestamps.forEach( time => {
    //         if (value.has(time)){
    //             // console.log(value.get(time))
    //         } else {
    //             value.set(time, 0)
    //         }
    //     })
    // })

    // console.log(data)


    // console.log("values: ", data.values())
    // console.log("keys: ", data.keys())
    // addDiv(data)
}

function make_bar_chart(dataset){
    
    dataset = Array.from(dataset)
    var svgWidth = document.getElementsByClassName("visualize-source-mention-chart")[0].offsetWidth;
    var svgHeight = document.getElementsByClassName("visualize-source-mention-chart")[0].offsetHeight;
    var barPadding = 0;
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

function make_line_chart(){
    var svgWidth = document.getElementsByClassName("visualize-source")[0].offsetWidth, svgHeight = 200, barPadding = 5;
    var barWidth = (svgWidth / dataset.length);

    var svg = d3.selectAll('.bar-chart')
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // var width = document.getElementById('vis')
    //     .clientWidth;
    // var height = document.getElementById('vis')
    //     .clientHeight;

    var margin = {
        top: 10,
        bottom: 100,
        left: 100,
        right: 120
    };

    var svg = d3.select('#vis')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip');

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var dateParse = d3.timeParse('%Y %b');
    var tooltipFormat = d3.timeFormat('%B %Y');

    var x_scale = d3.scaleTime()
        .range([0, width]);

    var y_scale = d3.scaleLinear()
        .range([height, 0]);

    var band_scale = d3.scaleBand()
        .range([0, width]);

    var line = d3.line()
        .x(function(d) {
            return x_scale(dateParse(d.date));
        })
        .y(function(d) {
            return y_scale(+d.value);
        })
        .curve(d3.curveBasis);

    var x_axis = d3.axisBottom()
        .scale(x_scale);

    var y_axis = d3.axisLeft()
        .scale(y_scale);

    var data;

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + height + ')');

    svg.append('g')
        .attr('class', 'y axis')

    d3.csv('unemployment_monthly.csv', function(csv_data) {
        data = csv_data;

        y_scale.domain([0, d3.max(csv_data, function(d) {
            return +d.value;
        })]);

        draw("2014");

        function draw(year) {

            year_data = data.filter(function(d) {
                return dateParse(d.date)
                    .getFullYear() === +year;
            });

            x_scale.domain(d3.extent(year_data, function(d) {
                return dateParse(d.date);
            }));

            band_scale.domain(year_data.map(function(d) {
                return dateParse(d.date);
            }));

            var lines = svg.selectAll('.line')
                .data([year_data]);

            lines
                .enter()
                .append('path')
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .merge(lines)
                .transition()
                .attr('d', line);

            var bars = svg.selectAll('.bar')
                .data(year_data);

            bars
                .exit()
                .remove();

            bars
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', function(d) {
                    return band_scale(dateParse(d.date));
                })
                .attr('width', band_scale.bandwidth())
                .attr('height', height)
                .attr('y', 0)
                .attr('fill', 'black')
                .attr('opacity', 0)
                .on('mouseover', mouseOver)
                .on('mousemove', mouseMove)
                .on('mouseout', mouseOut);

            d3.select('.x.axis')
                .call(x_axis);

            d3.select('.y.axis')
                .transition()
                .call(y_axis);

            function mouseOver(d) {
                var date = dateParse(d.date);
                var displayDate = tooltipFormat(date);

                d3.select(this)
                    .transition()
                    .style('opacity', 0.3);

                tooltip
                    .style('display', null)
                    .html('<p>Date: ' + displayDate + '<br>Unemployment Rate: ' + d.value + '%</p>');
            };

            function mouseMove(d) {
                tooltip
                    .style('top', (d3.event.pageY - 20) + "px")
                    .style('left', (d3.event.pageX + 20) + "px");
            };

            function mouseOut(d) {
                d3.select(this)
                    .transition()
                    .style('opacity', 0)

                tooltip
                    .style('display', 'none');
            };

            var slider = d3.select('#year');
            slider.on('change', function() {
                draw(this.value);
            });
        }
    });
}
 export {
    make_bar_chart, make_line_chart,
    display_source
}