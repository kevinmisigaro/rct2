import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Leader } from 'src/app/models/leader.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  leaders: Leader[] = []

  constructor(private router: Router) { }

  ngOnInit(): void {
    document.body.id = 'page-top';
  }

  ngOnDestroy(): void {
    document.body.id = ''
  }

  gotohome(){
    document.getElementById('close').click()
    this.router.navigate(['/'])
  }

}
