/** Declare constants */
const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const width = 1280;
const height = 600;
const padding = 60;
const req = new XMLHttpRequest();
const colors = ["#4575b4", "#91bfdb", "#e0f3f8", "#ffffbf", "#fee090", "#fc8d59", "#d73027"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**Declare variables */
var svg, tooltip, legend;//initialize this variable at the very first
var rawdata = [];
var temperatureData = [];
var x_scale, y_scale, x_axis, y_axis, color_scale;
var baseTemperature, numberOfYears, maxYear, minYear;

function generateScale() {

    x_scale = d3.scaleLinear()
        .domain([d3.min(temperatureData, (item) => {
            return item["year"];
        })
            , d3.max(temperatureData, (item) => {
                return item["year"];
            })])
        .range([padding, width - padding]);
    y_scale = d3.scaleTime()
        .domain([new Date(2012, 0, 1), new Date(2013, 0, 1)])
        .range([padding, height - padding]);

    /** 
     * The idea is to generate index of "colors" array based on the variance 
     * Why quantize scale?
     * - I need to divide the variance domain into 7 equal group, then assign a color to each group
     * */
    color_scale = d3.scaleQuantize()
        .domain([d3.min(temperatureData, (item) => {
            return item["variance"];
        }), d3.max(temperatureData, (item) => {
            return item["variance"];
        })])
        .range(colors);
}

function generateAxis() {

    x_axis = d3.axisBottom().scale(x_scale).tickFormat(d3.format("d"));
    /**
     * Why do we need tickValues function?
     * - without this function ticks were showing at the 1st of every month.
     * So the month name would appear exactly at the start of the 
     * rectangle for that month. 
     * Generating ticks at the 15th of every month creates the tick at the
     * middle of the rectangle
     * 
     * Also note that the scale should remain the same, just ticks in the 
     * scale need to show at the 15th of every month.
     */
    y_axis = d3.axisLeft().scale(y_scale)
        .tickValues([
            new Date(2012, 0, 15),
            new Date(2012, 1, 15),
            new Date(2012, 2, 15),
            new Date(2012, 3, 15),
            new Date(2012, 4, 15),
            new Date(2012, 5, 15),
            new Date(2012, 6, 15),
            new Date(2012, 7, 15),
            new Date(2012, 8, 15),
            new Date(2012, 9, 15),
            new Date(2012, 10, 15),
            new Date(2012, 11, 15)
        ])
        .tickFormat(d3.timeFormat("%B"));
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
        .attr('x', width - padding)
        .attr('y', height - padding + 20)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Year');

    svg.append('text')
        .attr('x', padding)
        .attr('y', padding - 10)
        .attr('class', 'label')
        .text('Month');

}

function generateRectangle() {
    svg.selectAll("rect")
        .data(temperatureData)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("fill", (item) => {
            // console.log("variance: " + item["variance"] 
            // + ", color index: " + Math.round(color_scale(item["variance"])));
            return color_scale(item["variance"]);
        })
        .attr("data-month", (item) => {
            return item["month"] - 1;
        })
        .attr("data-year", (item) => {
            return item["year"];
        })
        .attr("data-temp", (item) => {
            return baseTemperature + item["variance"];
        })
        .attr("x", (item) => {
            return x_scale(item["year"]);
        })
        .attr("y", (item) => {
            return y_scale(new Date(2012, item["month"] - 1, 1));
        })
        .attr("width", (item) => {
            return (width - 2 * padding) / numberOfYears;
        })
        .attr("height", (item) => {
            return (height - 2 * padding) / 12;
        })
        .on("mouseover", (event, item) => {
            tooltip.transition().style("visibility", "visible");

            tooltip.text(
                months[item["month"] - 1] + ", "
                + item["year"] + " temp: "
                + (baseTemperature + item["variance"]).toFixed(2));
            tooltip.attr("data-year", item["year"]);
        })
        .on("mouseout", (event, item) => {
            tooltip.transition().style("visibility", "hidden");
        });
}

function generateLegend() {
    colors.forEach((c, i) => {
        legend.append("rect")
            .attr("x", (padding + 50 * i))
            .attr("y", 0)
            .attr("width", 50)
            .attr("height", 50)
            .attr("fill", c);
        legend.append("text")
            .attr("x", (padding + 50 * i + 20))
            .attr("y", 75)
            .style("text-anchor", "middle")
            .text(function () {
                // invertExtent returns an array - the min and max value of the group
                return (color_scale.invertExtent(c)[1] + baseTemperature).toFixed(2);
            });
    })


}

document.addEventListener("DOMContentLoaded", function () {
    svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    legend = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", 100)
        .attr("id", "legend");
    tooltip = d3.select("#tooltip");

    //get data from given URL
    req.open("GET", URL, true);
    req.onload = function () {
        rawdata = JSON.parse(req.responseText);
        temperatureData = rawdata["monthlyVariance"];
        baseTemperature = rawdata["baseTemperature"];
        minYear = d3.min(temperatureData, (item) => {
            return item["year"];
        })
        maxYear = d3.max(temperatureData, (item) => {
            return item["year"];
        })
        numberOfYears = maxYear - minYear + 1;//both max and min year is in scale, so 1 added with their difference
        generateScale();
        generateAxis();
        generateRectangle();
        generateLegend();

    }
    req.send();

});