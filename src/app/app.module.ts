import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

//import firebase module
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { CrudService } from './services/crud.service';
import { RealTimeService } from './services/real-time.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { HistoryComponent } from './history/history.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { from } from 'rxjs';
import { RegisterComponent } from './register/register.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { ConnectedToComponent } from './connected-to/connected-to.component';
import { SystemControlComponent } from './system-control/system-control.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
  declarations: [
    AppComponent,
    ContactListComponent,
    HistoryComponent,
    LoginComponent,
    SidebarComponent,
    RegisterComponent,
    HomePageComponent,
    PageNotFoundComponent,
    ProfileComponent,
    ConnectedToComponent,
    SystemControlComponent,
    ChangePasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule
  ],
  providers: [CrudService,
              RealTimeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
