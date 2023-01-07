import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLineMainComponent } from './time-line-main/time-line-main.component';
import { TimeLineScaleComponent } from './time-line-scale/time-line-scale.component';
import { TimeLinePointComponent } from './time-line-point/time-line-point.component';
import { TimeLineContainerComponent } from './time-line-container/time-line-container.component';

@NgModule({
  declarations: [TimeLineMainComponent, TimeLineScaleComponent, TimeLinePointComponent, TimeLineContainerComponent],
  imports: [
    CommonModule
  ],
  exports: [TimeLineMainComponent, TimeLineScaleComponent, TimeLinePointComponent, TimeLineContainerComponent]
})
export class TimeLineModule { }
