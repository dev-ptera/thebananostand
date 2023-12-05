import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import {ADD_RPC_NODE_BY_URL} from '@app/services/wallet-events.service';

@Component({
    selector: 'app-add-rpc-overlay',
    styleUrls: ['add-rpc.component.scss'],
    template: `
        <div class="add-rpc-overlay overlay-action-container">
            <div class="overlay-header">Add New Banano Node</div>
            <div class="overlay-body">
                <div class="mat-body-1" style="margin-bottom: 16px">
                    If the default Banano nodes are unavailable, you can add a custom RPC node to handle all send,
                    receive, change transactions.
                </div>
                <div class="mat-body-1">
                    <div>Use the input field below to enter the URL of your new Banano node e.g:</div>
                    <div class="add-rpc-example mat-body-1">https://booster.dev-ptera.com/banano-rpc</div>
                </div>
                <form style="margin: 32px 0 16px 0">
                    <mat-form-field style="width: 100%" appearance="fill">
                        <mat-label>RPC Node URL</mat-label>
                        <input
                            type="text"
                            matInput
                            (keyup.enter)="addRpcNode()"
                            [formControl]="urlFormControl"
                            data-cy="add-new-rpc-input"
                        />
                    </mat-form-field>
                </form>
            </div>
            <div class="overlay-footer">
                <button mat-stroked-button mat-dialog-close color="primary" (click)="close.emit()">Close</button>
                <button
                    data-cy="add-rpc-overlay-button"
                    mat-flat-button
                    color="primary"
                    [disabled]="isDisabled()"
                    (click)="addRpcNode()"
                >
                    Add
                </button>
            </div>
        </div>
    `,
})
export class AddRpcOverlayComponent {
    urlFormControl = new FormControl('');

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    isDisabled(): boolean {
        return !this.urlFormControl.value;
    }

    addRpcNode(): void {
        if (this.isDisabled()) {
            return;
        }

        ADD_RPC_NODE_BY_URL.next(this.urlFormControl.value);
        this.close.emit();
    }
}
