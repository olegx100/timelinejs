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
  @Input('PointSize') glyphSize: number;

  ctrlContainer: HTMLCanvasElement; 
  private ctx: CanvasRenderingContext2D | null;
  datePipe: DatePipe;
  rect: DOMRect;
  popup: HTMLDivElement | null;

  yLine = 32;

  constructor (private timeScale: GraphDateScale) {
    this.datePipe = new DatePipe ('en-US');
    if (!this.glyphSize)
      this.glyphSize = 9;
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
  
  drawPoint (x: number, text: string | null = null) {
    if (!this.ctx)
      return;
  
    let y = this.yLine;  
    this.ctx.save();
    
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.PI / 4);
    
    let w = this.glyphSize / 2;

    if (text) {
      this.ctx.fillStyle = "gold";  
      this.ctx.fillRect(-w - 2 , -w - 2, this.glyphSize + 4, this.glyphSize + 4); 

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
    this.ctx.fillRect(-w, -w, this.glyphSize, this.glyphSize); 
    this.ctx.fillStyle = "aqua";
    this.ctx.fillRect(-w + 2 , -w + 2, this.glyphSize - 4, this.glyphSize - 4); 

    this.ctx.restore();

    if (text) {
/*      
      this.ctx.font = "100 12px Roboto";
      const tm = this.ctx.measureText(text);
      let h = tm.actualBoundingBoxAscent + tm.fontBoundingBoxDescent + 6;
      console.log (tm);

      this.ctx.fillStyle = "brown";
      this.ctx.fillRect(x - tm.width / 2 - 10, y - 30, tm.width + 20, h); 
      
      this.ctx.fillStyle = "lemonchiffon";
      this.ctx.fillRect(x - tm.width / 2 - 9, y - 29, tm.width + 18, h - 2); 

      this.ctx.strokeText(text, x - tm.width / 2 - 2, y - 17);
*/
      this.createTooltip (x, y, text);
    }
  }

  redraw () {

    if (this.ctx == null || !this.items.length)
      return;

    this.removeTooltip(); 
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    this.ctx.beginPath();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "dimgray";
    this.ctx.moveTo(0, this.yLine);
    this.ctx.lineTo(this.ctx.canvas.width, this.yLine);
    this.ctx.stroke();

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
          this.drawPoint ( x, this.datePipe.transform(this.items[i].Start, "yy-MM-dd HH:mm:ss.SSS"));
        }
        else {
          this.drawPoint (x);
        }
        
        lastX = x;
        n++;
      }
      i++;
    } 
  }

  unselectAll () {
    this.removeTooltip();

    for (let i = 0; i<this.items.length; i++) {
      if (this.items[i].Selected)
        this.items[i].Selected = undefined;
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

    const yOffsetInPx = evt.y - this.ctrlContainer.getBoundingClientRect().top;
    this.unselectAll();
    this.redraw();
    const item = this.getNearestItem (offsetInPx, yOffsetInPx); 
    console.log("item:", item);
    if (item) {
      item.Selected = !item.Selected;
      let text = null;
      if (item.Selected) 
         text = this.datePipe.transform(item.Start, "yy-MM-dd HH:mm:ss.SSS");
        
      this.drawPoint (this.timeScale.timeToPx(item.Start), text);
    }
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

  getNearestItem (x: number, y: number) {
    if (!this.items.length)
      return null;

    if (Math.abs(this.yLine - y) >=  5)
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

  private removeTooltip() {
    if (this.popup) {
      document.body.removeChild(this.popup);  
      this.popup = null;
    }
  }

  private createTooltip(x: number, y: number, text: string) {
    this.removeTooltip();

    const rect = this.ctrlContainer.getBoundingClientRect();
    console.log ("createTooltip");
    let popup = document.createElement('div');
    popup.innerHTML = text;
    popup.classList.add("tooltip");
    popup.style.top = (rect.top).toString() + "px";
    popup.style.left =(rect.left + x).toString() + "px";

    document.body.appendChild(popup);
    this.popup = popup;
  }
}