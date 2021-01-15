import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: any;
  email="";
  password="";
  passwordVerify="";//
  name="";
  phone="";
  isOwningCNSS:boolean;
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  constructor(private authservice: AuthService, private router: Router, public crudservice:CrudService) { }

  ngOnInit(){
    
  }

  CreateRecordUserInfo()
  {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      //The function stores within the relevant fields in "Record" variable, the user's input
      let RecordUserInfo = {};
      RecordUserInfo['name'] = this.name;
      RecordUserInfo['email'] = this.email;
      RecordUserInfo['phone'] = this.phone;
      RecordUserInfo['is-user-own-cnss'] = this.isOwningCNSS;

      //create_NewContact is defined in crud.service.ts file
      this.crudservice.create_userInfo(RecordUserInfo)
      .then(res => {
        this.name = "";
        this.email = "";
        this.phone = "";
        // this.isOwningCNSS;
        //console.log(res);
        this.message = "user-info data save done";
      }).catch(error => {
        console.log(error);
      })
    }
  }


  register()
  {
    this.clearErrorMessage();
    if(this.validateForm(this.email, this.password, this.passwordVerify,this.isOwningCNSS, this.name, this.phone))
    {
      this.authservice.registerWithEmail(this.email, this.password)
      .then(() => {
          console.log("stamp");
          console.log(this.authservice.currentUserId);

          console.log(this.authservice.currentUser);
          //we will save the user-info in collection named 'user-info'
          this.CreateRecordUserInfo();

          this.message = "Your data is registered in firebase"
          // this.router.navigate(['/home-page'])
          this.router.navigate(['/profile'])

      }).catch(_error =>{
        this.error = _error
        this.router.navigate(['/register'])
      })
    }
  }
  
  validateForm(email, password, passwordVerify, isOwningCNSS, name, phone)
  {
    if(email.length === 0)
    {
      this.errorMessage = "please enter email id";
      return false
    }
    if(password.length === 0)
    {
      this.errorMessage = "please enter password";
      return false
    }
    if(password.length < 5)
    {
      this.errorMessage = "password should be at least 5 chars";
      return false
    }
    if(!(passwordVerify === password))
    {
      this.errorMessage = "the verifying password is different from the password";
      return false
    }
    if(name.length === 0)
    {
      this.errorMessage = "please enter your name";
      return false
    }
    if(isOwningCNSS===undefined)
    {
      this.errorMessage = "select option";
      return false
    }
    if(phone.length != 10)
    {
      this.errorMessage = "phone number is not valid";
      return false
    }
    this.errorMessage = '';
    return true;
  }

  clearErrorMessage()
  {
    this.errorMessage = '';
    this.error = {name: '', message:''};
  }
}
