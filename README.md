## data-viz-project

https://atobywankenobi.github.io/data-viz-project/

## Changelog

TODO 
		
	Interactive visualization : selection on source graphs shows something on the map
		select-to-zoom on the time series will show the 
	
	Source statistics in right panel
		After selecting 1-5 outlets, show a time-serie of their number of publications
		
	Filter data by source and event type/CAMEO code
		find suitable data structure
		add the "selection box" component
	
	Time Slider
		(?) Allows user to select start time for the animation
		dragging back should remove events
		
	Improvements/visuals/misc
		style slide bar and "clock" div
		add slidebar tooltip to show date where mouse is hovering
		differentiate events that just appeared
		distribute event appearance over progression step (not all update at once)
		keep an event counter somewhere (by category, etc)
		faster/slower buttons beside play, to speed up timeline
	

IN PROGRESS 

	Quentin : 	bugfix : panzoom perforamnce problem
			bugfix : events appear at the wrong place after panning

DONE 

	wireframes & prototypes drawings		
		Idea : Show a world map
		Idea : Events pop up on the map (as dots, or heatmap) as time passes
		Idea : (Selected) News outlets are shows as icons / markers, located 
			on the map at the "mean position" of events they report (which
			moves as time passes)
		Idea : tooltip with some events info when hovering on events
		Idea : Clicking on an outlet's marker shows its "Region of focus" 

	Acquire sample dataset 
		preprocess, remove unnecessary features
		
	Display world map
		draw countries outline & fill with d3
		
	responsive website template with bootstrap.js	
	
	acquire full 1-week dataset
		download cumulative, 15m updates
		reduce size : filter out unnecessary features
		
	improved / more precise prototype
		components 
			world map
		  	sime slider / play button / timeframe selection
		  	right box containing data series showing activity of outlets
		  	bottom box for outlets, event type selection
		Sources representation
			Forget about moving markers
			Select a few sources, show their activity as a time-serie on the side
		Interaction : selecting a part of a time-serie shows the "region of focus" of the source on the map
		events are dots		
		dot events grow smaller / change color to indicate age
	
	map pan / zoom
	
	Time slider
		Play button starts the animation
		Triggers the load of new data files & matching animation
	
	events tooltips with basic infos
		
		
		


