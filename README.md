## data-viz-project

https://atobywankenobi.github.io/data-viz-project/

## Changelog

TODO

	misc
		add slidebar tooltip to show date where mouse is hovering
		keep an event/mention counter somewhere (by category, etc)
		add small random offset to events locations so that they don't "stack"
		verticakl "looped scroll" on the

    UX / user interaction / user interface
        time slider could offer start slider / stop slider / reset button

    mîm
        change categories to event code
        day/night overlay

    Feature :
        interactive selection on graphs : "band-select" on the time series will show the area of attention of the outlet over selected timeframe
    
    details on the graphs visualization
        Maximize graph scale on hover

    Styling :
        Clock at the top center
        3/4 buttons at bottom center (refresh, playspeed, play, maximize)
        orange / black / grey bg theme


IN PROGRESS

    Gauthier : graph visualization in the sidebar
        common scale across all sources
        name + mention counter stacked, left-aligned
        [?] (don't do if "maximize graph on hover") on hover : vertical bar spanning across all graphs, gives numerical value at intersection with curve 

    Tobia   :
        replace slider with clock
        add speed-change button
        Dots styling :
            [?] add random time offset to events so that they pop continuously
            [?] have points pop linearily between updates
            improve dot scaling
                [?] redraw at each zoom level
                [?] have 3-6 layer hidden layer for dot size at various zoom levels
                [?] best solution : find an attribute that prevents scaling, like paths

    Quentin :
        heatmap
        refresh button, information button
        Page styling :
            fix collapse buttons
            add functionality to reset buttons
            tabbed layout for showing sources stats in settings div (number of mentions in each category)



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

	Time Slider
		dragging back should remove events

	Filter data by source and event type/CAMEO code
		find suitable data structure
		add the "selection box" component

	events tooltips with basic infos

    Layout
        Proportional, 2-panel resizable layout
            SVG map should maximize into the available space while retaining aspect ratio
            # SVG map should scale with panel redimensioning
            # SVG map should not scale with panel redimensioning once zoomed in
            Settings menu, tabbed, collapsable
