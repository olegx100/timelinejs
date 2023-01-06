import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { GraphDateScale, IScaleEventReceiver } from '../GraphDateScale';

@Component({
  selector: 'app-time-line-point',
  templateUrl: './time-line-point.component.html',
  styleUrls: ['./time-line-point.component.css'], 
  encapsulation: ViewEncapsulation.None,
})
export class TimeLinePointComponent implements IScaleEventReceiver {
  @ViewChild('timelinePointContainer', { static:false }) rootEl: ElementRef<HTMLCanvasElement>;
  @Input('items') items: Array<any> = [];
  
  ctrlContainer: HTMLCanvasElement; 
  private ctx: CanvasRenderingContext2D | null;
  constructor (private timeScale: GraphDateScale) {

  }

  ngAfterViewInit() {
    this.ctrlContainer = this.rootEl.nativeElement;
    console.log (this.rootEl.nativeElement);
    this.ctx = this.rootEl.nativeElement.getContext("2d");
    this.timeScale.registerRedrawEventCallback(this);
    this.ctrlContainer.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.ctrlContainer.addEventListener("mousedown", this.startDrag.bind(this));
    this.ctrlContainer.addEventListener("mouseup", this.endDrag.bind(this));
    this.ctrlContainer.addEventListener('mousemove', this.drag.bind(this));

    let rect = this.ctrlContainer.getClientRects();
    if (this.ctx) {
      this.ctx.canvas.width = rect[0].width;
      this.ctx.canvas.height = rect[0].height;
      //this.ctx?.scale(1, 1);
    }
    
    console.log(rect, );
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
  
  drawDiamond (x: number, y: number, w: number) {
    if (!this.ctx)
      return;
  
    this.ctx.save();
    
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'red';
    
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.PI / 4);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    for (var i = 0; i < 3; i++)
    {
      this.ctx.lineTo(8, 8);
    }
    this.ctx.stroke();

    this.ctx.fillStyle = "salmon";
    this.ctx.fillRect(-w/2, -w/2, w, w); 
    this.ctx.fillStyle = "aqua";
    this.ctx.fillRect(-w/2 + 2 , -w/2 + 2, w - 4, w - 4); 

    this.ctx.restore();
  }

  redraw () {

    if (this.ctx == null || !this.items.length)
      return;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    let i = 0;  
    //Skip all items below start point
    while (i < this.items.length && this.items[i].Start < this.timeScale.minTime)
      i++;

    if (i >= this.items.length || this.items[0].Start >= this.timeScale.maxTime) 
      return;

    let dw = 0;
    //Draw all items in time range 
    while (i < this.items.length && this.items[i].Start <= this.timeScale.maxTime) {
      this.drawDiamond (this.timeScale.timeToPx(this.items[i].Start), 10, 8);
      i++;
    } 
  }
  /*
  redraw2 () {

    while (this.ctrlContainer.firstChild) {
      this.ctrlContainer.removeChild(this.ctrlContainer.firstChild);
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
      const el = this.createPoint(this.items[i], w, "");
      //el.classList.add (this.items[i].State);
      totalW = w;
      i++;
    }

    //Add empty span at the beginning
    if (this.items.length > 0 && this.items[0].Start > this.timeScale.minTime) {
      w = this.timeScale.durationToPx(this.items[0].Start - this.timeScale.minTime);
      
      const el = this.createPoint(null, w, "");
      el.classList.add ("_EmptyState_");
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
        const el = this.createPoint(this.items[i], w, (this.items[i].Duration / 60000).toString());
        //el.classList.add (this.items[i].State);
      }
      i++;
    } 
  }

  createPoint (item: any, w: number, text: string) {
    const el = document.createElement("div");
    el.innerText = text;
    
    el.classList.add ("scalePointItem");
    el.style.width = "" + w + "px";
    this.ctrlContainer.appendChild(el);
    return el;
  }
*/

  onMouseWheel (evt: any) {

    const offsetInPx = evt.x - this.ctrlContainer.getBoundingClientRect().left;
    if (evt.wheelDelta > 0)
      this.timeScale.changeScale (offsetInPx, 1.1);
    else
      this.timeScale.changeScale (offsetInPx, 1/1.1);
  }

  startDrag (evt: any) {
    const offsetInPx = evt.x - this.ctrlContainer.getBoundingClientRect().left;
    this.timeScale.startDrag(offsetInPx);


    const yOffsetInPx = evt.y - this.ctrlContainer.getBoundingClientRect().top;
    this.drawDiamond (offsetInPx, yOffsetInPx, 10);
  }

  drag (evt: any) {
    const offsetInPx = evt.x - this.ctrlContainer.getBoundingClientRect().left;
    this.timeScale.drag(offsetInPx, evt.buttons);
  }

  endDrag (evt: any) {
    this.timeScale.endDrag();
  }

  setIems () : void{
    this.items = [];

  }

}