import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AVENGER_EVENT_TYPES, MODELS } from 'src/app/enums/all.enums';
import { IInterviewComment, IInterviewCommentReply, IUser } from 'src/app/interfaces/avenger.models.interface';
import { IGenericTextInputEvent } from 'src/app/interfaces/common.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { SocketEventsService } from 'src/app/services/socket-events.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort } from 'src/app/_misc/chamber';

enum ActionContext {
  REPLY = 'REPLY',
}



@Component({
  selector: 'app-interview-comment',
  templateUrl: './interview-comment.component.html',
  styleUrls: ['./interview-comment.component.scss']
})
export class InterviewCommentComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('repliesBottomElm') repliesBottomElm?: ElementRef<HTMLDivElement>;
  @Output() commentDeleted = new EventEmitter<any>();
  @Input() comment!: IInterviewComment;

  you: IUser | null = null;
  isMenuShown: boolean = false;
  isRepliesShown: boolean = false;
  stats?: any;
  isPageSeen: boolean = false; // if user as seen via scrolling
  loading: boolean = false;
  end_reached: boolean = true;
  initial_get_replies_call: boolean = false;
  
  activity?: any;
  socketEvents: string[] = [];
  ActionContext = ActionContext;
  current_action_context: ActionContext | null = null;

  get isOwner(): boolean {
    const match = (
      !!this.you && 
      !!this.comment &&
      this.you.id === this.comment.owner_id
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
    const isVisible = this.check_feed_bottom_elm_visible();
    // console.log({ isVisible });
    if (isVisible && !this.loading && !this.end_reached) {
      this.loading = true;
      console.log(`loading...`);
      setTimeout(() => {
        this.get_interview_comment_replies();
      }, 500);
    }
  }

  check_feed_bottom_elm_visible() {
    return !!this.repliesBottomElm?.nativeElement && elementIsInViewPort(this.repliesBottomElm?.nativeElement);
  }

  ngOnInit() {
    this.reset();

  }

  reset() {
    if (!this.comment) {
      return;
    }

    this.socketEvents = [
      `INTERVIEW_COMMENT:${this.comment.id}:${AVENGER_EVENT_TYPES.NEW_REACTION}`,
      `INTERVIEW_COMMENT:${this.comment.id}:${AVENGER_EVENT_TYPES.REACTION_RESCINDED}`,
      `INTERVIEW_COMMENT:${this.comment.id}:${AVENGER_EVENT_TYPES.UPDATED}`,
      `INTERVIEW_COMMENT:${this.comment.id}:${AVENGER_EVENT_TYPES.DELETED}`,
      `INTERVIEW_COMMENT:${this.comment.id}:${AVENGER_EVENT_TYPES.NEW_COMMENT_REPLY}`,
      `INTERVIEW_COMMENT:${this.comment.id}:${AVENGER_EVENT_TYPES.NEW_ANALYTIC}`,
    ];

    this.start_events_listener();

    this.get_comment_stats();
    this.get_user_activity_on_interview_comment();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comment'].previousValue && changes['comment'].currentValue) {
      this.socketEventsService.leaveRoom(`INTERVIEW_COMMENT${changes['comment'].previousValue.id}`);
      this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));

      this.reset();
    }
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.socketEventsService.leaveRoom(`INTERVIEW_COMMENT:${this.comment.id}`);
    this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));
  }

  toggleShowReplies() {
    if (this.isRepliesShown) {
      this.isRepliesShown = false;
      return;
    }
    else {
      this.isRepliesShown = true;
      if (this.initial_get_replies_call) {
        return;
      }
      this.initial_get_replies_call = true;
      this.get_interview_comment_replies();
    }
  }

  set_action_context(action: ActionContext) {
    const new_context = action === this.current_action_context
      ? null
      : action;
    this.current_action_context = new_context;
  }

  start_events_listener() {
    this.socketEventsService.joinRoom(`INTERVIEW_COMMENT:${this.comment.id}`);

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
        data.comment && Object.assign(this.comment, data.comment);
        break;
      }
      case AVENGER_EVENT_TYPES.DELETED: {
        data.comment && Object.assign(this.comment, data.comment);
        this.commentDeleted.emit();
        break;
      }
      case AVENGER_EVENT_TYPES.NEW_COMMENT_REPLY: {
        data.reply && this.comment.replies?.unshift(data.reply);
        if (this.stats) {
          this.stats.replies_count = this.stats.replies_count + 1;
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

  get_interview_comment_replies() {
    const min_id: number | undefined = this.comment.replies?.at(-1)?.id;
    this.modelClient.interview.get_interview_comment_replies(this.comment.interview_id, this.comment.id, min_id)
    .subscribe({
      next: (response) => {
        this.comment.replies?.push(...response.data!);
        this.end_reached = !response.data || response.data.length < 5;
        this.loading = false;
        setTimeout(() => {
          if (this.check_feed_bottom_elm_visible() && !this.end_reached) {
            this.get_interview_comment_replies();
          }
        }, 500);
      }
    });
  }

  get_comment_stats() {
    this.modelClient.interview.get_interview_comment_stats(this.comment.interview_id, this.comment.id).subscribe({
      next: (response) => {
        this.stats = response.data;
      }
    });
  }


  get_user_activity_on_interview_comment() {
    this.modelClient.interview.get_user_activity_on_interview_comment(this.comment.interview_id, this.comment.id).subscribe({
      next: (response) => {
        this.activity = response.data;
        console.log(this);
      }
    });
  }

  toggle_like() {
    this.modelClient.interview.toggle_interview_comment_like(this.comment.interview_id, this.comment.id).subscribe({
      next: (response) => {
        this.activity && (this.activity.reacted = response.data);
        console.log(this);
      }
    });
  }

  delete_comment() {
    const ask = window.confirm(`This action cannot be undone. Delete this comment?`);
    if (!ask) {
      return;
    }

    this.loading = true;
    this.modelClient.interview.delete_interview_comment(this.comment.interview_id, this.comment.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
      }
    });
  }

  create_interview_comment_reply(event: IGenericTextInputEvent) {
    console.log(event);
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.modelClient.interview.create_interview_comment_reply(this.comment.interview_id, {
      owner_id: this.you!.id,
      comment_id: this.comment.id,
      body: event.value,
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
        event.reset && event.reset();
        this.activity && (this.activity.replied = response.data.reply);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }
}
