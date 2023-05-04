import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';
import { GENERIC_TEXT_FORM_LIMIT, GENERIC_TEXT_VALIDATORS, ratingOptions } from 'src/app/_misc/vault';

@Component({
  selector: 'app-rating-form',
  templateUrl: './rating-form.component.html',
  styleUrls: ['./rating-form.component.scss']
})
export class RatingFormComponent {

  @ViewChild('ratingFormElm') ratingFormElm?: ElementRef<HTMLFormElement>;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<IFormSubmitEvent>();

  TEXT_FORM_LIMIT: number = GENERIC_TEXT_FORM_LIMIT;
  ratingOptions: number[] = ratingOptions;
  ratingForm: FormGroup = new FormGroup({
    rating: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(5)]),
    title: new FormControl('', GENERIC_TEXT_VALIDATORS),
    summary: new FormControl('', GENERIC_TEXT_VALIDATORS),
  });

  constructor() {}

  onSubmit(
    formElm: HTMLFormElement,
  ) {
    if (this.ratingForm.invalid) {
      return;
    }
    const formData = new FormData(formElm);
    const payload: any = this.ratingForm.value;
    payload.rating = parseInt(payload.rating, 10);
    formData.append(`payload`, JSON.stringify(payload));
    Object.keys(payload).forEach((key: string) => {
      formData.append(key, payload[key]);
    });

    this.formSubmit.emit({
      formElm,
      form: this.ratingForm,
      formData,
      payload,
      resetForm: () => {
        this.ratingForm.setValue({ rating: 1, title: '', summary: '' });
        this.ratingForm.markAsPristine();
        this.ratingForm.markAsUntouched();
      }
    });
  }
}
