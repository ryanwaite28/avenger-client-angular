import { Injectable } from '@angular/core';
import { NOTICE_ANALYTIC_EVENTS, REACTIONS } from '../enums/all.enums';
import { INotice, INoticeStats } from '../interfaces/avenger.models.interface';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  constructor(
    private clientService: ClientService,
  ) { }


  /** GET */

  get_notice_by_id(notice_id: number) {
    return this.clientService.get<INotice>(`/notices/${notice_id}`);
  }

  get_feed_content_for_user(notice_id?: string | number) { 
    const endpoint = notice_id
      ? `/notices/feed/${notice_id}`
      : `/notices/feed`;
    return this.clientService.get<INotice[]>(endpoint);
  }

  get_notice_stats(notice_id: number) {
    return this.clientService.get<INoticeStats>(`/notices/${notice_id}/stats`);
  }

  get_user_activity_on_notice(notice_id: number) {
    return this.clientService.get<any>(`/notices/${notice_id}/user-activity`);
  }

  get_replies(notice_id: number, min_id?: number) {
    const endpoint = min_id
      ? `/notices/${notice_id}/replies/${min_id}`
      : `/notices/${notice_id}/replies`;

    return this.clientService.get<INotice[]>(endpoint);
  }

  get_latest_trending_skills_on_notices() {
    return this.clientService.get<INotice>(`/notices/trending-skills`);
  }



  /** POST */

  create_notice(data: {
    owner_id: number,
    parent_notice_id?: number,
    quoting_notice_id?: number,
    share_notice_id?: number,
    body?: string,
    tags?: string,
  }) {
    return this.clientService.post(`/notices`, data);
  }

  toggle_like(notice_id: number) {
    return this.clientService.post(`/notices/${notice_id}/toggle-reaction/${REACTIONS.LIKE}`);
  }

  log_notice_seen(notice_id: number) {
    return this.clientService.post(`/notices/${notice_id}/user-activity/seen`);
  }

  log_notice_details_expanded(notice_id: number) {
    return this.clientService.post(`/notices/${notice_id}/user-activity/details-expanded`);
  }



  /** PUT */

  update_notice(notice_id: number, data: { pinned_reply_id: number }) {
    return this.clientService.put<INotice>(`/notices/${notice_id}`, data);
  }



  /** DELETE */

  delete_notice(notice_id: number) {
    return this.clientService.delete<INotice>(`/notices/${notice_id}`);
  }


  
}
