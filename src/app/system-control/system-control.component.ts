import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AuthService } from '../services/auth.service';
import { CrudService } from '../services/crud.service';


export interface State {
  On:boolean,
  Off:boolean
}

@Component({
  selector: 'app-system-control',
  templateUrl: './system-control.component.html',
  styleUrls: ['./system-control.component.css']
})
export class SystemControlComponent implements OnInit {
  isNewProfile;

  public state: boolean;//The current state of the switch

  public deviceId: string;
  public dbPath=`/devices/`;

  constructor(public authservice: AuthService, public crudservice:CrudService, private db: AngularFireDatabase) { }

  ngOnInit(): void {
    //Get user device id;
    if(this.authservice.currentUser != null)//make sure the user is logged in
    {
      this.crudservice.get_userInfo().subscribe(data => {
          this.deviceId = data[0].payload.doc.data()['device_id'];
          console.log("Debug::user.deviceId", this.deviceId)
          //the path to the State attribute in the real-time database:
          // this.dbPath += `${this.deviceId}/control`;
          this.dbPath += `${this.deviceId}`;
          console.log("Debug::this.dbPath", this.dbPath)
          this.state = this.checkState()
      })
    }

  }

  checkState(){
    //let switchState:boolean;

    this.db.database.ref(this.dbPath+"/control").on('value',(snap)=>{
      if(snap.val() == null || snap.val() == undefined)
      {
        //create path and defined it as off
        this.db.list(this.dbPath).update('control',{state: 'off' });
        //switchState = false;
        this.state = false;
      }
      else
      {
        if(snap.val()['state'] == 'on')
        {
          // switchState = true;
          this.state = true;
        }
        else//snap.val()['state'] == 'off'
        {
          //switchState = false;
          this.state = false;

        }
      }
    });
   // return switchState;
    return this.state;
  }

  switchState(){

    if(this.state)//If currentState==On -> turn Off
    {
      this.db.list(this.dbPath).update('control',{state: 'off' });//.set({ state: 'off'});
    }
    else////If currentState==Off -> turn On
    {
      this.db.list(this.dbPath).update('control', {state: 'on' });
    }
  }
}
