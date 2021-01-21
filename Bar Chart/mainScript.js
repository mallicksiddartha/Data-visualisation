// Initialize constants
const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const width = 1280;
const height = 720;
const padding = 50;
const req = new XMLHttpRequest();
/// add more as we move along.

///declare variables
var rawData = []; // the raw data parsed from the url
var gdpData = []; // the x and y co-ordinates from the raw data
var svg; //initialize this variable right in the begining
var tooltip; //initialize this variable right in the begining
var x_scale, y_scale, x_axis, y_axis;

function generateTitle() {
    //add title to the svg
    svg.append("text")
        .attr("id", "title")
        .attr("x", (width - padding) / 2)
        .attr("y", padding)
        .style("text-anchor", "middle")
        .text("USA GDP");
}

function generateScale() {
    // add x axis scale using the date given
    x_scale = d3.scaleTime().domain([d3.min(gdpData, (item) => {
        return new Date(item[0]);
    }), d3.max(gdpData, (item) => {
        return new Date(item[0]);
    })]).range([padding, width - padding]);

    //add y scale using the data given
    y_scale = d3.scaleLinear()
        .domain([0, d3.max(gdpData, (item) => {
            return item[1];
        })]).range([height - padding, padding]);

}

function generateAxis() {
    // add x axis with attribute - "id" : "x-axis"
    x_axis = d3.axisBottom().scale(x_scale);
    svg
        .append("g")
        .attr("transform", "translate(0, " + (height - padding) + ")")
        .attr("id", "x-axis")
        .call(x_axis);
    //add y axis with attribute "id" : "y-axis"
    y_axis = d3.axisLeft().scale(y_scale);
    svg
        .append("g")
        .attr("transform", "translate( " + padding + ", 0)")
        .attr("id", "y-axis")
        .call(y_axis);
}

function generateBarFromData() {
    //use the data-enter process of d3
    svg.selectAll("rect")
        .data(gdpData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => {
            return x_scale(new Date(d[0])); // this gives the x co-ordinate using the x_scale
        })
        .attr("y", (d, i) => {
            return y_scale(d[1]); // this gives the y co-ordinate using the y_scale
        })
        .attr("class", "bar")
        .attr("fill", "aquamarine")
        .attr("width", (width - 2 * padding) / gdpData.length)
        .attr("height", (d) => {
            /**
             * The idea is :
             * Cut the bottom padding from the height
             * Then get the y co-ordinate using y_scale, this co-ordinate is the highest point of the bar
             * Then cut the top height starting from the y co-ordinate, which gives you the actual bar height starting
             * from x-axis to the y co-ordinate
             */
            return height - padding - y_scale(d[1]);
        })
        .attr("data-date", (d) => {
            return d[0];
        })
        .attr("data-gdp", (d) => {
            return d[1];
        })
        .on("mouseover", (event, d) => {

            tooltip.transition().style("visibility", "visible")
            tooltip.attr("data-date", d[0]).text(d[0]);
        }).on("mouseout", (event, d) => {
            tooltip.transition().style("visibility", "hidden");
        });

}

document.addEventListener('DOMContentLoaded', function () {
    //initialize svg variable
    svg = d3
        .select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "container");
    //create a div for the tooltip, apearently using "title" doesn't work
    tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip-div")
        .style("visibility", "hidden")
        .style("text-anchor", "middle");

    // get the data using get request
    req.open("GET", dataURL, true);
    req.send();
    req.onload = function () {
        rawData = JSON.parse(req.responseText);
        gdpData = rawData["data"];
        generateTitle();
        generateScale();
        generateAxis();
        generateBarFromData();
    };

});