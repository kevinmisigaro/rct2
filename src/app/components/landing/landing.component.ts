import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  
  constructor() {}

  ngOnInit(): void {}

}
