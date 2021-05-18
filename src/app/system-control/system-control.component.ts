import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { OwnerGuard } from '../guards/owner.guard';
import { AuthService } from '../services/auth.service';
import { CrudService } from '../services/crud.service';

enum Status {
  StandBy,
  On,
  Off,
}

@Component({
  selector: 'app-system-control',
  templateUrl: './system-control.component.html',
  styleUrls: ['./system-control.component.css']
})
export class SystemControlComponent implements OnInit {

  Status = Status;
  state:Status = Status.StandBy
  visualSwitchState: boolean;//for the [(ngModel)] in HTML

  public deviceId: string;
  public dbPath:string;


  constructor(public authservice: AuthService, public crudservice:CrudService, private db: AngularFireDatabase, private ownerguard: OwnerGuard) { }
  

  ngOnInit(): void {
    //check if the user owns CNSS system
    // if((this.authservice.currentUser != null) && this.checkIfOwner())//make sure the user is logged in + CNSS owner
    if((this.authservice.currentUser != null))//make sure the user is logged in
    {
      this.crudservice.get_userInfo().subscribe(data => {
          this.deviceId = data[0].payload.doc.data()['device_id'];//Get user device id
          console.log("Debug::user.deviceId", this.deviceId)

          this.dbPath = `/devices/${this.deviceId}`; //the path to the State attribute in the real-time database
          console.log("Debug::this.dbPath", this.dbPath)
          
          this.checkState();//show current switch state on the screen
      })
    }
  }

  checkState(){
    this.db.database.ref(this.dbPath+"/control").on('value',(snap)=>{
      if(snap.val() == null || snap.val() == undefined)
      {
        //create path and defined it as off
        this.db.list(this.dbPath).update('control',{state: 'off' });
        this.state = Status.StandBy;
      }
      else
      {
        if(snap.val()['state'] == 'on')
        {
          this.visualSwitchState=true;
          this.state = Status.On;
        }
        else//snap.val()['state'] == 'off'
        {
          this.visualSwitchState=false;
          this.state = Status.Off;

        }
      }
    });
    return this.state;
  }

  switchState(){

    if(this.state==Status.On)//If currentState==On -> turn Off
    {
      this.db.list(this.dbPath).update('control',{state: 'off' });
      this.visualSwitchState=false;
      this.state=Status.Off;
    }
    else if(this.state==Status.Off)//If currentState==Status.Off -> turn On
    {
      this.db.list(this.dbPath).update('control', {state: 'on' });
      this.visualSwitchState=true;
      this.state=Status.On;
    }
  }

  checkIfOwner()
  {
    let owner;
    this.crudservice.get_userDetails()
    .then(doc => {
      owner = doc.data()['is_device_owner'];
    });
    return owner;
  }
}
