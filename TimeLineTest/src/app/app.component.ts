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
      {"State": "Active", "Start": new Date(2022, 28, 10, 8, 0, 0)}, 
      {"State": "Error", "Start": new Date(2022, 28, 10, 8, 3, 0)}, 
      {"State": "Ready", "Start": new Date(2022, 28, 10, 8, 9, 0)}, 
      {"State": "Service", "Start": new Date(2022, 28, 10, 8, 21, 0)}, 
      {"State": "Active", "Start": new Date(2022, 28, 10, 8, 39, 0)}, 
      {"State": "Ready", "Start": new Date(2022, 28, 10, 8, 57, 0)}, 
      {"State": "Standby", "Start": new Date(2022, 28, 10, 9, 15, 0)}, 
      {"State": "Maintenance", "Start": new Date(2022, 28, 10, 9, 35, 0)}
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


