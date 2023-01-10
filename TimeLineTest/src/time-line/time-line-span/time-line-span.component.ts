import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GraphDateScale, IScaleEventReceiver } from '../GraphDateScale';

const emptyStateName = "_EmptyState_";

@Component({
  selector: 'app-time-line-span',
  templateUrl: './time-line-span.component.html',
  styleUrls: ['./time-line-span.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class TimeLineSpanComponent implements OnInit, IScaleEventReceiver {
  @ViewChild('timelineMainContainer', { static:false }) rootEl: ElementRef<HTMLDivElement>;

  @Input('items') items: Array<any> = [];

  mainContainer: HTMLDivElement; 
  timeFormat = "yy-MM-dd HH:mm:ss";
  datePipe: DatePipe;

  constructor(private timeScale: GraphDateScale) {
    this.datePipe = new DatePipe('en-US');
  }

  ngOnInit() {
    this.timeScale.registerRedrawEventCallback(this);
  }

  ngAfterViewInit() {
    this.mainContainer = this.rootEl.nativeElement;
    this.calc();
  }

  //do it on items items
  public calc () {
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
          State: emptyStateName};
        
        this.items.splice(i, 0, newState);
        i++;
      }
      
      if (this.items[i].Duration < 0)
        this.items[i].Duration = 0;
    }
  }

  createTimeSpan (item: any, w: number) {
    const el = document.createElement("div");
    if (item && item.State != emptyStateName) 
      el.innerText = item.State;
    
    el.classList.add ("timeLineItem");
    el.style.width = "" + w + "px";
    this.mainContainer.appendChild(el);
    return el;
  }

  redraw () {

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
      return;

    //Partial 1st item draw
    if (this.items[i].Start < this.timeScale.minTime) {  
      w = this.timeScale.durationToPx(this.items[i].Start + this.items[i].Duration - this.timeScale.minTime);
      const el = this.createTimeSpan(this.items[i], w);
      if (this.items[i].State)
        el.classList.add (this.items[i].State);
      else
        el.classList.add (emptyStateName);
      totalW = w;
      i++;
    }

    //Add empty span at the beginning
    if (this.items.length > 0 && this.items[0].Start > this.timeScale.minTime) {
      w = this.timeScale.durationToPx(this.items[0].Start - this.timeScale.minTime);
      
      const el = this.createTimeSpan(null, w);
      el.classList.add (emptyStateName);
      //el.innerText = this.items[0].State;
      totalW = w;        
    }
    
    let dw = 0;
    //Draw all items in time range 
    while (totalW < this.timeScale.widthPx && i < this.items.length) {
      w = this.timeScale.durationToPx(this.items[i].Duration);
      if (w < 1) {
        dw += w;
        w = 0;
      }
      if (dw >= 1) {
        w += dw;
        dw = 0;
      }

      if (totalW + w >= this.timeScale.widthPx)
        w = this.timeScale.widthPx - totalW;
      
      totalW += w; 
      if (w > 0) {
        const el = this.createTimeSpan(this.items[i], w);
        if (this.items[i].State)
          el.classList.add (this.items[i].State);
        else
        el.classList.add (emptyStateName);
      }
      i++;
    } 
  }

  //for debug
  timeToStr (time: number) {
    return this.datePipe.transform (time, "yyyy-MM-dd HH:mm:ss");
  }

  getMinTime () : number {
    if (!this.items.length)
      return NaN;
    
    return this.items[0].Start;
  }

  getMaxTime () : number {
    if (!this.items.length)
      return NaN;

    return this.items[this.items.length - 1].Start + this.items[this.items.length - 1].Duration;
  }

  resize () {

  }
} 