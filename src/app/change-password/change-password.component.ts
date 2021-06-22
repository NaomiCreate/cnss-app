import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import * as firebase from 'firebase';
import { AuthService } from '../services/auth.service';
// import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database';
import firebase from 'firebase/app';
import 'firebase/database'; // If using Firebase database
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


interface currentAndNewDetails {
  email: string;
  currentPassword: string;
  newPassword: string;
  verifyNewPassword: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  userInput: currentAndNewDetails = {
    email: '',
    currentPassword: '',
    newPassword: '',
    verifyNewPassword: ''
  }
  
  message = '';
  errorMessage = ''; //validation error handle
  error: { name: string, message: string } = { name: '', message: '' }; //firebase error handle

  rForm: FormGroup;
  post: any;//property for our submitted form
  //The inputs of the form:
  userInputEmail: string = '';
  userInputCurrentPassword: string = '';
  userInputFuturePassword: string = '';
  userInputFuturePasswordValidation: string = '';

  constructor(private fb: FormBuilder, public authservice: AuthService, private router: Router) {
    //here we will specifie the validations
    this.rForm = fb.group({
      'userInputEmail': ['', Validators.compose([Validators.required, Validators.email])],//[null,Validators.required], //Validators.email?
      'userInputCurrentPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'userInputFuturePassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'userInputFuturePasswordValidation': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  addPost(post) {
    this.userInput.email = post.userInputEmail;
    this.userInput.currentPassword = post.userInputCurrentPassword;
    this.userInput.newPassword = post.userInputFuturePassword;
    this.userInput.verifyNewPassword = post.userInputFuturePasswordValidation;

    this.changePassword();
  }

  ngOnInit(): void {
  }

  changePassword() {
    this.clearMessages();
    console.log("this.userInput.newPassword", this.userInput.newPassword);

    //First you get the current logged in user
    const cpUser = firebase.auth().currentUser;
    if (this.userInput.email == cpUser.email) {
      /*Then you set credentials to be the current logged in user's email
            and the password the user typed in the input named "old password"
            where he is basically confirming his password just like facebook for example.*/

      const credentials = firebase.auth.EmailAuthProvider.credential(
        this.userInput.email, this.userInput.currentPassword);

      //Reauthenticating here with the data above
      cpUser.reauthenticateWithCredential(credentials).then(success => {
        if (this.userInput.newPassword != this.userInput.verifyNewPassword) {
          this.errorMessage = "The password confirmation does not match password";
        } else {
          //console.log("The input is valid");

          /* Update the password to the password the user typed into the
            new password input field */
          cpUser.updatePassword(this.userInput.newPassword).then(res => {
            //Success
            this.message = "Password has been successfully changed";
            this.clearForm();
          }).catch(err => {
            //Failed
            this.errorMessage = "Password change failed";
          });

        }
      })
        .catch(err => {
          this.errorMessage = "Email or Current password are incorrect";
          if (err.code === "auth/wrong-password") {
            this.errorMessage = "Current password is incorrect";
          }
        })
    }
    else {
      this.errorMessage = "Email or Current password are incorrect";
    }
  }

  clearForm() {
    this.rForm.reset({
      'userInputEmail': '',
      'userInputCurrentPassword': '',
      'userInputFuturePassword': '',
      'userInputFuturePasswordValidation': ''
    });
  }

  clearMessages(){
    this.message = '';
    this.errorMessage = '';
    this.error = {name: '', message:''};
  }

  // validateForm() {
  //   this.errorMessage = this.message = "";

  //   // if (this.userInput.currentPassword.length === 0) {
  //   //   this.errorMessage = "Please enter your current password";
  //   //   return false
  //   // }
  //   // if (this.userInput.newPassword.length < 6) {
  //   //   this.errorMessage = "The new password should be at least 6 characters";
  //   //   return false
  //   // }
  //   if (!(this.userInput.newPassword === this.userInput.verifyNewPassword)) {
  //     this.errorMessage = "The password confirmation does not match password";
  //     return false
  //   }
  //   this.errorMessage = '';
  //   return true;
  // }

}
