import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';

interface UserRecord{
  email:string;
  firstName:string;
  lastName:string;
  phone:string;
  is_device_owner:boolean;
  device_id:string;
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  record:any; //will hold users info
  inEdit:boolean = false; //will hold the editing state 
  doc_id:string; //will hold the documents id
  
  
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  dbData: Subscription;
  subscriptions: Subscription[] = [];

  constructor(public authservice: AuthService, private router: Router,public crudservice:CrudService,private db: AngularFireDatabase) { }

  ngOnInit(){

    this.inEdit = false;

    if(this.authservice.currentUser != null)//make sure the user is logged in
    {
      this.subscriptions.push(
        this.crudservice.get_userInfo().subscribe(data => {

          /**This trcord is displayed in HTML, it returns an array */
          this.record = data.map(c => {

            //set device ownership for owner guard
            this.crudservice.set_is_owner(c.payload.doc.data()['is_device_owner']);

            return {
              email:c.payload.doc.data()['email'],
              firstName:c.payload.doc.data()['firstName'],
              lastName:c.payload.doc.data()['lastName'],
              phone:c.payload.doc.data()['phone'],
              is_device_owner:c.payload.doc.data()['is_device_owner'],
              device_id:c.payload.doc.data()['device_id'],
              doc_id: c.payload.doc.id
            };
          })
        })
      ); 
    }
  }

  //will fire after the user clicks "Edit Contant"
  editRecord(item:any)
  {    
    this.message ='';    
    this.inEdit = true; //Following this determination, we will see on the screen what appears in html under the tag #elseBlock
    item.editFirstName= item.firstName;
    item.editLastName= item.lastName;
    item.editPhone = item.phone;
    item.editIsDeviceOwner = item.is_device_owner;
    item.editDeviceID = item.device_id;
  }

  /**NEED TO ADD A CHECK THAT THE DEVICE IN USE DOESN'T ALREADY HAVE AN OWNER.
   * A DEVICE CAN HAVE ONE OWNER AND MANY CONTACTS.*/

  
  //will fire after the user press "Edit" and than press "Update"
  updateRecord(item:any)
  {
    // if(confirm("Are you sure you want to edit your details?"))
    // {
      //let dbPath = '';//`/devices-list/` + record['device_id'] ;//beginig of path to realtime database
      let new_record:UserRecord = {
        firstName:item.editFirstName,
        lastName: item.editLastName,
        email: item.email,
        phone: item.editPhone,
        is_device_owner: item.editIsDeviceOwner,
        device_id: item.editDeviceID
      }

      if(this.validateForm(new_record)){

        let dbPath = `/device-list/` + new_record['device_id'] ;//beginig of path to realtime database
        this.dbData = this.db.list(dbPath).snapshotChanges()
        .subscribe(data => {
          if(data[0]==undefined|| (new_record['device_id'].length==0 && new_record['is_device_owner']==true))//The device does not exist in the system Or emty
            alert("The device does not exist in the system");
          else {//The device exist in the system OR record['is_device_owner']==false
            if(new_record['is_device_owner']==false){
              new_record['device_id'] = '';
            }
            if(confirm("Are you sure you want to edit your details?")){
              this.crudservice.set_is_owner(new_record['is_device_owner']); //set device ownership for owner guard
              this.crudservice.update_user(new_record.email, new_record);

              //add device to collection: deviceToUid
              if(new_record['is_device_owner']==true){
                this.crudservice.add_deviceToUid(new_record.device_id).then()
                  .catch(error => {console.log(error);})
              }

              this.message = "The update was successful";
              this.inEdit = false;
            }
          }
        });
      }
    //}
  }


  /**This method returns true if all fields in edit HTML are valid */
  validateForm(record:UserRecord):boolean
  {    
     if(record.device_id.length==0 && record.is_device_owner == true){
        this.errorMessage = "Please enter device id";
        return false;
     }
    if(record.firstName.length === 0)
    {
      this.errorMessage = "Please enter your first name";
      return false
    }
    if(record.lastName.length === 0)
    {
      this.errorMessage = "Please enter your lsat name";
      return false
    }
    if(record.phone.length != 10)
    {
      this.errorMessage = "Phone number is not valid";
      return false
    }

    this.errorMessage = '';
    return true;
  }

  ngOnDestroy(){

    if(this.dbData != undefined)
      this.dbData.unsubscribe();

    this.subscriptions.forEach((subscription) => {
        if(subscription instanceof Subscription)
            subscription.unsubscribe();
    });
  }
}
