import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLineSpanComponent } from './time-line-span/time-line-span.component';
import { TimeLineScaleComponent } from './time-line-scale/time-line-scale.component';
import { TimeLinePointComponent } from './time-line-point/time-line-point.component';
import { TimeLineContainerComponent } from './time-line-container/time-line-container.component';

@NgModule({
  declarations: [TimeLineSpanComponent, TimeLineScaleComponent, TimeLinePointComponent, TimeLineContainerComponent],
  imports: [
    CommonModule
  ],
  exports: [TimeLineContainerComponent]
})
export class TimeLineModule { }
