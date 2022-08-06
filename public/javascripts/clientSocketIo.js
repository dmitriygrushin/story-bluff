const socket = io();
const ratingButtons = document.getElementsByClassName('rate-button');
const initialRatingButton = document.getElementById('evaluate-ratings-button');
const refreshRatingButton = document.getElementById('evaluate-again-button');
const userListTag = document.getElementById('user-list');
const colors = ['purple', 'indianred', 'green', 'mediumpurple', 'orchid', 'lavender', 'maroon', 'indigo', 'magenta', 'olive', 'blue', 'teal', 'gray', 'purple', 'black', 'fuchsia', 'plum', 'thistle', 'violet', 'navy'];
const copyLinkButton = document.getElementById('copy-link-button'); // copy-link-button
const myCanvas = document.getElementById('myCanvas');

let myUserList;
let HoverPie = {};
let data = [];

HoverPie.config = {
  canvasPadding : 25,
  hoverScaleX : 1.1,
  hoverScaleY : 1.1,
  labelColor : "rgba(255,255,255,1)",
  labelHoverColor : "rgba(255,255,255,1)",
  labelRadiusFactor : 0.66,
  labelFontFamily : "Arial",
  labelFontWeight : "normal",
  labelFontSize : 25,
  sectorFillColor : "#666",
  sectorStrokeColor : "#fff",
  sectorStrokeWidth : 2,
};
HoverPie.make = (function($canvas, data, config){
  config = $.extend({}, HoverPie.config, config);
  
  var percent2radians = (function(percent) { return percent*Math.PI*2; });
  
  var ctx = $canvas[0].getContext("2d");
  var oX = ctx.canvas.width/2;
  var oY = ctx.canvas.height/2;
  var r = Math.min(oX,oY) - config.canvasPadding;
  var stage = new createjs.Stage("myCanvas");
  stage.enableMouseOver(20);
  
  var cumulativeAngle = 1.5*Math.PI;
  
  for (var i=0; i<data.length; i++) {
    
    var sector = new createjs.Shape();
    var container = new createjs.Container();
    container.name = container.id;
    
    // Draw the arc
    var sectorFillColor = data[i].fillColor || config.sectorFillColor;
    var sectorStrokeColor = data[i].strokeColor || config.sectorStrokeColor;
    sector.graphics.moveTo(oX,oY).beginFill(sectorFillColor).setStrokeStyle(config.sectorStrokeWidth).beginStroke(sectorStrokeColor);
    
    var sectorAngle = percent2radians(data[i].percentage);
    sector.graphics.arc(oX,oY,r,cumulativeAngle,cumulativeAngle+sectorAngle);
    
    sector.graphics.closePath();
    
    container.addChild(sector);
    
    // Draw the label
    if (data[i].label) {
      var font = config.labelFontWeight+" "+config.labelFontSize+"px "+config.labelFontFamily;
      var unhoverLabel = new createjs.Text(data[i].label,font,config.labelColor);
      unhoverLabel.textAlign = "center";
      unhoverLabel.textBaseline = "bottom";
      
      var unhoverLabelRadius = r*config.labelRadiusFactor;
      var unhoverLabelAngle = cumulativeAngle + sectorAngle/2.0;
      unhoverLabel.x = oX + unhoverLabelRadius * Math.cos(unhoverLabelAngle);
      unhoverLabel.y = oY + unhoverLabelRadius * Math.sin(unhoverLabelAngle);
      unhoverLabel.name = "label";
      
      container.addChild(unhoverLabel);
    }
    
    container.regX = oX;
    container.regY = oY;
    container.x = oX;
    container.y = oY;
    
    cumulativeAngle+=sectorAngle;
    stage.addChild(container);
    stage.update();
  }
  
  var hovers = [];
  
  var hover = (function(ids){

    var toUnhover = [];
    for (var i=0; i<hovers.length; i++) {
      if (ids.indexOf(hovers[i]) == -1) {
        // didn't find hover[i] in ids, so add to toUnhover
        toUnhover.push(hovers[i]);
      }
    }
    for (var i=0; i<toUnhover.length; i++) {
      var child = stage.getChildByName(toUnhover[i]);
      child.scaleX = 1;
      child.scaleY = 1;
    }
    
    // and ids in ids that aren't in hovers need to be hovered
    var toHover = [];
    for (var i=0; i<ids.length; i++) {
      if (hovers.indexOf(ids[i]) == -1) {
        // didn't find ids[i] in hovers, so add to toHover
        toHover.push(ids[i]);
      }
    }
    for (var i=0; i<toHover.length; i++) {
      var child = stage.getChildByName(toHover[i]);
      child.scaleX = config.hoverScaleX;
      child.scaleY = config.hoverScaleY;
    }
    
    hovers = ids;
    stage.update();
  });
  
  $canvas.mousemove(function(e){
    var objs = stage.getObjectsUnderPoint(e.clientX,e.clientY);
    var ids = $.map(objs,function(e){ return e.parent.id; });
    
    // call hover() if ids does not match current hovers
    if (ids.length != hovers.length) {
      hover(ids);
      return;
    }
    for (var i=0; i<hovers.length; i++) {
      if (ids[i] != hovers[i]) {
        hover(ids);
        return;
      }
    }
  });
});

socket.emit('join-room', roomId, username);

socket.on('user-list', (userList) => {
    userListTag.innerHTML = '';
    myUserList = userList;
    // loop over userList hashmap and add each user to the userListTag
    for (let userId in userList) {
        let user = userList[userId];
        let listItem = document.createElement('li');
        listItem.style.fontSize = '1.3em';
        if (user.rating == 0) {
            listItem.innerHTML = `${user.username}: ✘`;
        } else {
            listItem.innerHTML = `${user.username}: ${user.rating}`;
        }
        userListTag.appendChild(listItem);
    }
});

socket.on('refresh-ratings', () => {
    myCanvas.style.visibility = 'hidden';
});

socket.on('show-rating', () => {
    showRatingResult();
});

if (initialRatingButton && refreshRatingButton) {
    refreshRatingButton.style.display = 'none';
    initialRatingButton.addEventListener('click', () => {
        socket.emit('show-rating');
        showRatingResult();
    });

    refreshRatingButton.addEventListener('click', () => {
        refreshRatings()
        initialRatingButton.style.display = 'block';
        refreshRatingButton.style.display = 'none';
    });
}

// only moderator can see the copyLinkButton
if (copyLinkButton) {
    copyLinkButton.addEventListener('click', (e) => {
        console.log('copy link');
        e.preventDefault();
        const url = window.location.href;
        navigator.clipboard.writeText(`${url}`);
    });
}



// set onclick listener for all rating-buttons class
for (let i = 0; i < ratingButtons.length; i++) {
    ratingButtons[i].addEventListener('click', (e) => {
        socket.emit('update-rating', e.target.value);
    });
}

function refreshRatings() {
    socket.emit('refresh-ratings');
    data = [];
    myCanvas.style.visibility = 'hidden';
}

function showRatingResult() {
    data = [];
    // store occurrence of each rating in a hashmap (key: rating, value: number of occurrences)
    let ratingOccurrenceMap = {};
    let totalOccurrences = 0;
    for (let userId in myUserList) {
        let user = myUserList[userId];
        if (user.rating != 0) {
            totalOccurrences++;
            if (user.rating in ratingOccurrenceMap) {
                ratingOccurrenceMap[user.rating] += 1;
            } else {
                ratingOccurrenceMap[user.rating] = 1;
            }
        }
    }

    console.log('totalOccurrences: ' + totalOccurrences);
    let i = 0;
    // key: #, value: occurrences
    for (let [key, value] of Object.entries(ratingOccurrenceMap)) {
        console.log('were in the loop');
        data.push(createDataObject(value / totalOccurrences, colors[i++], key));
    }

    console.log('ratingOccurrenceMap: ', ratingOccurrenceMap);

    if (data.length > 0) {
        myCanvas.style.visibility = 'visible';
        if (initialRatingButton && refreshRatingButton) {
            initialRatingButton.style.display = 'none';
            refreshRatingButton.style.display = 'block';
        }
        HoverPie.make($("#myCanvas"), data, {});
    }
}


function createDataObject(percentage, fillColor, label) {
    return {
        percentage : percentage,
        fillColor : fillColor,
        label : label
    }
}