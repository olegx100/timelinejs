import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-time-line-main',
  templateUrl: './time-line-main.component.html',
  styleUrls: ['./time-line-main.component.css'],
  encapsulation: ViewEncapsulation.None,
})


export class TimeLineMainComponent implements OnInit {
  @ViewChild('timelineMainContainer', { static:false }) rootEl: ElementRef<HTMLDivElement>;
  @ViewChild('timelineScaleContainer', { static:false }) scaleRootEl: ElementRef<HTMLDivElement>;

  @Input("nScales") nScales:number = 0;
  @Input('items') items: Array<any>;

  totalTime = 0;
  scale = 1;
  timeOffset = 0;
  mainContainer: HTMLDivElement; 
  timeLineScaleContainer: HTMLDivElement;

  constructor() { 
    
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.mainContainer = this.rootEl.nativeElement;
    this.mainContainer.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.mainContainer.addEventListener("mousedown", this.startDrag.bind(this));
    this.mainContainer.addEventListener("mouseup", this.endDrag.bind(this));
    this.mainContainer.addEventListener('mousemove', this.drag.bind(this));

    if (this.nScales) 
    {
      this.timeLineScaleContainer = this.scaleRootEl.nativeElement;
      this.timeLineScaleContainer.addEventListener('wheel', this.onMouseWheel.bind(this));
      this.timeLineScaleContainer.addEventListener("mousedown", this.startDrag.bind(this));
      this.timeLineScaleContainer.addEventListener("mouseup", this.endDrag.bind(this));
      this.timeLineScaleContainer.addEventListener('mousemove', this.drag.bind(this));      
    }
      
    this.start();
  }

  //do it on items items
  public start () {

    this.totalTime = 0;
    for(let i = 0; i < this.items.length; i++) {
      this.totalTime += this.items[i].Duration;
    }
    this.autoScale();
  }

  getWidth () {
    return Math.floor(this.mainContainer.clientWidth);
  }

  onResize (evt) {
    this.autoScale();
  }

  px2time (px) {
    return px / this.scale - this.timeOffset;
  }

  timeToPx (time) {
    return (time + this.timeOffset) * this.scale;
  }

  drawItems () {
    while (this.mainContainer.firstChild) {
      this.mainContainer.removeChild(this.mainContainer.firstChild);
    }

    let to = 0;
    let width = this.getWidth();
    let maxW = this.timeOffset * this.scale;
    let startIdx = 0;
    if (maxW >= 0) {
        const el = document.createElement("div");
        el.classList.add ("timeLineItem");
        el.classList.add ("EmptyState");
        this.mainContainer.appendChild(el);
        el.style.width = "" + maxW + "px";    
    }
    else {
        while (startIdx < this.items.length) {
            to += this.items[startIdx].Duration;
            let w = this.items[startIdx].Duration * this.scale;
            if (maxW + w > 0) {
                w = maxW + w;
                maxW = w;
                const el = document.createElement("div");
                el.innerText = this.items[startIdx].State;
                el.classList.add ("timeLineItem");
                el.classList.add (this.items[startIdx].State);
                this.mainContainer.appendChild(el);
                el.style.width = "" + w + "px";
                startIdx++;
                break;
            } 
            maxW += w;
            startIdx++;
        }
    }

    for(let i = startIdx; i < this.items.length; i++) {
        let w = this.items[i].Duration * this.scale;
        if (maxW + w >= width)  
        {
            w = width - maxW;
            if (w < 1)
                break;
        }
        maxW += w;

        const el = document.createElement("div");
        el.innerText = "" + to;//states[i].State;
        el.classList.add ("timeLineItem");
        el.classList.add (this.items[i].State);
        el.id = "i_" + i;
        this.mainContainer.appendChild(el);
        el.style.width = "" + w + "px";
        if (maxW >= width)
            break;
            
        to += this.items[i].Duration;
    }

    this.refreshScale();
  }

  autoScale () {
    this.timeOffset = 0;
    this.scale = this.getWidth() / this.totalTime; //px/sec
    this.drawItems ();
  }

  onMouseWheel (evt) {

    const offsetInPx = evt.x - this.mainContainer.getBoundingClientRect().left;
    let locTimePt = offsetInPx / this.scale - this.timeOffset;

    if (evt.wheelDelta > 0)
        this.scale *= 1.1;
    else
        this.scale /= 1.1;
     
    this.timeOffset = (offsetInPx - locTimePt * this.scale)/ this.scale;
    this.drawItems ();
  }

  //Drag and drop handling
  inDrag;
  dragStartX;

  startDrag (evt) {
    this.inDrag = true;
    this.dragStartX = evt.x; //x on page, not the container
  }

  endDrag () {
    this.inDrag = false;
  }

  drag (evt) {
    if (!this.inDrag)
        return;
    
    if (evt.buttons == 0) {
      this.endDrag();
        return;
    }

    this.timeOffset += (evt.x - this.dragStartX) / this.scale;   
    this.dragStartX = evt.x;
    this.drawItems ();
  }
  //EndOf Drag and drop handling

  //Scale handler

  getSlotSize (slotSize) {
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

refreshScale () {
    if (!this.timeLineScaleContainer)
      return;

    const scaleWidth = this.getWidth();
    let minTime = this.px2time(0);
    let maxTime = this.px2time(scaleWidth);
    let timeSpan = maxTime - minTime;
    let timeSlot = this.getSlotSize(timeSpan / this.nScales);
    let minScaleTime = Math.floor(minTime / timeSlot) * timeSlot;

    while (minScaleTime < minTime) {
        minScaleTime += timeSlot;
    }

    while (this.timeLineScaleContainer.firstChild) {
        this.timeLineScaleContainer.removeChild(this.timeLineScaleContainer.firstChild);
    }

    let totalW = this.timeToPx(minScaleTime);
    if (totalW >= 1) 
    {
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.classList.add ("scaleEdgeSpanItem");
        el.style.width = "" + totalW + "px";
        this.timeLineScaleContainer.appendChild(el);
    }
    else 
        totalW = 0;

    let itemWidth = timeSlot * this.scale; 
    let i = 0;
    while (true) {
        
        if (totalW + itemWidth >= scaleWidth) {
            break;
        }

        totalW += itemWidth;
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.innerText = "" + (minScaleTime + timeSlot * i);
        el.style.width = "" + (itemWidth - 1) + "px"; //-1 for the left border
        this.timeLineScaleContainer.appendChild(el);
        i++;
    }

    if (totalW < scaleWidth) 
    {
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.style.width = "" + (scaleWidth - totalW) + "px";
        this.timeLineScaleContainer.appendChild(el);
    }
  }
  //EndOf Scale handler
}
