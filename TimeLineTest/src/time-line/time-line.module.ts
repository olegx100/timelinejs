import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeLineMainComponent } from './time-line-main/time-line-main.component';

@NgModule({
  declarations: [TimeLineMainComponent],
  imports: [
    CommonModule
  ],
  exports: [TimeLineMainComponent]
})
export class TimeLineModule { }
