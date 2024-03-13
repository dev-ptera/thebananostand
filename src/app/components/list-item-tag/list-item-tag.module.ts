import { NgModule } from '@angular/core';
import { ListItemTagComponent } from './list-item-tag.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [ListItemTagComponent],
    exports: [ListItemTagComponent],
    imports: [CommonModule],
})
export class ListItemTagModule {}
