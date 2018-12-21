# BREAKING NEWS


### Run this project 

You can run our visualization on [github pages](https://atobywankenobi.github.io/data-viz-project/)


### Project Description

*Breaking news* : an EPFL Data visualization project - COM-408 Data visualization - Prof. K. Benzi.

This projects is an interactive visualization showcasing evolution over time of events and related news articles over the course of a day on a world map.

The events are divided into 4 main categories: 

* Verbal cooperation
* Material cooperation
* Verbal conflict
* Material conflict

For each event category, a circle representing the event is displayed on the world map based on the geographical coordinates, with a different color for each category. Hovering over a circle displays a tooltip containing more information about the specific event and allows the user by clicking on it to open the first article related to the event. 
In the right panel, there are different line charts that display the variation over time of the number of mentions for the top sources. They are ordered by overall number of mentions. It is possible to click-and-drag over a graph (band-selection) to show which countries a source covered events in, over that period of time, shown by a cloropleth map.


### Project structure
 
* css
* data
* scripts
* index.html
* README.md

The project is hosted on github pages, for this reasons we chose events from one day, 5th november 2018. The events and mentions are json files found in data/gdelt.

In scripts, there are both python scripts to download data from [gdelt](https://www.gdeltproject.org/), clean and reduce them, and javascript files which implements the logic of the visualization.

In order to run it locally, fork/clone the repo and run a simple static server, like npm http-server and access index.html in google chrome.


### Authors

Tobia Albergoni, Quentin Bouvet, Gauthier Müller
