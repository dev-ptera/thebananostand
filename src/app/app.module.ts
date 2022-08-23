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
import { SendDialogComponent } from './pages/account/dialogs/send/send-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeRepDialogComponent } from './pages/account/dialogs/change-rep/change-rep-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { DashboardComponent } from '@app/pages/dashboard/dashboard.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddIndexDialogComponent } from '@app/pages/dashboard/add-index/add-index.component';
import { ReceiveDialogComponent } from '@app/pages/account/dialogs/receive/receive-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { FilterDialogComponent } from '@app/pages/account/dialogs/filter/filter-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EnterSecretDialogComponent } from '@app/pages/home/enter-secret/enter-secret-dialog.component';
import { ResponsiveDirective } from './directives/responsive.directive';
import { LoginComponent } from '@app/pages/login/login.component';
import { AppThemePickerComponent } from '@app/components/theme-picker/theme-picker.component';
import { AppAccountSettingsComponent } from '@app/components/account-settings/account-settings.component';
import { NewSeedDialogComponent } from '@app/pages/home/new-seed/new-seed-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ChangeRepBottomSheetComponent
} from "@app/pages/account/bottom-sheet/change-rep/change-rep-bottom-sheet.component";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {ChangeRepComponent} from "@app/pages/account/actions/change-rep/change-rep.component";
import {SendComponent} from "@app/pages/account/actions/send/send.component";
import {SendBottomSheetComponent} from "@app/pages/account/bottom-sheet/send/send-bottom-sheet.component";
import {ReceiveComponent} from "@app/pages/account/actions/receive/receive.component";
import {ReceiveBottomSheetComponent} from "@app/pages/account/bottom-sheet/receive/receive-bottom-sheet.component";

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
        SendDialogComponent,
        AddIndexDialogComponent,
        ChangeRepDialogComponent,
        ReceiveDialogComponent,
        FilterDialogComponent,
        EnterSecretDialogComponent,
        ResponsiveDirective,
        ReceiveBottomSheetComponent,
        LoginComponent,
        AppAccountSettingsComponent,
        NewSeedDialogComponent,
        LedgerSnackbarErrorComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
