import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  //name="";
  email="";
  password="";
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  constructor(private authservice: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  register()
  {
    this.clearErrorMessage();
    if(this.validateForm(this.email, this.password))
    {
      this.authservice.registerWithEmail(this.email, this.password)
      .then(() => {
        this.message = "Your data is registered in firebase"
        //this.router.navigate(['/login'])
      }).catch(_error =>{
        this.error = _error
        this.router.navigate(['/register'])
      })
    }
  }

  validateForm(email, password)
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

    this.errorMessage = '';
    return true;
  }

  clearErrorMessage()
  {
    this.errorMessage = '';
    this.error = {name: '', message:''};
  }
}
