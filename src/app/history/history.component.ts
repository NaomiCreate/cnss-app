import { Component, OnInit } from '@angular/core';
import { RealTimeService } from '../services/real-time.service';



import { AngularFireDatabase } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ValueTransformer } from '@angular/compiler/src/util';
import { CrudService } from '../services/crud.service';

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
  
  public alertURL;//protected imageURL
  private dbData;//will hold object from firebase
  private deviceID;
  private isOwner = false;
  

  constructor(private crudservice: CrudService, private realtimeservice: RealTimeService, 
              private db: AngularFireDatabase, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.crudservice.get_userInfo().subscribe(data => {
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
        //console.log("device_id", this.deviceID[0]);
        if(this.dbPath == "/devices/")
          this.dbPath += `${this.deviceID[0]}/history`;//add end of path
        console.log("dbPath",this.dbPath);

        this.get_alert_details();

        console.log(this.alertArray);
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
  }
}