import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  dbData;
  constructor(public authservice: AuthService, private router: Router,public crudservice:CrudService,private db: AngularFireDatabase) { }

  ngOnInit(){
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      //this.isEdit= false;
      this.crudservice.get_userInfo().subscribe(data => {
        this.user = data.map(c => {
          return {
            id: c.payload.doc.id,
            isEdit: false,
            name: c.payload.doc.data()['name'],
            email: c.payload.doc.data()['email'],
            phone: c.payload.doc.data()['phone'],
            is_device_owner: c.payload.doc.data()['is_device_owner'],
            device_id: c.payload.doc.data()['device_id'],
          };
        })
      });  
    }
  }

  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {        
    Record.isEdit = true; //Following this determination, we will see on the screen what appears in html under the tag #elseBlock
    Record.editName= Record.name;
    Record.editEmail = Record.email;
    Record.editPhone = Record.phone;
    Record.editIsUserOwnCnss = Record.is_device_owner;
    Record.editDeviceID = Record.device_id;
  }

  //will fire after the user press "Edit" and than press "Update"
  updateRecord(recordData)
  {
    if(confirm("are you sure you want to edit your details?"))
    {
      let dbPath = '';//`/devices-list/` + record['device_id'] ;//beginig of path to realtime database
      let record = {};
      record['name'] = recordData.editName;
      record['email'] = recordData.editEmail;
      record['phone'] = recordData.editPhone;
      record['is_device_owner'] = recordData.editIsUserOwnCnss;
      record['device_id'] = recordData.editDeviceID;

      dbPath = `/device-list/` + record['device_id'] ;//beginig of path to realtime database
      this.dbData = this.db.list(dbPath).snapshotChanges()
      .subscribe(data => {
        //console.log("data[0].payload.exists()",data[0].payload.exists());
        if(data[0]==undefined|| (record['device_id'].length==0 && record['is_device_owner']==true))//The device does not exist in the system Or emty
          alert("The device does not exist in the system");
        else//The device exist in the system OR record['is_device_owner']==false
        {
          this.crudservice.update_user(recordData.id, record);
          this.message = "The update was successful";
          recordData.isEdit = false;
        }
      })
    }
  }

  validateForm(is_device_owner,email, name, phone,device_id)
  {    
    var dbPath = `/devices-list/` + device_id ;//beginig of path to realtime database
    let dbData = this.db.list(dbPath).snapshotChanges()
    .subscribe(data => {
      //console.log("data[0].payload.exists()",data[0].payload.exists());
      if(data[0]==undefined || device_id.length==0)//The device ID does not exist in the system Or empty
      {
        alert("The device does not exist in the system");
        return false;
      }
    })
    if(email.length === 0)
    {
      this.errorMessage = "please enter email id";
      return false
    }
    if(name.length === 0)
    {
      this.errorMessage = "please enter your name";
      return false
    }
    // if(phone.length != 10)
    // {
    //   this.errorMessage = "phone number is not valid";
    //   return false
    // }
    this.errorMessage = '';
    return true;
  }

  ngOnDestroy(){
    if(this.dbData != undefined)
      this.dbData.unsubscribe();
  }
}
