import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database';

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

  password: string = '';
  passwordVerif: string = '';

  message = '';
  errorMessage = ''; //validation error handle
  error: { name: string, message: string } = { name: '', message: '' }; //firebase error handle

  dbData: any;

  constructor(private authservice: AuthService, private router: Router, public crudservice: CrudService, private db: AngularFireDatabase) { }

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
        .catch(error => { console.log(error); })

      //update DeviceToUid collection if needed
      if (this.userInfoRecord.is_device_owner) {
        this.crudservice.add_deviceToUid(this.userInfoRecord.device_id).then()
          .catch(error => { console.log(error); })
      }

      //update UserInfo collection
      this.crudservice.create_userInfo(this.userInfoRecord).then(() => {
        this.password = this.passwordVerif = "";
        this.message = "user-info was saved succefully";
      }).catch(error => { console.log(error); })
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
              this.errorMessage = "The device id does not exist in the system";
            }
            else {
              this.crudservice.get_uidFromDeviceID(this.userInfoRecord.device_id).then((doc) => {
                if (doc.exists) {
                  this.errorMessage = "The device id is already in use";
                }
                else {
                  this.authservice.registerWithEmail(this.userInfoRecord.email, this.password)
                    .then(() => {
                      this.CreateRecordUserInfo();
                      this.message = "Your details saved successfully"
                      this.router.navigate(['/profile'])

                    }).catch(_error => {
                      this.error = _error
                      this.router.navigate(['/register'])
                    })
                }
              }).catch((error) => {
                console.log("error");

              });
            }
          })
      }
      else {
        this.authservice.registerWithEmail(this.userInfoRecord.email, this.password)
          .then(() => {
            this.CreateRecordUserInfo();
            this.message = "Your data is registered in firebase"
            this.router.navigate(['/profile'])

          }).catch(_error => {
            this.error = _error
            this.router.navigate(['/register'])
          })
      }

    }
  }

  validateForm() {

    if (this.userInfoRecord.email.length === 0) {
      this.errorMessage = "Please enter your email address in format:\nyourname@example.com";
      return false
    }
    if (this.password.length === 0) {
      this.errorMessage = "Please enter a password";
      return false
    }
    if (this.password.length < 6) {
      this.errorMessage = "The password should be at least 6 characters";
      return false
    }
    if (!(this.passwordVerif === this.password)) {
      this.errorMessage = "The password verification does not match the password";
      return false
    }
    if (this.userInfoRecord.firstName.length === 0) {
      this.errorMessage = "Please enter your first name";
      return false
    }
    if (this.userInfoRecord.lastName.length === 0) {
      this.errorMessage = "Please enter your last name";
      return false
    }
    if (this.userInfoRecord.phone.length === 0) {
      this.errorMessage = "Please enter your cell phone number";
      return false
    }
    if (this.userInfoRecord.phone.length != 10) {
      this.errorMessage = "Cell phone number is not valid";
      return false
    }
    // if(this.userInfoRecord.is_device_owner===undefined)
    // {
    //   this.errorMessage = "Select option";
    //   return false
    // }
    if (this.userInfoRecord.is_device_owner == true && this.userInfoRecord.device_id.length == 0) {
      this.errorMessage = "Please enter your device id";
      return false
    }
    //NEED TO ADD: The device id is already in use
    this.errorMessage = '';
    return true;
  }


  clearErrorMessage() {
    this.errorMessage = '';
    this.error = { name: '', message: '' };
  }


  ngOnDestroy() {
    if (this.dbData != undefined)
      this.dbData.unsubscribe();
  }


}
