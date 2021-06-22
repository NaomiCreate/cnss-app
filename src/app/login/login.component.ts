import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  rForm: FormGroup;
  post: any;//property for our submitted form
  //The inputs of the form:
  userInputEmail: string = '';
  userInputPassword: string = '';


  addPost(post:any) {

    this.user.email = post.userInputEmail;
    this.user.password = post.userInputPassword;
    this.login();
    this.user.email = this.user.password = '';
    this.post = null;

  }

  constructor(private fb: FormBuilder,private authservice: AuthService, private router: Router) { 
    //here we will specifie the validations
    this.rForm = fb.group({
      'userInputEmail': ['', Validators.compose([Validators.required, Validators.email])],
      'userInputPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }
  
  ngOnInit(): void {
  }

  login()
  {
    this.clearErrorMessage();
    this.authservice.loginWithEmail(this.user.email, this.user.password)
    .then(
      (result) => {this.router.navigate(['/profile'])})
    .catch((error) =>{
      // console.log("error,", error);
      this.errorMessage = "Email or Password are incorrect";
    })   
  }

  clearErrorMessage()
  {
    this.errorMessage = '';
    this.error = {name: '', message:''};
  }

}
