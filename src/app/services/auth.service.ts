import { Injectable } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import * as firebase from 'firebase';

export interface User {
  email: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {


  authState: any = null;

  constructor(private firebaseAuth: AngularFireAuth, private router: Router) {

    this.firebaseAuth.authState.subscribe((auth =>{
      //console.log("Debug:: IN auth.service authState")
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
    console.log("Debug:: auth.service currentUser ", this.authState)
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
        //this.isAuth=true;//user is logged in
        resolve(credential.user);
      }).catch(error=>{
        console.log(error)
        //throw error;
      })
    });
  }

/*function in use in login.component.ts*/
 loginWithEmail(email: string, password: string){
    return new Promise(resolve => {
      this.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then((credential) => {
        this.authState = credential.user;
        //this.isAuth=true;//user is logged in
        resolve(credential.user);
      }).catch(error=>{
        console.log("Error: The email or password are incorrect, please try again")
        //alert("Error: The email or password are incorrect, please try again");
        //throw error;
      })
    });
  }

  //logout functions
  logout() {
    console.log("Debug:: auth.service logout()")
    this.firebaseAuth.signOut();
    this.router.navigate(['/login']);//navigate to login page
  }

  /**TESTING */

}
