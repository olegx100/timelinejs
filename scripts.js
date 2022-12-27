var states = [
    {"State": "Print", "Duration": 3, "Start": "8:00"}, 
    {"State": "Error", "Duration": 6, "Start": "8:00"}, 
    {"State": "Ready", "Duration": 12, "Start": "8:00"}, 
    {"State": "Service", "Duration": 6, "Start": "8:00"}, 
    {"State": "Print", "Duration": 18, "Start": "8:00"}, 
    {"State": "Ready", "Duration": 18, "Start": "8:00"}
]

var scrollInterval = NaN;
const mainContainer = document.getElementById("timelineMainContainer");
mainContainer.addEventListener("resize", onResize); //does not work ?
mainContainer.addEventListener("wheel", onMouseWheel);
mainContainer.addEventListener("mousedown", startDrag);
mainContainer.addEventListener("mouseup", endDrag);
mainContainer.addEventListener('mousemove', drag);
//mainContainer.addEventListener('mouseleave', endDrag);

//Buttons can be removed from HTML
const leftBtn = document.getElementById("leftBtn");
leftBtn?.addEventListener("mousedown", startScrollLeft);
leftBtn?.addEventListener("mouseup", stopScroll);

const rightBtn = document.getElementById("rightBtn");
rightBtn?.addEventListener("mousedown", startScrollRight);
rightBtn?.addEventListener("mouseup", stopScroll);

const resetBtn = document.getElementById("resetBtn");
resetBtn?.addEventListener("click", autoScale);

//global variables
var totalTime;
var scale = 1;
var timeOffset = 0;

start();

function start () {
    createDummyModel ();

    totalTime = 0;
    for(let i = 0; i < states.length; i++) {
        totalTime += states[i].Duration;
    }
    autoScale();
}

function getWidth () {
    return Math.floor(mainContainer.clientWidth);
}

function onResize (evt) {
    autoScale();
}

function px2time (px) {
    return px / scale + timeOffset;
}

function timeToPx (time) {
    return (time - timeOffset) * scale;
}

function drawItems () {
    while (mainContainer.firstChild) {
        mainContainer.removeChild(mainContainer.firstChild);
    }

    let width = getWidth();
    let maxW = Math.round(timeOffset * scale);
    let startIdx = 0;
    if (maxW >= 0) {
        const el = document.createElement("div");
        el.classList.add ("timeLineItem");
        el.classList.add ("EmptyState");
        mainContainer.appendChild(el);
        el.style.width = "" + maxW + "px";    
    }
    else {
        while (startIdx < states.length) {
            let w = Math.round(states[startIdx].Duration * scale);
            if (maxW + w > 0) {
                w = maxW + w;
                maxW = w;
                const el = document.createElement("div");
                el.innerText = states[startIdx].State;
                el.classList.add ("timeLineItem");
                el.classList.add (states[startIdx].State);
                mainContainer.appendChild(el);
                el.style.width = "" + w + "px";
                startIdx++;
                break;
            } 
            maxW += w;
            startIdx++;
        }
    }

    for(let i = startIdx; i < states.length; i++) {
        let w = Math.round(states[i].Duration * scale);
        if (maxW + w >= width)  
        {
            w = width - maxW - 1;
            if (w < 1)
                break;
        }
        maxW += w;

        const el = document.createElement("div");
        el.innerText = states[i].State;
        el.classList.add ("timeLineItem");
        el.classList.add (states[i].State);
        el.id = "i_" + i;
        mainContainer.appendChild(el);
        el.style.width = "" + w + "px";
        if (maxW >= width)
            break;
    }

    //refreshScale();
}

function onMouseWheel (evt) {
    
    const offsetInPx = evt.x - mainContainer.getBoundingClientRect().left;
    let locTimePt = offsetInPx / scale - timeOffset;

    if (evt.wheelDelta > 0)
        scale *= 1.1;
    else
        scale /= 1.1;
     
    timeOffset = (offsetInPx - locTimePt * scale)/scale;
    
    drawItems ();
}

function autoScale () {
    timeOffset = 0;
    scale =  getWidth() / totalTime; //px/sec
    drawItems ();
}

function scroll (dir) {
    let width = getWidth();
    let dt = width / scale * 0.005;
    if (dir > 0)
        timeOffset += dt;
    else
        timeOffset -= dt;

    drawItems ();
}

function startScrollLeft() {
    stopScroll();
    scrollInterval = setInterval(() => scroll (-1), 100);
}

function startScrollRight () {
    stopScroll();
    scrollInterval = setInterval(() => scroll (1), 100);
}

function stopScroll () {
    clearInterval(scrollInterval);
    scrollInterval = NaN;
}

//Drag and drop handling
var inDrag;
var dragStartX;

function startDrag (evt) {
    inDrag = true;
    dragStartX = evt.x; //x on page, not the container
}

function endDrag () {
    inDrag = false;
}

function drag (evt) {
    if (!inDrag)
        return;
    
    if (evt.buttons == 0) {
        endDrag();
        return;
    }

    timeOffset += (evt.x - dragStartX) / scale;   
    dragStartX = evt.x;
    drawItems ();
}

//EndOf Drag and drop handling

function createDummyModel () {
    states = [];
    stateNames = ["Print", "Service", "Ready", "None", "Error"];

    for (let i = 0; i<1000; i++) {
        let state = {};
        state.State = stateNames[Math.floor(Math.random() * stateNames.length)];
        state.Duration = Math.random() * 60;
        state.start = "00:00:00"
        states.push(state);
    }
}
