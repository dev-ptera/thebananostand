import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
//import { animate, style, transition, trigger } from '@angular/animations';
import { ViewportService } from '@app/services/viewport.service';
import { Location } from '@angular/common';
import { UtilService } from '@app/services/util.service';
import { AppStateService, AppStore } from '@app/services/app-state.service';
import { FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TransactionService } from '@app/services/transaction.service';

@UntilDestroy()
@Component({
    selector: 'app-signing-page',
    templateUrl: './signing.component.html',
    //styleUrls: [],
})
export class SigningComponent {
    store: AppStore;
    transactionService: TransactionService;

    messageFormControl = new FormControl('message-', [
        (control: AbstractControl): ValidationErrors | null => {
            const forbidden = !control.value.startsWith("message-");
            return forbidden ? {forbiddenName: {value: control.value}} : null;
        }
    ]);
    addressFormControl = new FormControl(0);

    messageSignExpand = false;
    blockSignExpand = false;
    hasCopiedMessageSignature = false;
    messageSignature: string = "";

    constructor(
      public vp: ViewportService,
      public util: UtilService,
      private readonly _location: Location,
      private readonly _transactionService: TransactionService,
      private readonly _appStateService: AppStateService,
    ) {
        this.transactionService = _transactionService;
        _appStateService.store.pipe(untilDestroyed(this)).subscribe((store) => {
          this.store = store;
          this.store.activeWallet.loadedIndexes
          console.log(this.store.accounts)
        });
    }

    async goSignMessage(): Promise<void> {
        const message: string = this.messageFormControl.value;
        if (!message.startsWith("message-")) return;
        let accountIndex: number = this.addressFormControl.value;
        this.messageSignature = await this.transactionService.messageSign(message, accountIndex);
    }

    copyMessageSignature(): void {
        this.util.clipboardCopy(this.messageSignature);
        this.hasCopiedMessageSignature = true;
        setTimeout(() => {
            this.hasCopiedMessageSignature = false;
        }, 690);
    }

    toggleMessageSignExpand(): void {
        this.messageSignExpand = this.messageSignExpand ? false : true;
    }

    toggleBlockSignExpand(): void {
        this.blockSignExpand = this.blockSignExpand ? false : true;
    }

    back(): void {
      this._location.back();
    }
}
