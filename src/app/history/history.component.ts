import { Component, OnInit } from '@angular/core';
import { RealTimeService } from '../services/real-time.service';

import { AngularFireDatabase } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ValueTransformer } from '@angular/compiler/src/util';
import { CrudService } from '../services/crud.service';
import { Subscription } from 'rxjs';


export interface Alert {
  image_path: string; //url :URL
  notes: string;
  timestamp: number;
  inEdit: boolean; // needed for device owner, that is current user 
  alertID: string; // needed for device owner, that is current user  for edit
}

enum Status {
   StandBy,
   Accept,
   Deny
}

export interface Connection {
  shareHistory: Status;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hideHistory: boolean;
  dbPath: string;
  alerts: Array<Alert>;
  hasAlerts: Status;
  index: number;
}

export interface User {
  isOwner: Status;
  dbPath: string;
  alerts: Array<Alert>;
  hasAlerts: Status;
  deviceID: any;
  hasConnections:Status;
}


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})

export class HistoryComponent implements OnInit {


  public user: User = {
    isOwner: Status.StandBy,
    dbPath: `/devices/`, //beginig of path to realtime database'
    alerts: [],
    hasAlerts: Status.StandBy,
    deviceID: "",
    hasConnections:Status.StandBy
  }

  public connections: Array<Connection> = []; // will contain all users connections that allow sharing their history with him
  private data_subscriptions: Array<Subscription> = []; //to release on ngDestroy

  //The next variables are for HTML use
  public myHistoySelected: boolean = true;
  public state = Status;

  constructor(private crudservice: CrudService, private realtimeservice: RealTimeService, 
    private db: AngularFireDatabase, private sanitizer: DomSanitizer) { }

  ngOnInit(): void{

    //set user info
    //Set the current user history page:first page to be seen in History
    this.data_subscriptions.push(

      this.crudservice.get_userInfo().subscribe(data => {

        //if owner ->
        if(this.isDeviceOwner){

          //set info
          this.user.isOwner = Status.Accept;
          this.user.deviceID = data[0].payload.doc.data()['device_id'];
          this.user.dbPath += `${this.user.deviceID}/history`;

          console.log("Debug::user.dbPath", this.user.dbPath)

          //getAlerts
          this.data_subscriptions.push(
            this.db.list(this.user.dbPath).snapshotChanges().subscribe(data => {

                console.log("Debug:: getting user alerts")
                data.forEach(doc => this.user.alerts.push(this.getAlert(doc))) 

                //sort alerts by date
                this.user.alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();
                  
                //set hasAlerts
                if(this.user.alerts.length != 0){
                  this.user.hasAlerts = Status.Accept
                }
                else{
                  this.user.hasAlerts = Status.Deny
                }
              }
            )
          );
      

        }
        else{
          //for HTML output
          this.user.isOwner = Status.Deny;
        }

        //get users connections
        this.getConnections()
      
      })
      
    );

  }
 
  //This function is to be called in ngOnInit - to get users cpnnections
  getConnections(){

    //console.log("in getConnection")
    
    this.data_subscriptions.push(
      this.crudservice.get_AllConnections().subscribe(data => {

        //set users HasConnection for HTML output
        if(data.length === 0){
          this.user.hasConnections = Status.Deny
        }
        else{
          this.user.hasConnections = Status.Accept
        }
       
        data.forEach((c,i) => {
          
            let new_connection:Connection = {
              shareHistory: Status.StandBy,
              firstName: '',
              lastName: '',
              email: c.payload.doc.id,
              phone: '',
              hideHistory: true,
              dbPath: `/devices/`, //beginig of path to realtime database';
              alerts: [],
              hasAlerts: Status.StandBy,
              index: i
            }
          
            this.crudservice.get_contact_details(new_connection.email,  c.payload.doc.data()['id'])
              .then((doc) =>{
                  new_connection.firstName = doc.data()['firstName'],
                  new_connection.lastName = doc.data()['lastName'],
                  new_connection.phone = doc.data()['phone'],

                  this.crudservice.getHistoryPermission(c.payload.doc.data()['id'])
                  .then((item) => {
        
                    //If connection allows sharing his history
                    if(item.data()['shareHistory'] == true){
                      new_connection.shareHistory = Status.Accept;
                      new_connection.dbPath += `${doc.data()['device_id']}/history`
                    }else{
                      new_connection.shareHistory = Status.Deny;
                    }

                    this.connections.push(new_connection);

                    console.log("Debug::connections",this.connections)
                    console.log("Debug::user",this.user)

                }).catch(error =>console.log(error))
               }
              )
              .catch(error =>console.log(error))

          })
        })
    )
         
  }

  //used in ngOnInit
  isDeviceOwner(data:any):boolean{
    return data[0].payload.doc.data()['is_device_owner'];
  }

  /*Sets alert and returns it*/
  getAlert(doc:any):Alert{

    return {
      image_path:doc.payload.val()["image_path"],
      notes: doc.payload.val()["notes"],
      timestamp: doc.payload.val()["timestamp"],
      inEdit:false,
      alertID: doc.key
    };
  }


  /**This functin is an on click listener, it receives a connection and retreivs all alerts 
   * index -> should be connections index in array connections
  */
  showAlerts(index: number){

    console.log("Debug:: connection email", index)
    console.log("Debug:: connections[index]", this.connections[index])


    if(this.connections[index].shareHistory == Status.Accept){

      //empty array
      this.connections[index].hasAlerts = Status.StandBy;
      this.connections[index].hideHistory = false; //show history for HTML
      this.connections[index].alerts = [];
    
      //getAlerts
      this.data_subscriptions.push(

        this.db.list(this.connections[index].dbPath).snapshotChanges().subscribe(data => {

            data.forEach(doc => this.connections[index].alerts.push(this.getAlert(doc))) 

            //sort alerts by date
            this.connections[index].alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();
              
            //set hasAlerts
            if(this.connections[index].alerts.length != 0){
              this.connections[index].hasAlerts = Status.Accept
            }
            else{
              this.connections[index].hasAlerts = Status.Deny
            }

            console.log("Debug::connection email", this.connections[index].email)
            console.log("Debug::connection alerts", this.connections[index].alerts)
            console.log("Debug::connection has alert", this.connections[index].hasAlerts)
            console.log("Debug::connection showAlerts", this.connections[index].shareHistory)
          }
        )
      );
    }
    else{
      console.log("Debug::this should not appear here, this user does not allow sharing his history")
    }
    
  }

  //NEED TO TEST
  /**This function is an onclick listener for hideHistory HTML 
   * index -> should be connections index in array connections
  */
  hideHistory(index:number){

    this.connections[index].hideHistory = true; //hide history for HTML

  }

  //NEED TO TEST
  ngOnDestroy(){
    this.data_subscriptions.forEach(element => element.unsubscribe())
  }

}