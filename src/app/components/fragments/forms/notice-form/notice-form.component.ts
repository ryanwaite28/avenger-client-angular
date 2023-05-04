import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';

@Component({
  selector: 'app-notice-form',
  templateUrl: './notice-form.component.html',
  styleUrls: ['./notice-form.component.scss']
})
export class NoticeFormComponent {
  @ViewChild('noticeFormElm') noticeFormElm?: ElementRef<HTMLFormElement>;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<IFormSubmitEvent>();

  NOTICE_TEXT_FORM_LIMIT = 500;
  noticeForm = new FormGroup({
    body: new FormControl<string>('', [Validators.required, Validators.min(1), Validators.max(this.NOTICE_TEXT_FORM_LIMIT)]),
  });

  constructor() {}

  onSubmit(
    formElm: HTMLFormElement,
  ) {
    const formData = new FormData(formElm);
    formData.append(`payload`, JSON.stringify(this.noticeForm.value));
    Object.keys(this.noticeForm.value).forEach((key: string) => {
      const value = (<any> this.noticeForm.value)[key];
      formData.append(key, value);
    });

    this.formSubmit.emit({
      formElm,
      form: this.noticeForm,
      formData,
      payload: this.noticeForm.value,
      resetForm: () => {
        this.noticeForm.setValue({ body: '' });
        this.noticeForm.markAsPristine();
        this.noticeForm.markAsUntouched();
      }
    });
  }
}
