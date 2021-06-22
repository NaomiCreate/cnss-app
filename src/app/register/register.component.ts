import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserRecord {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  is_device_owner: boolean;
  device_id: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  userInfoRecord: UserRecord = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    is_device_owner: false,
    device_id: ''
  }

  public next:number = 1;
  password: string = '';
  passwordVerif: string = '';

  message = '';
  errorMessage = ''; //validation error handle
  dbData: any;

  rForm: FormGroup;
  post: any;//property for our submitted form
  //The inputs of the form:
  userInputEmail: string = '';
  userInputPassword: string = '';
  userInputPasswordValidation: string = '';
  userInputFirstName: string = '';
  userInputLastName: string = '';
  userInputPhone: string = '';

  // userInputIsOwner: boolean = false;
  // userInputIsDeviceOwner: string = '';
  //userInputDeviceId: string = '';
  
  constructor(private fb: FormBuilder, private authservice: AuthService, private router: Router, public crudservice: CrudService, private db: AngularFireDatabase) {
    //here we will specifie the validations
    
    this.rForm = fb.group({
      'userInputEmail': ['', Validators.compose([Validators.required, Validators.email])],
      'userInputPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'userInputPasswordValidation': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'userInputFirstName':['',Validators.required],
      'userInputLastName':['',Validators.required],
      'userInputPhone': ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
    });
  }


  addPost(post) {
    this.userInfoRecord.email = post.userInputEmail;
    this.password = post.userInputPassword;
    this.passwordVerif = post.userInputPasswordValidation;
    this.userInfoRecord.firstName = post.userInputFirstName;
    this.userInfoRecord.lastName = post.userInputLastName;
    this.userInfoRecord.phone = post.userInputPhone;
    // this.userInfoRecord.is_device_owner = post.userInputIsOwner;
    // if(this.userInfoRecord.is_device_owner)
   //this.userInfoRecord.device_id= post.userInputDeviceId;

    this.register();
  }

  ngOnInit() { }

  /**NEED TO ADD A CHECK THAT THE DEVICE IN USE DOESN'T ALREADY HAVE AN OWNER.
   * A DEVICE CAN HAVE ONE OWNER AND MANY CONTACTS.*/

  /*This function is to be called after user was registerd succesfully
   and user account was craeted.*/
  CreateRecordUserInfo() {
    if (this.authservice.currentUser != null)//check that user is logged in
    {

      //update EmailToUid collection
      this.crudservice.add_EmailToUid(this.userInfoRecord.email).then()
        .catch(error => { 
          console.log(error); })

      //update DeviceToUid collection if needed
      if (this.userInfoRecord.is_device_owner) {
        this.crudservice.add_deviceToUid(this.userInfoRecord.device_id).then()
          .catch(error => { 
            console.log(error); })
      }

      //update UserInfo collection
      this.crudservice.create_userInfo(this.userInfoRecord).then(() => {
        this.password = this.passwordVerif = "";
      }).catch(error => { 
        console.log(error); })
    }
  }


  register() {

    this.clearErrorMessage();
    if (this.validateForm()) {
      if (this.userInfoRecord.is_device_owner == true) {
        let dbPath = `/device-list/` + this.userInfoRecord.device_id;//path to realtime database
        this.dbData = this.db.list(dbPath).snapshotChanges()
          .subscribe(data => {
            if (data[0] == undefined) {
              this.errorMessage = "Device ID is not registered in the system";
            }
            else {
              this.crudservice.get_uidFromDeviceID(this.userInfoRecord.device_id).then((doc) => {
                if (doc.exists) {
                  this.errorMessage = "The device ID is not available";
                }
                else {
                  this.authservice.registerWithEmail(this.userInfoRecord.email, this.password)
                    .then(() => {
                      this.CreateRecordUserInfo();
                      this.router.navigate(['/profile'])

                    }).catch(error => {
                      console.log("There is a problem", error.code)
                      if(error.message == "auth/email-already-in-use"){
                        this.errorMessage = " The email address is already in use by a nother account"
                      }
                      else{
                        this.errorMessage = "Error, registration failed";
                      }
                
                    })
                }
              }).catch((error) => {
                console.log("error",error);
                this.errorMessage = "Error, registration failed";
              });
            }
          })
      }
      else {
        this.userInfoRecord.device_id = ''; // clear device id
        this.authservice.registerWithEmail(this.userInfoRecord.email, this.password)
          .then(() => {
            this.CreateRecordUserInfo();
            this.router.navigate(['/profile'])

          }).catch(error => {
            console.log("There is a problem", error.code)
            if(error.message == "auth/email-already-in-use"){
              this.errorMessage = " The email address is already in use by a nother account."
            }
            else{
              this.errorMessage = "Error, registration failed";
            }
          })
      }

    }
  }

  validateForm() {

    if (!(this.passwordVerif === this.password)) {
      this.errorMessage = "The password confirmation does not match password";
      return false
    }
    if (this.userInfoRecord.is_device_owner == true && this.userInfoRecord.device_id.length == 0) {
      this.errorMessage = "Enter your device ID";
      return false
    }
    //NEED TO ADD: The device id is already in use
    this.errorMessage = '';
    return true;
  }


  clearErrorMessage() {
    this.errorMessage = '';
  }


  ngOnDestroy() {
    if (this.dbData != undefined)
      this.dbData.unsubscribe();
  }


}
