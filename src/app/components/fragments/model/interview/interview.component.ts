import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AVENGER_EVENT_TYPES, ROUTE_PAGES } from 'src/app/enums/all.enums';
import { IInterview, IInterviewStats, IInterviewUserAnalyticInfo } from 'src/app/interfaces/avenger.models.interface';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { IFormSubmitEvent, IGenericTextInputEvent } from 'src/app/interfaces/common.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { SocketEventsService } from 'src/app/services/socket-events.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort } from 'src/app/_misc/chamber';



enum ActionContext {
  COMMENT = 'COMMENT',
  EDIT = 'EDIT',
  INTERVIEWER_RATING = 'INTERVIEWER_RATING',
  INTERVIEWEE_RATING = 'INTERVIEWEE_RATING',
}

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss']
})
export class InterviewComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('rootComponentElm') rootComponentElm?: ElementRef<HTMLDivElement>;
  @Input() interview!: IInterview;
  @Input() show_parent_interview: boolean = false;
  @Output() interviewDeleted = new EventEmitter<any>();
  
  you: IUser | null = null;
  loading: boolean = false;
  isMenuShown: boolean = false;
  stats?: IInterviewStats;
  isPageSeen: boolean = false; // if user as seen via scrolling
  
  activity?: IInterviewUserAnalyticInfo | any;
  socketEvents: string[] = [];
  ActionContext = ActionContext;
  current_action_context: ActionContext | null = null;
  did_submit_interviewee_rating: boolean = false;
  did_submit_interviewer_rating: boolean = false;

  get isOwner(): boolean {
    const match = (
      !!this.you && 
      !!this.interview &&
      this.you.id === this.interview.owner_id
    );
    return match;
  };

  get interviewer_tooltip_text(): string {
    const tooltip = `Interviewer Ratings - ${this.stats?.interviewer_rating.avg || 0}/5 out of ${this.stats?.interviewer_rating.count || 0} ratings`;
    return tooltip;
  }
  get interviewee_tooltip_text(): string {
    const tooltip = `Interviewer Ratings - ${this.stats?.interviewee_rating.avg || 0}/5 out of ${this.stats?.interviewee_rating.count || 0} ratings`;
    return tooltip;
  }

  constructor(
    private userStore: UserStoreService,
    private modelClient: ModelClientService,
    private socketEventsService: SocketEventsService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.userStore.getChangesObs().subscribe({
      next: (you: IUser | null) => {
        this.you = you;
      }
    });
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onPageScroll(event: Event) {
    // console.log(event);
    this.log_seen();
  }

  ngOnInit() {
    this.reset();
  }

  cgeck_user_given_ratings() {
    this.modelClient.interview.check_interviewee_rating_by_writer_id_and_interview_id(this.interview.id, this.you!.id).subscribe({
      next: (response) => {
        this.did_submit_interviewee_rating = !!response.data;
      }
    });

    this.modelClient.interview.check_interviewer_rating_by_writer_id_and_interview_id(this.interview.id, this.you!.id).subscribe({
      next: (response) => {
        this.did_submit_interviewer_rating = !!response.data;
      }
    });
  }

  reset() {
    if (!this.interview) {
      return;
    }

    this.socketEvents = [
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.NEW_REACTION}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.REACTION_RESCINDED}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.UPDATED}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.DELETED}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.NEW_ANALYTIC}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.NEW_COMMENT}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.INTERVIEWEE_RATING}`,
      `INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.INTERVIEWER_RATING}`,
    ];

    this.start_events_listener();
    this.cgeck_user_given_ratings();
    this.get_interview_stats();
    this.get_user_activity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['interview'].previousValue && changes['interview'].currentValue) {
      this.socketEventsService.leaveRoom(`INTERVIEW:${changes['interview'].previousValue.id}`);
      this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));

      this.reset();
    }
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.socketEventsService.leaveRoom(`INTERVIEW:${this.interview.id}`);
    this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));
  }

  set_action_context(action: ActionContext) {
    const new_context = action === this.current_action_context
      ? null
      : action;
    this.current_action_context = new_context;
  }

  log_seen() {
    const isVisible = !!this.rootComponentElm?.nativeElement && elementIsInViewPort(this.rootComponentElm?.nativeElement);
    // console.log({ interview_id: this.interview.id, isVisible });
    if (!this.isPageSeen && isVisible) {
      this.isPageSeen = isVisible;
      if (this.activity && !this.activity.seen) {
        this.modelClient.interview.log_interview_seen(this.interview.id).subscribe({
          next: (response) => {
            console.log(response);
            this.activity && (this.activity.seen = response.data);
          }
        });
      }
    }
  }

  log_details_expanded() {
    const shouldLogDetailsExpanded: boolean = (
      this.activatedRoute.snapshot.data['page'] === ROUTE_PAGES.INTERVIEW_PAGE &&
      parseInt(this.activatedRoute.snapshot.params['interview_id'], 10) === this.interview.id &&
      (!!this.activity && !this.activity.details_expanded)
    );
    if (shouldLogDetailsExpanded) {
      this.modelClient.interview.log_interview_details_expanded(this.interview.id).subscribe({
        next: (response) => {
          console.log(response);
          this.activity && (this.activity.details_expanded = response.data);
        }
      });
    }
  }
  
  start_events_listener() {
    this.socketEventsService.joinRoom(`INTERVIEW:${this.interview.id}`);

    for (const eventName of this.socketEvents) {
      const eventKey = eventName.split(':')[2];
      const listener = this.socketEventsService.listenSocketCustom(eventName, (event) => {
        this.handle_socket_event(eventKey, event);
      });
    }
  }

  handle_socket_event(eventName: string, data: any) {
    console.log(data, { eventName });
    switch (eventName) {
      case AVENGER_EVENT_TYPES.NEW_REACTION: {
        if (this.stats) {
          this.stats.reactions_count = this.stats.reactions_count + 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.REACTION_RESCINDED: {
        if (this.stats) {
          this.stats.reactions_count = this.stats.reactions_count - 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.UPDATED: {
        data.interview && Object.assign(this.interview, data.interview);
        break;
      }
      case AVENGER_EVENT_TYPES.DELETED: {
        data.interview && Object.assign(this.interview, data.interview);
        this.interviewDeleted.emit();
        break;
      }
      case AVENGER_EVENT_TYPES.NEW_COMMENT: {
        data.comment && this.interview.comments?.unshift(data.comment);
        if (this.stats) {
          this.stats.comments_count = this.stats.comments_count + 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.INTERVIEWEE_RATING: {
        data.rating && this.interview.interviewee_ratings?.push(data.rating);
        if (this.stats) {
          this.stats.interviewee_rating = data.rating_stats;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.INTERVIEWER_RATING: {
        data.rating && this.interview.interviewer_ratings?.push(data.rating);
        if (this.stats) {
          this.stats.interviewer_rating = data.rating_stats;
        }
        break;
      }
      
      
      
      case AVENGER_EVENT_TYPES.NEW_ANALYTIC: {
        this.stats && this.stats.analytics_count++;
        break;
      }

      default:  {
        console.log(`cannot handle: ${eventName}`);
      }
    }
  }

  get_interview_stats() {
    this.modelClient.interview.get_interview_stats(this.interview.id).subscribe({
      next: (response) => {
        this.stats = response.data;
      }
    });
  }

  get_user_activity() {
    this.modelClient.interview.get_user_activity_on_interview(this.interview.id).subscribe({
      next: (response) => {
        this.activity = response.data;
        console.log(this);
        this.log_seen();
        this.log_details_expanded();
      }
    });
  }

  toggle_like() {
    this.modelClient.interview.toggle_interview_like(this.interview.id).subscribe({
      next: (response) => {
        this.activity && (this.activity.reacted = response.data);
        console.log(this);
      }
    });
  }

  delete_interview() {
    const ask = window.confirm(`This action cannot be undone. Delete this interview?`);
    if (!ask) {
      return;
    }

    this.loading = true;
    this.modelClient.interview.delete_interview(this.interview.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
      }
    });
  }

  create_interview_comment(event: IGenericTextInputEvent) {
    console.log(event);
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.modelClient.interview.create_interview_comment({
      owner_id: this.you!.id,
      interview_id: this.interview.id,
      body: event.value,
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
        event.reset && event.reset();
        this.activity && (this.activity.commented = response.data);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }

  create_interviewer_rating(formEvent: IFormSubmitEvent) {
    this.modelClient.interview.create_interviewer_rating({
      interview_id: this.interview.id,
      writer_id: this.you!.id,
      rating: formEvent.payload['rating'],
      title: formEvent.payload['title'],
      summary: formEvent.payload['summary'],
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.did_submit_interviewer_rating = true;
        this.current_action_context = null;
        formEvent.resetForm && formEvent.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }
  
  create_interviewee_rating(formEvent: IFormSubmitEvent) {
    this.modelClient.interview.create_interviewee_rating({
      interview_id: this.interview.id,
      writer_id: this.you!.id,
      rating: formEvent.payload['rating'],
      title: formEvent.payload['title'],
      summary: formEvent.payload['summary'],
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.did_submit_interviewee_rating = true;
        this.current_action_context = null;
        formEvent.resetForm && formEvent.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }
}
