var WineData = [];
// var columns = ["fixed acidity", "volatile acidity", "citric acid", "residual sugar", "chlorides", "free sulfur dioxide", "total sulfur dioxide", "density", "pH", "sulphates", "alcohol"];
var columns = [];
var svgHeight = 800,
    svgWidth = 800;
var anchorCX = 400;
var anchorCY = 400;
var anchorCircleRadius = 250;
var labelCircleRadius = 275;
var qualityColor = {
    "3": "#FFEB3B",
    "4": "#CDDC39",
    "5": "#8BC34A",
    "6": "#00BCD4",
    "7": "#9C27B0",
    "8": "#E91E63",
};


// method to identify position to insert the anchors
var attrPositionX = function(j, radius) {
    return radius * Math.cos(j * 360 / columns.length) + anchorCX;
}
var attrPositionY = function(j, radius) {
    return radius * Math.sin(j * 360 / columns.length) + anchorCY;
}


// group element that holds anchors and label
// for drag https://bl.ocks.org/d3noob/204d08d309d2b2903e12554b0aef6a4d
function dragstarted(d) {
    d3.select(this).raise().classed("active", true);
}

function dragged(d) {
    d3.select(this).select("text")
        .attr("x", d.x = d3.event.x)
        .attr("y", d.y = d3.event.y);
    d3.select(this).select("circle")
        .attr("cx", d.x = d3.event.x)
        .attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("active", false);
}

var svg;
var initialize = function() {
    svg = d3.select("body").append("svg").attr("width", svgHeight).attr("height", svgHeight).attr("cx", 100).attr("cy", 100);

    // outer circle
    svg.selectAll("anchorCircle").append("anchorCircle");
    svg.selectAll("anchorCircle").data([1]).enter()
        .append("circle")
        .attr("r", anchorCircleRadius)
        .attr("fill", "white")
        .attr("cx", anchorCX)
        .attr("cy", anchorCY)
        .style("stroke", d => d.error ? "#F44336" : "#F44336")

    var g = svg.selectAll("g")
        .data(columns)
        .enter()
        .append("g")
        // d3.select(".node").call(d3.drag().on("drag", mousemove));
        // .attr("transform", (d,i)=>{
        //     return "translate()";
        // })
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    g.append("circle")
        // .data(columns)
        // .enter()
        // .append("circle")
        .attr("r", 10)
        .attr("cx", (d, i) => {
            return attrPositionX(i, anchorCircleRadius);
        })
        .attr("cy", (d, i) => {
            return attrPositionY(i, anchorCircleRadius);
        })
        .attr("fill", "#2196F3")

    g.append("text")
        // .data(columns)
        // .enter()
        // .append("text")
        .text(function(d) {
            return d;
        })
        .attr("x", (d, i) => {
            return attrPositionX(i, labelCircleRadius);
        })
        .attr("y", (d, i) => {
            return attrPositionY(i, labelCircleRadius);
        })
        .attr("text-anchor", "middle")
};




// plotting points inside graph
// function Attractor(name, x, y) {
//     this.name = name
//     this.x = x
//     this.y = y
// }


// function DataPoint(attractions, quality) {
//     this.attractions = attractions
//     this.quality = quality
//     this.totalAttractorForce = function() {
//         return this.attractions.map(function(a) {
//             return a.force
//         }).reduce(function(a, b) {
//             return a + b
//         })
//     }
//     this.coordinateX = function() {
//         return this.attractions.map(function(a) {
//             return a.force * a.attractor.x
//         }).reduce(function(a, b) {
//             return a + b
//         }) / this.totalAttractorForce()
//     }
//     this.coordinateY = function() {
//         return this.attractions.map(function(a) {
//             return a.force * a.attractor.y
//         }).reduce(function(a, b) {
//             return a + b
//         }) / this.totalAttractorForce()
//     }
//     this.coordinates = [this.coordinateX(), this.coordinateY()]
// }


// var attractorObj = {};
// columns.forEach((column, index) => attractorObj[column] = new Attractor(column, attrPositionX(index, anchorCircleRadius), attrPositionY(index, anchorCircleRadius)));

// var buildDataPointsObj = function(index) {
//     // WineData
//     return columns.reduce((prevValue, column) => {
//         prevValue.push({
//             attractor: attractorObj[column],
//             force: +WineData[index][column]
//         });
//         return prevValue;
//     }, []);
// }


// var datapoints = [];

var constructDataPoints = function() {
    // tbr
    // WineData.forEach((item, index) => {
    //     datapoints.push(new DataPoint(buildDataPointsObj(index), item.quality))
    // });

    // data points
    svg.selectAll("points").append("points");

    // points inside the plot
    var datapoints = svg.selectAll("points")
        .data(WineData)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return calcDataPointX(d, i);
            // return d.coordinateX();
        })
        .attr("cy", function(d, i) {
            return calcDataPointY(d, i);
            // return d.coordinateY();
        })
        .attr("r", 5)
        .attr("fill", "red")
        .on("mouseover", function() {
            d3.select(this).attr('r', 10)
            d3.select(this).classed("selected", true)
            d3.select(this).attr('fill', "#FF5722")
        })
        .on("mouseout", function(d) {
            d3.select(this).attr('r', 5)
            d3.select(this).attr('fill', qualityColor[d.quality]);
        })
        .attr("fill", d => {
            return qualityColor[d.quality];
        })
        .attr("opacity", "0.4")
    // .attr("style","z-index:10;");
}

// calculating data points position is taken from this article
// https://www.researchgate.net/publication/224343330_Vectorized_Radviz_and_Its_Application_to_Multiple_Cluster_Datasets
var calcDataPointX = function(data, index) {
    var num = 0,
        den = 0;
    columns.forEach((column, j) => {
        num += +data[column] * Math.cos(j + 1) * attrPositionX(j, anchorCircleRadius);
        den += +data[column];
    });
    console.log("posX " + (num / den));
    return num / den + anchorCircleRadius;
};

var calcDataPointY = function(data, index) {
    var num = 0,
        den = 0;
    columns.forEach((column, j) => {
        num += +data[column] * Math.sin(j + 1) * attrPositionY(j, anchorCircleRadius);
        den += +data[column];
    });
    return num / den + anchorCircleRadius;
    // return anchorCircleRadius * (num / den) + anchorCY;
};


d3.csv("winequality-red.csv", data => {
    WineData = data;
    columns = Object.keys(WineData[0]);
    console.log("data " + JSON.stringify(WineData[0]));
    initialize();
    constructDataPoints();
});


// circle transsition and duration