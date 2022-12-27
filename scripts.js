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
console.log (mainContainer);

const leftBtn = document.getElementById("leftBtn");
leftBtn.addEventListener("mousedown", startScrollLeft);
leftBtn.addEventListener("mouseup", stopScroll);

const rightBtn = document.getElementById("rightBtn");
rightBtn.addEventListener("mousedown", startScrollRight);
rightBtn.addEventListener("mouseup", stopScroll);

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", autoScale);

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

    mainContainer.addEventListener("resize", onResize);
    mainContainer.addEventListener("wheel", onMouseWheel);
    mainContainer.addEventListener("click", onClick);
    onResize (NaN);
}

function onResize (evt) {
    let width = mainContainer.clientWidth;
    scale = width / totalTime; //px/sec
    drawItems ();
}

function drawItems () {
    while (mainContainer.firstChild) {
        mainContainer.removeChild(mainContainer.firstChild);
    }

    let width = mainContainer.clientWidth;
    let maxW = timeOffset * scale;
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
            let w = states[startIdx].Duration * scale;
            if (maxW + w > 0) {
                w += maxW; 
                maxW = 0;
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
        let w = states[i].Duration * scale;
        if (maxW + w > width) 
            w = width - maxW;

        maxW += w;

        const el = document.createElement("div");
        el.innerText = states[i].State;
        el.classList.add ("timeLineItem");
        el.classList.add (states[i].State);
        el.id = "span_" + i;
        mainContainer.appendChild(el);
        el.style.width = "" + w + "px";
        if (maxW >= width)
            break;
    }
}

function onMouseWheel (evt) {
    
    const offsetInPx = evt.x - mainContainer.getBoundingClientRect().left;
    let locTimePt = offsetInPx / scale - timeOffset;

    if (evt.wheelDelta > 0)
        scale *= 1.1;
    else
        scale /= 1.1;
     
    timeOffset = (offsetInPx - locTimePt * scale)/scale;
    
    //if (timeOffset < 0)
    //    timeOffset = 0;

    drawItems ();
}

function onClick(evt) {
    const offsetInPx = evt.x - mainContainer.getBoundingClientRect().left;
    let locTimePt = timeOffset + offsetInPx / scale;
}

function autoScale () {
    timeOffset = 0;
    onResize ();
}

function scroll (dir) {
    let width = mainContainer.clientWidth;
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