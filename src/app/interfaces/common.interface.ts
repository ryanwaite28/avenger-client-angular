import { ElementRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { REACTIONS } from '../enums/all.enums';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IUser } from './avenger.models.interface';



export interface PlainObject<T = any> {
  [key: string]: T;
}

export interface IGenericTextInputEvent { value: string, reset?: () => void }

export interface IUserNotificationsLastOpenedByApp extends ICommonModel {
  user_id:                             number,
  micro_app:                           string,
  notifications_last_opened:           string,
}

export interface IFormSubmitEvent {
  formData: FormData,
  payload: PlainObject,
  form: UntypedFormGroup,
  formElm: HTMLFormElement,
  resetForm?: () => void,
}

export interface IUserSubscriptionInfo {
  status: string,
  active: boolean,
  current_period_start: number,
  current_period_end: number,
}

export interface IReaction extends ICommonModel {
  name: string;
}

export interface IReactionsCounts {
  total_count: number;
  like_count: number;
  love_count: number;
  idea_count: number;
  confused_count: number;
}

export interface ICommonModel extends PlainObject {
  id:                      number,
  date_created:            string,
  uuid:                    string,
  created_at:              string,
  updated_at:              string,
  deleted_at:              string,
}





export interface ServiceMethodResultsInfo<T = any> {
  message?: string;
  data?: T;
  error?: any;
};

/**
 * @interface ServiceMethodResults
 * 
 * @description
 * Interface for a service method return value.
 * - status: uses an http code to signify result of action
 * - error: flag to indicate if there was an error
 * - info: object that serves as details about the results
 */
export type ServiceMethodResults<T = any> = {
  status: HttpStatusCode,
  error: boolean,
  info: ServiceMethodResultsInfo<T>,
};

export type ServiceMethodAsyncResults<T = any> = Promise<ServiceMethodResults<T>>;


export interface INavigatorGeoLocation {
  position: any,
  lat:  number,
  lng: number,
}

export interface IGoogleAutocompleteEvent {
  manage: PlainObject;
  placeData: PlainObject;
}