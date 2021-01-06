import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email="";
  password="";
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(private authservice: AuthService, private router: Router) { }
  
  ngOnInit(): void {
  }

  login()
  {
    this.clearErrorMessage();
    if(this.validateForm(this.email, this.password))
    {
      this.authservice.loginWithEmail(this.email, this.password)
      .then(() => {
        // this.router.navigate(['/home-page'])
        this.router.navigate(['/profile'])
      }).catch(_error =>{
        this.error = _error
        this.router.navigate(['/login'])
      })
    }  
  }

  clearErrorMessage()
  {
    this.errorMessage = '';
    this.error = {name: '', message:''};
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
}
