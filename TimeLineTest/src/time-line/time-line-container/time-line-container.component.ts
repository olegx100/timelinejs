import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { toArray } from 'rxjs';
import { GraphDateScale } from '../GraphDateScale';

@Component({
  selector: 'app-time-line-container',
  templateUrl: './time-line-container.component.html',
  styleUrls: ['./time-line-container.component.css'], 
  providers:[GraphDateScale]
})
export class TimeLineContainerComponent {
  @Input("Series") Series: Array<any>; 
  @ViewChild("timeLineContainer") rootEl: ElementRef<HTMLDivElement>;
  @ViewChild("innerDiv") innerDiv: ElementRef<HTMLDivElement>;
  timeLineContainer:  HTMLDivElement;

  constructor (private timeScale: GraphDateScale) {

  }

  ngAfterViewInit ()  {
    this.timeLineContainer = this.rootEl.nativeElement;

    this.timeLineContainer.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.timeLineContainer.addEventListener("mousedown", this.startDrag.bind(this));
    this.timeLineContainer.addEventListener("mouseup", this.endDrag.bind(this));
    this.timeLineContainer.addEventListener('mousemove', this.drag.bind(this));

    this.timeLineContainer.addEventListener("touchstart", this.touchDown.bind(this));
    this.timeLineContainer.addEventListener('touchmove', this.touchMove.bind(this));
    //touchup is not called after touchmove
    //this.timeLineContainer.addEventListener("touchup", this.endDrag.bind(this));



    this.timeScale.widthPx = this.timeLineContainer.clientWidth;
    window.addEventListener ('resize', this.onWndResize.bind(this));
    this.timeScale.raiseResizeEvent();
    this.timeScale.autoScale();
  }

  onWndResize (evt: any): void {
    this.timeScale.widthPx = this.innerDiv.nativeElement.clientWidth;
    this.timeScale.raiseResizeEvent();
    this.timeScale.raiseRedrawEvent();
  }

  onMouseWheel (evt: any) {
    this.timeScale.onMouseWheel (evt, this.timeLineContainer);
  }

  startDrag (evt: any) {
    const offsetInPx = evt.x - this.timeLineContainer.getBoundingClientRect().left;
    this.timeScale.startDrag(offsetInPx);
  }

  drag (evt: any) {
    const offsetInPx = evt.x - this.timeLineContainer.getBoundingClientRect().left;
    this.timeScale.drag(offsetInPx, evt.buttons);
  }

  endDrag (evt: any) {
    console.log ("touchUp");
    this.timeScale.endDrag();
  }

  touches: Array<any>;
  touchMove (evt: any) {
    this.procTouchMove (evt);
  }
  
  touchDown (evt: any) {
    const offsetInPx = evt.touches[0].pageX - this.timeLineContainer.getBoundingClientRect().left;
    this.timeScale.startDrag(offsetInPx);
    this.touches = evt.touches;
  }

  getTouchChanges (tarr: Array<any>) {
    let res = new Array<any>();
    let i = 0;
    while (i < this.touches.length) {
      let j = 0;
      while (j < tarr.length) {
        if (this.touches[i].identifier == tarr[j].identifier) {
          let pt = {
            "id": this.touches[i].identifier,
            "fromX": this.touches[i].pageX,
            "toX": tarr[i].pageX
          }
          res.push(pt);
        }
        j++
      }
      i++;
    }
    return res;
  }

  procTouchMove (evt: any): void {
    var tArr = this.getTouchChanges (evt.touches);
    if (tArr.length < 1)
      return;

    const offsetInPx = evt.touches[0].pageX - this.timeLineContainer.getBoundingClientRect().left;  
    if (tArr.length == 1)  {
      this.timeScale.drag(offsetInPx, 1);
      return;
    }

    let min = tArr[0];
    let max = tArr[1];
    for (let i = 0; i < tArr.length; i++) {
      if (min.toX - min.fromX > tArr[i].toX - tArr[i].fromX)
        min = tArr[i];
      
      if (max.toX - max.fromX > tArr[i].toX - tArr[i].fromX)
        max = tArr[i];        
    }
    
    let scale = Math.abs (min.fromX - max.fromX);
    if (!scale)
      scale = 1;
    
    scale = Math.abs (min.toX - max.toX)  / scale;
    if (!scale)
      scale = 1;

    let midPoint = (min.toX + max.toX) / 2 - offsetInPx;
    this.timeScale.changeScale(midPoint, scale);
    this.touches = evt.touches;
    evt.preventDefault();
  }
}
