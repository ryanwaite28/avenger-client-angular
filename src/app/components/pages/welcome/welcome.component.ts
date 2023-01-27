import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/services/environment.service';

@Component({
  selector: 'modern-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  apps: any[] = [];

  constructor(
    private envService: EnvironmentService
  ) { }

  ngOnInit(): void {
    
  }

}
