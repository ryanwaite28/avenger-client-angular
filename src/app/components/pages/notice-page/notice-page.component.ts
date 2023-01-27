import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { INotice } from 'src/app/interfaces/avenger.models.interface';
import { UserStoreService } from 'src/app/stores/user-store.service';
import { elementIsInViewPort, get_last } from 'src/app/_misc/chamber';
import { ModelClientService } from 'src/app/services/model-client.service';

@Component({
  selector: 'app-notice-page',
  templateUrl: './notice-page.component.html',
  styleUrls: ['./notice-page.component.scss']
})
export class NoticePageComponent implements OnInit {
  @ViewChild('feedBottomElm') feedBottomElm?: ElementRef<HTMLDivElement>;
  
  you: IUser | null = null;

  notice!: INotice;
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

  check_feed_bottom_elm_visible() {
    return !!this.feedBottomElm?.nativeElement && elementIsInViewPort(this.feedBottomElm?.nativeElement);
  }

  handle_route_data(data: Data) {
    console.log(data);
    this.notice = data['notice'] as INotice;
    if (this.notice) {
      this.get_replies();
    }
  }


  get_replies() {
    const min_id: number | undefined = get_last<INotice>(this.notice.notice_replies || [])?.id;
    this.modelClient.notice.get_replies(this.notice.id, min_id)
    .subscribe({
      next: (response) => {
        this.notice.notice_replies?.push(...response.data!);
        this.end_reached = !response.data || response.data.length < 5;
        this.loading = false;
        setTimeout(() => {
          if (this.check_feed_bottom_elm_visible() && !this.end_reached) {
            this.get_replies();
          }
        }, 500);
      }
    });
  }

  go_back() {
    this.location.back();
  }
}
