Angular Plotting using D3
=========================

This is a simple plotting library using [AngularJS](http://angularjs.org), and [D3](http://d3js.org) (for svg rendering). Graphs are made modularly, with a set of axes sourrounding the various components (e.g. plots, histograms, lines) drawn on top.

The resulting structure may look similar to [Radian](http://openbrainsrc.github.io/Radian/index.html), however it differs in a few ways:

* It is smaller -- Radian includes many features that can be accomplished through existing html and css
* Code and presentation are separate -- Radian tends to allow variable declarations and function definitions inside its attributes
* No data retrieval. (let the existing frameworks do that for us)

In short, if you just want to show a function or some data, use Radian. If you want to separate the theme/appearance, and manage most of the data in javascript, we're a good choice.

How to use
----------

All plots go on a set of axes. The `axes` directive controls the scales and renders the horizontal and vertical axes. A typical set up looks like,

    <axes options="axesOptions>
        <plot data="data" options="plotOptions"></plot>
        <line start="[-6,0]" end="[6,0]" options="{strokeWidth:1, color:'black'}"></line>
    </axes>

Each element inside the `axes` directive is rendered in the same space, using the coordinate system of the axes. Thus, that line draws a horizontal rule for y=0. The `options` and `data` attributes (and `start` and `end`) are standard AngularJS scoping options. That is, any variables in the parent controller's scope or javascript expressions can be used.

Types of Graph(ic)s
-------------------

The following graphs and graphical elements are included:

### `plot`

Plot a series of data or a trail. The `data` argument is expected to have the type `Array<[number,number]>` (using Typescript conventions). Options can set stroke width, colour, etc.

### `function`

Exactly Like the plot, except taking a javascript function (type `(x: number) => number`) defined in the scope as `f` instead of a data series.

### `histogram`

Draw a histogram. Here, `data` is an `Array<number>`. The data is put into bins based on the `xDomain` option (of either `axes` or `histogram`) and `bins` option (of the `histogram`).

### `line`

Draw a line from `start` to `end`. The coordinates are the the coordinate system set up by `axes`, of type `[number, number]`.


License
-------

See LICENSE.txt
