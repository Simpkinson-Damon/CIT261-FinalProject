const targetNodes = [
  "timeChart",
  "timeLegend",
];
var colors = [];

function clearData() {
  for(let i = 0; i < targetNodes.length; i++) {
    let target=document.getElementById(targetNodes[i]);
    while(target.hasChildNodes()) {
      target.removeChild(target.firstChild);
    }
  }
}

function getThemeParkInfo(park) {
  clearData();
  let xhttp = new XMLHttpRequest();

  // build the URL to work on both the local machine and heroku
  let str = window.location.pathname;
  let base_url = str.slice(0, str.lastIndexOf("/"));
  let url = "//" + window.location.host + base_url + "/getParkInfo";
  let params = '?park=' + park;

  // begin get request
  xhttp.open("GET", url + params, true);
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState === 4 && xhttp.status === 200) {
      let response = JSON.parse(xhttp.responseText);
      console.log(response);
      colors = [];
      let times = [];
      let rides = [];
      for(let i = 0; i < response.length; i++) {
        if(response[i].waitTime > 5) {
          console.log("item: " + i);
          colors.push(generateRandomColor());
          times.push(response[i].waitTime);
          rides.push(response[i].name);
        }
      }
      generateFlipCards(response);
      if(times.length === 0) {
        console.log("There are no wait times");
      }
      generateBarChart(times, rides, colors);
    }
  };
  xhttp.send();
}

function drawLine(ctx, startX, startY, endX, endY,color){
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.lineTo(endX,endY);
  ctx.stroke();
  ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
  ctx.save();
  ctx.fillStyle=color;
  ctx.fillRect(upperLeftCornerX,upperLeftCornerY,width,height);
  ctx.restore();
}

let Barchart = function(options){
  this.options = options;
  this.canvas = options.canvas;
  this.ctx = this.canvas.getContext("2d");
  this.colors = options.colors;

  this.draw = function(){
    let maxValue = 0;
    for (item in this.options.data){
      maxValue = Math.max(maxValue,this.options.data[item]);
    }
    let canvasActualHeight = this.canvas.height - this.options.padding * 2;
    let canvasActualWidth = this.canvas.width - this.options.padding * 2;

    //drawing the grid lines
    let gridValue = 0;
    while (gridValue <= maxValue){
      let gridY = canvasActualHeight * (1 - gridValue/maxValue) + this.options.padding;
      drawLine(
        this.ctx,
        0,
        gridY,
        this.canvas.width,
        gridY,
        this.options.gridColor
      );
      //writing grid markers
      this.ctx.save();
      this.ctx.fillStyle = this.options.gridColor;
      this.ctx.textBaseline="bottom";
      this.ctx.font = "bold 10px Arial";
      this.ctx.fillText(gridValue, 10,gridY - 2);
      this.ctx.restore();
      gridValue+=this.options.gridScale;
    }

    //drawing the bars
    let barIndex = 0;
    let numberOfBars = Object.keys(this.options.data).length;
    let barSize = (canvasActualWidth)/numberOfBars;
    for (item in this.options.data){
      let val = this.options.data[item];
      let barHeight = Math.round( canvasActualHeight * val/maxValue) ;
      drawBar(
        this.ctx,
        this.options.padding + barIndex * barSize,
        this.canvas.height - barHeight - this.options.padding,
        barSize,
        barHeight,
        this.colors[barIndex%this.colors.length]
      );
      barIndex++;
    }

    //drawing series name
    this.ctx.save();
    this.ctx.textBaseline="bottom";
    this.ctx.textAlign="center";
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "bold 14px Arial";
    this.ctx.fillText(this.options.seriesName, this.canvas.width/2,this.canvas.height);
    this.ctx.restore();


    //draw legend
    barIndex = 0;
    let legend = document.querySelector("legend[for='timeChart']");
    let ul = document.createElement("ul");
    legend.append(ul);
    for (let i = 0; i < this.options.labels.length; i++) {
      let li = document.createElement("li");
      li.style.align = "left";
      li.style.font = "bold 14px Arial";
      li.style.listStyle = "none";
      li.style.borderLeft = "20px solid "+this.colors[barIndex%this.colors.length];
      li.style.padding = "5px";
      li.textContent = this.options.labels[i];
      ul.append(li);
      barIndex++;
    }
  }
};

function generateRandomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  let color = "rgb(" + r + "," + g + "," + b + ")";
  return color;
}

function generateBarChart(times, rides, colors) {
  let chartCanvas = document.getElementById("timeChart");
  chartCanvas.width = 500;
  chartCanvas.height = 500;

  let myChart = new Barchart(
    {
      canvas:chartCanvas,
      seriesName:"Attraction Wait Times",
      padding:25,
      gridScale:10,
      gridColor:"#aaaaaa",
      data:times,
      labels:rides,
      colors:colors
    }
  );
  myChart.draw();
}

function generateFlipCards(data) {
  hideFlipCards();
  let count = 1;
  let displayData = "";
  let parkName = "";
  for(let i = 0; i < data.length; i++) {
    displayData = "";
    let openTime = "Not Available";
    let closeTime = "Not Available";
    if(data[i].waitTime > 5) {
      parkName = '<p>' + data[i].name + '</p>';
      let cardTarget = "#underCard" + count;
      let cardFront = "#cardFront" + count;
      if(data[i].schedule) {
        openTime = getTime(data[i].schedule.openingTime);
        closeTime = getTime(data[i].schedule.closingTime);
      }
      displayData += '<p>Wait: ' + data[i].waitTime + '</p>';
      displayData += '<p>Open: ' + openTime + '</p>';
      displayData += '<p>Close: ' + closeTime + '</p>';
      $(cardTarget).append(displayData);
      $(cardTarget).show();
      $(cardFront).append(parkName);
      $(cardFront).css("background-color", colors[count - 1]);
      count++;
    }
  }
}

function getTime(time) {
  let myTime = new Date(time);
  let hour = myTime.getHours();
  let minutes = ('0' + myTime.getMinutes()).slice(-2);
  return(hour + ":" + minutes);
}


function hideFlipCards() {
  $("p").remove()
  for(let i = 1; i <= 24; i++) {
    let card = "#underCard" + i;
    $(card).hide();
  }
}

$(document).ready(function(){
  hideFlipCards();


});