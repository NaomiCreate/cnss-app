import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { HistoryComponent } from './history/history.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { ConnectedToComponent } from './connected-to/connected-to.component';
import { SystemControlComponent } from './system-control/system-control.component';

import {OwnerGuard} from './guards/owner.guard';
import { AuthGuard } from './guards/auth.guard';
import { ManagerGuard } from './guards/manager.guard';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full' },//empty string because we will see this page at the path: http://localhost:4200/
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'home-page', component: HomePageComponent, canActivate: [AuthGuard] },
  {path: 'contact-list', component: ContactListComponent, canActivate: [ManagerGuard]},
  {path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {path: 'connected-to', component: ConnectedToComponent, canActivate: [AuthGuard] },
  {path: 'system-control', component: SystemControlComponent, canActivate: [ManagerGuard]},
  {path: "**", component: PageNotFoundComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
