/* Sample of user code for the Time Line Demo */
import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ITimeLineItem, TimeLinePointLegend } from 'src/time-line/time-line.module';
import { MyAppSeries, MyAppTimeLineItem } from './MyAppSeries';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TimeLineTest';

  public Series: Array<MyAppSeries>;
  public version = "1.0.1.0";

  constructor () {
    this.createSeries();
  }

  createDummyModel (n: number) {
    const states = new Array<MyAppTimeLineItem>();
    const stateNames = ["Active", "Service", "Ready", "None", "Error", "Maintenance", "Standby"];

    let time = (new Date (2022, 9, 28)).getTime();
    let lastState = null;

    while (states.length < n) {
        let st = stateNames[Math.floor(Math.random() * stateNames.length)];
        if (st === lastState)
          continue;
        
        let state = new MyAppTimeLineItem ();
        state.Text = st;
        state.Duration = Math.floor(Math.random() * 120_000);
        state.Start = time;

        lastState = st;
        time += state.Duration;
        states.push(state);
    }

    return states;
  }

  createSeries (): void {
    this.Series = new Array<MyAppSeries>;

    // let s0 = new MyAppSeries();
    // s0.type = 'time-point';
    // this.Series.push (s0);

    // let s_1 = new MyAppSeries();
    // s_1.type = 'time-span';
    // this.Series.push (s_1);

    let s1 = new MyAppSeries();
    s1.items = new Array<MyAppTimeLineItem>();
    s1.type = 'time-point';
    s1.onNewItemSelected = this.onTimePointSelected.bind(this);
    s1.items = this.createDummyModel(1000);
    s1.legend = new TimeLinePointLegend();
    s1.legend.borderColor = "coral"; 
    s1.legend.fillColor = "aqua"; 
    s1.legend.pointSize = 11;
    this.Series.push (s1);
    
    let s2 = new MyAppSeries();
    s2.type = 'time-scale';
    this.Series.push (s2);

    let s3 = new MyAppSeries();
    s3.items = new Array<MyAppTimeLineItem>();
    s3.type = 'time-point';
    s3.onNewItemSelected = this.onTimePointSelected.bind(this);;
    s3.items = this.createDummyModel(1000);
    s3.legend = new TimeLinePointLegend();
    s3.legend.borderColor = 'red'; 
    s3.legend.fillColor = 'pink'; 
    s3.legend.pointSize = 9;
    this.Series.push (s3);

    let s4 = new MyAppSeries();
    s4.type = 'time-span';
    s4.onNewItemCreated = this.onNewTimeSpanItemCreated.bind(this);;
    s4.items = this.createDummyModel(1000);
    this.Series.push (s4);

    let s5 = new MyAppSeries();
    s5.type = 'time-scale';
    this.Series.push (s5);

    let s6 = new MyAppSeries();
    s6.type = 'time-point';
    s6.onNewItemSelected = this.onTimePointSelected.bind(this);;
    s6.items = this.createDummyModel(1000); 
    s6.legend = new TimeLinePointLegend();
    s6.legend.borderColor = 'blue'; 
    s6.legend.fillColor = 'aqua'; 
    s6.legend.pointSize = 13;
    this.Series.push (s6);

    let s7 = new MyAppSeries();
    s7.type = 'time-scale';
    this.Series.push (s7);
  }

  onNewTimeSpanItemCreated(item: ITimeLineItem, el: HTMLElement): void {
      let myAppItem = item as MyAppTimeLineItem;
      if(!myAppItem)
        return;
      if (myAppItem.Text) 
      {
        el.innerText = myAppItem.Text;
        el.classList.add (myAppItem.Text);
      }
      else
        el.classList.add ("_EmptyState_"); //emptyStateName
  }

  dp = new DatePipe("en-US");
  onTimePointSelected(item: ITimeLineItem, el: HTMLElement): void {
    let myAppItem = item as MyAppTimeLineItem;
    if (!myAppItem)
      return;
    el.innerText = "Time: " + this.dp.transform(myAppItem.Start, "yy-MM-dd HH:mm:ss.SSS") || "";
  }
}
