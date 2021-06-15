import { Component, OnInit } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';

interface UserRecord {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  is_device_owner: boolean;
  device_id: string;
}

enum Status {
  StandBy,
  Accept,
  ChangePassword
  // Deny
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  record: any; //will hold users info
  inEdit: boolean = false; //will hold the editing state 
  doc_id: string; //will hold the documents id

  Status = Status;
  state:Status = Status.StandBy

  message = '';
  errorMessage = ''; //validation error handle
  error: { name: string, message: string } = { name: '', message: '' }; //firebase error handle

  dbData: Subscription;
  subscriptions: Subscription[] = [];

  constructor(public authservice: AuthService, private router: Router, public crudservice: CrudService, private db: AngularFireDatabase) { }

  ngOnInit() {

    this.inEdit = false;

    if (this.authservice.currentUser != null)//make sure the user is logged in
    {
      this.subscriptions.push(
        this.crudservice.get_userInfo().subscribe(data => {

          /**This trcord is displayed in HTML, it returns an array */
          this.record = data.map(c => {

            return {
              email: c.payload.doc.data()['email'],
              firstName: c.payload.doc.data()['firstName'],
              lastName: c.payload.doc.data()['lastName'],
              phone: c.payload.doc.data()['phone'],
              is_device_owner: c.payload.doc.data()['is_device_owner'],
              device_id: c.payload.doc.data()['device_id'],
              doc_id: c.payload.doc.id
            };
          })
          this.state=Status.Accept;
        })
      );
    }
  }

  //will fire after the user clicks "Edit Contant"
  editRecord(item: any) {
    this.message = '';
    this.inEdit = true; //Following this determination, we will see on the screen what appears in html under the tag #elseBlock
    item.editFirstName = item.firstName;
    item.editLastName = item.lastName;
    item.editPhone = item.phone;
    item.editIsDeviceOwner = item.is_device_owner;
    item.editDeviceID = item.device_id;
  }

  /**NEED TO ADD A CHECK THAT THE DEVICE IN USE DOESN'T ALREADY HAVE AN OWNER.
   * A DEVICE CAN HAVE ONE OWNER AND MANY CONTACTS.*/


  //will fire after the user press "Edit" and than press "Update"
  updateRecord(item:any)
  {
      let new_record:UserRecord = {
        firstName:item.editFirstName,
        lastName: item.editLastName,
        email: item.email,
        phone: item.editPhone,
        is_device_owner: item.editIsDeviceOwner,
        device_id: item.editDeviceID
      }

      if(this.validateForm(new_record)){

        // new owner
        if(new_record.is_device_owner && !this.record[0].is_device_owner){
          console.log("new owner");
          this.setDeviceID(new_record)
          .then(
            () => {
              this.updateUser(new_record) 
            }
          )
          .catch((error) => console.log("Error, device id could not be set"));
        }
        // user changed their device id
        else if(new_record.device_id != this.record[0].device_id){
          console.log("device id change");
          this.changeDeviceID(new_record)
          .then(
            () => {
              this.updateUser(new_record) 
            }
          )
          .catch((error) => console.log("Error, device id could not be changed"));
        }
        // no change in device id
        else{
          console.log("device id kept");
          this.updateUser(new_record)   
        }
      }
  }

  updateUser(new_record:UserRecord){

    if(confirm("Are you sure you want to edit your details?")){
      this.crudservice.update_user(new_record.email, new_record);
      this.message = "The update was successfully saved";
      this.inEdit = false;
    }  

  }

  setDeviceID(new_record:UserRecord):Promise<boolean>{

    return new Promise((resolve,reject) => {
      let dbPath = `/device-list/` + new_record.device_id
      this.verifyDevice(dbPath)
      .then(
        (valid:boolean) => {

          console.log("device valid", valid);

          // check id device already exists
          this.crudservice.get_uidFromDeviceID(new_record.device_id)
          .then(
            (result) => {
              if (result.exists) {
                this.errorMessage = "The device ID is not available";
                reject(true);
              }
              else{
                // add device to list under current user
                this.crudservice.add_deviceToUid(new_record.device_id)
                .then(() => resolve(true))
              }
            }
          )
        }    
      ).catch(
        (invalid:boolean) => {
          console.log("device invalid", !invalid);
          this.errorMessage = "The device ID does not exist in the system";
          reject(true);
        }
      )
    })
  }

  changeDeviceID(new_record:UserRecord):Promise<boolean>{

    // user contacts will remain, device will be erased from device-to-uid and changed to new device
    return new Promise((resolve,reject) => {
      let dbPath = `/device-list/` + new_record.device_id
      this.verifyDevice(dbPath)
      .then(
        (valid:boolean) => {
          console.log("device valid", valid);
          
          // check id device already exists
          this.crudservice.get_uidFromDeviceID(new_record.device_id)
          .then(
            (result) => {
              if (result.exists) {
                this.errorMessage = "The device ID is not available";
                reject(true);
              }
              else{
                // add device to list under current user
                this.crudservice.delete_deviceToUid(this.record[0].device_id);
                this.crudservice.add_deviceToUid(new_record.device_id)
                .then(() => resolve(true))
              }
            }
          )
        }    
      ).catch(
        (invalid:boolean) => {
          console.log("device invalid", !invalid);
          this.errorMessage = "The device ID does not exist in the system";
          reject(true);
        }
      )
    })
  }

  verifyDevice(dbPath: any):Promise<boolean>{

    return new Promise(
      (resolve, reject) => {
        this.db.list(dbPath).query.once("value")
        .then(
          (result) => {
            if(result.exists()){
              resolve(true);
            }
            else{
              reject(false);
            }
          }
        ).catch(() => reject(false));
      }
    )
  }

  cancleOwnership(){

    this.errorMessage = '';
    this.message = '';

    // ask if user is sure, warn about all actions taken
    if (confirm("Are you sure you want to cancle your ownership?\nThis action will remove all your contacts and erase your device history.")) {
      
      // remove user from all connected-to  and requests
      this.crudservice.get_AllContacts().get().toPromise()
      .then(
        (result)=>{
          console.log(result)
          result.forEach(
            (contact) => {
              if(contact.data().confirmed){
                console.log("contact_uid",contact.data().uid);
                console.log("my_email",this.authservice.currentUserName);
                this.crudservice.delete_connection(contact.data().uid, this.authservice.currentUserName);
              }
              else{
                console.log("contact_uid",contact.data().uid);
                console.log("my_email",this.authservice.currentUserName);
                this.crudservice.delete_request(contact.data().uid, this.authservice.currentUserName);
              }

              // remove contact from contact list
              console.log("my_UID",this.authservice.currentUserId);
              console.log("contacts_email",contact.data().email);
              console.log("*******");
              this.crudservice.delete_contact(this.authservice.currentUserId, contact.data().email)
            })
        })

      // remove device from device-list in realtime
      this.crudservice.get_userDetails()
      .then(
        (result)=>{

          // inorder not to erase by mistake all devices
          if(result.data().device_id != ''){
            // erase history
            let dbPath = `/devices/${result.data().device_id}`;
            console.log("dbPath",dbPath);
            this.db.database.ref(dbPath).remove()

            // remove device-to-uid entry
            this.crudservice.delete_deviceToUid(result.data().device_id);
          }

          if(result.data().is_device_owner){
            // set device-id to '' and ownership to false
            this.crudservice.resetOwnership();
          }
        
        }
      )    
    }
    
    

  }



  /**This method returns true if all fields in edit HTML are valid */
  validateForm(record: UserRecord): boolean {
    if (record.device_id.length == 0 && record.is_device_owner == true) {
      this.errorMessage = "Please enter your device ID";
      return false;
    }
    if (record.firstName.length === 0) {
      this.errorMessage = "Please enter your first name";
      return false
    }
    if (record.lastName.length === 0) {
      this.errorMessage = "Please enter your last name";
      return false
    }
    if (record.phone.length != 10) {
      this.errorMessage = "Cell phone number is not valid";
      return false
    }

    this.errorMessage = '';
    return true;
  }

  ngOnDestroy() {

    if (this.dbData != undefined)
      this.dbData.unsubscribe();

    this.subscriptions.forEach((subscription) => {
      if (subscription instanceof Subscription)
        subscription.unsubscribe();
    });
  }
}
