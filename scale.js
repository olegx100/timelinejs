
const timelineScaleContainer = document.getElementById("timelineScaleContainer");
const nscales = 8;

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

function initScale (time, nspans) {
    const scaleWidth = timelineScaleContainer.clientWidth;
    let itemWidth = scaleWidth / nspans;    
    let timeSlot = getSlotSize(time / nspans);
    nspans = time / timeSlot;    
    for (let i = 0; i < nspans; i++) {
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.innerText = "" + timeSlot * i + ".00";
        el.style.width = "" + itemWidth + "px";
        timelineScaleContainer.appendChild(el);
    }
}

function refreshScale () {

    const scaleWidth = getScaleWidth();
    let minTime = px2time(0);
    let maxTime = px2time(scaleWidth);
    let timeSpan = maxTime - minTime;
    let timeSlot = getSlotSize(timeSpan / nscales);
    let minScaleTime = Math.floor(minTime / timeSlot) * timeSlot;
    if (minScaleTime < minTime)
        minScaleTime += timeSlot;

    console.log ("refreshScale"); 
    while (timelineScaleContainer.firstChild) {
        timelineScaleContainer.removeChild(timelineScaleContainer.firstChild);
    }

    let totalW = minScaleTime * scale;
    const el = document.createElement("div");
    //el.classList.add ("scaleSpanItem");
    el.style.width = "" + totalW + "px";
    timelineScaleContainer.appendChild(el);

    let i = 0;    
    let itemWidth = timeSlot * scale;
    while (i < nscales) {
        
        if (totalW + itemWidth > scaleWidth)
            break;

        totalW += itemWidth;
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.innerText = "" + timeSlot * i;
        el.style.width = "" + itemWidth + "px";
        timelineScaleContainer.appendChild(el);
    }
}

