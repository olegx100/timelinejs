import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeScaleCalc } from '../TimeScaleCalc';
import { GraphDateScale } from '../GraphDateScale';

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

  timeFormat = "HH:mm:ss";
  mainContainer: HTMLDivElement; 
  timeLineScaleContainer: HTMLDivElement;
  timelineCalc : TimeScaleCalc;
  timeScale: GraphDateScale;

  constructor() {
    this.timelineCalc  = new TimeScaleCalc();
    this.timeScale = new GraphDateScale();
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

    //Insert empty states to fill gaps
    for(let i = 1; i < this.items.length; i++) {
      let duration = this.items[i].Start - this.items[i-1].Start;
      if (duration < this.items[i-1].Duration)
        this.items[i-1].Duration = duration;
      
      if (duration > this.items[i-1].Duration) {

        let newStart = this.items[i-1].Start + this.items[i-1].Duration;
        let newState = {
          Start: newStart, 
          Duration:  this.items[i].Start - newStart,
          State: "_EmptyState_"};
        
        this.items.splice(i, 0, newState);
        i++;
      }
    }
    
    this.autoScale();
  }

  getWidth () {
    return Math.floor(this.mainContainer.clientWidth);
  }

  onResize (evt) {
    this.autoScale();
  }

  createTimeSpan (datepipe, item, w) {
    const el = document.createElement("div");
    if (item) 
      el.innerText = datepipe.transform(item.Start, this.timeFormat); //this.items[startIdx].State;
    
    el.classList.add ("timeLineItem");
    el.style.width = "" + w + "px";
    this.mainContainer.appendChild(el);
    return el;
  }

  drawItems () {

    while (this.mainContainer.firstChild) {
      this.mainContainer.removeChild(this.mainContainer.firstChild);
    }

    const datepipe: DatePipe = new DatePipe('en-US')

    let i = 0;
    let totalW = 0;
    let w: number;

    //Skip all items below start point
    while (i < this.items.length && this.items[i].Start + this.items[i].Duration <= this.timeScale.minTime)
      i++;

    if (i >= this.items.length)  
      return;

    if (this.items[i].Start < this.timeScale.minTime) {  
      w = this.timeScale.durationToPx(this.items[i].Start + this.items[i].Duration - this.timeScale.minTime);
      const el = this.createTimeSpan(datepipe, null, w);
      el.innerText = datepipe.transform(this.items[i].Start, this.timeFormat); //this.items[startIdx].State;
      el.classList.add (this.items[i].State);
      totalW = w;
      i++;
    }

    //Add empty span at the beginning
    if (this.items.length > 0 && this.items[0].Start > this.timeScale.minTime && this.items[0].Start < this.timeScale.maxTime) {
      w = this.timeScale.durationToPx(this.items[0].Start - this.timeScale.minTime);
      
      const el = this.createTimeSpan(datepipe, null, w);
      el.classList.add ("_EmptyState_");
      el.innerText = datepipe.transform(this.timeScale.minTime, this.timeFormat); //this.items[startIdx].State;
      totalW = w;        
    }
    
    //Draw all items in time range 
    while (totalW < this.timeScale.widthPx && i < this.items.length) {
      w = this.timeScale.durationToPx(this.items[i].Duration);
      if (totalW + w >= this.timeScale.widthPx) {
        w = this.timeScale.widthPx - totalW;
      }
      totalW += w; 
      const el = this.createTimeSpan(datepipe, this.items[i], w);
      el.classList.add (this.items[i].State);
      i++;
    } 

    //this.refreshScale();
  }

  autoScale () {
    if (this.items.length > 0) {
      let minTime = this.items[0].Start;
      let maxTime = this.items[this.items.length - 1].Start + this.items[this.items.length - 1].Duration;
      this.timeScale.widthPx = this.getWidth();
      
      //TODO: set default scale for empty list
      this.timeScale.minTime = minTime;
      this.timeScale.maxTime = maxTime;
    }
    
    this.drawItems ();
  }

  onMouseWheel (evt) {

    const offsetInPx = evt.x - this.mainContainer.getBoundingClientRect().left;
    if (evt.wheelDelta > 0)
      this.timeScale.changeScale (offsetInPx, 1.1);
    else
      this.timeScale.changeScale (offsetInPx, 1/1.1);
     
    this.drawItems ();
  }

  startDrag (evt) {
    const offsetInPx = evt.x - this.mainContainer.getBoundingClientRect().left;
    this.timeScale.startDrag(offsetInPx);
    //this.drawItems();
  }

  drag (evt) {
    const offsetInPx = evt.x - this.mainContainer.getBoundingClientRect().left;
    if (this.timeScale.drag(offsetInPx, evt.buttons))
      this.drawItems();
  }

  endDrag (evt) {
    this.timeScale.endDrag();
    //this.drawItems();
  }

  getSlotSize (slotSize) {

    let scaleCalc = new TimeScaleCalc();
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

/*
refreshScale () {
    if (!this.timeLineScaleContainer)
      return;

    const scaleWidth = this.getWidth();
    let minTime = this.px2time(0);
    let maxTime = this.px2time(scaleWidth);
    let timeSpan = maxTime - minTime;
    let timeSlot = this.timelineCalc.getScaleValue(timeSpan / this.nScales, minTime);
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
  */
} 
