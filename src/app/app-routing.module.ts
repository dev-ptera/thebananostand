import { AccountComponent } from './pages/account/account.component';
import { AddressBookComponent } from '@app/pages/address-book/address-book.component';
import { AuthGuardService as AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './pages/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPageComponent } from '@app/pages/settings/settings.component';

const routes: Routes = [
    { path: 'account/:account', component: AccountComponent, data: { animation: 'Account' }, canActivate: [AuthGuard] },
    { path: '', component: HomeComponent, data: { animation: 'Home' } },
    { path: 'settings', component: SettingsPageComponent, data: { animation: 'Settings' } },
    { path: 'address-book', component: AddressBookComponent, data: { animation: 'AddressBook' } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
