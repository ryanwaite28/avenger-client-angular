import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { MODELS } from 'src/app/enums/all.enums';
import { IUser, IInterview, IInterviewComment } from 'src/app/interfaces/avenger.models.interface';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort, get_last } from 'src/app/_misc/chamber';

@Component({
  selector: 'app-interview-interviewee-ratings-page',
  templateUrl: './interview-interviewee-ratings-page.component.html',
  styleUrls: ['./interview-interviewee-ratings-page.component.scss']
})
export class InterviewIntervieweeRatingsPageComponent {
  @ViewChild('feedBottomElm') feedBottomElm?: ElementRef<HTMLDivElement>;
  
  you: IUser | null = null;
  MODELS = MODELS;

  interview!: IInterview;
  loading: boolean = false;
  end_reached: boolean = true;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modelClient: ModelClientService,
    private userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.userStore.getChangesObs().subscribe({
      next: (you: IUser | null) => {
        this.you = you;
      }
    });

    this.activatedRoute.parent!.data.subscribe((data: Data) => {
      this.handle_route_data(data);
    });
  }

  handle_route_data(data: Data) {
    console.log(data);
    this.interview = data['interview'] as IInterview;
    if (this.interview) {
      this.get_interview_interviewee_ratings();
    }
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onPageScroll(event: Event) {
    const isVisible = this.check_feed_bottom_elm_visible();
    // console.log({ isVisible });
    if (isVisible && !this.loading && !this.end_reached) {
      this.loading = true;
      console.log(`loading...`);
      setTimeout(() => {
        this.get_interview_interviewee_ratings();
      }, 500);
    }
  }

  check_feed_bottom_elm_visible() {
    return !!this.feedBottomElm?.nativeElement && elementIsInViewPort(this.feedBottomElm?.nativeElement);
  }

  get_interview_interviewee_ratings() {
    const min_id: number | undefined = this.interview.interviewee_ratings?.at(-1)?.id;
    this.modelClient.interview.get_interview_interviewee_ratings(this.interview.id, min_id)
    .subscribe({
      next: (response) => {
        this.interview.interviewee_ratings?.push(...response.data!);
        this.end_reached = !response.data || response.data.length < 5;
        this.loading = false;
        setTimeout(() => {
          if (this.check_feed_bottom_elm_visible() && !this.end_reached) {
            this.get_interview_interviewee_ratings();
          }
        }, 500);
      }
    });
  }
}
