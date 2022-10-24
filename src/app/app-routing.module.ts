import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './pages/account/account.component';
import { HomeComponent } from './pages/home/home.component';
import {SettingsPageComponent} from "@app/pages/settings/settings.component";

const routes: Routes = [
    { path: 'account/:account', component: AccountComponent, data: { animation: 'Account' } },
    { path: '', component: HomeComponent, data: { animation: 'Home' } },
    { path: 'settings', component: SettingsPageComponent, data: { animation: 'Settings' } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
