import { AccountComponent } from './pages/account/account.component';
import { AddIndexBottomSheetComponent } from '@app/overlays/bottom-sheet/add-index/add-index-bottom-sheet.component';
import { AddIndexDialogComponent } from '@app/overlays/dialogs/add-index/add-index-dialog.component';
import { AddIndexOverlayComponent } from '@app/overlays/actions/add-index/add-index.component';
import { AddressBookComponent } from '@app/pages/address-book/address-book.component';
import { AppAccountSettingsComponent } from '@app/components/account-settings/account-settings.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ChangePasswordOverlayComponent } from '@app/overlays/actions/change-password/change-password.component';
import { ChangeRepBottomSheetComponent } from '@app/overlays/bottom-sheet/change-rep/change-rep-bottom-sheet.component';
import { ChangeRepComponent } from '@app/overlays/actions/change-rep/change-rep.component';
import { ChangeRepDialogComponent } from '@app/overlays/dialogs/change-rep/change-rep-dialog.component';
import { CommonModule } from '@angular/common';
import { CreateWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/create-wallet/create-wallet-bottom-sheet.component';
import { CreateWalletDialogComponent } from '@app/overlays/dialogs/create-wallet/create-wallet-dialog.component';
import { CreateWalletOverlayComponent } from '@app/overlays/actions/create-wallet/create-wallet.component';
import { DashboardComponent } from '@app/pages/dashboard/dashboard.component';
import { DashboardPipe } from '@app/pages/dashboard/dashboard.pipe';
import { DatasourceAvailablePipe, SettingsPageComponent } from '@app/pages/settings/settings.component';
import { EmptyStateModule } from '@app/components/empty-state/empty-state.module';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { EnterSecretComponent } from '@app/overlays/actions/enter-secret/enter-secret.component';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { FilterBottomSheetComponent } from '@app/overlays/bottom-sheet/filter/filter-bottom-sheet.component';
import { FilterComponent } from '@app/overlays/actions/filter/filter.component';
import { FilterDialogComponent } from '@app/overlays/dialogs/filter/filter-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { HoverClassDirective } from './directives/hover-class.directive';
import { HttpClientModule } from '@angular/common/http';
import { LedgerSnackbarErrorComponent } from '@app/pages/home/ledger-error-snackbar.component';
import { ListItemTagModule } from '@app/components/list-item-tag/list-item-tag.module';
import { LoginComponent } from '@app/pages/login/login.component';
import { LongPressDirective } from './directives/long-press.directive';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MobileStepperModule } from '@app/components/mobile-stepper/mobile-stepper.module';
import { NgModule } from '@angular/core';
import { QrDialogComponent } from '@app/components/qr/qr.component';
import { ReceiveBottomSheetComponent } from '@app/overlays/bottom-sheet/receive/receive-bottom-sheet.component';
import { ReceiveComponent } from '@app/overlays/actions/receive/receive.component';
import { ReceiveDialogComponent } from '@app/overlays/dialogs/receive/receive-dialog.component';
import { RenameWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-wallet/rename-wallet-bottom-sheet.component';
import { RenameWalletComponent } from '@app/overlays/actions/rename-wallet/rename-wallet.component';
import { RenameWalletDialogComponent } from '@app/overlays/dialogs/rename-wallet/rename-wallet-dialog.component';
import { ResponsiveDirective } from './directives/responsive.directive';
import { ResponsiveMenuModule } from '@app/components/responsive-menu/responsive-menu.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SendBottomSheetComponent } from '@app/overlays/bottom-sheet/send/send-bottom-sheet.component';
import { SendComponent } from '@app/overlays/actions/send/send.component';
import { SendDialogComponent } from '@app/overlays/dialogs/send/send-dialog.component';
import { SpacerModule } from '@app/components/spacer/spacer.module';
import { SigningComponent } from './pages/signing/signing.component';
import { SignMessageComponent } from './pages/sign-message/sign-message.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TransactionComponent } from '@app/pages/account/components/transaction/transaction.component';
import { ReceivableComponent } from '@app/pages/account/components/receivable/receivable.component';
import { RenameAddressComponent } from '@app/overlays/actions/rename-address/rename-address.component';
import { RenameAddressDialogComponent } from '@app/overlays/dialogs/rename-address/rename-address-dialog.component';
import { RenameAddressBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-address/rename-address-bottom-sheet.component';
import { MatListModule } from '@angular/material/list';
import { AccountCardComponent } from '@app/pages/dashboard/components/account-card/account-card.component';
import { ConversionToBANPipe } from './pipes/conversion-to-ban.pipe';
import { ConversionFromBANPipe } from './pipes/conversion-from-ban.pipe';
import { AccountTableComponent } from '@app/pages/dashboard/components/account-table/account-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { AccountActionsComponent } from '@app/pages/dashboard/components/account-actions/account-actions.component';
import { ApiRequestComponent } from '@app/overlays/actions/api-request/api-request.component';
import { ApiRequestDialogComponent } from '@app/overlays/dialogs/api-request/api-request-dialog.component';
import { ApiRequestBottomSheetComponent } from '@app/overlays/bottom-sheet/api-request/api-request-bottom-sheet.component';

import { provideUserIdleConfig } from 'angular-user-idle';
import { MatSliderModule } from '@angular/material/slider';
import { LOAD_WASM, NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { CommaPipe } from './pipes/comma.pipe';
import { AddRpcOverlayComponent } from '@app/overlays/actions/add-rpc/add-rpc.component';
import { AddRpcDialogComponent } from '@app/overlays/dialogs/add-rpc/add-rpc-dialog.component';
import { AddRpcBottomSheetComponent } from '@app/overlays/bottom-sheet/add-rpc/add-rpc-bottom-sheet.component';

LOAD_WASM().subscribe((res: any) => console.log('WASM ngx-scanner-qrcode loaded', res));

@NgModule({
    declarations: [
        ApiRequestComponent,
        ApiRequestDialogComponent,
        ApiRequestBottomSheetComponent,
        AccountComponent,
        AccountCardComponent,
        AddIndexBottomSheetComponent,
        AddIndexDialogComponent,
        AddIndexOverlayComponent,
        AddRpcOverlayComponent,
        AddRpcDialogComponent,
        AddRpcBottomSheetComponent,
        AddressBookComponent,
        AppAccountSettingsComponent,
        AppComponent,
        ChangePasswordBottomSheetComponent,
        ChangePasswordDialogComponent,
        ChangePasswordOverlayComponent,
        ChangeRepBottomSheetComponent,
        ChangeRepComponent,
        ChangeRepDialogComponent,
        CommaPipe,
        ConversionFromBANPipe,
        ConversionToBANPipe,
        CreateWalletBottomSheetComponent,
        CreateWalletDialogComponent,
        CreateWalletOverlayComponent,
        DashboardComponent,
        DashboardPipe,
        DatasourceAvailablePipe,
        EnterSecretBottomSheetComponent,
        EnterSecretComponent,
        EnterSecretDialogComponent,
        FilterBottomSheetComponent,
        FilterComponent,
        FilterDialogComponent,
        HomeComponent,
        HoverClassDirective,
        LedgerSnackbarErrorComponent,
        LoginComponent,
        LongPressDirective,
        QrDialogComponent,
        ReceivableComponent,
        ReceiveBottomSheetComponent,
        ReceiveComponent,
        ReceiveDialogComponent,
        RenameAddressComponent,
        RenameAddressBottomSheetComponent,
        RenameAddressDialogComponent,
        RenameWalletBottomSheetComponent,
        RenameWalletComponent,
        RenameWalletDialogComponent,
        ResponsiveDirective,
        SendBottomSheetComponent,
        SendComponent,
        SendDialogComponent,
        SettingsPageComponent,
        SigningComponent,
        SignMessageComponent,
        TransactionComponent,
        AccountTableComponent,
        AccountActionsComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        EmptyStateModule,
        FormsModule,
        HttpClientModule,
        ListItemTagModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatTooltipModule,
        MobileStepperModule,
        NgxScannerQrcodeModule,
        ReactiveFormsModule,
        ResponsiveMenuModule,
        ScrollingModule,
        SpacerModule,
        TextFieldModule,
        MatListModule,
        MatTableModule,
        MatSortModule,
        MatSliderModule,
    ],
    providers: [provideUserIdleConfig({ idle: 600, timeout: 60 })],
    bootstrap: [AppComponent],
})
export class AppModule {}
