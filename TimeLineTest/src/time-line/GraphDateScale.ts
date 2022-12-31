const minTimeLimit = -2208997240000;

export interface IScaleEventReceiver {
  redraw ();
}

export class GraphDateScale {
  constructor () {
    this.callbacks = [];
  }

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
    if (this.minTimeLimit && this.minTimeLimit > value)
      this._minTime = this.minTimeLimit;
  }

  private _maxTime: number;
  public get maxTime(): number {
    return this._maxTime;
  }
  public set maxTime(value: number) {
    this._maxTime = value;
    if (this._maxTimeLimit && value > this._maxTimeLimit)
      this._maxTime = this._maxTimeLimit;
  }

  private _minTimeLimit: number;
  public get minTimeLimit(): number {
    return this._minTimeLimit;
  }
  public set minTimeLimit(value: number) {
    this._minTimeLimit = value;
  }

  private _maxTimeLimit: any;
  public get maxTimeLimit(): any {
    return this._maxTimeLimit;
  }
  public set maxTimeLimit(value: any) {
    this._maxTimeLimit = value;
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

  public pxToDuration (dpx) {
      return dpx / this._widthPx * (this._maxTime - this._minTime);      
  }

  public changeScale(xPx, upScale) : Boolean {
    let timeSpan = this._maxTime - this._minTime;
    if (timeSpan < 1 && upScale > 1)
      return false;

    if (this.minTime <= minTimeLimit && upScale < 1)  
      return false;
    
    let r = xPx / this._widthPx;
    let leftTime = timeSpan * r;
    let rightTime = timeSpan - leftTime;
    let midPoint = this._minTime + leftTime;
    this.minTime = midPoint - leftTime / upScale;
    this.maxTime = midPoint + rightTime / upScale;

    this.raiseRedrawEvent();
    return true;
  }

  public raiseRedrawEvent() {
    for (let cb of this.callbacks) 
    {
      try {
        cb.redraw();
      } 
      catch(ex)  {
        console.error ("Error:", ex);
      }
    }
  }

  //Drag and drop handling
  inDrag;
  dragStartX;

  startDrag(pxPt) {
    this.inDrag = true;
    this.dragStartX = pxPt;
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
    
    this.minTime += dt;
    if (this.minTime < minTimeLimit)
      this.minTime = minTimeLimit;

    this.maxTime += dt;
    this.dragStartX = pxPt;
    this.raiseRedrawEvent();
    return true;
  }
  //EndOf Drag and drop handling

  callbacks : Array<IScaleEventReceiver>;
  registerRedrawEventCallback (callback) {
    this.callbacks.push(callback);
  }

  unregisterRedrawEventCallback (callback) {
    let i = 0;
    while (i < this.callbacks.length) {
      if (this.callbacks[i] === callback) {
        this.callbacks.splice(i, 1);
        continue;
      }
      i++;
    }
  }
}
