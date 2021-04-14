import { Component, OnInit } from '@angular/core';
import { RealTimeService } from '../services/real-time.service';

import { AngularFireDatabase } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ValueTransformer } from '@angular/compiler/src/util';
import { CrudService } from '../services/crud.service';
import { Subscription } from 'rxjs';

export interface Alert {
  path: string; //url :URL
  notes: string;
  timestamp: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  private dbPath = `/devices/`;//beginig of path to realtime database
  private alertArray: Array<Alert> = [];//each file contains name and url
  
  subscription: Subscription;//we will use it when: isMyHistoyPushed =true

  public alertURL;//protected imageURL
  private dbData: Subscription;//will hold object from firebase
  private userInfo:Subscription; // will hold firestore subscription
  private deviceID;
  private isOwner = false;
  
  public isMyHistoyPushed =true;//!
  public isShowContactPushed = false;
  public showOrHide = "Show history";

  connections = [];//!


  constructor(private crudservice: CrudService, private realtimeservice: RealTimeService, 
              private db: AngularFireDatabase, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
      console.log("this.isMyHistoyPushed == true");
      this.userInfo = this.crudservice.get_userInfo().subscribe(data => {
          this.deviceID = data.map(c => {
            if (c.payload.doc.data()['is_device_owner'] == true){
              this.isOwner = true;
              console.log("device_id", c.payload.doc.data()['device_id']);
              return c.payload.doc.data()['device_id'];
            }
            else{
              this.isOwner = false;
              return "";
            }
          });

          this.dbPath += `${this.deviceID[0]}/history`;//add end of path
          console.log("dbPath",this.dbPath);

          this.get_alert_details(this.dbPath);

      });
  }

  get_alert_details(path){
    this.alertArray = [];
    this.dbData = null;

    this.dbData = this.db.list(path).valueChanges()
    .subscribe(data => {

      //inject fata files in to file array
      for (let i = 0; i < data.length; i++)
        this.alertArray.push({ path: data[i]["image_path"], notes: data[i]["notes"], timestamp: data[i]["timestamp"] });
      this.alertArray.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();
    })
  }

  get alerts(){
    return this.alertArray;
  }

  ngOnDestroy(){

    if(this.dbData != undefined)
      this.dbData.unsubscribe();
    
    if(this.userInfo != undefined)
      this.userInfo.unsubscribe();
  }



  connectionsHistoryPushed(){
    this.isMyHistoyPushed = false;
      this.subscription = this.crudservice.get_AllConnections().subscribe(data => {
        this.connections = data.map(c => {

          if(c.payload.doc.data()['shareHistory']==true)
          {
            let connection={};

            this.crudservice.get_contact_details(c.payload.doc.id,  c.payload.doc.data()['id'])
            .then((doc) => { 
              connection['firstName'] = doc.data()['firstName'];
              connection['lastName'] = doc.data()['lastName'];
              connection['email'] = doc.data()['email'];

            }).catch(error => {console.log(error)});

            return connection;
          }
          
        })
      }); 
  }

  showOrHidePushed(email:string){
    this.dbPath=`/devices/`;
    console.log("email"+email);
    let connectionUid ="";
    //toggel btn
    if(this.isShowContactPushed == false)
    {
      this.isShowContactPushed=true;
      this.showOrHide = "Hide history";
    }
    else
    {
      this.isShowContactPushed=false;
      this.showOrHide = "Show history";
      
      let connectionTemp = this.crudservice.get_uidFromEmail(email).then((doc) => {
    
           connectionUid=doc.data()[email];
           console.log("!!connectionUid"+connectionUid);
           let connectionDeviceID = this.crudservice.get_userInfoByUid(connectionUid).subscribe(data => {
            let deviceId = data.map(c => {
              if (c.payload.doc.data()['is_device_owner'] == true){
                this.isOwner = true;
                console.log("device_id", c.payload.doc.data()['device_id']);
                return c.payload.doc.data()['device_id'];
              }
              else{
                this.isOwner = false;
                return "";
              }
            });
    
            this.dbPath += `${this.deviceID[0]}/history`;//add end of path
            console.log("dbPath",this.dbPath);
    
            this.get_alert_details(this.dbPath);
    
        });

      }).catch((error) => {
        console.log("Error getting document:", error);
      });  


      console.log("!connectionUid"+connectionUid);
      
      //get device id from uid

    }
  }
}