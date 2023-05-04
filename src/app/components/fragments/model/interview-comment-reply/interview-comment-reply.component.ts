import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AVENGER_EVENT_TYPES } from 'src/app/enums/all.enums';
import { IInterviewCommentReply, IUser } from 'src/app/interfaces/avenger.models.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { SocketEventsService } from 'src/app/services/socket-events.service';
import { UserStoreService } from 'src/app/stores/user-store.service';

@Component({
  selector: 'app-interview-comment-reply',
  templateUrl: './interview-comment-reply.component.html',
  styleUrls: ['./interview-comment-reply.component.scss']
})
export class InterviewCommentReplyComponent {
  @Output() replyDeleted = new EventEmitter<any>();
  @Input() reply!: IInterviewCommentReply;
  @Input() interview_id!: number;


  you: IUser | null = null;
  loading: boolean = false;
  isMenuShown: boolean = false;
  isRepliesShown: boolean = false;
  stats?: any;
  isPageSeen: boolean = false; // if user as seen via scrolling
  
  activity?: any;
  socketEvents: string[] = [];

  get isOwner(): boolean {
    const match = (
      !!this.you && 
      !!this.reply &&
      this.you.id === this.reply.owner_id
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

  ngOnInit() {
    this.reset();

  }

  reset() {
    if (!this.reply) {
      return;
    }

    this.socketEvents = [
      `INTERVIEW_COMMENT_REPLY:${this.reply.id}:${AVENGER_EVENT_TYPES.NEW_REACTION}`,
      `INTERVIEW_COMMENT_REPLY:${this.reply.id}:${AVENGER_EVENT_TYPES.REACTION_RESCINDED}`,
      `INTERVIEW_COMMENT_REPLY:${this.reply.id}:${AVENGER_EVENT_TYPES.UPDATED}`,
      `INTERVIEW_COMMENT_REPLY:${this.reply.id}:${AVENGER_EVENT_TYPES.DELETED}`,
      `INTERVIEW_COMMENT_REPLY:${this.reply.id}:${AVENGER_EVENT_TYPES.NEW_ANALYTIC}`,
    ];

    this.start_events_listener();

    this.get_comment_reply_stats();
    this.get_user_activity_on_interview_comment_reply();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reply'].previousValue && changes['reply'].currentValue) {
      this.socketEventsService.leaveRoom(`INTERVIEW_COMMENT_REPLY${changes['reply'].previousValue.id}`);
      this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));

      this.reset();
    }
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy() {
    this.socketEventsService.leaveRoom(`INTERVIEW_COMMENT_REPLY:${this.reply.id}`);
    this.socketEvents.forEach(ev => this.socketEventsService.stopListenSocketCustom(ev));
  }

  start_events_listener() {
    this.socketEventsService.joinRoom(`INTERVIEW_COMMENT_REPLY:${this.reply.id}`);

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
        data.reply && Object.assign(this.reply, data.reply);
        break;
      }
      case AVENGER_EVENT_TYPES.DELETED: {
        data.reply && Object.assign(this.reply, data.reply);
        this.replyDeleted.emit();
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

  get_comment_reply_stats() {
    this.modelClient.interview.get_interview_comment_reply_stats(this.interview_id, this.reply.comment_id, this.reply.id).subscribe({
      next: (response) => {
        this.stats = response.data;
      }
    });
  }


  get_user_activity_on_interview_comment_reply() {
    this.modelClient.interview.get_user_activity_on_interview_comment_reply(this.interview_id, this.reply.comment_id, this.reply.id).subscribe({
      next: (response) => {
        this.activity = response.data;
        console.log(this);
      }
    });
  }

  toggle_like() {
    this.modelClient.interview.toggle_interview_comment_reply_like(this.interview_id, this.reply.comment_id, this.reply.id).subscribe({
      next: (response) => {
        this.activity && (this.activity.reacted = response.data);
        console.log(this);
      }
    });
  }

  delete_comment_reply() {
    const ask = window.confirm(`This action cannot be undone. Delete this reply?`);
    if (!ask) {
      return;
    }

    this.loading = true;
    this.modelClient.interview.delete_interview_comment_reply(this.interview_id, this.reply.comment_id, this.reply.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.alertService.handleResponseSuccessGeneric(response);
      }
    });
  }
}
