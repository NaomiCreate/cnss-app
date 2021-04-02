import { Injectable } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import { Observable } from 'rxjs';

export interface User {
  email: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {

  //user: Observable<firebase.User>;
  private isAuth=false;//set to true id user is authenticated
  user: Observable<any>;

  authState: any = null;
  // static isLoggedIn:boolean;

  constructor(private firebaseAuth: AngularFireAuth, private router: Router) {

    /**TESTING */
    this.user = firebaseAuth.authState;
    /**TESTING */

    
    this.firebaseAuth.authState.subscribe((auth =>{
      this.authState = auth;
    }))
  }

  //get fanctions, to get data from firebase
  get isUserAnonymousLoggedIn(): boolean{
    return (this.authState !== null) ? this.authState.isAnonymous : false
  } 

  get currentUserId(): string{
    return (this.authState !== null) ? this.authState.uid : ''
  }

  get currentUserName(): string{
    return this.authState['email']
  }

  get currentUser(): any{
    return (this.authState !== null) ? this.authState : null;
  } 

  get isUserEmailLoggedIn(): boolean{
    if((this.authState !== null) && (!this.isUserAnonymousLoggedIn)){
      return true
    } else{
      return false
    }
  } 

  //function in use in register.component.ts
  registerWithEmail(email: string, password: string){
    return new Promise(resolve => {
      this.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then((credential) => {
        this.authState = credential.user;
        this.isAuth=true;//user is logged in
        resolve(credential.user);
      }).catch(error=>{
        console.log(error)
        throw error;
      })
    });
  }

/*function in use in login.component.ts*/
 loginWithEmail(email: string, password: string){
    return new Promise(resolve => {
      this.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then((credential) => {
        this.authState = credential.user;
        this.isAuth=true;//user is logged in
        resolve(credential.user);
      }).catch(error=>{
        console.log(error)
        alert("Error: The email or password are incorrect, please try again");
        throw error;
      })
    });
  }

  /**TESTING */
  //logout functions
  logout() {
    this.firebaseAuth.signOut();
    this.isAuth=false;////user is logged out
    this.router.navigate(['/login']);//navigate to login page
  }

   //returns true of user is logged in
   get isLoggedIn(): boolean {
    return this.isAuth;
  }
  /**TESTING */


  // signout(): void
  // {
  //   this.firebaseAuth.signOut();
  //   // AuthService.isLoggedIn = false;
  //   this.router.navigate(['/login']);
  // }

  
}
