import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent, ChildComponent, PresentPipe } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    ChildComponent,
    PresentPipe,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
