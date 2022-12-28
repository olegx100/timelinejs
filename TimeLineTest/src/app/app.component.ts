import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'TimeLineTest';

  items = [
    {"State": "Active", "Duration": 3, "Start": "8:00"}, 
    {"State": "Error", "Duration": 6, "Start": "8:03"}, 
    {"State": "Ready", "Duration": 12, "Start": "8:09"}, 
    {"State": "Service", "Duration": 6, "Start": "8:21"}, 
    {"State": "Active", "Duration": 18, "Start": "8:39"}, 
    {"State": "Ready", "Duration": 18, "Start": "8:57"},
    {"State": "Standby", "Duration": 18, "Start": "9:15"},
    {"State": "Maintenance", "Duration": 20, "Start": "8:35"},
  ];
  
}


