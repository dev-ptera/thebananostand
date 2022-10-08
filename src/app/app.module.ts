/**
 Copyright (c) 2021-present, Eaton

 All rights reserved.

 This code is licensed under the BSD-3 license found in the LICENSE file in the root directory of this source tree and at https://opensource.org/licenses/BSD-3-Clause.
 **/
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';

import { AppComponent } from './app.component';
import { HomeComponent, LedgerSnackbarErrorComponent } from './pages/home/home.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    EmptyStateModule,
    InfoListItemModule,
    ListItemTagModule,
    MobileStepperModule,
    SpacerModule,
    UserMenuModule,
} from '@brightlayer-ui/angular-components';
import { MatCardModule } from '@angular/material/card';
import { AccountComponent } from './pages/account/account.component';
import { AppRoutingModule } from './app-routing.module';
import { QrDialogComponent } from './components/qr.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { DashboardComponent } from '@app/pages/dashboard/dashboard.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ResponsiveDirective } from './directives/responsive.directive';
import { LoginComponent } from '@app/pages/login/login.component';
import { AppThemePickerComponent } from '@app/components/theme-picker/theme-picker.component';
import { AppAccountSettingsComponent } from '@app/components/account-settings/account-settings.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ChangeRepComponent } from '@app/overlays/actions/change-rep/change-rep.component';
import { SendComponent } from '@app/overlays/actions/send/send.component';
import { SendBottomSheetComponent } from '@app/overlays/bottom-sheet/send/send-bottom-sheet.component';
import { FilterBottomSheetComponent } from '@app/overlays/bottom-sheet/filter/filter-bottom-sheet.component';
import { AddIndexDialogComponent } from '@app/overlays/dialogs/add-index/add-index-dialog.component';
import { ReceiveBottomSheetComponent } from '@app/overlays/bottom-sheet/receive/receive-bottom-sheet.component';
import { AddIndexBottomSheetComponent } from '@app/overlays/bottom-sheet/add-index/add-index-bottom-sheet.component';
import { ReceiveComponent } from '@app/overlays/actions/receive/receive.component';
import { ReceiveDialogComponent } from '@app/overlays/dialogs/receive/receive-dialog.component';
import { AddIndexOverlayComponent } from '@app/overlays/actions/add-index/add-index.component';
import { FilterComponent } from '@app/overlays/actions/filter/filter.component';
import { FilterDialogComponent } from '@app/overlays/dialogs/filter/filter-dialog.component';
import { SendDialogComponent } from '@app/overlays/dialogs/send/send-dialog.component';
import { EnterSecretComponent } from '@app/overlays/actions/enter-secret/enter-secret.component';
import { EnterSecretDialogComponent } from '@app/overlays/dialogs/enter-secret/enter-secret-dialog.component';
import { EnterSecretBottomSheetComponent } from '@app/overlays/bottom-sheet/enter-secret/enter-secret-bottom-sheet.component';
import { ChangeRepBottomSheetComponent } from '@app/overlays/bottom-sheet/change-rep/change-rep-bottom-sheet.component';
import { RenameWalletComponent } from '@app/overlays/actions/rename-wallet/rename-wallet.component';
import { RenameWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/rename-wallet/rename-wallet-bottom-sheet.component';
import { RenameWalletDialogComponent } from '@app/overlays/dialogs/rename-wallet/rename-wallet-dialog.component';
import { LongPressDirective } from '@app/components/long-press/long-press.directive';
import { ChangePasswordOverlayComponent } from '@app/overlays/actions/change-password/change-password.component';
import { ChangePasswordDialogComponent } from '@app/overlays/dialogs/change-password/change-password-dialog.component';
import { ChangeRepDialogComponent } from '@app/overlays/dialogs/change-rep/change-rep-dialog.component';
import { ChangePasswordBottomSheetComponent } from '@app/overlays/bottom-sheet/change-password/change-password-bottom-sheet.component';
import { CreateWalletOverlayComponent } from '@app/overlays/actions/create-wallet/create-wallet.component';
import { CreateWalletBottomSheetComponent } from '@app/overlays/bottom-sheet/create-wallet/create-wallet-bottom-sheet.component';
import { CreateWalletDialogComponent } from '@app/overlays/dialogs/create-wallet/create-wallet-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    declarations: [
        AppComponent,
        AppThemePickerComponent,
        HomeComponent,
        DashboardComponent,
        AccountComponent,
        QrDialogComponent,
        ChangeRepComponent,
        SendComponent,
        SendBottomSheetComponent,
        ReceiveComponent,
        ChangeRepBottomSheetComponent,
        EnterSecretBottomSheetComponent,
        SendDialogComponent,
        AddIndexOverlayComponent,
        AddIndexBottomSheetComponent,
        AddIndexDialogComponent,
        ReceiveDialogComponent,
        ChangeRepDialogComponent,
        FilterDialogComponent,
        FilterComponent,
        FilterBottomSheetComponent,
        EnterSecretDialogComponent,
        CreateWalletOverlayComponent,
        CreateWalletBottomSheetComponent,
        CreateWalletDialogComponent,
        ResponsiveDirective,
        ReceiveBottomSheetComponent,
        LoginComponent,
        AppAccountSettingsComponent,
        EnterSecretComponent,
        LedgerSnackbarErrorComponent,
        RenameWalletComponent,
        RenameWalletBottomSheetComponent,
        RenameWalletDialogComponent,
        LongPressDirective,
        ChangePasswordOverlayComponent,
        ChangePasswordDialogComponent,
        ChangePasswordBottomSheetComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatBottomSheetModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        MatIconModule,
        ScrollingModule,
        InfoListItemModule,
        UserMenuModule,
        ListItemTagModule,
        MobileStepperModule,
        SpacerModule,
        MatProgressSpinnerModule,
        EmptyStateModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatChipsModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatExpansionModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
