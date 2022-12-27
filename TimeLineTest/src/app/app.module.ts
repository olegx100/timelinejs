import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TimeLineModule } from 'src/time-line/time-line.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    TimeLineModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
