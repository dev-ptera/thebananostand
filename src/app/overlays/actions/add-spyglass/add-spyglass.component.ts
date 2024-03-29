import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ADD_SPYGLASS_API_SOURCE_BY_URL } from '@app/services/wallet-events.service';

@Component({
    selector: 'app-add-spyglass-overlay',
    styleUrls: ['add-spyglass.component.scss'],
    template: `
        <div class="add-spyglass-overlay overlay-action-container">
            <div class="overlay-header">Add new Spyglass API datasource</div>
            <div class="overlay-body">
                <div class="mat-body-1" style="margin-bottom: 16px">
                    If the default Spyglass API sources are unavailable, you can add a custom source instead.
                </div>
                <div class="mat-body-1">
                    <div>Use the input field below to enter the URL of your new API source e.g:</div>
                    <div class="add-spyglass-example mat-body-1">https://api.spyglass.pw/banano</div>
                </div>
                <form style="margin: 32px 0 16px 0">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>Spyglass API URL</mat-label>
                        <textarea
                            type="text"
                            matInput
                            (keyup.enter)="addSpyglassSource()"
                            [formControl]="urlFormControl"
                            data-cy="add-new-spyglass-input"
                        ></textarea>
                    </mat-form-field>
                </form>
            </div>
            <div class="overlay-footer">
                <button mat-stroked-button mat-dialog-close color="primary" (click)="close.emit()">Close</button>
                <button
                    data-cy="add-spyglass-overlay-button"
                    mat-flat-button
                    color="primary"
                    [disabled]="isDisabled()"
                    (click)="addSpyglassSource()"
                >
                    Add
                </button>
            </div>
        </div>
    `,
})
export class AddSpyglassOverlayComponent {
    urlFormControl = new FormControl('');

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    isDisabled(): boolean {
        return !this.urlFormControl.value;
    }

    addSpyglassSource(): void {
        if (this.isDisabled()) {
            return;
        }

        ADD_SPYGLASS_API_SOURCE_BY_URL.next(this.urlFormControl.value.trim());
        this.close.emit();
    }
}
