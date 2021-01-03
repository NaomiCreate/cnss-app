import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { CreateTimerComponent } from './create-timer/create-timer.component';
import { HistoryComponent } from './history/history.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full' },//empty string because we will see this page at the path: http://localhost:4200/
  {path: 'login', component: LoginComponent },
  {path: 'register', component: RegisterComponent },
  {path: 'home-page', component: HomePageComponent },
  {path: 'contact-list', component: ContactListComponent },
  {path: 'create-timer', component: CreateTimerComponent },
  {path: 'history', component: HistoryComponent },
  {path: "**", component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
