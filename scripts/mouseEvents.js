import {EventCodes} from './eventCodes.js'
import {make_bar_chart} from './displaySources.js'

function eventOnMouseOver(d, tooltip) {

  tooltip.transition()
    .duration(100)
    .style("visibility", "visible")
    .style("opacity", 0.9)
    .style("background", "black");

  tooltip.html(tooltipHTML(d))
    .style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY - 50 ) + "px");
}

function eventOnMouseOut(d, tooltip) {

  tooltip.transition()
        .duration(100)
        //.style("opacity", 0)
        .style("visibility", "hidden");
}

// TODO: remove
function eventOnMouseClick(d, that) {
  console.log(that)
  console.log("d: ", d)
  console.log("event id: ", d.ID)
  make_bar_chart()

  // Open event in new tab
  window.open(d['Source']);
}

function tooltipHTML(d) {

  let ec = new EventCodes();

  return "<b>Global Event ID:</b> " + d['ID'] + " </br>" +
    "<b>Location:</b> " + d['Action_Location'] + " </br>" +
    "<b>Actor 1:</b> " + d['Actor1'] + " </br>" +
    "<b>Actor 2:</b> " + d['Actor2'] + " </br>" +
    "<b>Type:</b> " + ec.codes[d['Code']].name + " </br>";
}

export {
    eventOnMouseOver, eventOnMouseOut,
    eventOnMouseClick
}
