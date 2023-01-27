import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { IInterview, IInterviewComment } from 'src/app/interfaces/avenger.models.interface';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort, get_last } from 'src/app/_misc/chamber';
import { ModelClientService } from 'src/app/services/model-client.service';
import { MODELS } from 'src/app/enums/all.enums';

@Component({
  selector: 'app-interview-page',
  templateUrl: './interview-page.component.html',
  styleUrls: ['./interview-page.component.scss']
})
export class InterviewPageComponent implements OnInit {
  @ViewChild('feedBottomElm') feedBottomElm?: ElementRef<HTMLDivElement>;
  
  you: IUser | null = null;
  MODELS = MODELS;

  interview!: IInterview;
  loading: boolean = false;
  end_reached: boolean = true;

  constructor(
    private router: Router,
    private location: Location,
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

    this.activatedRoute.data.subscribe((data: Data) => {
      this.handle_route_data(data);
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
        this.get_interview_comments();
      }, 500);
    }
  }

  check_feed_bottom_elm_visible() {
    return !!this.feedBottomElm?.nativeElement && elementIsInViewPort(this.feedBottomElm?.nativeElement);
  }

  handle_route_data(data: Data) {
    console.log(data);
    this.interview = data['interview'] as IInterview;
    if (this.interview) {
      this.get_interview_comments();
    }
  }


  get_interview_comments() {
    const min_id: number | undefined = get_last<IInterviewComment>(this.interview.comments || [])?.id;
    this.modelClient.interview.get_interview_comments(this.interview.id, min_id)
    .subscribe({
      next: (response) => {
        this.interview.comments?.push(...response.data!);
        this.end_reached = !response.data || response.data.length < 5;
        this.loading = false;
        setTimeout(() => {
          if (this.check_feed_bottom_elm_visible() && !this.end_reached) {
            this.get_interview_comments();
          }
        }, 500);
      }
    });
  }

  go_back() {
    this.location.back();
  }
}