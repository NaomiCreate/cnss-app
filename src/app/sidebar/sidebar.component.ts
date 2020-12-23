import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';//So the sidebar appears after the user registered
import {Router} from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(public authservice: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

}
