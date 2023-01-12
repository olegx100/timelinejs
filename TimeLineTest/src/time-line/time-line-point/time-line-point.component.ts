import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { GraphDateScale, IScaleEventReceiver } from '../GraphDateScale';
import { ITimeLineItem, ITimeLineItemsProvider, TimeLinePointLegend } from '../ITimeLineSeriesEvents';

@Component({
  selector: 'app-time-line-point',
  templateUrl: './time-line-point.component.html',
  styleUrls: ['./time-line-point.component.css'], 
  encapsulation: ViewEncapsulation.None,
})
export class TimeLinePointComponent implements IScaleEventReceiver {
  @ViewChild('timelinePointContainer', { static:false }) rootEl: ElementRef<HTMLCanvasElement>;
  @Input('series') series: ITimeLineItemsProvider;
  
  ctrlContainer: HTMLCanvasElement; 
  private ctx: CanvasRenderingContext2D | null;
  popup: HTMLDivElement | null;
  selectedItem: ITimeLineItem | null;

  yLine = 32;

  constructor (private timeScale: GraphDateScale) {

  }

  ngAfterViewInit() {

    if (!this.series?.legend) 
    {
      this.series.legend = new TimeLinePointLegend ();
      this.series.legend.borderColor = "salmon";
      this.series.legend.fillColor = "lemonshiffon";
      this.series.legend.pointSize = 9;
    }

    if (!this.series.items) 
      this.series.items = [];

    this.ctrlContainer = this.rootEl.nativeElement;
    this.ctrlContainer.addEventListener("mousedown", this.mouseDown.bind(this));
    
    if (this.series.legend.pointSize <= 0)
      this.series.legend.pointSize = 9;

    this.ctx = this.rootEl.nativeElement.getContext("2d", { alpha: false });
    this.timeScale.registerRedrawEventCallback(this);
    //window.addEventListener ('resize', this.resize.bind(this));
  }

  resize () {
    if (!this.ctx)
      return;

    const r = this.ctrlContainer.getBoundingClientRect();

    let dpr = window.devicePixelRatio;
    if (dpr < 1)
      dpr = 1; //fix black area on browser scale < 100%

    this.ctx.canvas.width = this.timeScale.widthPx * dpr;
    this.ctx.canvas.height = r.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.ctrlContainer.style.width = `${this.timeScale.widthPx}px`;
  }

  getMinTime () : number {
    if (!this.series.items.length)
      return NaN;
    
    return this.series.items[0].Start;
  }

  getMaxTime () : number {
    if (!this.series.items.length)
      return NaN;

    return this.series.items[this.series.items.length - 1].Start + this.series.items[this.series.items.length - 1].Duration;
  }
  
  drawPoint (x: number, item: ITimeLineItem) {
    if (!this.ctx)
      return;
  
    let y = this.yLine;  
    this.ctx.save();
    
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.PI / 4);
    
    let w = this.series.legend.pointSize / 2;

    if (item === this.selectedItem) {
      this.ctx.fillStyle = "gold";  
      this.ctx.fillRect(-w - 2 , -w - 2, this.series.legend.pointSize + 4, this.series.legend.pointSize + 4); 

      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "gold";
      this.ctx.beginPath();
      this.ctx.moveTo (-this.series.legend.pointSize, -this.series.legend.pointSize);
      this.ctx.lineTo (this.series.legend.pointSize, this.series.legend.pointSize);
      this.ctx.stroke();

      this.createTooltip (x, y, item);
    }

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.series.legend.borderColor;
    this.ctx.beginPath();
    this.ctx.moveTo (-this.series.legend.pointSize, -this.series.legend.pointSize);
    this.ctx.lineTo (this.series.legend.pointSize, this.series.legend.pointSize);
    this.ctx.stroke();

    this.ctx.fillStyle = this.series.legend.borderColor;
    this.ctx.fillRect(-w, -w, this.series.legend.pointSize, this.series.legend.pointSize); 

    this.ctx.fillStyle = this.series.legend.fillColor;
    this.ctx.fillRect(-w + 2 , -w + 2, this.series.legend.pointSize - 4, this.series.legend.pointSize - 4); 

    this.ctx.restore();
  }

  redraw () {

    if (this.ctx == null)
      return;

    this.removeTooltip(); 
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.beginPath();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.series.legend.borderColor;
    this.ctx.moveTo(0, this.yLine);
    this.ctx.lineTo(this.ctx.canvas.width, this.yLine);
    this.ctx.stroke();

    const items = this.series.items;    
    if (!items.length)
      return;

    let i = 0;  
    //Skip all items below start point
    while (i < items.length && items[i].Start < this.timeScale.minTime)
      i++;

    if (i >= items.length || items[0].Start >= this.timeScale.maxTime) 
      return;

    let lastX = -1000;
    //Draw all items in time range 
    let n = 0;
    while (i < items.length && items[i].Start <= this.timeScale.maxTime) {
      let x = this.timeScale.timeToPx(items[i].Start);
      if (items[i] == this.selectedItem || x - lastX >= 4) {     
          this.drawPoint (x, items[i]);
          lastX = x;
          n++;
      }
      i++;
    } 
  }

  unselectItem () {
    this.removeTooltip();
    if (this.selectedItem) {
      this.setSelectedItem (null, null);
    }
  }

  getNearestItem (x: number, y: number) {
    const items = this.series.items;
    if (!items.length)
      return null;

    if (Math.abs(this.yLine - y) >=  5)
      return null;
    
    const time = this.timeScale.pxToTime (x);
    const minTime = this.timeScale.pxToTime (x - 5);
    const maxTime = this.timeScale.pxToTime (x + 5);

    if (items[0].Start > maxTime)
      return null;
    
    if (items[items.length - 1].Start < minTime)
      return null;

    let i = 0;
    while (i < items.length && items[i].Start <= minTime) i++;

    let ret = null;
    let dt = maxTime - minTime + 1;
    let ct;
    while (i < items.length && items[i].Start <= maxTime) {
      ct = Math.abs(items[i].Start - time);
      if (ct < dt) {
        ret = items[i];
        dt = ct;
      }
      i++;
    }
    return ret;
  }

  private removeTooltip() {
    if (this.popup) {
      document.body.removeChild(this.popup);  
      this.popup = null;
    }
  }

  private createTooltip(x: number, y: number, item: ITimeLineItem) {
    this.removeTooltip();
    
    const rect = this.ctrlContainer.getBoundingClientRect();
    let popup = document.createElement('div');
    popup.classList.add("tooltip");
    popup.style.top = (rect.top).toString() + "px";
    popup.style.left =(rect.left + x).toString() + "px";
    this.series.onNewItemSelected (item, popup);
    document.body.appendChild(popup);

    this.popup = popup;
  }

  mouseDown (evt: any) {
    const offsetInPx = evt.x - this.ctrlContainer.getBoundingClientRect().left;
    const yOffsetInPx = evt.y - this.ctrlContainer.getBoundingClientRect().top;
    this.unselectItem();
    this.redraw();
    const item = this.getNearestItem (offsetInPx, yOffsetInPx); 
    if (item) {
      this.selectedItem = item;
      this.drawPoint (this.timeScale.timeToPx(item.Start), item);
    }
  }

  setSelectedItem (item: ITimeLineItem | null, el: HTMLElement | null) {
    this.selectedItem = item;
    this.series.onNewItemSelected (item, el);
  }

}