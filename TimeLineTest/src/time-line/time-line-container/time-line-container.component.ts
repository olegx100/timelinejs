import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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
    this.timeScale.endDrag();
  }
}
