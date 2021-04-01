import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';

interface UserCredentials{
  email:string;
  password:string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user: UserCredentials = {
    email: '',
    password: ''
  }
  
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(private authservice: AuthService, private router: Router) { }
  
  ngOnInit(): void {
  }

  login()
  {
    this.clearErrorMessage();
    if(this.validateForm())
    {
      this.authservice.loginWithEmail(this.user.email, this.user.password)
      .then(() => {
        // this.router.navigate(['/home-page'])
        this.router.navigate(['/profile'])
      }).catch()
    }  
  }

  clearErrorMessage()
  {
    this.errorMessage = '';
    this.error = {name: '', message:''};
  }

  validateForm()
  {
    if(this.user.email.length === 0)
    {
      this.errorMessage = "please enter email";
      return false
    }
    if(this.user.password.length === 0)
    {
      this.errorMessage = "please enter password";
      return false
    }
    if(this.user.password.length < 5)
    {
      this.errorMessage = "password should be at least 5 characters";
      return false
    }

    this.errorMessage = '';
    return true;
  }
}
