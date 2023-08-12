import { AccountComponent } from './pages/account/account.component';
import { AddressBookComponent } from '@app/pages/address-book/address-book.component';
import { AuthGuardService as AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './pages/home/home.component';
import {inject, NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPageComponent } from '@app/pages/settings/settings.component';
import { SigningComponent } from './pages/signing/signing.component';
import { SignMessageComponent } from './pages/sign-message/sign-message.component';

const routes: Routes = [
    { path: 'account/:account', component: AccountComponent, data: { animation: 'Account' }, canActivate: [AuthGuard] },
    { path: '', component: HomeComponent, data: { animation: 'Home' } },
    { path: 'settings', component: SettingsPageComponent, data: { animation: 'Settings' }, canActivate: [AuthGuard] },
    {
        path: 'address-book',
        component: AddressBookComponent,
        data: { animation: 'AddressBook' },
        canActivate: [() => inject(AuthGuard).canActivate()]
    },
    {
        path: 'signing',
        component: SigningComponent,
        data: { animation: 'Signing' },
        canActivate: [() => inject(AuthGuard).canActivate()]
    },
    {
        path: 'sign-message',
        component: SignMessageComponent,
        data: { animation: 'SignMessage' },
        canActivate: [() => inject(AuthGuard).canActivate()]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
