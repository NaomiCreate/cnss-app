import { Injectable } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';

export interface User {
  email: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {


  authState: any = null;
  subscription:Subscription;

  constructor(private firebaseAuth: AngularFireAuth, private router: Router) {

    this.subscription = this.firebaseAuth.authState.subscribe((auth =>{
      this.authState = auth;
    }))

  } 

  set_user(val:any){
    this.authState = val;
  }
  
  get auth(){
    return this.firebaseAuth;
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
    //console.log("Debug:: auth.service currentUser ", this.authState)
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

    return new Promise((resolve,reject) => {

      this.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then((credential) => {
        this.authState = credential.user;
        resolve(true);
      }).catch(error=>{
        reject(new Error(error.code));
      })
    });
  }

/*function in use in login.component.ts*/
 loginWithEmail(email: string, password: string){

    return new Promise((resolve,reject) => {
      this.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then((credential) => {
        this.authState = credential.user;
        resolve(true);
      }).catch((error) => {
        // console.log("error.code", error.code);
        reject(new Error(error.code));
      })
    });
  }

  //logout functions
  logout() {
    //console.log("Debug:: auth.service logout()")
    this.firebaseAuth.signOut();
    //this.subscription.unsubscribe();
    this.router.navigate(['/login']);//navigate to login page
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


  /**TESTING */

}
