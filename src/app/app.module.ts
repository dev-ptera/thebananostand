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
import { HomeComponent } from './pages/home/home.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    EmptyStateModule,
    InfoListItemModule,
    ListItemTagModule,
    MobileStepperModule,
    SpacerModule,
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
import {AddIndexDialogComponent} from "@app/pages/dashboard/add-index/add-index.component";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        DashboardComponent,
        AccountComponent,
        QrDialogComponent,
        SendDialogComponent,
        AddIndexDialogComponent,
        ChangeRepDialogComponent,
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
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        MatIconModule,
        ScrollingModule,

        // brightlayer-ui
        InfoListItemModule,
        ListItemTagModule,
        MobileStepperModule,
        SpacerModule,
        MatProgressSpinnerModule,
        EmptyStateModule,
        MatSlideToggleModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatCheckboxModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
