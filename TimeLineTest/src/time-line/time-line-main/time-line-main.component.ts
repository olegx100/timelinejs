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
  //@Input('minTime') minTime: Date;
  //@Input('maxTime') maxTime: Date;

  timeFormatMs   = "HH:mm:ss.SSS";
  timeFormat     = "HH:mm:ss";
  dateTimeFormat = "dd.MM.yy HH:mm";
  dateFormat     = "dd.MM.yy";
  yearFormat     = "yyyy";

  mainContainer: HTMLDivElement; 
  timeLineScaleContainer: HTMLDivElement;
  timelineCalc : TimeScaleCalc;
  timeScale: GraphDateScale;
  datePipe: DatePipe;

  constructor() {
    this.timelineCalc  = new TimeScaleCalc();
    this.timeScale = new GraphDateScale();
    this.datePipe = new DatePipe('en-US');
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
    this.items.sort ((i1, i2) => { return i1.Start - i2.Start});
    //Insert empty states to fill gaps
    for(let i = 1; i < this.items.length; i++) {
      let duration = this.items[i].Start - this.items[i-1].Start;
      if (duration < this.items[i-1].Duration || this.items[i-1].Duration < 0)
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
      
      if (this.items[i].Duration < 0)
        this.items[i].Duration = 0;
    }
    
    this.autoScale();
  }

  getWidth () {
    return Math.floor(this.mainContainer.clientWidth);
  }

  onResize (evt) {
    this.autoScale();
  }

  createTimeSpan (item, w) {
    const el = document.createElement("div");
    if (item) 
      el.innerText = this.datePipe.transform(item.Start, this.timeFormat); //this.items[startIdx].State;
    
    el.classList.add ("timeLineItem");
    el.style.width = "" + w + "px";
    this.mainContainer.appendChild(el);
    return el;
  }

  drawItems () {

    while (this.mainContainer.firstChild) {
      this.mainContainer.removeChild(this.mainContainer.firstChild);
    }

    let i = 0;
    let totalW = 0;
    let w: number;

    //Skip all items below start point
    while (i < this.items.length && this.items[i].Start + this.items[i].Duration <= this.timeScale.minTime)
      i++;

    if (i >= this.items.length || this.items[0].Start >= this.timeScale.maxTime) 
    {
      this.refreshScale();
      return;
    }


    if (this.items[i].Start < this.timeScale.minTime) {  
      w = this.timeScale.durationToPx(this.items[i].Start + this.items[i].Duration - this.timeScale.minTime);
      const el = this.createTimeSpan(this.items[i], w);
      el.classList.add (this.items[i].State);
      totalW = w;
      i++;
    }

    //Add empty span at the beginning
    if (this.items.length > 0 && this.items[0].Start > this.timeScale.minTime) {
      w = this.timeScale.durationToPx(this.items[0].Start - this.timeScale.minTime);
      
      const el = this.createTimeSpan(null, w);
      el.classList.add ("_EmptyState_");
      el.innerText = this.datePipe.transform(this.timeScale.minTime, this.timeFormat); //this.items[startIdx].State;
      totalW = w;        
    }
    
    //Draw all items in time range 
    while (totalW < this.timeScale.widthPx && i < this.items.length) {
      w = this.timeScale.durationToPx(this.items[i].Duration);
      if (totalW + w >= this.timeScale.widthPx) {
        w = this.timeScale.widthPx - totalW;
      }
      totalW += w; 
      const el = this.createTimeSpan(this.items[i], w);
      el.classList.add (this.items[i].State);
      i++;
    } 

    this.refreshScale();
  }

  autoScale () {

    //TODO: !!! Limits ???
    //this.timeScale.minTimeLimit = (new Date (2020, 0, 1)).getTime();
    //this.timeScale.maxTimeLimit = (new Date (2023, 0, 1)).getTime();

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
  }

  drag (evt) {
    const offsetInPx = evt.x - this.mainContainer.getBoundingClientRect().left;
    if (this.timeScale.drag(offsetInPx, evt.buttons))
      this.drawItems();
  }

  endDrag (evt) {
    this.timeScale.endDrag();
  }

  timeToStr (time) {
    let pl = new DatePipe ('en-US');
    return pl.transform (time, "yyyy-MM-dd HH:mm:ss");
  }

  getScaleFormatStr (scaleSize) {
    if (scaleSize < 10000)
      return this.timeFormatMs;
  
    if (scaleSize < 3600000 * 2)
      return this.timeFormat;

    if (scaleSize < TimeScaleCalc.getMsecInDay())
        return this.dateTimeFormat;

    if (scaleSize < TimeScaleCalc.getMsecInYear())
        return this.dateFormat;
    
    return this.yearFormat;
  }

  refreshScale () {
    if (!this.timeLineScaleContainer)
      return;

    const scaleWidth = this.timeScale.widthPx;

    let timeSlot = TimeScaleCalc.getScaleSize ((this.timeScale.maxTime - this.timeScale.minTime) / this.nScales);
    let minScaleTime = TimeScaleCalc.getNearestBiggerScalePoint(timeSlot, this.timeScale.minTime);

    while (minScaleTime < this.timeScale.minTime) {
        minScaleTime += timeSlot;
    }

    while (this.timeLineScaleContainer.firstChild) {
        this.timeLineScaleContainer.removeChild(this.timeLineScaleContainer.firstChild);
    }

    let totalW = this.timeScale.timeToPx(minScaleTime);

    if (totalW > 0) 
    {
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        el.classList.add ("scaleEdgeSpanItem");
        el.style.width = "" + totalW + "px";
        this.timeLineScaleContainer.appendChild(el);
    }

    //console.log ("minTime:", this.timeToStr(minScaleTime), minScaleTime);

    let currScaleTime = minScaleTime;
    let itemWidth = 0;
    let i = 0;
    let fmtStr = this.getScaleFormatStr(timeSlot);
    while (totalW + itemWidth < scaleWidth) {
        let nextScaleTime = TimeScaleCalc.getNextScaleValue (currScaleTime, timeSlot);
        itemWidth = this.timeScale.durationToPx (nextScaleTime - currScaleTime);

        if (totalW + itemWidth > scaleWidth)
          itemWidth = scaleWidth - totalW;

        totalW += itemWidth;
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        
        console.log ("currtimeScale:", this.timeToStr(currScaleTime));
        el.innerText = this.datePipe.transform(currScaleTime, fmtStr);
        el.style.width = "" + itemWidth + "px";
        this.timeLineScaleContainer.appendChild(el);
        currScaleTime = nextScaleTime;
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
