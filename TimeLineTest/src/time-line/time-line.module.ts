import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLineMainComponent } from './time-line-main/time-line-main.component';
import { TimeLineScaleComponent } from './time-line-scale/time-line-scale.component';

@NgModule({
  declarations: [TimeLineMainComponent, TimeLineScaleComponent],
  imports: [
    CommonModule
  ],
  exports: [TimeLineMainComponent]
})
export class TimeLineModule { }
