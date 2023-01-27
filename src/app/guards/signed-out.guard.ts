import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { map } from 'rxjs/operators';
import { CanActivateReturn } from './_guard';
import { ModelClientService } from '../services/model-client.service';
import { JWT_TOKEN_NAME } from '../_misc/vault';



@Injectable({
  providedIn: 'root'
})
export class SignedOutGuard implements CanActivate {
  constructor(
    private modelClient: ModelClientService,
    private router: Router,
  ) {}

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): CanActivateReturn {
    return this.canActivate(route, state);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): CanActivateReturn {
    return this.modelClient.user.checkUserSession().pipe(
      map((you) => {
        console.log(this, { route, state });
        if (!!you) {
          const redirect = route.queryParams['redirect'];
          if (redirect) {
            const jwt = window.localStorage.getItem(JWT_TOKEN_NAME);
            const redirectUrl = `${redirect}?jwt=${jwt}`;
            window.location.href = redirectUrl;
            return false;
          }

          this.router.navigate(['/', 'users', you.id]);
        }
        return !you;
      })
    );
  }
}
