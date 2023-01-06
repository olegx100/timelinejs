import { DatePipe } from '@angular/common';
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
  datePipe: DatePipe;
  rect: DOMRect;

  constructor (private timeScale: GraphDateScale) {
    this.datePipe = new DatePipe ('en-US');
  }

  ngAfterViewInit() {
    this.ctrlContainer = this.rootEl.nativeElement;
    console.log (this.rootEl.nativeElement);
    this.ctx = this.rootEl.nativeElement.getContext("2d", { alpha: false });
    this.timeScale.registerRedrawEventCallback(this);
    this.ctrlContainer.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.ctrlContainer.addEventListener("mousedown", this.startDrag.bind(this));
    this.ctrlContainer.addEventListener("mouseup", this.endDrag.bind(this));
    this.ctrlContainer.addEventListener('mousemove', this.drag.bind(this));

    this.init ();
  }

  init () {
    if (!this.ctx)
      return;

    const r = this.ctrlContainer.getBoundingClientRect();
    if (this.rect && r.width === this.rect.width && r.height === this.rect.height)
      return;
      
    this.rect = r;

    const dpr = window.devicePixelRatio;
    this.ctx.canvas.width = r.width * dpr;
    this.ctx.canvas.height = r.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.ctrlContainer.style.width = `${r.width}px`;
    this.ctrlContainer.style.height = `${r.height}px`;
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
  
  drawDiamond (x: number, text: string | null = null) {
    if (!this.ctx)
      return;
  
    let w = 9; 
    const y = 16;
    this.ctx.save();
    
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.PI / 4);

    if (text) {
      this.ctx.fillStyle = "gold";  
      this.ctx.fillRect(-w/2 - 2 , -w / 2 - 2, w + 4, w + 4); 

      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "gold";
      this.ctx.beginPath();
      this.ctx.moveTo (0,0);
      this.ctx.lineTo (8, 8);
      this.ctx.stroke();
    }

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "salmon";
    this.ctx.beginPath();
    this.ctx.moveTo (0,0);
    this.ctx.lineTo (8, 8);
    this.ctx.stroke();

    this.ctx.fillStyle = "salmon";
    this.ctx.fillRect(-w/2, -w/2, w, w); 
    this.ctx.fillStyle = "aqua";
    this.ctx.fillRect(-w/2 + 2 , -w/2 + 2, w - 4, w - 4); 

    this.ctx.restore();

    if (text) {
      this.ctx.font = "12px Roboto";
      const tm = this.ctx.measureText(text);
      this.ctx.strokeText(text, x - tm.width / 2, y - 8);
    }
  }

  redraw () {

    if (this.ctx == null || !this.items.length)
      return;

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    let i = 0;  
    //Skip all items below start point
    while (i < this.items.length && this.items[i].Start < this.timeScale.minTime)
      i++;

    if (i >= this.items.length || this.items[0].Start >= this.timeScale.maxTime) 
      return;

    let lastX = -1000;
    //Draw all items in time range 
    let n = 0;
    while (i < this.items.length && this.items[i].Start <= this.timeScale.maxTime) {
      let x = this.timeScale.timeToPx(this.items[i].Start);
      if (this.items[i].Selected || x - lastX >= 4) {     
        if (this.items[i].Selected) {
          this.drawDiamond ( x, this.datePipe.transform(this.items[i].Start, "yy-MM-dd HH:mm:ss.SSS"));
        }
        else {
          this.drawDiamond (x);
        }
        
        lastX = x;
        n++;
      }
      i++;
    } 
  }

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


    const item = this.getNearestItem (offsetInPx); 
    console.log("item:", item);
    if (item) {
      item.Selected = !item.Selected;
      if (item.Selected)
        this.drawDiamond (this.timeScale.timeToPx(item.Start), this.datePipe.transform(item.Start, "yy-MM-dd HH:mm:ss.SSS"));
       else
         this.redraw(); 
    }

    //const yOffsetInPx = evt.y - this.ctrlContainer.getBoundingClientRect().top;
    //this.drawDiamond (offsetInPx, yOffsetInPx, 10);
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

  getNearestItem (x: number) {
    if (!this.items.length)
      return null;

    const time = this.timeScale.pxToTime (x);
    const minTime = this.timeScale.pxToTime (x - 5);
    const maxTime = this.timeScale.pxToTime (x + 5);

    if (this.items[0].Start > maxTime)
      return null;
    
    if (this.items[this.items.length - 1].Start < minTime)
      return null;

    let i = 0;
    while (i < this.items.length && this.items[i].Start <= minTime) i++;

    let ret = null;
    let dt = maxTime - minTime + 1;
    let ct;
    while (i < this.items.length && this.items[i].Start <= maxTime) {
      ct = Math.abs(this.items[i].Start - time);
      if (ct < dt) {
        ret = this.items[i];
        dt = ct;
      }
      i++;
    }
    return ret;
  }
}