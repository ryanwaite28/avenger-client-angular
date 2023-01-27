import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { INotice } from 'src/app/interfaces/avenger.models.interface';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { IFormSubmitEvent } from 'src/app/interfaces/common.interface';
import { AlertService } from 'src/app/services/alert.service';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort, get_last } from 'src/app/_misc/chamber';

@Component({
  selector: 'app-feed-noticess-page',
  templateUrl: './feed-noticess-page.component.html',
  styleUrls: ['./feed-noticess-page.component.scss']
})
export class FeedNoticessPageComponent implements OnInit, AfterViewInit {
  
  @ViewChild('feedBottomElm') feedBottomElm?: ElementRef<HTMLDivElement>;

  you: IUser | null = null;
  loading: boolean = false;
  end_reached: boolean = true;
  notice_feed: Array<INotice> = [];


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

    const notice_id = get_last<INotice>(this.notice_feed)?.id;
    this.modelClient.notice.get_feed_content_for_user(notice_id)
    .subscribe({
      next: (response) => {
        this.notice_feed.push(...response.data!);
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

  create_notice(formEvent: IFormSubmitEvent) {
    const tags: string[] = formEvent.form.value.body?.match(/#[a-zA-Z0-9]+/gi)?.map((str: string) => str.slice(1)) || [];
    const mentions: string[] = formEvent.form.value.body?.match(/@[a-zA-Z0-9\-\_\.]{2,50}/gi)?.map((str: string) => str.slice(1)) || [];
    
    console.log(this, { tags, mentions });


    this.modelClient.notice.create_notice({
      owner_id: this.you!.id,
      body: formEvent.form.value.body!,
      tags: tags.join(','),
    }).subscribe({
      next: (response) => {
        console.log(response);
        this.notice_feed.unshift(response.data);
        formEvent.resetForm && formEvent.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.alertService.handleResponseErrorGeneric(error);
      }
    });
  }
}
