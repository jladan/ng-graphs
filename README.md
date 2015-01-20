Angular Plotting using D3
=========================

This repository contains one (or two) ideas for using D3 to handle plotting in angular.

Idea 1 *Multi-directive* plots.
-------------------------------

This is the idea put forth in `radius`. A full plot would be created with several directives:

    <figure>
        <axes xdomain="" ydomain=""></axes>
        <plot plot-data="" color=""></plot>
    </figure>

and so on. It seems quite nice, because it pushes more of the declaration of the plot into the html, but it also makes it more difficult programmatically. For example, if we wanted multiple data sets in the plot, it would be necessary to add more `<plot>` directives, possibly using `ngRepeat`.

Idea 2 *Monolithic* plots.
--------------------------

A directive that handles all of the plotting in one fell swoop. The configuration, such as axes, domain, colours, etc. are all handled in a config object passed as an argument. Lines to be plotted are passed in another argument.

    <plot-2d plot-data="" config=""></plot-2d>

This has an advantage that *all* of the plot data is held in scope, including what components are to be rendered. There can also be more error handling if components are not added to the plot (like axes)

Idea 3 *Monolithic + Directive* plots
-------------------------------------

I think I like this idea best: make a standard monolithic plot, with all the advantages mentioned before, but also allow directives to draw things like lines, or subplots.

    <figure>
        <plot-2d plot-data="" config=""></plot-2d>
        <subfigure position="">
            <plot-2d plot-data="" config=""></plot-2d>
        </subfigure>
        <line start="" end=""></line>
    </figure>

It would also be cool if lines were able to be drawn inside the plots as well. The position for children of plots would be in the scale associated with the plot, while the position for children of figures would be relative (in [0,1]).

Other possible components would be `<figure-grid>`, `<circle>`, and so on.
