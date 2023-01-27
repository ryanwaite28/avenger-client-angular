import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort, get_last } from 'src/app/_misc/chamber';
import { IInterview } from 'src/app/interfaces/avenger.models.interface';

@Component({
  selector: 'app-feed-interviews-page',
  templateUrl: './feed-interviews-page.component.html',
  styleUrls: ['./feed-interviews-page.component.scss']
})
export class FeedInterviewsPageComponent {
  
  @ViewChild('feedBottomElm') feedBottomElm?: ElementRef<HTMLDivElement>;

  you: IUser | null = null;
  loading: boolean = false;
  end_reached: boolean = true;
  interview_feed: Array<IInterview> = [];


  get canLoadMore(): boolean {
    const match = !this.loading && !this.end_reached;
    return match;
  }

  get shouldShowSpinner(): boolean {
    const shouldShow = !this.end_reached && this.check_feed_bottom_elm_visible();
    return shouldShow;
  }

  constructor(
    private userStore: UserStoreService,
    private modelClient: ModelClientService,
    private alertService: AlertService,
  ) {
    this.userStore.getChangesObs().subscribe({
      next: (you: IUser | null) => {
        this.you = you;
        !!you && this.load_feed();
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
        this.load_feed();
      }, 500);
    }
  }

  ngOnInit() {
    
  }
  
  ngAfterViewInit(): void {
  }

  check_feed_bottom_elm_visible() {
    return !!this.feedBottomElm?.nativeElement && elementIsInViewPort(this.feedBottomElm?.nativeElement);
  }

  load_feed() {
    // if (this.loading) {
    //   console.log(`already loading...`);
    //   return;
    // }

    const timestamp = get_last<IInterview>(this.interview_feed)?.created_at;
    this.modelClient.interview.get_feed_content_for_user(timestamp)
    .subscribe({
      next: (response) => {
        this.interview_feed.push(...response.data!);
        this.end_reached = !response.data || response.data.length < 5;
        this.loading = false;
        setTimeout(() => {
          if (this.check_feed_bottom_elm_visible() && !this.end_reached) {
            this.load_feed();
          }
        }, 500);
      }
    });
  }

  create_interview(formEvent: IFormSubmitEvent) {
    const tags: string[] = formEvent.payload['description']?.match(/#[a-zA-Z0-9]+/gi)?.map((str: string) => str.slice(1)) || [];
    const mentions: string[] = formEvent.payload['description']?.match(/@[a-zA-Z0-9\-\_\.]{2,50}/gi)?.map((str: string) => str.slice(1)) || [];
    
    console.log(this, { tags, mentions });


    this.modelClient.interview.create_interview({
      owner_id: this.you!.id,
      title: formEvent.payload['title'],
      description: formEvent.payload['description'],
      video_link: formEvent.payload['video_link'],
      tags: tags.join(','),
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.interview_feed.unshift(response.data);
        formEvent.resetForm && formEvent.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }
}
