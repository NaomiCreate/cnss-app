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

          this.get_alert_details();

      });
  }

  get_alert_details(){

    this.dbData = this.db.list(this.dbPath).valueChanges()
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
    //console.log("get_Connections_shareHistory()"+  this.crudservice.get_Connections_shareHistory());

    this.isMyHistoyPushed = false;
      this.subscription = this.crudservice.get_AllConnections().subscribe(data => {
        this.connections = data.map(c => {

          if(c.payload.doc.data()['shareHistory']==true)
          {
            let connection={};

            //this.crudservice.get_contact_details(c.payload.doc.id, Object.keys(c.payload.doc.data())[0])
            this.crudservice.get_contact_details(c.payload.doc.id,  c.payload.doc.data()['id'])
            .then((doc) => { 
            // if(doc.data()['shareHistory'] == true)
              //{
              connection['firstName'] = doc.data()['firstName'];
              connection['lastName'] = doc.data()['lastName'];
              //}
              //connection['shareHistory'] = doc.data()['shareHistory'];

            }).catch(error => {console.log(error)});
            console.log(connection);

            return connection;
          }
          
        })
      }); 
  }
}