import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileStepperComponent } from './mobile-stepper.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
    declarations: [MobileStepperComponent],
    imports: [CommonModule, MatButtonModule, MatProgressBarModule],
    exports: [MobileStepperComponent],
})
export class MobileStepperModule {}
