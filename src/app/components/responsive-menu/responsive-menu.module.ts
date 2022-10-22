import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsiveMenuComponent } from './responsive-menu.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatCardModule } from '@angular/material/card';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
    declarations: [ResponsiveMenuComponent],
    imports: [
        CommonModule,
        OverlayModule,
        MatBottomSheetModule,
        MatCardModule,
        MatToolbarModule,
        MatMenuModule,
        MatDividerModule,
    ],
    exports: [ResponsiveMenuComponent],
})
export class ResponsiveMenuModule {}
