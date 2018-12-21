import {EventCodes} from './EventCodes.js'


function eventOnMouseOver(d, tooltip, htmlContent=undefined) {

  tooltip.transition()
    .duration(100)
    .style("visibility", "visible")
    .style("opacity", 0.9)
    .style("background", "black");

  if (htmlContent == undefined){
    tooltip.html(tooltipHTML(d))
      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 50 ) + "px");
  } else {
      tooltip.html(htmlContent)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 50 ) + "px");
  }

}

function eventOnMouseOut(d, tooltip) {
  tooltip.transition()
        .duration(100)
        .style("visibility", "hidden");
}

function eventOnMouseClick(d, that) {
  // Open event in new tab
  window.open(d['Source']);
}

function tooltipHTML(d) {

  let ec = new EventCodes();

  return '<div class="tooltip-box">' +
           '<div class="tooltip-title">' +
            '<span class="tooltip-title-text">EventID: ' + d['ID'] + '</span>' +
           '</div>' +
           '<div class="tooltip-content">' +
             '<div class="tooltip-names">' +
               '<span class="tooltip-elem"><b>Time</b></span>' + " </br>" +
               '<span class="tooltip-elem"><b>Location</b></span>' + " </br>" +
               '<span class="tooltip-elem"><b>Type</b></span>' + " </br>" +
               '<span class="tooltip-elem"><b>Actor 1</b></span>' + " </br>" +
               '<span class="tooltip-elem"><b>Actor 2</b></span>' + " </br>" +
             '</div>' +
             '<div class="tooltip-values">' +
               '<span class="tooltip-elem">' + timestampToDate(d['Timestamp']) + '</span>' + " </br>" +
               '<span class="tooltip-elem">' + d['Action_Location'] + '</span>' + " </br>" +
               '<span class="tooltip-elem">' + ec.codes[d['Code']].name + '</span>' + " </br>" +
               '<span class="tooltip-elem">' + d['Actor1'] + '</span>' + " </br>" +
               '<span class="tooltip-elem">' + d['Actor2'] + '</span>' + " </br>" +
             '</div>' +
           '</div>' +
         '</div>';
}

function timestampToDate(t) {
  console.log(t)
  let ts = t.toString()
  let d = new Date(Number(ts.slice(0, 4)), Number(ts.slice(4, 6))-1, Number(ts.slice(6, 8)), Number(ts.slice(8, 10)));
  return d.toTimeString().slice(0, 8);
}

export {
    eventOnMouseOver, eventOnMouseOut,
    eventOnMouseClick
}
