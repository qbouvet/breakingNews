## Authors

Tobia, Quentin, Gauthier

## data-viz-project

[github pages](https://atobywankenobi.github.io/data-viz-project/)

## Project Description

Project *Breaking News* for EPFL course *COM-480 Data Visualization* given by professor K. Benzi.
The projects is an interactive visualization displaying evolution over time of world events and online reports over the course of a day on a 2D world map.
The events are divided into 4 main categories: 

* Verbal cooperation
* Material cooperation
* Verbal conflict
* Material conflict

For each event category, a circle representing the event is displayed on the world map based on the geographical coordinates, with a different color for each category. Hovering over a circle generates a tooltip which displays more information about the specific event and allows the user to open the source by clicking on it. 
In the right panel, there are different line charts representing news sources coverage, ordered by the total number of mentions per source. They display the variation over time of the number of mentions for the top 20 sources. It is possible to drag the mouse and make a band selection of the desired time period for a specific source over the line chart in order to display the countries in which the source is most active.

## Project structure

* /css
* /data
* /scripts
* index.html
* README.md

The project is hosted on github pages, and presents the events from one day, November 5th, 2018. The events and mentions are json files found in data/gdelt.

In /scripts, there are both python files used to download and clean data from [gdelt](https://www.gdeltproject.org/), and javascript files which implement the logic of the visualization.

In order to run it locally, fork/clone the repo and run a simple static server, like npm http-server and access index.html in google chrome.
