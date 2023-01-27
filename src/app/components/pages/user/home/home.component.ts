import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUserField } from 'src/app/interfaces/user-field.interface';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';



@Component({
  selector: 'common-user-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class UserHomeFragmentComponent implements OnInit {
  you: IUser | any;
  user: IUser | any;
  user_fields: IUserField[] = [];

  get isYou(): boolean {
    const isYours = (
      this.you && 
      this.user &&
      this.user.id === this.you.id
    );
    return !!isYours;
  };

  constructor(
    private userStore: UserStoreService,
    private modelClient: ModelClientService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.userStore.getChangesObs().subscribe((you: IUser | null) => {
      this.you = you;
      if (this.isYou) {
        this.user = you;
      }
    });

    this.route.parent!.data.subscribe((data) => {
      this.user = data['user'];
    });
  }
}
