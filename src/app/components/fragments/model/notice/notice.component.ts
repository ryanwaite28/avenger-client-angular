import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AVENGER_EVENT_TYPES, ROUTE_PAGES } from 'src/app/enums/all.enums';
import { INotice, INoticeStats, INoticeUserAnalyticInfo } from 'src/app/interfaces/avenger.models.interface';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { SocketEventsService } from 'src/app/services/socket-events.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort } from 'src/app/_misc/chamber';



enum ActionContext {
  REPLY = 'REPLY',
  SHARE = 'SHARE',
  QUOTE = 'QUOTE',
}

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss']
})
export class NoticeComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('rootComponentElm') rootComponentElm?: ElementRef<HTMLDivElement>;
  @Input() notice!: INotice;
  @Input() show_parent_notice: boolean = false;
  @Output() noticeDeleted = new EventEmitter<any>();
  
  you: IUser | null = null;
  loading: boolean = false;
  isMenuShown: boolean = false;
  stats?: INoticeStats;
  isPageSeen: boolean = false; // if user as seen via scrolling
  
  activity?: INoticeUserAnalyticInfo;
  socketEvents: string[] = [];
  ActionContext = ActionContext;
  current_action_context: ActionContext | null = null;

  get isOwner(): boolean {
    const match = (
      !!this.you && 
      !!this.notice &&
      this.you.id === this.notice.owner_id
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

    this.modelClient.notice.get_latest_trending_skills_on_notices().subscribe({
      next: (response) => {
        
      }
    });
  }

  reset() {
    if (!this.notice) {
      return;
    }

    this.socketEvents = [
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NEW_REACTION}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.REACTION_RESCINDED}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NOTICE_UPDATED}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NOTICE_DELETED}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NOTICE_SHARED}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NOTICE_UNSHARED}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NOTICE_QUOTED}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NEW_NOTICE_REPLY}`,
      `NOTICE:${this.notice.id}:${AVENGER_EVENT_TYPES.NEW_ANALYTIC}`,
    ];

    this.start_events_listener();

    this.get_notice_stats();
    this.get_user_activity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notice'].previousValue && changes['notice'].currentValue) {
      this.socketEventsService.leaveRoom(`NOTICE:${changes['notice'].previousValue.id}`);
      this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));

      this.reset();
    }
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.socketEventsService.leaveRoom(`NOTICE:${this.notice.id}`);
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
    // console.log({ notice_id: this.notice.id, isVisible });
    if (!this.isPageSeen && isVisible) {
      this.isPageSeen = isVisible;
      if (this.activity && !this.activity.seen) {
        this.modelClient.notice.log_notice_seen(this.notice.id).subscribe({
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
      this.activatedRoute.snapshot.data['page'] === ROUTE_PAGES.NOTICE_PAGE &&
      parseInt(this.activatedRoute.snapshot.params['notice_id'], 10) === this.notice.id &&
      (!!this.activity && !this.activity.details_expanded)
    );
    if (shouldLogDetailsExpanded) {
      this.modelClient.notice.log_notice_details_expanded(this.notice.id).subscribe({
        next: (response) => {
          console.log(response);
          this.activity && (this.activity.details_expanded = response.data);
        }
      });
    }
  }
  
  start_events_listener() {
    this.socketEventsService.joinRoom(`NOTICE:${this.notice.id}`);

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
        this.stats && this.stats.reactions_count++;
        break;
      }
      case AVENGER_EVENT_TYPES.REACTION_RESCINDED: {
        this.stats && this.stats.reactions_count--;
        break;
      }
      case AVENGER_EVENT_TYPES.NEW_NOTICE_REPLY: {
        this.stats && this.stats.replies_count++;
        data.notice && this.notice.notice_replies?.unshift(data.notice);
        break;
      }
      case AVENGER_EVENT_TYPES.NOTICE_QUOTED: {
        this.stats && this.stats.quotes_count++;
        break;
      }
      case AVENGER_EVENT_TYPES.NOTICE_SHARED: {
        this.stats && this.stats.shares_count++;
        break;
      }
      case AVENGER_EVENT_TYPES.NOTICE_UNSHARED: {
        this.stats && this.stats.shares_count--;
        break;
      }
      case AVENGER_EVENT_TYPES.NOTICE_UPDATED: {
        data.notice && Object.assign(this.notice, data.notice);
        break;
      }
      case AVENGER_EVENT_TYPES.NOTICE_DELETED: {
        data.notice && Object.assign(this.notice, data.notice);
        this.noticeDeleted.emit();
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

  get_notice_stats() {
    this.modelClient.notice.get_notice_stats(this.notice.id).subscribe({
      next: (response) => {
        this.stats = response.data;
      }
    });
  }

  get_user_activity() {
    this.modelClient.notice.get_user_activity_on_notice(this.notice.id).subscribe({
      next: (response) => {
        this.activity = response.data;
        console.log(this);
        this.log_seen();
        this.log_details_expanded();
      }
    });
  }

  toggle_like() {
    this.modelClient.notice.toggle_like(this.notice.id).subscribe({
      next: (response) => {
        this.activity && (this.activity.reacted = response.data);
        console.log(this);
      }
    });
  }

  create_notice_reply(formEvent: IFormSubmitEvent) {
    console.log(formEvent);
    const tags: string[] = formEvent.form.value.body?.match(/#[a-zA-Z0-9]+/gi)?.map((str: string) => str.slice(1)) || [];
    const mentions: string[] = formEvent.form.value.body?.match(/@[a-zA-Z0-9\-\_\.]{2,50}/gi)?.map((str: string) => str.slice(1)) || [];
    
    console.log(this, { tags, mentions });

    if (this.loading) {
      return;
    }
    this.loading = true;
    this.modelClient.notice.create_notice({
      owner_id: this.you!.id,
      parent_notice_id: this.notice.id,
      body: formEvent.form.value.body!
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.loading = false;
        this.activity && !this.activity.replied && (this.activity.replied = response.data);
        formEvent.resetForm && formEvent.resetForm();
        this.current_action_context = null;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }

  create_notice_quote(formEvent: IFormSubmitEvent) {
    console.log(formEvent);
    const tags: string[] = formEvent.form.value.body?.match(/#[a-zA-Z0-9]+/gi)?.map((str: string) => str.slice(1)) || [];
    const mentions: string[] = formEvent.form.value.body?.match(/@[a-zA-Z0-9\-\_\.]{2,50}/gi)?.map((str: string) => str.slice(1)) || [];
    
    console.log(this, { tags, mentions });

    if (this.loading) {
      return;
    }
    this.loading = true;
    this.modelClient.notice.create_notice({
      owner_id: this.you!.id,
      quoting_notice_id: this.notice.id,
      body: formEvent.form.value.body!
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.loading = false;
        this.activity && !this.activity.quoted && (this.activity.quoted = response.data);
        formEvent.resetForm && formEvent.resetForm();
        this.current_action_context = null;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }

  create_notice_share() {
    const ask = window.confirm(`${this.activity?.shared ? 'Unshare' : 'Share'} this notice?`);
    if (!ask) {
      return;
    }

    if (this.loading) {
      return;
    }
    this.loading = true;
    this.modelClient.notice.create_notice({
      owner_id: this.you!.id,
      share_notice_id: this.notice.id,
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.loading = false;
        this.activity && !this.activity.shared && (this.activity.shared = response.data);
        this.current_action_context = null;
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }

  delete_notice() {
    const ask = window.confirm(`This action cannot be undone. Delete this notice?`);
    if (!ask) {
      return;
    }

    this.loading = true;
    this.modelClient.notice.delete_notice(this.notice.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
      }
    });
  }
}
