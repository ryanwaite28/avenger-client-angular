import { Component, Input, OnInit } from '@angular/core';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { IUserSubscriptionInfo, ServiceMethodResultsInfo } from 'src/app/interfaces/common.interface';
import { ModelClientService } from 'src/app/services/model-client.service';
import { UserStoreService } from 'src/app/stores/user-store.service';



@Component({
  selector: 'common-user-profile-card',
  templateUrl: './user-profile-card.component.html',
  styleUrls: ['./user-profile-card.component.scss']
})
export class UserProfileCardComponent implements OnInit {
  you: IUser | null = null;
  @Input() user?: IUser | null;
  @Input() user_subscription_info: IUserSubscriptionInfo | null = null;
  
  
  @Input() app: string = 'modern';

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
  ) { }

  ngOnInit(): void {
    this.userStore.getChangesObs().subscribe({
      next: (you: IUser | null) => {
        this.you = you;
      }
    });

    if (this.user && !this.user_subscription_info) {
      // fetch subscription info if not given
      this.modelClient.user.get_platform_subscription_info(this.user.id).subscribe({
        next: (response: ServiceMethodResultsInfo) => {
          this.user_subscription_info = response.data!;
        }
      });
    }
  }

}
