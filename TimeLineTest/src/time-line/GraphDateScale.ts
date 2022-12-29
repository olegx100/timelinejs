export class GraphDateScale {
  private _widthPx: number;
  public get widthPx(): number {
    return this._widthPx;
  }
  public set widthPx(value: number) {
    this._widthPx = value;
    this.raiseRedrawEvent();
  }

  private _minTime: number;
  public get minTime(): number {
    return this._minTime;
  }
  public set minTime(value: number) {
    this._minTime = value;
    this.raiseRedrawEvent();
  }

  private _maxTime: number;
  public get maxTime(): number {
    return this._maxTime;
  }
  public set maxTime(value: number) {
    this._maxTime = value;
    this.raiseRedrawEvent();
  }

  public timeToPx(timePt) {
    let timeSpan = this._maxTime - this._minTime;
    let scale = timeSpan / this._widthPx;
    return (timePt - this._minTime) / scale;
  }

  public pxToTime(pxPt) {
    return (
      this._minTime + ((this._maxTime - this._minTime) * pxPt) / this._widthPx
    );
  }

  public durationToPx(dt) {
    let timeSpan = this._maxTime - this._minTime;
    return  dt / timeSpan * this._widthPx;
  }

  pxToDuration (dpx) {
      return dpx / this._widthPx * (this._maxTime - this._minTime);      
  }

  public changeScale(xPx, upScale) {
    let timeSpan = this._maxTime - this._minTime;
    let r = xPx / this._widthPx;
    let leftTime = timeSpan * r;
    let rightTime = timeSpan - leftTime;
    let midPoint = this._minTime + leftTime;
    this._minTime = midPoint - leftTime / upScale;
    this._maxTime = midPoint + rightTime / upScale;
    this.raiseRedrawEvent();
  }

  private raiseRedrawEvent() {}

  //Drag and drop handling
  inDrag;
  dragStartX;

  startDrag(pxPt) {
    this.inDrag = true;
    this.dragStartX = pxPt; //x on page, not the container
  }

  endDrag() {
    this.inDrag = false;
  }

  drag(pxPt, buttons):boolean {
    if (!this.inDrag) return false;

    if (buttons == 0) {
      this.endDrag();
      return false;
    }

    let dt = this.pxToDuration(this.dragStartX - pxPt);
    this._minTime += dt;
    this._maxTime += dt;
    this.dragStartX = pxPt;
    this.raiseRedrawEvent();
    return true;
  }
  //EndOf Drag and drop handling
}
