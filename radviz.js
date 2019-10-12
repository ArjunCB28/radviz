var WineData = [];
var columns = ["fixed acidity", "volatile acidity", "citric acid", "residual sugar", "chlorides", "free sulfur dioxide", "total sulfur dioxide", "density", "pH", "sulphates", "alcohol"];

var svgHeight = 800,
    svgWidth = 800;
var anchorCX = 400;
var anchorCY = 400;
var anchorCircleRadius = 250;
var labelCircleRadius = 325;

var svg = d3.select("body").append("svg").attr("width", svgHeight).attr("height", svgHeight).attr("cx", 100).attr("cy", 100);


// label names circle
// svg.selectAll("anchorLabel").append("anchorLabel");
// svg.selectAll("anchorLabel").data([1]).enter()
// .append("circle")
// .attr("r",labelCircleRadius)
// .attr("fill","white")
// .attr("cx", anchorCX)
// .attr("cy", anchorCY)
// .style("stroke", d => d.error ? "red" : "red")


// outer circle
svg.selectAll("anchorCircle").append("anchorCircle");
svg.selectAll("anchorCircle").data([1]).enter()
    .append("circle")
    .attr("r", anchorCircleRadius)
    .attr("fill", "white")
    .attr("cx", anchorCX)
    .attr("cy", anchorCY)
    .style("stroke", d => d.error ? "red" : "red")

// method to identify position to insert the anchors
var attrPositionX = function(j, radius) {
    return radius * Math.cos(j * 360 / columns.length) + anchorCX;
}
var attrPositionY = function(j, radius) {
    return radius * Math.sin(j * 360 / columns.length) + anchorCY;
}


//////////////
var g = svg.selectAll("anchorCircle")
    .data(columns)
    .enter()
    .append("g")
    // .attr("x",(d,i)=>{return attrPositionX(i,anchorCircleRadius);})
    // .attr("y",(d,i)=>{return attrPositionY(i,anchorCircleRadius);})
    // .attr("transform", function(d, i) {
    //     return "translate(" + attrPositionX(i, anchorCircleRadius) + "," + attrPositionY(i, anchorCircleRadius) + ")";
    // })



g.append("circle")
    .attr("r", 10)
    .attr("cx", (d, i) => {
        return attrPositionX(i, anchorCircleRadius);
    })
    .attr("cy", (d, i) => {
        return attrPositionY(i, anchorCircleRadius);
    })
    .attr("fill", "blue")

g.append("text")
    .text(function(d) {
        return d;
    })
    .attr("x", (d, i) => {
        return attrPositionX(i, anchorCircleRadius);
    })
	.attr("y", (d, i) => {
        return attrPositionY(i, anchorCircleRadius);
    })


/////////////

// plotting anchors around the circle
// svg.selectAll("anchorCircle").data(columns).enter().append("circle")
// .attr("r",10)
// .attr("cx",(d,i)=>{return attrPositionX(i,anchorCircleRadius);})
// .attr("cy",(d,i)=>{return attrPositionY(i,anchorCircleRadius);})
// .attr("fill","blue")
// .attr("style","z-index:9;");


// plotting labels around the anchors
// svg.selectAll("anchorLabel").data(columns).enter().append("text")
// // .attr("r",50)
// .attr("x",(d,i)=>{return attrPositionX(i,labelCircleRadius);})
// .attr("y",(d,i)=>{return attrPositionY(i,labelCircleRadius);})
// .text(d=>{return d;})
// // .attr("fill","blue");


// plotting points inside graph
function Attractor(name, x, y) {
    this.name = name
    this.x = x
    this.y = y
}


function DataPoint(attractions, quality) {
    this.attractions = attractions
    this.quality = quality
    this.totalAttractorForce = function() {
        return this.attractions.map(function(a) {
            return a.force
        }).reduce(function(a, b) {
            return a + b
        })
    }
    this.coordinateX = function() {
        return this.attractions.map(function(a) {
            return a.force * a.attractor.x
        }).reduce(function(a, b) {
            return a + b
        }) / this.totalAttractorForce()
    }
    this.coordinateY = function() {
        return this.attractions.map(function(a) {
            return a.force * a.attractor.y
        }).reduce(function(a, b) {
            return a + b
        }) / this.totalAttractorForce()
    }
    this.coordinates = [this.coordinateX(), this.coordinateY()]
}


var attractorObj = {};
columns.forEach((column, index) => attractorObj[column] = new Attractor(column, attrPositionX(index, anchorCircleRadius), attrPositionY(index, anchorCircleRadius)));

var buildDataPointsObj = function(index) {
    // WineData
    return columns.reduce((prevValue, column) => {
        prevValue.push({
            attractor: attractorObj[column],
            force: +WineData[index][column]
        });
        return prevValue;
    }, []);
}


var datapoints = [];

var constructDataPoints = function() {
    WineData.forEach((item, index) => {
        datapoints.push(new DataPoint(buildDataPointsObj(index), item.quality))
    });

    // data points
    svg.selectAll("points").append("points");

    // points inside the plot
    svg.selectAll("points")
        .data(datapoints)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            console.log("hi");
            return d.coordinateX();
        })
        .attr("cy", function(d) {
            return d.coordinateY();
        })
        .attr("r", 5)
        .attr("fill", "red")
        .on("mouseover", function() {
            d3.select(this).attr('fill', 'blue')
        })
        .on("mouseout", function() {
            d3.select(this).attr('fill', 'red')
        })
        .attr("fill", "red")
    // .attr("style","z-index:10;");
}


d3.csv("winequality-red.csv", data => {
    WineData = data;
    console.log(JSON.stringify(WineData[0]));
    // constructDataPoints();
});