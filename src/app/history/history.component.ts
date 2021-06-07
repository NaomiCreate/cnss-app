import { Component, OnInit, ViewChild } from '@angular/core';
import { RealTimeService } from '../services/real-time.service';

import { AngularFireDatabase } from '@angular/fire/database';
import { DomSanitizer } from '@angular/platform-browser';
import { ValueTransformer } from '@angular/compiler/src/util';
import { CrudService } from '../services/crud.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
// import { Console } from 'console';
import { validateEventsArray } from '@angular/fire/firestore';


//import { timeStamp } from 'console';

//TOASTS: https://ej2.syncfusion.com/angular/documentation/toast/timeout/?_ga=2.203180305.1660293228.1622753500-518789863.1617545645


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

  largestTimestamp:number;
  smallestTimestamp:number;
  prevTimestamp:number;
  nextTimestamp:number;

  showAll:boolean;//change to showAll checkBox
  searchLargestTimestamp:number;
  searchSmallestTimestamp:number;
  fromDate?: Date;//---added For search
  toDate?: Date;//---added For search
  fromTime?: Date;//---added For search
  toTime?: Date;//---added For search

  INDEPENDENT_FLAG: boolean; // this flag will turn to true when there is no next and there is only one alert in the array
  PREV_FLAG: boolean;
  NEXT_FLAG: boolean;

}

export interface User {
  isOwner: Status;
  dbPath: string;
  alerts: Array<Alert>;
  hasAlerts: Status;
  deviceID: any;
  hasConnections:Status;

  largestTimestamp:number;
  smallestTimestamp:number;
  prevTimestamp:number;
  nextTimestamp:number;

  showAll:boolean;//change to showAll checkBox

  searchLargestTimestamp:number;
  searchSmallestTimestamp:number;
  fromDate?: Date;//---added For search
  toDate?: Date;//---added For search
  fromTime?: Date;//---added For search
  toTime?: Date;//---added For search

  INDEPENDENT_FLAG: boolean; // this flag will turn to true when there is no next and there is only one alert in the array
  PREV_FLAG: boolean;
  NEXT_FLAG: boolean;

}

const UINIX_MIN_TIMESTAMP =  0x0;
// const UINIX_MAX_TIMESTAMP =  0x7FFFFFFF;


//---added for search
const ALERT_LIMIT = 3;//The value should be: limit+1 

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})

export class HistoryComponent implements OnInit {

  INDEPENDENT_FLAG = false; // this flag will turn to true when there is no next and there is only one alert in the array

  public user: User = {
    isOwner: Status.StandBy,
    dbPath: `/devices/`, //beginig of path to realtime database'
    alerts: [],
    hasAlerts: Status.StandBy,
    deviceID: "",
    hasConnections:Status.StandBy,

    showAll:true,
    searchLargestTimestamp:null,
    searchSmallestTimestamp:null,
    fromDate: null,
    toDate: null,
    fromTime: null,
    toTime: null,

    largestTimestamp:null,
    smallestTimestamp:null,
    prevTimestamp:null,
    nextTimestamp:null,

    INDEPENDENT_FLAG: false,
    PREV_FLAG: false,
    NEXT_FLAG: true,
    
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
          this.setLargestTimestap(this.user).then(res =>
          {
            console.log("ngInin => returnd from set largest time stamp")
            this.setSmallestTimestap(this.user).then(res =>
            {
              this.user.nextTimestamp = this.user.searchLargestTimestamp; // set the next timestamp
              //getAlerts
              this.getNext(this.user, false);
            })
          
          })
          
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
              showAll:true,
              searchLargestTimestamp:null,
              searchSmallestTimestamp:null,
              fromDate: null,
              toDate: null,
              fromTime: null,
              toTime: null,
              largestTimestamp:null,
              smallestTimestamp:null,
              prevTimestamp:null,
              nextTimestamp:null,
              INDEPENDENT_FLAG: false,
              PREV_FLAG:false,
              NEXT_FLAG: true,
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

    if(this.connections[index].shareHistory == Status.Accept){

      this.connections[index].hideHistory = false; //show history for HTML
      if(this.connections[index].alerts.length == 0){

        this.setLargestTimestap(this.connections[index]).then(res =>
          {
            console.log("ngInin => returnd from set largest time stamp")
            this.setSmallestTimestap(this.connections[index]).then(res =>
            {
              this.connections[index].nextTimestamp = this.connections[index].searchLargestTimestamp; // set the next timestamp
              //getAlerts
              this.getNext(this.connections[index], false);
            })
          
          })
        
      }
      
    }
    else{
      console.log("Debug::this should not appear here, this user does not allow sharing his history")
    }
    
  }


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


//function for debugging
timestamp_to_date(timestamp: number){
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

/**
 * Note: for some reason when value changes the query is fired twice,
 * once with an empty object and a second time with the object.
 * @param person
 * @returns true, when data object is not empty, false otherwise.
 * If returns false from value changes it might be user doesn't have alerts but one can't tell.
 */
setLargestTimestap(person:Connection | User):Promise<boolean>{

  let code = `ref=>ref.orderByChild('timestamp').startAt(${UINIX_MIN_TIMESTAMP}).limitToLast(${1})`;

  return new Promise((resolve) =>
  {
    this.data_subscriptions.push(this.db.list(person.dbPath,eval(code))
    .valueChanges()
    .subscribe(data => {

      // This value changes triggers when new alert arrives
      if(data.length > 0){
        console.log("Largest timestamp alert",data[0]["timestamp"]);
        if(person.largestTimestamp < data[0]["timestamp"]){
          //TOAST//
          console.log("new alert");
          //TOAST//
        }
        person.largestTimestamp = data[0]["timestamp"];
        if(person.showAll){
          person.searchLargestTimestamp = person.largestTimestamp;
        }
        resolve(true);
      }
      resolve(false);
   }))
  })

}

setSmallestTimestap(person:Connection | User):Promise<boolean>{

  let code = `ref=>ref.orderByChild('timestamp').startAt(${UINIX_MIN_TIMESTAMP}).limitToFirst(${1})`;

  return new Promise((resolve) =>
  {
    this.data_subscriptions.push(this.db.list(person.dbPath,eval(code))
    .valueChanges()
    .subscribe(data => {

      if(data.length > 0){
        console.log("Smallest timestamp alert",data[0]["timestamp"]);
        person.smallestTimestamp = data[0]["timestamp"];
        if(person.showAll){
          person.searchSmallestTimestamp = person.smallestTimestamp;
        }
        resolve(true);
      }
      resolve(false);

    })
    )
  })
  
}

  /** to be used in html
   * returns true if person should have the 'next' button otherwise returns false*/ 
  hasNext(person:Connection | User):boolean{

    if(person.alerts.length != 0 && 
        person.alerts[person.alerts.length - 1].timestamp > person.searchSmallestTimestamp){
      return true
    }else{
      return false;
    }

  }

  /** to be used in html
   * returns true if person should have the 'prev' button otherwise returns false*/ 
  hasPrev(person:Connection | User):boolean{

    if(person.alerts.length != 0 && 
       person.alerts[0].timestamp < person.searchLargestTimestamp){
      return true
    }else{
      return false;
    }

  }

  /**This function sets the next batch of alerts, 
   * it relies on the fact that person is an object and is there for passed by reference.
   * Inorder to get previous batch of alerts ser prev as true, otherwise set it as false.
   * Note: this function asumes next and prev timestamp should always be set the same way.
   * in other words that there value does not affect the visability of the buttons*/
  getNext(person:Connection | User, prev:boolean){

    // person.hasAlerts = Status.StandBy;

    // let isStart = false;
    // if( person.alerts.length == 0){ // This is not the first batch
    //   person.prevTimestamp = null; // reset the previous point
    //   isStart = true;
    // }


    this.data_subscriptions.push(
      this.db.list(person.dbPath,eval(this.get_code(person,prev)))
        .snapshotChanges()
        .subscribe(data => {


         // alert("snapshotChanges");

          // do the following only if we are in the firs batch 
          // or if we are in snap shot changes and the largest timstamp is smaller or equal to 
          // the largest presont timestamp
          // NOTE: after vigures checking it seems each time there is a change (remove or create) 
          // snapshot changes is calles 4 times
          // twice with the following two alerts and twice with the previouse two alerts.
          if(  person.PREV_FLAG 
            || person.NEXT_FLAG 
            || (!person.INDEPENDENT_FLAG 
              && (data.length != 0 
                && data[data.length - 1].payload.val()['timestamp'] <= person.alerts[0].timestamp))
            || (person.INDEPENDENT_FLAG 
              && data.length != 0 
              && (data[data.length - 1].payload.val()['timestamp'] > person.alerts[0].timestamp))){

            //alert(`person.PREV_FLAG=${person.PREV_FLAG}`)
            person.hasAlerts = Status.StandBy;

            // console.log("Debug:: isStart:",isStart)
            // if(isStart && person.alerts.length != 0){
            //   console.log("Debug:: NEW ALERT - THIS WILL BE OUR FLAG TO MAKE FIRST ALERT IN SPECIAL COLOR")
            // }
          
            person.alerts = data.map(doc => {return this.getAlert(doc)}) //empty alerts, incase - snapshotChanges
            console.log("Debug::Test user alerts: ",person.alerts)

            //sort alerts by date
            person.alerts.sort((a, b) => {return a.timestamp-b.timestamp}).reverse();


            if(person.alerts.length == 0){
              person.hasAlerts = Status.Deny
            }else{

              if(!prev){ // case :: next

                if(person.alerts.length == ALERT_LIMIT){
                  //pop the last item - it's timestamp will be usefull when clicking next again 
                  person.nextTimestamp = person.alerts.pop().timestamp;
                } 
                person.prevTimestamp = person.alerts[0].timestamp; // set prev 
            
              }
              else{ // case :: prev
                
                if(person.alerts.length == (ALERT_LIMIT + 1)){
                  // Then we are still able to go beackwoards
                  person.alerts.shift().timestamp; // need to shift first
                  person.prevTimestamp = person.alerts[0].timestamp; // and then set prevStarting point
                
                }
                person.nextTimestamp = person.alerts.pop().timestamp // pop last item as it was already displayed

              }

              person.hasAlerts = Status.Accept
            }
          }//else if(person.INDEPENDENT_FLAG && data.length != 0 && !this.hasPrev(person)){
          //   person.hasAlerts = Status.Deny
          //   person.INDEPENDENT_FLAG = false;
          // }

          if(!this.hasNext(person) && person.alerts.length == 1){
            person.INDEPENDENT_FLAG = true;
          }else{
            person.INDEPENDENT_FLAG = false;
          }

          if(person.PREV_FLAG){
            person.PREV_FLAG = false;
          }

          if(person.NEXT_FLAG){
            person.NEXT_FLAG = false;
          }
            
        }
      )

    );

  }


  /**This function returns string of code for use in  getNext realtime query.
   * This function is not called when snapChanges accurs
  */
  get_code(person:Connection | User, prev:boolean){

    console.log("In get code")

    //let start: number;
    let code: string;

    if(!prev){ // next
      console.log("person.nextTimestamp", person.nextTimestamp);
      code = `ref=>ref.orderByChild('timestamp').startAt(${person.searchSmallestTimestamp}).endAt(${person.nextTimestamp}).limitToLast(${ALERT_LIMIT})`;
    }else{ // prev
      console.log("person.prevTimestamp", person.prevTimestamp);
      code = `ref=>ref.orderByChild('timestamp').startAt(${person.prevTimestamp}).endAt(${person.searchLargestTimestamp}).limitToFirst(${ALERT_LIMIT + 1})`;
    }
    return code;
    
  }

  /**This function deletes alert from the devices collection in realtime firebase, 
    *Parm: the alert's ID*/
  deleteAlert(alertID:string){

    if(!this.hasNext(this.user) && this.user.alerts.length == 1){
      this.user.INDEPENDENT_FLAG = true;
    }else{
      this.user.INDEPENDENT_FLAG = false;
    }

    this.db.database.ref(`/devices/${this.user.deviceID}/history/${alertID}`).remove()
  }

  search(person:Connection | User){

    console.log("in search")

   if(!person.showAll){
     
      this.getLargestTimestap(this.dateToTimestamp(person.toDate,person.toTime), person)
      .then(res => {
        if(res > 0){
          person.searchLargestTimestamp = res;
          this.getSmallestTimestap(this.dateToTimestamp(person.fromDate,person.fromTime),person)
          .then(res =>{
            if(res > 0){
              person.searchSmallestTimestamp = res;
              person.nextTimestamp = person.searchLargestTimestamp; // set the next timestamp
              if(person.searchLargestTimestamp >= person.searchSmallestTimestamp){
                person.NEXT_FLAG = true;
                this.getNext(person, false);  //getAlerts
              }
              else{
                console.log("no alerts 3");
              }
            }
            else{
              console.log("no alerts 2");
            }
          }) 
        }
        else{
          console.log("no alerts 1");
        }
        // person.searchSmallestTimestamp = this.dateToTimestamp(person.fromDate,person.fromTime);
        // person.searchLargestTimestamp = this.dateToTimestamp(person.toDate,person.toTime);
      })
    }
    else{
      person.searchSmallestTimestamp = person.smallestTimestamp;
      person.searchLargestTimestamp = person.largestTimestamp;
      person.nextTimestamp = person.searchLargestTimestamp; // set the next timestamp
      person.NEXT_FLAG = true;
      this.getNext(person, false);  //getAlerts
    }
    
    
  }

  /**
   * @param timestamp 
   * @param person 
   * @returns -1 if non exists
   */
  getLargestTimestap(timestamp:number, person: User | Connection):Promise<number>{
  
    return new Promise((resolve) =>
    {
      this.db.list(person.dbPath).query.orderByChild('timestamp')
      .startAt(UINIX_MIN_TIMESTAMP)
      .endAt(timestamp)
      .limitToLast(1)
      .once("value")
      .then(data => {

        data.forEach(c => {console.log("getLargestTimestap",c.val()["timestamp"])})
        if(data.exists){
          data.forEach(c => {resolve(c.val()["timestamp"])})
        }
        resolve(-1);
    })
 
  })
}
  
/**
 * @param timestamp 
 * @param person 
 * @returns -1 if non exists
 */
getSmallestTimestap(timestamp:number,  person: User | Connection):Promise<number>{

  return new Promise((resolve) =>
  {
    this.db.list(person.dbPath).query.orderByChild('timestamp')
    .startAt(timestamp)
    .endAt(person.largestTimestamp)
    .limitToFirst(1)
    .once("value")
    .then(data => {

      data.forEach(c => {console.log("getSmallestTimestap", c.val()["timestamp"])})
      if(data.exists){
        data.forEach(c => {resolve(c.val()["timestamp"])})
      }
      resolve(-1);
    })

  })
}





//----------------------------***Search***----------------------------

  // dateToTimestamp(time:SearchPoints)
  dateToTimestamp(timePoint:Date,datePoint:Date)
  {
    var date = new Date(datePoint + ' ' + timePoint); 
    console.log("Search Debug:: timePoint=",timePoint);
    console.log("Search Debug:: datePoint=",datePoint);
    console.log("Search Debug:: date=",date);

    //let date = new Date(time.year, time.month-1, time.day, time.hour, time.minutes, time.seconds);
    //let date = new Date(time.date.getFullYear(), time.date.getMonth()-1, time.date.getDay(), time.time.getHours(), time.time.getMinutes());

    return date.getTime();
  }


}

