import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { IInterview } from '../interfaces/avenger.models.interface';
import { ModelClientService } from '../services/model-client.service';

@Injectable({
  providedIn: 'root'
})
export class InterviewResolver implements Resolve<IInterview | undefined> {
  constructor(
    private modelClient: ModelClientService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IInterview | undefined> {
    const interview_id: number = parseInt(route.params['interview_id'], 10);
    return this.modelClient.interview.get_interview_by_id(interview_id).pipe(map((response) => response.data));
  }
}
