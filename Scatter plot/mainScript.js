const width = 800;
const height = 600;
const padding = 50;
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const req = new XMLHttpRequest();

//declaring variables
var svg, tooltip, legend;//initialize this variable at the very first
var rawdata = [];
var coOrdinateData = [];
var x_scale, y_scale, x_axis, y_axis;

//Create a title for the plot
function generateTitle() {
    svg.append("text")
        .attr("id", "title")
        .attr("x", (width - padding) / 2)
        .attr("y", padding)
        .style("text-anchor", "middle")
        .text("DRUG USE");
}
//Generate scales for finding x and y co-ordinates
function generateScale() {
    x_scale = d3.scaleLinear()
        .domain([d3.min(rawdata, function (item) {
            return item["Year"] - 1;
        }), d3.max(rawdata, function (item) {
            return item["Year"] + 1;
        })])
        .range([padding, width - padding]);
    y_scale = d3.scaleTime()
        .domain([d3.min(rawdata, function (item) {
            return d3.timeParse("%M:%S")(item["Time"]);
        }), d3.max(rawdata, function (item) {
            return d3.timeParse("%M:%S")(item["Time"]);
        })])
        .range([padding, height - padding]);
}
//Generate axis based on the scales generated
function generateAxis() {
    x_axis = d3.axisBottom().scale(x_scale).tickFormat(d3.format("d"));
    y_axis = d3.axisLeft().scale(y_scale).tickFormat(function (d) {
        return d3.timeFormat("%M:%S")(d);
    });
    svg.append("g")
        .attr("transform", "translate(0, " + (height - padding) + ")")
        .attr("id", "x-axis")
        .call(x_axis);
    svg
        .append("g")
        .attr("transform", "translate( " + padding + ", 0)")
        .attr("id", "y-axis")
        .call(y_axis);

        svg.append('text')
		.attr('x', width-padding)
		.attr('y', height -padding - 10)
		.attr('text-anchor', 'end')
		.attr('class', 'label')
        .text('Year');
        
        svg.append('text')
		.attr('x', padding + 10)
        .attr('y', padding + 10)
		.attr('class', 'label')
		.text('Time');
}
//Generate circles for the scatter plot based on the received data
function generateDots() {
    svg
        .selectAll("circle")
        .data(rawdata)
        .enter()
        .append("circle")
        .attr("cx", (d) => {
            return x_scale(d["Year"]);
        })
        .attr("cy", (d) => {
            return y_scale(d3.timeParse("%M:%S")(d["Time"]));
        })
        .attr("r", 3)
        .attr("class", (d) => {
            if (d["Doping"] !== '') {
                return "dot orange";
            } else {
                return "dor green";
            }
        })
        .attr("data-xvalue", (d) => {
            return d["Year"];
        })
        .attr("data-yvalue", (d) => {
            return new Date(d["Seconds"] * 1000);
        })
        .attr("fill", (d) => {
            if (d["Doping"] !== '') {
                return "orange";
            } else {
                return "lightGreen";
            }
        })
        .on("mouseover", function (event, d) {
            tooltip.transition().style("visibility", "visible");
            tooltip.attr("data-year", d["Year"]).text(d["Year"]);
        })
        .on("mouseout", function (event, d) {
            tooltip.transition().style("visibility", "hidden");
        })
        .attr("data-legend", (d) => {
            if (d["Doping"] !== '') {
                return "Dope test +";
            } else {
                return "Dope test -";
            }
        })
        ;

}

//Legend adding
function generateLegend() {

    // d3.select("body")
    //     .append("div")
    //     .attr("id", "legend")
    //     .text("Orenge = Dope test + | Green = Dope test -");
    svg.append("text")
        .attr("id", "legend")
        .attr("x", width - (padding*4))
        .attr("y", padding)
        .append("tspan")
        .text("Orenge = Dope test + ")
        .append("tspan")
        .attr("x", width - (padding*4))
        .attr("dy", "1em")
        .text("Green = Dope test -");

}

function generateTooltip() {

}
document.addEventListener("DOMContentLoaded", function () {
    //initialize "svg"
    svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "container");
    tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip-div")
        .style("visibility", "hidden")
        .style("text-anchor", "middle");

    generateTitle();

    //get data from given URL
    req.open("GET", url, true);
    req.send();
    req.onload = function () {
        rawdata = JSON.parse(req.responseText);
        generateScale();
        generateAxis();
        generateDots();
        generateLegend();
    }

});