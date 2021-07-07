import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-mainnav',
  templateUrl: './mainnav.component.html',
  styleUrls: ['./mainnav.component.css']
})
export class MainnavComponent implements OnInit {

  userInfo: any;
  displayUserInfo: boolean = false

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.userInformation().subscribe(res => {
      this.userInfo = res.data;
      this.displayUserInfo = true
    })
  }

  logout(){
    this.authService.logout()
  }

}
