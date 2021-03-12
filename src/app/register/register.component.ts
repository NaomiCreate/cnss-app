import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';

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
  is_device_owner:boolean;
  device_id=""//(called "system_id") //NEED TO CHECK THAT SYSTEM EXISTS IN FIREBASE AND ONLY THEN ALLOW REGISTRATION
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  dbData;
  constructor(private authservice: AuthService, private router: Router, public crudservice:CrudService,private db: AngularFireDatabase) { }

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
      RecordUserInfo['is_device_owner'] = this.is_device_owner;
      RecordUserInfo['device_id'] = this.device_id;

      this.crudservice.add_EmailToUid(this.email).then()
      .catch(error => {console.log(error);})

      //create_NewContact is defined in crud.service.ts file
      this.crudservice.create_userInfo(RecordUserInfo)
      .then(() => {
        this.password="";
        this.passwordVerify="";
        this.name = "";
        this.email = "";
        this.phone = "";
        this.device_id = "";
        // this.is_device_owner;
        this.message = "user-info was saved succefully";
      }).catch(error => {
        console.log(error);
      })
    }
  }


  register()
  {
    let dbPath = '';//`/device-list/` + record['device_id'] ;//beginig of path to realtime database
    this.clearErrorMessage();
    if(this.validateForm(this.email, this.password, this.passwordVerify,this.is_device_owner, this.name, this.phone,this.device_id))
    {
      //----------
      if(this.is_device_owner==true)
      {
      dbPath = `/device-list/` + this.device_id ;//beginig of path to realtime database
      this.dbData = this.db.list(dbPath).snapshotChanges()
      .subscribe(data => {
        //console.log("data[0].payload.exists()",data[0].payload.exists());
        if(data[0]==undefined|| (this.device_id.length==0 && this.is_device_owner==true))//The device does not exist in the system Or emty
          alert("The device does not exist in the system");
        else//The device exist in the system OR record['is_device_owner']==false
        {
          this.authservice.registerWithEmail(this.email, this.password)
          .then(() => {
              //we will save the user-info in collection named 'user-info'
              this.CreateRecordUserInfo();
              this.message = "Your data is registered in firebase"
              this.router.navigate(['/profile'])
    
          }).catch(_error =>{
            this.error = _error
            this.router.navigate(['/register'])
          })
        }
      })
    }
    else{
      this.authservice.registerWithEmail(this.email, this.password)
          .then(() => {
              //we will save the user-info in collection named 'user-info'
              this.CreateRecordUserInfo();
              this.message = "Your data is registered in firebase"
              this.router.navigate(['/profile'])
    
          }).catch(_error =>{
            this.error = _error
            this.router.navigate(['/register'])
          })
    }
      //----------
      // this.authservice.registerWithEmail(this.email, this.password)
      // .then(() => {
      //     //we will save the user-info in collection named 'user-info'
      //     this.CreateRecordUserInfo();
      //     this.message = "Your data is registered in firebase"
      //     this.router.navigate(['/profile'])

      // }).catch(_error =>{
      //   this.error = _error
      //   this.router.navigate(['/register'])
      // })
    }
  }
  
  
  validateForm(email, password, passwordVerify, is_device_owner, name, phone, dvice_id)
  {
    //if is_device_owner==TRUE -> need to check if the device_id is stored in the system//added 7.3.21

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
    if(is_device_owner===undefined)
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

  ngOnDestroy(){
    if(this.dbData != undefined)
      this.dbData.unsubscribe();
  }
}
