import { Injectable } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { map } from "rxjs/operators";
import { ResolveType } from "../guards/_guard";
import { GetSessionResponse } from "../interfaces/responses.interface";
import { IUser } from "../interfaces/avenger.models.interface";
import { ModelClientService } from "../services/model-client.service";
import { UserStoreService } from "../stores/user-store.service";

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<IUser | null> {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modelClient: ModelClientService,
    private userStore: UserStoreService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): ResolveType<IUser | null> {
    // console.log({ state, route });
    return this.modelClient.user.get_user_by_id(route.params['user_id']).pipe(
      map((response: any) => {
        return response.data || null;
      })
    )
  }
}