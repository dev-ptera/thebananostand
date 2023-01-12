import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from './empty-state.component';

@NgModule({
    declarations: [EmptyStateComponent],
    imports: [CommonModule],
    exports: [EmptyStateComponent],
})
export class EmptyStateModule {}
