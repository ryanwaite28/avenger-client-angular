import { Component, OnInit } from '@angular/core';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { IUserField } from 'src/app/interfaces/user-field.interface';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';



@Component({
  selector: 'common-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent implements OnInit {
  you: IUser | any;
  user: IUser | any;
  user_fields: IUserField[] = [];
  loading: boolean = false;
  isFollowing: boolean = false;

  get isYou(): boolean {
    const match = (
      !!this.you && 
      !!this.user &&
      this.user.id === this.you.id
    );
    return match;
  };

  get isNotYou(): boolean {
    const match = (
      !!this.you && 
      !!this.user &&
      this.user.id !== this.you.id
    );
    return match;
  };

  constructor(
    private userStore: UserStoreService,
    private modelClient: ModelClientService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // combineLatest([
    //   this.userStore.getChangesObs(),
    //   this.route.data
    // ])
    combineLatest({
      you: this.userStore.getChangesObs(),
      data: this.route.data,
    })
    .subscribe((values) => {
      console.log(values);
      const { you, data } = values;

      this.you = you;
      this.user = data['user'];

      if (this.isNotYou) {
        this.check_following();
      }
    });
  }

  check_following() {
    this.modelClient.user.check_user_follows(this.you.id, this.user.id).subscribe({
      next: (response) => {
        this.isFollowing = !!response.data;
      }
    });
  }

  toggle_user_follow() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.modelClient.user.toggle_user_follow(this.you.id, this.user.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.isFollowing = !!response.data;
      }
    });
  }
}
