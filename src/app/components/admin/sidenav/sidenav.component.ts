import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { PlatformService } from 'src/app/services/platform.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit {
  role: string;
  userName: string;
  platform: string;

  constructor(
    private auth: AuthService,
    private platformService: PlatformService
  ) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');

    if (localStorage.getItem('role') == 'leader') {
      this.auth.userInformation().subscribe((res) => {
        this.userName = res.data.user.name;

        this.platformService.getPlatforms().subscribe((res) => {
          this.platform = res.data.platform.find(
            (x) => x.leader_name == this.userName
          ).platform_name;
        });
      });
    }
  }
}
