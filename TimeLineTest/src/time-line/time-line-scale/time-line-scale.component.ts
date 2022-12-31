import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GraphDateScale, IScaleEventReceiver } from '../GraphDateScale';
import { TimeScaleCalc } from '../TimeScaleCalc';

@Component({
  selector: 'app-time-line-scale',
  templateUrl: './time-line-scale.component.html',
  styleUrls: ['./time-line-scale.component.css'], 
  encapsulation: ViewEncapsulation.None,
})

export class TimeLineScaleComponent implements OnInit, IScaleEventReceiver {
  @ViewChild('timelineScaleContainer', { static:false }) scaleRootEl: ElementRef<HTMLDivElement>;
  @Input("nScales") nScales:number = 0;
  timeLineScaleContainer: HTMLDivElement;
  
  timelineCalc : TimeScaleCalc;
  datePipe: DatePipe;
  
  timeFormatMs   = "HH:mm:ss.SSS";
  timeFormat     = "HH:mm:ss";
  dateTimeFormat = "dd.MM.yy HH:mm";
  dateFormat     = "dd.MM.yy";
  yearFormat     = "yyyy";

  constructor(private timeScale: GraphDateScale) { 
    this.timelineCalc  = new TimeScaleCalc();
    this.datePipe = new DatePipe ("en-US");
  }

  ngOnInit() {
    this.timeScale.registerRedrawEventCallback(this);
  }

  ngAfterViewInit () {
    if (!this.nScales || !this.scaleRootEl) 
      return;
    
    this.timeLineScaleContainer = this.scaleRootEl.nativeElement;
    this.timeLineScaleContainer.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.timeLineScaleContainer.addEventListener("mousedown", this.startDrag.bind(this));
    this.timeLineScaleContainer.addEventListener("mouseup", this.endDrag.bind(this));
    this.timeLineScaleContainer.addEventListener('mousemove', this.drag.bind(this));      
  }

  onMouseWheel (evt) {

    const offsetInPx = evt.x - this.timeLineScaleContainer.getBoundingClientRect().left;
    if (evt.wheelDelta > 0)
      this.timeScale.changeScale (offsetInPx, 1.1);
    else
      this.timeScale.changeScale (offsetInPx, 1/1.1);
  }

  startDrag (evt) {
    const offsetInPx = evt.x - this.timeLineScaleContainer.getBoundingClientRect().left;
    this.timeScale.startDrag(offsetInPx);
  }

  drag (evt) {
    const offsetInPx = evt.x - this.timeLineScaleContainer.getBoundingClientRect().left;
    this.timeScale.drag(offsetInPx, evt.buttons);
  }

  endDrag (evt) {
    this.timeScale.endDrag();
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

  redraw () {
    if (!this.timeLineScaleContainer)
      return;

    const scaleWidth = this.timeScale.widthPx;

    let timeSlot = TimeScaleCalc.getScaleSize ((this.timeScale.maxTime - this.timeScale.minTime) / this.nScales);
    let minScaleTime = TimeScaleCalc.getNearestBiggerScalePoint(this.timeScale.minTime, timeSlot);

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

    let currScaleTime = minScaleTime;
    let itemWidth = 0;
    let i = 0;
    let fmtStr = this.getScaleFormatStr(timeSlot);
    while (totalW < scaleWidth) {
        let nextScaleTime = TimeScaleCalc.getNextScaleValue (currScaleTime, timeSlot);
        itemWidth = this.timeScale.durationToPx (nextScaleTime - currScaleTime);

        if (totalW + itemWidth > scaleWidth)
          itemWidth = scaleWidth - totalW;

        totalW += itemWidth;
        const el = document.createElement("div");
        el.classList.add ("scaleSpanItem");
        
        el.innerText = this.datePipe.transform(currScaleTime, fmtStr);
        el.style.width = "" + itemWidth + "px";
        this.timeLineScaleContainer.appendChild(el);
        currScaleTime = nextScaleTime;
        i++;
    }
  }

  //EndOf Scale handler
}
