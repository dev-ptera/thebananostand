import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './pages/account/account.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
    { path: ':account', component: AccountComponent, data: { animation: 'Account' } },
    { path: '', component: HomeComponent, data: { animation: 'Home' } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
