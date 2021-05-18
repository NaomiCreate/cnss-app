import { Component, OnInit } from '@angular/core';
import { RealTimeService } from '../services/real-time.service';

import { AngularFireDatabase } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ValueTransformer } from '@angular/compiler/src/util';
import { CrudService } from '../services/crud.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

//import { timeStamp } from 'console';


export interface Alert {
  image_path: string; //url :URL
  notes: string;
  timestamp: any;

  year: number;//---added For search
  month: number;//---added For search
  day: number;//---added For search
  hour: number;//---added For search
  minutes: number;//---added For search

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

  prevStartPoint:number;
  nextStartPoint:number;

  //searchStartPoint: SearchPoints;//---added For search
  //searchEndPoint: SearchPoints;//---added For search
}

export interface User {
  isOwner: Status;
  dbPath: string;
  alerts: Array<Alert>;
  hasAlerts: Status;
  deviceID: any;
  hasConnections:Status;

  prevStartPoint:number;
  nextStartPoint:number;

  searchStartPoint: SearchPoints;//---added For search
  searchEndPoint: SearchPoints;//---added For search
}

//---added for search
export interface SearchPoints {
  date: String;
  year: number;
  month: number;
  day: number;
  hour: number;
  minutes: number;
  seconds: number;

}
//---added for search
const ALERT_LIMIT = 3;//The value should be: limit+1 

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
    hasConnections:Status.StandBy,

    prevStartPoint:null,
    nextStartPoint:null,
    searchStartPoint: { date: "",
                        year: null,
                        month: null,
                        day: null,
                        hour: null,
                        minutes: null,
                        seconds: null 
                      },//---added For search
    searchEndPoint: { date: "",
                      year: null,
                      month: null,
                      day: null,
                      hour: null,
                      minutes: null,
                      seconds: null
                    }//---added For search
  }

  public connections: Array<Connection> = []; // will contain all users connections that allow sharing their history with him
  private data_subscriptions: Array<Subscription> = []; //to release on ngDestroy

  //The next variables are for HTML use
  public myHistoySelected: boolean = true;
  public state = Status;

  constructor(private authservice: AuthService, private crudservice: CrudService, private realtimeservice: RealTimeService, 
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

          //console.log("Debug::user.dbPath", this.user.dbPath)

          //getAlerts
          this.getNext(-1,false);
        
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
      this.crudservice.get_AllConnections(this.authservice.currentUserId).snapshotChanges().subscribe(data => {

        //set users HasConnection for HTML output
        if(data.length === 0){
          this.user.hasConnections = Status.Deny
        }
        else{
          this.user.hasConnections = Status.Accept
        }
       
        this.connections = [] // empty connections
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
              index: i,
              prevStartPoint:null,
              nextStartPoint:null
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

                    //console.log("Debug::connections",this.connections)
                    //console.log("Debug::user",this.user)

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
    //this.time_stamp_to_date(doc.payload.val()["timestamp"]);//For DEBUG

    var date = new Date(+doc.payload.val()["timestamp"]);
    //console.log("Debug:: date from getAlert = ",date);

    return {
      image_path:doc.payload.val()["image_path"],
      notes: doc.payload.val()["notes"],
      timestamp: doc.payload.val()["timestamp"],
      year: date.getFullYear(),
      month:date.getMonth()+1,
      day: date.getUTCDate(),
      hour: date.getHours(),
      minutes: date.getMinutes(),
      inEdit:false,
      alertID: doc.key
    };
  }


  /**This functin is an on click listener, it receives a connection and retreivs all alerts 
   * index -> should be connections index in array connections
  */
  showAlerts(index: number){

    //console.log("Debug:: connection email", index)
    //console.log("Debug:: connections[index]", this.connections[index])


    if(this.connections[index].shareHistory == Status.Accept){

      this.connections[index].hideHistory = false; //show history for HTML
      if(this.connections[index].alerts.length == 0){
        this.getNext(index, true);
      }
      
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

//function for debug
time_stamp_to_date(timestamp: number){
  var date = new Date(+timestamp);
  console.log("date = ",date);
  console.log("date.toDateString() = ",date.toDateString());
  console.log("date.getFullYear() =",date.getFullYear());
  console.log("date.getMonth()+1 =",date.getMonth()+1);
  console.log("date.getUTCDate() =",date.getUTCDate());
  console.log("date.getMinutes() = ",date.getMinutes());
  console.log("date.getSeconds() = ",date.getSeconds());
  console.log("date.getHours() = ",date.getHours());
  console.log("date.toLocaleTimeString() = ",date.toLocaleTimeString());
  }



//--------------------------------------------------------------------------27/04/2021


  getNext(index:number, isConnection:boolean)
  {
    let start: number;
    let code: string;

    if(!isConnection)//isUser
    {
      this.user.hasAlerts = Status.StandBy;

      if(this.user.alerts.length != 0){
        console.log("Debug:: in this.user.alerts.length != 0 ")
        start = this.user.nextStartPoint;
        code = `ref=>ref.orderByChild('timestamp').endAt(start).limitToLast(${ALERT_LIMIT})` ;
      }
      else{ //The opening group of alerts
        start = null;
        this.user.prevStartPoint = null; // as this is the openning group set prev to null
        code = `ref=>ref.orderByChild('timestamp').startAt(start).limitToLast(${ALERT_LIMIT})`;
      }
  
      console.log("Debug: outer layer getNext")
      console.log("Debug:: start:",start)
      this.data_subscriptions.push(
        this.db.list(this.user.dbPath,eval(code))
          .snapshotChanges()
          .subscribe(data => {
            console.log("Debug: inner layer getNext")
            console.log("Debug:: start:",start)

            //this.user.alerts = []; //empty alerts, incase - snapshotChanges
            //data.forEach(doc => this.user.alerts.push(this.getAlert(doc)))
            
            this.user.alerts = data.map(doc => {return this.getAlert(doc)}) //empty alerts, incase - snapshotChanges
            console.log("Debug::Test user alerts: ",this.user.alerts)

            //sort alerts by date
            this.user.alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();

            if(this.user.alerts.length == ALERT_LIMIT)
            {
              //pop the last item - its time stamp will be usefull when clicking next again next 
              this.user.nextStartPoint = this.user.alerts.pop().timestamp;
            }
            else
            {
              this.user.nextStartPoint = null;
            }

            if(start != null){
              this.user.prevStartPoint = this.user.alerts[0].timestamp; //as this is not the opening group 
            }
            

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
    
    else{ //isConnection nake sure only connection that allows sharing allerts gets here

      this.connections[index].hasAlerts = Status.StandBy;

      if(this.connections[index].alerts.length != 0){
        start = this.connections[index].nextStartPoint;
        code = `ref=>ref.orderByChild('timestamp').endAt(start).limitToLast(${ALERT_LIMIT})` ;
      }
      else{ //The opening group of alerts
        start = null;
        this.connections[index].prevStartPoint = null; // as this is the openning group set prev to null
        code = `ref=>ref.orderByChild('timestamp').startAt(start).limitToLast(${ALERT_LIMIT})`;
      }
  
      this.data_subscriptions.push(
        this.db.list(this.connections[index].dbPath,eval(code))
          .snapshotChanges()
          .subscribe(data => {
  
            this.connections[index].alerts = []; //empty alerts - snapshotChanges
            data.forEach(doc => this.connections[index].alerts.push(this.getAlert(doc))) 
            
            //sort alerts by date
            this.connections[index].alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();

            if(this.connections[index].alerts.length == ALERT_LIMIT)
            {
              //pop the last item - its time stamp will be usefull when clicking next again next 
              this.connections[index].nextStartPoint = this.connections[index].alerts.pop().timestamp;
            }
            else
            {
              this.connections[index].nextStartPoint = null;
            }

            if(start != null){
              this.connections[index].prevStartPoint = this.connections[index].alerts[0].timestamp; //as this is not the opening group 
            }
            

            //set hasAlerts
            if(this.connections[index].alerts.length != 0){
              this.connections[index].hasAlerts = Status.Accept
            }
            else{
              this.connections[index].hasAlerts = Status.Deny
            }
          }
        )
  
      );


    }
  }

  getPrev(index:number, isConnection:boolean)
  {
    let start: number;
    let code: string;

    if(!isConnection)//isUser
    {
      this.user.hasAlerts = Status.StandBy;


      start = this.user.prevStartPoint; // sould always be equal to this.user.alerts[0].timestamp, 
                                        //unless only the first group was called and then it's null
      this.user.nextStartPoint = this.user.alerts[0].timestamp; //set nextStatingPoint before goint back
      code = `ref=>ref.orderByChild('timestamp').startAt(start).limitToFirst(${ALERT_LIMIT + 1})` ;
      // Get ALERT_LIMIT + 1 to know when we reached the beginning.
  
      console.log("Debug:: outer layer getPrev")
      console.log("Debug:: start:",start)
      this.data_subscriptions.push(
        this.db.list(this.user.dbPath,eval(code))
          .snapshotChanges()
          .subscribe(data => {
            console.log("Debug:: inner layer getPrev")
            console.log("Debug:: start:",start)

            this.user.alerts = []; //empty alerts - snapshot changes
            data.forEach(doc => this.user.alerts.push(this.getAlert(doc))) 
            
            //sort alerts by date
            this.user.alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();

            if(this.user.alerts.length == (ALERT_LIMIT + 1))
            {
              // Then we are still able to go beackwoards
              this.user.alerts.shift().timestamp; // need to shift first
              this.user.prevStartPoint = this.user.alerts[0].timestamp; // and then set prevStarting point
            
            }
            else//this.user.alerts.length <= ALERT_LIMIT
            {
              this.user.prevStartPoint = null;
            }

            this.user.alerts.pop() // pop last item as it was already displayed

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

      this.connections[index].hasAlerts = Status.StandBy;


      start = this.connections[index].prevStartPoint; // sould always be equal to this.connections[index].alerts[0].timestamp, 
                                        //unless only the first group was called and then it's null
      this.connections[index].nextStartPoint = this.connections[index].alerts[0].timestamp; //set nextStatingPoint before goint back
      code = `ref=>ref.orderByChild('timestamp').startAt(start).limitToFirst(${ALERT_LIMIT + 1})` ;
      // Get ALERT_LIMIT + 1 to know when we reached the beginning.
  

      this.data_subscriptions.push(
        this.db.list(this.connections[index].dbPath,eval(code))
          .snapshotChanges()
          .subscribe(data => {

            this.connections[index].alerts = []; // empty alerts - snapshotChanges
            data.forEach(doc => this.connections[index].alerts.push(this.getAlert(doc))) 
      
            //sort alerts by date
            this.connections[index].alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();

            if(this.connections[index].alerts.length == (ALERT_LIMIT + 1))
            {
              // Then we are still able to go beackwoards
              this.connections[index].alerts.shift().timestamp; // need to shift first
              this.connections[index].prevStartPoint = this.connections[index].alerts[0].timestamp; // and then set prevStarting point
            
            }
            else//this.connections[index].alerts.length <= ALERT_LIMIT
            {
              this.connections[index].prevStartPoint = null;
            }

            this.connections[index].alerts.pop() // pop last item as it was already displayed

            //set hasAlerts
            if(this.connections[index].alerts.length != 0){
              this.connections[index].hasAlerts = Status.Accept
            }
            else{
              this.connections[index].hasAlerts = Status.Deny
            }
          }
        )
  
      );

    }
   
  }
//----------------------------***Search***----------------------------

  dateToTimestamp(time:SearchPoints)
  {
    let date = new Date(time.year, time.month-1, time.day, time.hour, time.minutes, time.seconds);
    return date.getTime();
  }

  getNextSearch(isConnection:boolean, searchStartPoint:SearchPoints, searchEndPoint:SearchPoints)
  {
    //let start: number;
    //let code: string;

    if(!isConnection)//isUser
    {
      this.user.hasAlerts = Status.StandBy;
                            
      let start = this.dateToTimestamp(searchStartPoint);
      let end = this.dateToTimestamp(searchEndPoint);

      this.db.database.ref(`/devices/${this.user.deviceID}/history`).orderByChild("timestamp").startAt(start).endAt(end).once('value').then(function(snapshot) {
        snapshot.forEach(function(child) {

          let childData = child.val();
          let timestamps=child.val().timestamp;

          console.log("Search Debug:: childData= ",childData);
          console.log("Search Debug:: timestamps= ",timestamps);
        });
      });
      
      //set hasAlerts
      if(this.user.alerts.length != 0){
        this.user.hasAlerts = Status.Accept
      }
      else{
        this.user.hasAlerts = Status.Deny
      }
    }
  }
}