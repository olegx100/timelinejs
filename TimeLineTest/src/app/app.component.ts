import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'TimeLineTest';

  items: Array<any>;
  
  constructor () {
    this.items = this.getItems ();
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
      {"State": "Maintenance", "Start": new Date(2022, 9, 28, 9, 35, 0).getTime()}
    ];

    for(let i = 1; i < res.length; i++) {
      res[i-1].Duration =  (res[i].Start - res[i-1].Start);
    }

    if (res.length > 0) 
    {
      if (!res[res.length-1].Duration)
        res[res.length-1].Duration = 1;
    }
    res[2].Duration = res[2].Duration / 3;
    return res;
  }
}


