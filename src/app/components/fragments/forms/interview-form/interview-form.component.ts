import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, UntypedFormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';
import { getYouTubeIdFromLink, isYouTubeLink } from 'src/app/_misc/chamber';
import { YOUTUBE_URL_ID } from 'src/app/_misc/regex.utils';

@Component({
  selector: 'app-interview-form',
  templateUrl: './interview-form.component.html',
  styleUrls: ['./interview-form.component.scss']
})
export class InterviewFormComponent {
  @ViewChild('interviewFormElm') interviewFormElm?: ElementRef<HTMLFormElement>;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<IFormSubmitEvent>();

  TEXT_FORM_LIMIT = 500;
  interviewForm = new FormGroup({
    title: new FormControl<string>('', [Validators.max(this.TEXT_FORM_LIMIT)]),
    description: new FormControl<string>('', [Validators.max(this.TEXT_FORM_LIMIT)]),
    video_link: new FormControl<string>('', [Validators.required, (control) => {
      const match: boolean = isYouTubeLink(control.value);
      return match ? null : { youtube: { valid: false } };
    }]),
  });

  hasPermissionToPost: boolean = false;

  youtubeIdControl = new UntypedFormControl('');
  youtubeEmbedControl = new UntypedFormControl('');

  youtubeId(value: string): string {
    // const match: boolean = isYouTubeLink(value);
    // if (!match) {
    //   return '';
    // }
    const id = getYouTubeIdFromLink(value);
    return id || '';
  }

  constructor(
    public readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log(this);
    this.interviewForm.controls.video_link.valueChanges.subscribe({
      next: (value) => {
        const id = this.youtubeId(value!);
        console.log({ id });
        const changed = !!id && !(this.youtubeEmbedControl.value?.changingThisBreaksApplicationSecurity || '').includes(id);
        if (changed) {
          const embed = 'https://www.youtube.com/embed/' + id;
          const sanitized = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
          console.log({ sanitized });
          this.youtubeIdControl.setValue(id);
          this.youtubeEmbedControl.setValue(sanitized);
        }
      }
    });
  }

  onSubmit(
    formElm: HTMLFormElement,
  ) {
    if (this.interviewForm.invalid) {
      return;
    }
    const formData = new FormData(formElm);
    const payload: any = {
      title: this.interviewForm.value.title,
      description: this.interviewForm.value.description,
      video_link: this.youtubeEmbedControl.value?.changingThisBreaksApplicationSecurity,
    };
    formData.append(`payload`, JSON.stringify(payload));
    Object.keys(payload).forEach((key: string) => {
      formData.append(key, payload[key]);
    });

    this.formSubmit.emit({
      formElm,
      form: this.interviewForm,
      formData,
      payload,
      resetForm: () => {
        this.interviewForm.setValue({ title: '', description: '', video_link: '' });
        this.interviewForm.markAsPristine();
        this.youtubeIdControl.setValue('');
        this.youtubeEmbedControl.setValue('');
      }
    });
  }
}