import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { InfoListItemComponent } from './info-list-item.component';
import { MatDividerModule } from '@angular/material/divider';
import { SpacerModule } from '@app/components/spacer/spacer.module';

@NgModule({
    declarations: [InfoListItemComponent],
    imports: [SpacerModule, MatIconModule, CommonModule, MatListModule, MatDividerModule],
    exports: [InfoListItemComponent, MatIconModule, MatListModule, SpacerModule, MatDividerModule],
})
export class InfoListItemModule {}
