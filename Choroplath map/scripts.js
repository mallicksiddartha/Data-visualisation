/**Constants */
const mapDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const width = 960;
const height = 700;
const padding = 40;
const colors = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'];

/**Variables */
var svg, legend, tooltip, countiesData, educationData, mapProjection, mapPath;
var educationUrlData = [];
var mapUrlData = [];
var colorScale;//Calculates color based on the percentage

/**
 * We create a scale with
 * Domain - [0, 90]
 * Range  - colors (array of 9 diverging colors)
 * Why? So that we can generate "fill" color without explicit "if-else/switch" statement
 */
function generateScale() {
  colorScale = d3.scaleQuantize()
    .domain([0, 90])
    .range(colors);
}

/**
 * We merge the properties of the education data with map generating data. 
 * This way we can easily access the educational properties to generate different attributes for the
 * generated counties in the map.
 * @param { Topojson data to create map } mapData 
 * @param { Education data for each county } eduData
 * @returns {Merged array of object with both properties of the mapData and eduData} sortedMapData
 */
function mergeJsonData(mapData, eduData) {
  let sortedMapData = mapData.features;
  sortedMapData.sort((a, b) => a.id - b.id);
  eduData.sort((a, b) => a.fips - b.fips);
  /**We have sorted both the data based on the comparable properties ("id" and "fips") in the same order
   * Now we merge the 2 data into 1 for ease of access in the "d3.data" method
  */
  sortedMapData.forEach((item, index) => {
    let eduItem = eduData[index];
    Object.assign(item, eduItem);
  });

  return sortedMapData;
}

function generateMap(sortedMapData) {
  mapProjection = d3.geoMercator();
  mapPath = d3.geoPath()
    .projection(null);
  svg.selectAll("path")
    .data(sortedMapData)
    .enter()
    .append("path")
    .attr("d", (item) => mapPath(item))
    .attr("class", "county")
    .attr("fill", (item) => colorScale(item["bachelorsOrHigher"]))
    .attr("data-fips", (item) => item["fips"])
    .attr("data-education", (item) => item["bachelorsOrHigher"])
    .attr("data-county", (item) => item["area_name"])
    .attr("data-state", (item) => item["state"])
    .on("mouseover", (event, item) => {
      tooltip.transition().style("visibility", "visible");
      tooltip.text("State: " + item["state"]
        + ", County: " + item["area_name"]
        + ", % of Bachelors or higher: " + item["bachelorsOrHigher"] + "%");
      tooltip.attr("data-education", item["bachelorsOrHigher"]);
    })
    .on("mouseout", (event, item) => {
      tooltip.transition().style("visibility", "hidden");
    });
}

function generateLegend() {
  colors.forEach((c, i) => {
    legend.append("rect")
      .attr("x", i * 50)
      .attr("y", 0)
      .attr("width", 50)
      .attr("height", 10)
      .attr("fill", c);
    legend.append("text")
      .attr("x", i * 50 + 25)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .attr("font-family", "sans-sarif")
      .attr("font-size", 10 + "px")
      .text(function () {
        // invertExtent returns an array - the min and max value of the group
        return (colorScale.invertExtent(c)[1]).toFixed(0) + "%";
      });
  });
}

document.addEventListener("DOMContentLoaded", function () {

  svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(" + (width / 2) + ",0)");

  tooltip = d3.select("#tooltip");
  //get map data
  d3.json(mapDataURL).then(
    (mapData, error) => {
      if (error) return console.error(error);
      //convert topojson data into geojson data
      countiesData = topojson.feature(mapData, mapData.objects.counties);

      d3.json(educationDataURL).then((eduData, error) => {
        if (error) return console.error(error);
        educationData = eduData;

        let mergedData = mergeJsonData(countiesData, educationData);
        generateScale();
        generateMap(mergedData);
        generateLegend();
      });
    });
});