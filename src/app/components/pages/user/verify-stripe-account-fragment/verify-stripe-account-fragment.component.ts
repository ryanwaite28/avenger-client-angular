import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ClientService } from 'src/app/services/client.service';
import { GoogleMapsService } from 'src/app/services/google-maps.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { JWT_TOKEN_NAME } from 'src/app/_misc/vault';



@Component({
  selector: 'common-verify-stripe-account-fragment',
  templateUrl: './verify-stripe-account-fragment.component.html',
  styleUrls: ['./verify-stripe-account-fragment.component.scss']
})
export class UserVerifyStripeAccountFragmentComponent implements OnInit {
  you: any;
  results: any;
  continue_onboarding: boolean = false;
  onboarding_url: string = '';

  constructor(
    private userStore: UserStoreService,
    private modelClient: ModelClientService,
    private alertService: AlertService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private googleService: GoogleMapsService,
  ) { }

  ngOnInit() {
    this.userStore.getChangesObs().subscribe({
      next: (you: IUser | null) => {
        this.you = you;
        this.checkStripeAccount();
      }
    });
  }

  checkStripeAccount() {
    this.modelClient.user.verify_stripe_account(this.you.id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.results = response;
        const token = response.token || response.data.token;
        if (token) {
          window.localStorage.setItem(JWT_TOKEN_NAME, token);
          this.userStore.setState(response.data.you);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
        this.results = error.error;
        if (error.status === HttpStatusCode.PreconditionFailed) {
          this.continue_onboarding = true;
          this.onboarding_url = error.error.data.onboarding_url;
        }
      },
      complete: () => {
        
      },
    });
  }
}
