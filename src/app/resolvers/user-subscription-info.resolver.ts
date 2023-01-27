import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { ResolveType } from '../guards/_guard';
import { IUser } from '../interfaces/avenger.models.interface';
import { IUserSubscriptionInfo } from '../interfaces/common.interface';
import { ModelClientService } from '../services/model-client.service';
import { UserStoreService } from '../stores/user-store.service';

@Injectable({
  providedIn: 'root'
})
export class UserSubscriptionInfoResolver implements Resolve<IUserSubscriptionInfo | null> {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modelClient: ModelClientService,
    private userStore: UserStoreService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): ResolveType<IUserSubscriptionInfo | null> {
    // console.log({ state, route });
    return this.modelClient.user.get_platform_subscription_info(route.params['user_id']).pipe(
      map((response: any) => {
        return response.data!;
      })
    )
  }
}