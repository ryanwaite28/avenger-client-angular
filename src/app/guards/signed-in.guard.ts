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



@Injectable({
  providedIn: 'root'
})
export class SignedInGuard implements CanActivate {
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
        if (!you) {
          this.router.navigate(['/', 'signin']);
        }
        return !!you;
      })
    );
  }
}
