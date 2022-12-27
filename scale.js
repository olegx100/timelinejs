const nscales = 8;

const timelineScaleContainer = document.getElementById("timelineScaleContainer");
timelineScaleContainer.addEventListener("mousedown", startDrag);
timelineScaleContainer.addEventListener("mouseup", endDrag);
timelineScaleContainer.addEventListener('mousemove', drag);
timelineScaleContainer.addEventListener("wheel", onMouseWheel);


function getSlotSize (slotSize) {
    let m = 1;
    while (slotSize > 10) {
        slotSize = slotSize / 10;
        m = m * 10;
    }

    if (slotSize > 3)
        return 5 * m;
        
    if (slotSize > 1.5)
        return 2 * m;

    return 1 * m;
}

function getScaleWidth() {
    return  timelineScaleContainer.clientWidth;
}


function refreshScale () {

    const scaleWidth = getScaleWidth();
    let minTime = px2time(0);
    let maxTime = px2time(scaleWidth);
    let timeSpan = maxTime - minTime;
    let timeSlot = getSlotSize(timeSpan / nscales);
    let minScaleTime = Math.floor(minTime / timeSlot) * timeSlot;

    while (minScaleTime < minTime) {
        minScaleTime += timeSlot;
    }

    while (timelineScaleContainer.firstChild) {
        timelineScaleContainer.removeChild(timelineScaleContainer.firstChild);
    }

    let totalW = timeToPx(minScaleTime);
    if (totalW >= 1) 
    {
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.classList.add ("scaleEdgeSpanItem");
        el.style.width = "" + totalW + "px";
        timelineScaleContainer.appendChild(el);
    }
    else 
        totalW = 0;

    let itemWidth = timeSlot * scale; //left Border
    let i = 0;
    while (true) {
        
        if (totalW + itemWidth >= scaleWidth) {
            break;
        }

        totalW += itemWidth;
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        if (i % 2)
            el.classList.add ("odd");

        el.innerText = "" + (minScaleTime + timeSlot * i);
        el.style.width = "" + (itemWidth - 1) + "px"; //-1 for the left border
        timelineScaleContainer.appendChild(el);
        i++;
    }

    if (totalW < scaleWidth) 
    {
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        //el.classList.add ("scaleEdgeSpanItem");
        el.style.width = "" + (scaleWidth - totalW) + "px";
        timelineScaleContainer.appendChild(el);
    }
}



//copy from the main - todo: use ref
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