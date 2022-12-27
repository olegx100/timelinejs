import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'TimeLineTest';

  items = [
    {"State": "Print", "Duration": 3, "Start": "8:00"}, 
    {"State": "Error", "Duration": 6, "Start": "8:00"}, 
    {"State": "Ready", "Duration": 12, "Start": "8:00"}, 
    {"State": "Service", "Duration": 6, "Start": "8:00"}, 
    {"State": "Print", "Duration": 18, "Start": "8:00"}, 
    {"State": "Ready", "Duration": 18, "Start": "8:00"}
  ];
  
}


