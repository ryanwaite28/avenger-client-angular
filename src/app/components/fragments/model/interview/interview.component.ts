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
  
  activity?: IInterviewUserAnalyticInfo;
  socketEvents: string[] = [];
  ActionContext = ActionContext;
  current_action_context: ActionContext | null = null;

  get isOwner(): boolean {
    const match = (
      !!this.you && 
      !!this.interview &&
      this.you.id === this.interview.owner_id
    );
    return match;
  };

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

    this.modelClient.interview.get_latest_trending_skills_on_interviews().subscribe({
      next: (response) => {
        
      }
    });
  }

  reset() {
    if (!this.interview) {
      return;
    }

    this.socketEvents = Object.values(AVENGER_EVENT_TYPES)
      .filter((event_name: string) => event_name.toLowerCase().includes('interview'))
      .map((event_name: string) => `INTERVIEW:${this.interview.id}:${event_name}`)
      .concat([`INTERVIEW:${this.interview.id}:${AVENGER_EVENT_TYPES.NEW_ANALYTIC}`]);

    this.start_events_listener();

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
      case AVENGER_EVENT_TYPES.NEW_INTERVIEW_REACTION: {
        if (this.stats) {
          this.stats.reactions_count = this.stats.reactions_count + 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.INTERVIEW_REACTION_RESCINDED: {
        if (this.stats) {
          this.stats.reactions_count = this.stats.reactions_count - 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.INTERVIEW_UPDATED: {
        data.interview && Object.assign(this.interview, data.interview);
        break;
      }
      case AVENGER_EVENT_TYPES.INTERVIEW_DELETED: {
        data.interview && Object.assign(this.interview, data.interview);
        this.interviewDeleted.emit();
        break;
      }
      case AVENGER_EVENT_TYPES.NEW_INTERVIEW_COMMENT: {
        data.comment && this.interview.comments?.unshift(data.comment);
        if (this.stats) {
          this.stats.comments_count = this.stats.comments_count + 1;
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
}
