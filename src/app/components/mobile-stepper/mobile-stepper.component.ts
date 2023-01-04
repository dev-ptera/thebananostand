import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';

export type MobileStepperVariant = 'dots' | 'text' | 'progress';

/**
 * [MobileStepper Component](https://brightlayer-ui-components.github.io/angular/?path=/info/components-mobile-stepper--readme)
 *
 * The <MobileStepper> is used to minimally display progress when completing a workflow that requires multiple steps.
 *  There are three types of progress indicators supported, dots (default), text, and progress.
 */
@Component({
    selector: 'blui-mobile-stepper',
    templateUrl: './mobile-stepper.component.html',
    styleUrls: ['./mobile-stepper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'blui-mobile-stepper',
    },
})
export class MobileStepperComponent implements OnChanges {
    /** The index of the active step */
    @Input() activeStep: number;

    /** Total number of steps to display */
    @Input() steps: number;

    /** Which type of indicator to use. Can be 'dots' | 'text' | 'progress'.
     *
     * `dots` - Each step appears as a dot. Visited steps will appear as a different color.
     *
     * `text` -  Text indicator which shows current step and total steps.  Example: "Step 1/5"
     *
     * `progress` - Appears as a progress bar that fills the further along as user is in the workflow.
     *
     * @default dots
     * */
    @Input() variant: MobileStepperVariant = 'dots';

    stepsArray: number[] = [];

    ngOnChanges(): void {
        this.stepsArray = Array(this.steps)
            .fill(0)
            .map((i) => i);
    }

    /** This is only used for progress variant. */
    getProgressFill(): number {
        return this.activeStep === 0 ? 0 : (this.activeStep / (this.stepsArray.length - 1)) * 100;
    }
}
