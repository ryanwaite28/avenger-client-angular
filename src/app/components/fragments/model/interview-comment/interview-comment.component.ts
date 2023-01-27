import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AVENGER_EVENT_TYPES, MODELS } from 'src/app/enums/all.enums';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { SocketEventsService } from 'src/app/services/socket-events.service';
import { UserStoreService } from 'src/app/stores/user-store.service';

enum ActionContext {
  REPLY = 'REPLY',
}



@Component({
  selector: 'app-interview-comment',
  templateUrl: './interview-comment.component.html',
  styleUrls: ['./interview-comment.component.scss']
})
export class InterviewCommentComponent {
  @Output() commentDeleted = new EventEmitter<any>();
  @Input() comment: any;


  you: IUser | null = null;
  loading: boolean = false;
  isMenuShown: boolean = false;
  stats?: any;
  isPageSeen: boolean = false; // if user as seen via scrolling
  
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

  reset() {
    if (!this.comment) {
      return;
    }

    this.socketEvents = Object.values(AVENGER_EVENT_TYPES)
      .filter((event_name: string) => event_name.toLowerCase().includes('interview'))
      .map((event_name: string) => `INTERVIEW_COMMENT${this.comment.id}:${event_name}`)
      .concat([`INTERVIEW_COMMENT${this.comment.id}:${AVENGER_EVENT_TYPES.NEW_ANALYTIC}`]);

    this.start_events_listener();

    this.get_comment_stats();
    this.get_user_activity();
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
    this.socketEventsService.leaveRoom(`INTERVIEW_COMMENT${this.comment.id}`);
    this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));
  }

  set_action_context(action: ActionContext) {
    const new_context = action === this.current_action_context
      ? null
      : action;
    this.current_action_context = new_context;
  }

  start_events_listener() {
    this.socketEventsService.joinRoom(`INTERVIEW_COMMENT${this.comment.id}`);

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
      case AVENGER_EVENT_TYPES.NEW_INTERVIEW_COMMENT_REACTION: {
        if (this.stats) {
          this.stats.reactions_count = this.stats.reactions_count + 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.INTERVIEW_COMMENT_REACTION_RESCINDED: {
        if (this.stats) {
          this.stats.reactions_count = this.stats.reactions_count - 1;
        }
        break;
      }
      case AVENGER_EVENT_TYPES.COMMENT_UPDATED: {
        data.interview && Object.assign(this.comment, data.interview);
        break;
      }
      case AVENGER_EVENT_TYPES.COMMENT_DELETED: {
        data.comment && Object.assign(this.comment, data.interview);
        this.commentDeleted.emit();
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

  get_comment_stats() {
    this.modelClient.interview.get_interview_comment_stats(this.comment.interview_id, this.comment.id).subscribe({
      next: (response) => {
        this.stats = response.data;
      }
    });
  }

  get_user_activity() {
    this.modelClient.interview.get_user_activity_on_interview(this.comment.id).subscribe({
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
    this.modelClient.interview.delete_interview(this.comment.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
      }
    });
  }
}
