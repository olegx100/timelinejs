import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GraphDateScale, IScaleEventReceiver } from '../GraphDateScale';
import { ITimeLineItem, ITimeLineItemsProvider } from '../ITimeLineSeriesEvents';

const emptyStateName = "_EmptyState_";

@Component({
  selector: 'app-time-line-span',
  templateUrl: './time-line-span.component.html',
  styleUrls: ['./time-line-span.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class TimeLineSpanComponent implements OnInit, IScaleEventReceiver {
  @ViewChild('timelineMainContainer', { static:false }) rootEl: ElementRef<HTMLDivElement>;

  @Input('series') series: ITimeLineItemsProvider;

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
    const items = this.series.items;
    if (!items?.length)
      return;

    items.sort ((i1, i2) => { return i1.Start - i2.Start});
    //Insert empty states to fill gaps
    for(let i = 1; i < items.length; i++) {
      let duration = items[i].Start - items[i-1].Start;
      if (duration < items[i-1].Duration || items[i-1].Duration < 0)
        items[i-1].Duration = duration;
      
      if (duration > items[i-1].Duration) {

        let newStart = items[i-1].Start + items[i-1].Duration;
        let newState = {
          Start: newStart, 
          Duration: items[i].Start - newStart,
          State: emptyStateName};
        
        items.splice(i, 0, newState);
        i++;
      }
      
      if (items[i].Duration < 0)
        items[i].Duration = 0;
    }
  }

  createTimeSpan (item: ITimeLineItem | null, w: number) {
    const el = document.createElement("div");
    this.series.onNewItemCreated (item, el);
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

    const items = this.series?.items;
    if (!this.series?.items?.length)
      return;

    //Skip all items below start point
    while (i < items.length && items[i].Start + items[i].Duration <= this.timeScale.minTime)
      i++;

    if (i >= items.length || items[0].Start >= this.timeScale.maxTime) 
      return;

    //Partial 1st item draw
    if (items[i].Start < this.timeScale.minTime) {  
      w = this.timeScale.durationToPx(items[i].Start + items[i].Duration - this.timeScale.minTime);
      const el = this.createTimeSpan(items[i], w);
      totalW = w;
      i++;
    }

    //Add empty span at the beginning
    if (items.length > 0 && items[0].Start > this.timeScale.minTime) {
      w = this.timeScale.durationToPx(items[0].Start - this.timeScale.minTime);
      
      const el = this.createTimeSpan(null, w);
      el.classList.add (emptyStateName);
      //el.innerText = items[0].State;
      totalW = w;        
    }
    
    let dw = 0;
    //Draw all items in time range 
    while (totalW < this.timeScale.widthPx && i < items.length) {
      w = this.timeScale.durationToPx(items[i].Duration);
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
        const el = this.createTimeSpan(items[i], w);
      }
      i++;
    } 
  }

  //for debug
  timeToStr (time: number) {
    return this.datePipe.transform (time, "yyyy-MM-dd HH:mm:ss");
  }

  getMinTime () : number {
    if (!this.series?.items?.length)
      return NaN;
    
    return this.series.items[0].Start;
  }

  getMaxTime () : number {
    if (!this.series?.items?.length)
      return NaN;

    return this.series.items[this.series.items.length - 1].Start + this.series.items[this.series.items.length - 1].Duration;
  }

  resize () {

  }
} 
