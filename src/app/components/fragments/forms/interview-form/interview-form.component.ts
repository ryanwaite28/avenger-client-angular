import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, UntypedFormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, concat, debounceTime, distinctUntilChanged, filter, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { IInterview, ISkill, IUser } from 'src/app/interfaces/avenger.models.interface';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';
import { SkillService } from 'src/app/services/skill.service';
import { UsersService } from 'src/app/services/users.service';
import { getYouTubeIdFromLink, isYouTubeLink } from 'src/app/_misc/chamber';
import { YOUTUBE_URL_ID } from 'src/app/_misc/regex.utils';

@Component({
  selector: 'app-interview-form',
  templateUrl: './interview-form.component.html',
  styleUrls: ['./interview-form.component.scss']
})
export class InterviewFormComponent {
  @ViewChild('interviewFormElm') interviewFormElm?: ElementRef<HTMLFormElement>;
  @Input() interview?: IInterview;
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
  isShowingMoreInfo: boolean = false;

  youtubeIdControl = new UntypedFormControl('');
  youtubeEmbedControl = new UntypedFormControl('');

  skillsResultsLoading = false;
  skillQueryInput$ = new Subject<string>();
  selectedSkills: ISkill[] = [];
  skillsResults$: Observable<ISkill[]> = concat(
    of([]), // default items
    this.skillQueryInput$.pipe(
      distinctUntilChanged(),
      filter((query: string) => query?.length > 0),
      debounceTime(500),
      tap(() => this.skillsResultsLoading = true),
      switchMap((query) => {
        return this.skillService.get_skill_by_query(query).pipe(
          map((response) => response.data! || []),
          catchError(() => of([])), // empty list on error
        )
      }),
      tap(() => this.skillsResultsLoading = false),
    )
  );

  interviewerResultsLoading = false;
  interviewerQueryInput$ = new Subject<string>();
  selectedInterviewer: IUser | null = null;
  interviewerResults$: Observable<IUser[]> = concat(
    of([]), // default items
    this.interviewerQueryInput$.pipe(
      distinctUntilChanged(),
      filter((query: string) => query?.length > 0),
      debounceTime(500),
      tap(() => this.interviewerResultsLoading = true),
      switchMap((query) => {
        return this.usersService.get_users_by_query(query).pipe(
          map((response) => response.data! || []),
          catchError(() => of([])), // empty list on error
        )
      }),
      tap(() => this.interviewerResultsLoading = false),
    )
  );

  youtubeId(value: string): string {
    // const match: boolean = isYouTubeLink(value);
    // if (!match) {
    //   return '';
    // }
    const id = getYouTubeIdFromLink(value);
    return id || '';
  }

  constructor(
    public readonly sanitizer: DomSanitizer,
    public readonly skillService: SkillService,
    public readonly usersService: UsersService,
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

    // if (this.interview) {
    //   this.interviewForm.setValue({

    //   });
    // }
  }

  trackByFn(item: ISkill) {
    return item.id;
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
    if (this.selectedSkills.length) {
      payload.skill_ids = this.selectedSkills.map(s => s.id);
    }
    if (this.selectedInterviewer) {
      payload.interviewer_id = this.selectedInterviewer.id;
    }
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
        this.selectedSkills = [];
        this.isShowingMoreInfo = false;
        this.interviewForm.setValue({ title: '', description: '', video_link: '' });
        this.interviewForm.markAsPristine();
        this.interviewForm.markAsUntouched();
        this.youtubeIdControl.setValue('');
        this.youtubeEmbedControl.setValue('');
      }
    });
  }
}