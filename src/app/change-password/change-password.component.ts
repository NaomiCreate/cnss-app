import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface currentAndNewDetails{
  currentPassword:string;
  newPassword:string;
  verifyNewPassword:string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  userInput: currentAndNewDetails = {
  currentPassword:'',
  newPassword:'',
  verifyNewPassword:''
  }

  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(public authservice: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  changePassword(){
  if(this.validateForm())
  {
      // var user = firebase.auth().currentUser;
      // var credentials = firebase.auth.EmailAuthProvider.credential(
      //   user.email,
      //   'yourpassword'
      // );
      // user.reauthenticateWithCredential(credentials);

      var user = this.authservice.currentUser;
      //var credential;
      const credential = this.authservice.currentUser.EmailAuthProvider.credential(
        user.email, 
        this.userInput.currentPassword
      ).then(function() {
      // Prompt the user to re-provide their sign-in credentials
      user.reauthenticateWithCredential(credential);
      });

      //------------------------------
      // this.authservice.currentUser.updatePassword(this.userInput.newPassword)
      // .then(() => {
      //   alert("Password changed successfully");
      //   this.message ="Password changed successfully"
      //   this.userInput.currentPassword =this.userInput.newPassword =this.userInput.verifyNewPassword= "";
      // }).catch(function(error) {
      //   this.errorMessage="error";
      // });
    }
  }

  validateForm()
  {
    this.errorMessage = this.message = "";
    if(this.userInput.currentPassword.length === 0)
    {
      this.errorMessage = "Please enter your current password";
      return false
    }
    // if(!(this.userInput.currentPassword === <currentPasswword>))
    // {
    //   this.errorMessage = "The current password you entered is incorrect";
    //   return false
    // }
    if(this.userInput.newPassword.length < 6)
    {
      this.errorMessage = "The new password should be at least 6 characters";
      return false
    }
    if (!(this.userInput.newPassword === this.userInput.verifyNewPassword)) {
      this.errorMessage = "The new password verification does not match the new password";
      return false
    }
    this.errorMessage = '';
    return true;
  }

}
