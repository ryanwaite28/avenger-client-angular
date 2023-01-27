import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { COMMON_EVENT_TYPES } from '../enums/all.enums';
import { PlainObject } from '../interfaces/common.interface';
import { IUser } from '../interfaces/avenger.models.interface';
import { UserStoreService } from '../stores/user-store.service';
import { getUserFullName } from '../_misc/chamber';
import { AlertService } from './alert.service';
import { SocketEventsService } from './socket-events.service';
import { ModelClientService } from './model-client.service';

/**
 * Get and tracks user's unseen information (global state/store), this includes:
 * - messages
 * - conversations
 * - notifications
 */

export interface IUnseen {
  messages: number;
  conversations: number;
  notifications: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppSocketEventsStateService {
  private you: IUser | any;

  private unseenEvents: PlainObject<number> = {};
  private tagByEvent: PlainObject<string> = {};
  private eventsByTag: PlainObject<PlainObject<boolean>> = {};
  private changes: BehaviorSubject<PlainObject<number>> = new BehaviorSubject({});
  private changesByEvent: PlainObject<BehaviorSubject<number>> = {};
  private changesByEventTag: PlainObject<BehaviorSubject<PlainObject<number>>> = {};

  // private changesFreeze: PlainObject<boolean> = {}; 
  private changesFreezeEvent: PlainObject<boolean> = {}; 
  private tagEvent: any = {};

  constructor(
    private socketEventsService: SocketEventsService,
  ) {}

  registerEvents(eventsList: Array<string>) {
    console.log(`registering events for:`, { eventsList });
    if (!this.unseenEvents) {
      this.unseenEvents = {};
      this.tagByEvent = {};

      this.changes = new BehaviorSubject<any>({});
      this.changesByEvent = {};

      // this.changesFreeze = false;
      this.changesFreezeEvent = {};
    }

    eventsList.forEach((event_type) => {
      this.unseenEvents[event_type] = 0;
      this.changesByEvent[event_type] = new BehaviorSubject<number>(this.unseenEvents[event_type]);
      this.changesFreezeEvent[event_type] = false;

      this.socketEventsService.listenToObservableEventStream(event_type).subscribe((event: any) => {
        console.log(event);
        // this.events.next(event);
        this.increment(event_type, 1);
      });
    });
  }

  assignTagToevents(assignments: Array<{ event: string, tag: string }>) {
    console.log(`assignTagToevents:`, { assignments });
    if (!this.tagEvent) {
      this.tagEvent = {};
    }
    for (const assignment of assignments) {
      this.tagEvent[assignment.event] = assignment.tag;
      if (!this.eventsByTag) {
        this.eventsByTag = {};
      }
      if (!this.eventsByTag[assignment.tag]) {
        this.eventsByTag[assignment.tag] = {};
      }
      this.eventsByTag[assignment.tag][assignment.event] = true;

      if (!this.changesByEventTag) {
        this.changesByEventTag = {};
      }
      if (!this.changesByEventTag[assignment.tag]) {
        const initialState = {
          [assignment.event]: !this.unseenEvents ? 0 : this.unseenEvents[assignment.event] || 0,
        };
        this.changesByEventTag[assignment.tag] = new BehaviorSubject(initialState);
      }
    }
  }

  increment(event_type: string, amount: number) {
    this.setIncrementDecrementInternal(event_type, amount, true);
  }
  
  decrement(event_type: string, amount: number) {
    this.setIncrementDecrementInternal(event_type, amount, false);
  }

  private setIncrementDecrementInternal(event_type: string, amount: number, increase: boolean) {
    if (!event_type || !amount || !this.unseenEvents.hasOwnProperty(event_type) || amount <= 0) {
      console.log(`could not increment:`, { event_type, amount });
      return;
    }

    // const appCanChange = this.appCanChange(app);
    const eventCanChange = this.eventCanChange(event_type);
    // const canChange = (eventCanChange && appCanChange);

    if (eventCanChange) {
      console.log(`AppSocketEventsStateService - setIncrementDecrementInternal:`, { event_type, amount, increase });
      const newAmount = increase
        ? this.unseenEvents[event_type] + amount
        : this.unseenEvents[event_type] - amount;
      this.unseenEvents[event_type] = newAmount;
      this.changes.next({ ...this.unseenEvents });
      this.changesByEvent[event_type].next(this.unseenEvents[event_type]);

      // get tag
      const tag: string = this.tagEvent && this.tagEvent[event_type] || '';
      if (tag) {
        const state = this.geteventsStateByTag(tag);
        const tagStream = this.changesByEventTag[tag];
        tagStream.next(state);
      }
    }
  }

  clear (event_type?: string) {
    if (event_type && this.unseenEvents.hasOwnProperty(event_type)) {
      this.unseenEvents[event_type] = 0;
      this.changes.next({ ...this.unseenEvents });
      this.changesByEvent[event_type].next(this.unseenEvents[event_type]);

    } 
    else {
      Object.keys(this.unseenEvents).forEach((event_type) => {
        this.unseenEvents[event_type] = 0;
        this.changesByEvent[event_type].next(this.unseenEvents[event_type]);
      });
      this.changes.next({ ...this.unseenEvents });
    }

    const tag: string = this.tagEvent && this.tagEvent[(event_type || '')] || '';
    if (tag) {
      const state = this.geteventsStateByTag(tag);
      const tagStream = this.changesByEventTag[tag];
      tagStream.next(state);
    }
  }
  
  
  geteventsStateByTag(tag: string) {
    if (!this.eventsByTag || !this.eventsByTag[tag]) {
      const msg = `app or tags not assigned/registered:`;
      console.warn(msg, this, { tag });
      throw new Error(msg);
    }
    const stateByTag: PlainObject<number> = {};
    let total = 0;
    const event_types = Object.keys(this.eventsByTag[tag]);
    for (const event_type of event_types) {
      const state = this.unseenEvents[event_type] || 0;
      stateByTag[event_type] = state;
      total = total + state;
    }
    stateByTag['total'] = total;
    return stateByTag;
  }

  eventCanChange(event_type: string) {
    return !this.changesFreezeEvent[event_type];
  }

  // setAppChangeFreeze(state: boolean) {
  //   this.changesFreeze = state;
  // }

  seteventChangeFreeze(event_type: string, state: boolean) {
    console.log(`AppSocketEventsStateService.seteventChangeFreeze:`, { event_type, state });
    this.changesFreezeEvent[event_type] = state;
  }

  getAppStateChanges() {
    return this.changes.asObservable();
  }

  geteventStateChanges(event_type: string) {
    return this.changesByEvent[event_type].asObservable();
  }

  geteventTagChanges(tag: string) {
    return this.changesByEvent[tag].asObservable();
  }
}
