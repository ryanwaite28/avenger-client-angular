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

  

  handle_route_data(data: Data) {
    console.log(data);
    this.interview = data['interview'] as IInterview;
  }

  go_back() {
    this.location.back();
  }

  onActiveLinkChange(event: any) {
    console.log({event});
  }
}
