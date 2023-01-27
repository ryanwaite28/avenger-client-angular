import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { INotice } from '../interfaces/avenger.models.interface';
import { ModelClientService } from '../services/model-client.service';

@Injectable({
  providedIn: 'root'
})
export class NoticeResolver implements Resolve<INotice | undefined> {
  constructor(
    private modelClient: ModelClientService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<INotice | undefined> {
    const notice_id: number = parseInt(route.params['notice_id'], 10);
    return this.modelClient.notice.get_notice_by_id(notice_id).pipe(map((response) => response.data));
  }
}
