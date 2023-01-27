import { Injectable } from '@angular/core';
import { env } from '../../env/env.local';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  readonly PRODUCTION = env.PRODUCTION;
  readonly API_DOMAIN = env.API_DOMAIN;

  constructor() { }

}
