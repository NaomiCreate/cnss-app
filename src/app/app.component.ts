import { Component } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CNSS-App';

  // constructor(
  //   private afAuth: AngularFireAuth,
  //   private router: Router,
  // ){ 
  //   this.afAuth.onAuthStateChanged((user) => {
  //     if (user) {
  //       this.router.navigate(['/profile']);
  //     } else {
  //       this.router.navigate(['login']);
  //     } 
  //   });
  // }
}
