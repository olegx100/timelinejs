const minTimeLimit = -2208997240000;

export interface IScaleEventReceiver {
  redraw () : void;
  getMinTime () : number;
  getMaxTime () : number;
}

export class GraphDateScale {
  constructor () {
    this._widthPx = 0;
    this._minTime = (new Date (2020, 0, 1)).getTime();
    this._maxTime = (new Date (2025, 0, 1)).getTime();
    this._minTimeLimit = (new Date (1900, 0, 1)).getTime();
    this._maxTimeLimit = (new Date (2100, 0, 1)).getTime();
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

  public timeToPx(timePt: number) {
    let timeSpan = this._maxTime - this._minTime;
    let scale = timeSpan / this._widthPx;
    return (timePt - this._minTime) / scale;
  }

  public pxToTime(pxPt: number) {
    return (
      this._minTime + ((this._maxTime - this._minTime) * pxPt) / this._widthPx
    );
  }

  public durationToPx(dt: number) {
    let timeSpan = this._maxTime - this._minTime;
    return  dt / timeSpan * this._widthPx;
  }

  public pxToDuration (dpx: number) {
      return dpx / this._widthPx * (this._maxTime - this._minTime);      
  }

  public changeScale(xPx: number, upScale: number) : Boolean {
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
  inDrag: boolean = false;
  dragStartX: number = 0;

  startDrag(pxPt: number) {
    this.inDrag = true;
    this.dragStartX = pxPt;
  }

  endDrag() {
    this.inDrag = false;
  }

  drag(pxPt: number, buttons: number):boolean {
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
  registerRedrawEventCallback (callback: IScaleEventReceiver) {
    this.callbacks.push(callback);
  }

  unregisterRedrawEventCallback (callback: IScaleEventReceiver) {
    let i = 0;
    while (i < this.callbacks.length) {
      if (this.callbacks[i] === callback) {
        this.callbacks.splice(i, 1);
        continue;
      }
      i++;
    }
  }

  public autoScale () {

    //TODO: !!! Limits ???
    //this.minTimeLimit = (new Date (2020, 0, 1)).getTime();
    //this.maxTimeLimit = (new Date (2023, 0, 1)).getTime();

    if (!this.callbacks.length)
      return;

    let minTime = NaN, maxTime = NaN;
    for (let i = 0; i < this.callbacks.length; i++) {
      let t0 = this.callbacks[i].getMinTime();
      if (!isNaN(t0)) {
        if (isNaN(minTime))
          minTime = t0;
        else
          minTime = Math.min (minTime, t0);  
      }

      let t1 = this.callbacks[i].getMaxTime();
      if (!isNaN(t1)) {
        if (isNaN(maxTime))
          maxTime = t1;
        else
          maxTime = Math.max (maxTime, t1);  
      }
    }

    if (!isNaN(minTime))
      this.minTime = minTime;

    if (!isNaN(maxTime))
      this.maxTime = maxTime;

    this.raiseRedrawEvent(); 
  }
}
