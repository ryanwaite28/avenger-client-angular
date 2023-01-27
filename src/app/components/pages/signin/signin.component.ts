import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { JWT_TOKEN_NAME } from 'src/app/_misc/vault';

@Component({
  selector: 'modern-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  loading: boolean = false;
  TEXT_FORM_LIMIT = 250;
  COMMON_TEXT_VALIDATOR = [
    Validators.required,
    Validators.maxLength(this.TEXT_FORM_LIMIT)
  ];

  signinForm = new UntypedFormGroup({
    username_email: new UntypedFormControl('', this.COMMON_TEXT_VALIDATOR),
    password: new UntypedFormControl('', this.COMMON_TEXT_VALIDATOR),
  });
  error = false;
  errorMessage: string | any;

  phoneForm = new UntypedFormGroup({
    phone: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
  });
  phoneVerifyForm = new UntypedFormGroup({
    code: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
  });
  phoneError = false;
  phoneErrorMessage: string | any;

  verification_requested_successfully: boolean = false;
  sms_request_id: string | any;
  phone_is_verified: boolean = false;

  redirect: string = '';

  constructor(
    private modelClient: ModelClientService,
    private userStore: UserStoreService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe({
      next: (params: Params) => {
        console.log({ params });
        this.redirect = params['redirect'];
      }
    });
  }

  onSubmit() {
    if (!this.signinForm.valid) {
      // return;
    }
    this.error = false;
    this.loading = true;
    this.modelClient.user.sign_in(this.signinForm.value)
      .subscribe({
        next: (response: any) => {
          if (this.redirect) {
            window.location.href = `${this.redirect}?jwt=${response.data.token}`;
            return;
          }
          this.alertService.handleResponseSuccessGeneric(response);
          this.router.navigate(['/', 'users', response.data.you.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.alertService.handleResponseErrorGeneric(error);
          this.errorMessage = error.error['message'];
          this.error = true;
          this.loading = false;
        },
      });
  }

  async send_sms_verification() {
    try {
      this.loading = true;
      this.phoneError = false;
      const phone = this.phoneForm.value.phone;
      const user = await this.modelClient.user.get_user_by_phone(phone)
        .toPromise()
        .then((response: any) => {
          return response && response.data;
        })
        .catch((error) => {
          // console.log(error);
          this.loading = false;
          this.phoneError = true;
          this.phoneErrorMessage = `Could not send verification code; something went wrong...`;
          return;
        });
      if (!user) {
        this.phoneError = true;
        this.loading = false;
        this.phoneErrorMessage = `No user found by provided phone number...`;
        return;
      }
    } catch (e) {
      this.loading = false;
      this.phoneError = true;
      this.phoneErrorMessage = `Something went wrong...`;
      throw e;
    }
    
    this.modelClient.user.send_sms_verification(`1` + this.phoneForm.value.phone)
      .subscribe(
        (response: any) => {
          this.verification_requested_successfully = true;
          this.sms_request_id = response.sms_request_id;
        },
        (error: HttpErrorResponse) => {
          this.alertService.handleResponseErrorGeneric(error);
          this.phoneError = true;
          this.phoneErrorMessage = error.error.message;
          this.loading = false;
        }
      );
  }

  verify_sms_code() {
    this.loading = true;
    this.modelClient.user.verify_sms_code({
      request_id: this.sms_request_id!,
      code: this.phoneVerifyForm.value.code,
    }).subscribe(
      (response: any) => {
        this.alertService.handleResponseSuccessGeneric(response);
        this.loading = false;
        this.phone_is_verified = true;
        window.localStorage.setItem(JWT_TOKEN_NAME, response.data.token);
        this.userStore.setState(response.data.you);
        this.router.navigate(['/', 'users', response.data.you.id]);
      },
      (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
        this.phoneError = true;
        this.phoneErrorMessage = error.error.message;
        this.loading = false;
      }
    );
  }
}
