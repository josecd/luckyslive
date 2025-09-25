import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WheelComponent } from './components/wheel.component';

const routes: Routes = [
  { path: '', component: WheelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }