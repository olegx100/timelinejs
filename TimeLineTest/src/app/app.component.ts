import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TimeLineTest';

  public Series: Array<any>;
  public version = "1.0.0.1";
  
  constructor () {
    this.createSeries();
  }

  getItems () {
    let res:Array<any> = [
      {"State": "Active", "Start"     : new Date(2022, 9, 28, 8, 0, 0).getTime()}, 
      {"State": "Error", "Start"      : new Date(2022, 9, 28, 8, 3, 0).getTime()}, 
      {"State": "Ready", "Start"      : new Date(2022, 9, 28, 8, 9, 0).getTime()}, 
      {"State": "Service", "Start"    : new Date(2022, 9, 28, 8, 21, 0).getTime()}, 
      {"State": "Active", "Start"     : new Date(2022, 9, 28, 8, 40, 0).getTime()}, 
      {"State": "Ready", "Start"      : new Date(2022, 9, 28, 8, 57, 0).getTime()}, 
      {"State": "Standby", "Start"    : new Date(2022, 9, 28, 9, 15, 0).getTime()}, 
      {"State": "Maintenance", "Start": new Date(2022, 9, 28, 9, 35, 0).getTime()}, 
      {"State": "Ready", "Start"      : new Date(2022, 9, 30, 0,  0, 0).getTime()},       
      {"State": "Error", "Start"      : new Date(2022, 9, 30, 0, 30, 0).getTime()}, 
      {"State": "Ready", "Start"      : new Date(2022, 9, 30, 1,  0, 0).getTime()}, 
      {"State": "Standby", "Start"    : new Date(2022, 9, 30, 1, 30, 0).getTime()},       
      {"State": "Service", "Start"    : new Date(2022, 9, 30, 2,  0, 0).getTime()},
      {"State": "Ready", "Start"      : new Date(2022, 9, 30, 2, 30, 0).getTime(), "Duration": 30000}
    ];

    for(let i = 1; i < res.length; i++) {
      res[i-1].Duration =  (res[i].Start - res[i-1].Start);
    }

    if (res.length > 0) 
    {
      if (!res[res.length-1].Duration)
        res[res.length-1].Duration = 1;
    }
    //to check the empty state handling in the control
    res[2].Duration = res[2].Duration / 3;

    return res;
  }  

  createDummyModel (n: number) {
    const states = [];
    const stateNames = ["Active", "Service", "Ready", "None", "Error", "Maintenance", "Standby"];

    let time = (new Date (2022, 9, 28)).getTime();
    let lastState = null;

    while (states.length < n) {
        let st = stateNames[Math.floor(Math.random() * stateNames.length)];
        if (st === lastState)
          continue;
        
        let state = {
          "State": st,
          "Duration": Math.floor(Math.random() * 120_000),
          "Start": time
        }

        lastState  =st;
        time += state.Duration;
        states.push(state);
    }

    return states;
  }

  createSeries (): void {
    this.Series = [];

    this.Series.push ({ 
      "type":'time-point', 
      "items": this.createDummyModel(1000), 
      "legend": {
        "borderColor": "coral", 
        "fillColor": "aqua", 
        "pointSize": 11
      }
    });

    this.Series.push ({ "type":'time-scale'});

    this.Series.push ({ 
      "type":'time-point', 
      "items": this.createDummyModel(1000), 
      "legend": {
        "borderColor": "red", 
        "fillColor": "pink", 
        "pointSize": 9
      }
    });

    this.Series.push ({ "type":'time-span', "items":  this.createDummyModel(1000) });

    this.Series.push ({ "type":'time-scale'});

    this.Series.push ({ 
      "type":'time-point', 
      "items": this.createDummyModel(1000), 
      "legend": {
        "borderColor": "blue", 
        "fillColor": "aqua", 
        "pointSize": 13
      }
    });

    this.Series.push ({ "type":'time-scale'});
  }
}
