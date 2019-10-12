var WineData = [];
// var columns = ["fixed acidity", "volatile acidity", "citric acid", "residual sugar", "chlorides", "free sulfur dioxide", "total sulfur dioxide", "density", "pH", "sulphates", "alcohol"];
var columns = [];
var selectedColumns = {};
var selectedColumnsArr = [];
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
// important: need to convert radians to degree to get correct values
var attrPositionX = function(j, radius, m) {
    // Math.sin((j * 360 / m) *Math.PI/180);

    return radius * Math.cos((j * 360 / m) *Math.PI/180) + anchorCX;
    // return radius * Math.cos(j * 360 / m) + anchorCX;
}
var attrPositionY = function(j, radius, m) {
    return radius * Math.sin((j * 360 / m) *Math.PI/180) + anchorCY;
    // return radius * Math.sin(j * 360 / m) + anchorCY;
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
    svg = d3.select("body").append("svg").attr("width", svgHeight).attr("height", svgHeight);

    // outer circle
    svg.selectAll("anchorCircle").append("anchorCircle");
    svg.selectAll("anchorCircle").data([1]).enter()
        .append("circle")
        .attr("r", anchorCircleRadius)
        .attr("fill", "white")
        .attr("cx", anchorCX)
        .attr("cy", anchorCY)
        .style("stroke", d => d.error ? "#F44336" : "#F44336")
};

var createAnchors = function(){
    d3.selectAll("g").remove();
    var g = svg.selectAll("g")
        .data(selectedColumnsArr)
        .enter()
        .append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    g.append("circle")
        .attr("r", 10)
        .attr("cx", (d, i) => {
            return attrPositionX(i, anchorCircleRadius, selectedColumnsArr.length);
        })
        .attr("cy", (d, i) => {
            return attrPositionY(i, anchorCircleRadius, selectedColumnsArr.length);
        })
        .attr("fill", "#2196F3")

    g.append("text")
        .text(function(d) {
            return d;
        })
        .attr("x", (d, i) => {
            return attrPositionX(i, labelCircleRadius, selectedColumnsArr.length);
        })
        .attr("y", (d, i) => {
            return attrPositionY(i, labelCircleRadius, selectedColumnsArr.length);
        })
        .attr("text-anchor", "middle")
};

var datapoints;
// method to construct the data points inside the circle.
var constructDataPoints = function() {
    // data points
    svg.selectAll("points").append("points");

    // points inside the plot
    datapoints = svg.selectAll("points")
        .data(WineData)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return 0;
            // return calcDataPointX(d, i);
        })
        .attr("cy", function(d, i) {
            return 0;
            // return calcDataPointY(d, i);
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
        .attr("opacity", "1");
}

var transitionDataPoints = function(){
    datapoints.transition()
   .duration(500)
   .attr("cx", function(d, i) {
        return calcDataPointX(d, i);
    })
    .attr("cy", function(d, i) {
        return calcDataPointY(d, i);
    })
};

// formula for calculating data points position is taken from this article
// https://www.researchgate.net/publication/224343330_Vectorized_Radviz_and_Its_Application_to_Multiple_Cluster_Datasets
var calcDataPointX = function(data, index) {
    var num = 0,
        den = 0;
    selectedColumnsArr.forEach((column, j) => {
        // num += +data[column] * Math.cos(j + 1) * attrPositionX(j, anchorCircleRadius, columns.length);
        num += +data[column] * Math.cos(j + 1) * selectedColumns[column].x;
        den += +data[column];
    });
    return num / den + anchorCircleRadius;
};

var calcDataPointY = function(data, index) {
    var num = 0,
        den = 0;
    selectedColumnsArr.forEach((column, j) => {
        // num += +data[column] * Math.sin(j + 1) * attrPositionY(j, anchorCircleRadius, columns.length);
        num += +data[column] * Math.sin(j + 1) * selectedColumns[column].y;
        den += +data[column];
    });
    return num / den + anchorCircleRadius;
};

var getColumnLength = function(){
    return Object.keys(selectedColumns).length;
};

// 
var calculateAnchorCoordinates = function(){
    if(getColumnLength() === 0) {
        return;
    }
    var index = 0;
    for(var column in selectedColumns) {
        selectedColumns[column].x = attrPositionX(index,anchorCircleRadius, getColumnLength());
        selectedColumns[column].y = attrPositionY(index,anchorCircleRadius, getColumnLength());
        index++;
    }
    console.log(JSON.stringify(selectedColumns));
    createAnchors();
    transitionDataPoints();
};

// callback function when column is added or removed
var columnChaged = function(elem){
    if(elem.checked){
        selectedColumns[elem.value] = {};
        selectedColumnsArr.push(elem.value);
    } else {
        delete selectedColumns[elem.value];
        selectedColumnsArr = selectedColumnsArr.filter(column => column !== elem.value);
    }
    calculateAnchorCoordinates();
};

// adds column checkbox
var constructColumnSelection = function(){
    columns.forEach(column=>{
        var input = document.createElement("input");
        var label = document.createElement("label");
        var br = document.createElement("br");
        input.innerHTML = column;

        var type = document.createAttribute("type");
        var value = document.createAttribute("value");
        var id = document.createAttribute("id");
        var name = document.createAttribute("name");
        var onclick = document.createAttribute("onclick");
        var forAttr = document.createAttribute("for");
        id.value = column;
        name.value = column;
        type.value = "checkbox";
        value.value = column;
        forAttr.value = column;
        onclick.value = "columnChaged(this);";
        label.innerHTML = column;

        input.setAttributeNode(type);
        input.setAttributeNode(value);
        input.setAttributeNode(id);
        input.setAttributeNode(name);
        input.setAttributeNode(onclick);
        label.setAttributeNode(forAttr);
        document.getElementById("column-select").appendChild(input);
        document.getElementById("column-select").appendChild(label);
        document.getElementById("column-select").appendChild(br);
    });

};


d3.csv("winequality-red.csv", data => {
    WineData = data;
    columns = Object.keys(WineData[0]);
    columns.pop();
    console.log("columns " + JSON.stringify(columns));
    initialize();
    createAnchors();
    constructColumnSelection();
    constructDataPoints();
});


// circle transsition and duration