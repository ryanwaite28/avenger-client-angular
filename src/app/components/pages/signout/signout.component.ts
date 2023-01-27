import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';

@Component({
  selector: 'modern-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.scss']
})
export class SignoutComponent implements OnInit {

  constructor(
    private modelClient: ModelClientService,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.modelClient.user.sign_out();
    this.router.navigate(['/', 'signin']);
    this.alertService.handleResponseSuccessGeneric({ message: `Signed out successfully!` });
  }

}
