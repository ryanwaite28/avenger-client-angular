import { Injectable } from '@angular/core';
import { NOTICE_ANALYTIC_EVENTS, REACTIONS } from '../enums/all.enums';
import { IInterview, IInterviewComment } from '../interfaces/avenger.models.interface';
import { IInterviewStats } from '../interfaces/avenger.models.interface';
import { ClientService } from './client.service';


@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  constructor(
    private clientService: ClientService,
  ) { }


  /** GET */

  get_interview_by_id(interview_id: number) {
    return this.clientService.get<IInterview>(`/interviews/${interview_id}`);
  }

  get_feed_content_for_user(timestamp?: string) {
    const endpoint = timestamp ? `/interviews/feed/${timestamp}` : `/interviews/feed`;
    return this.clientService.get<IInterview[]>(endpoint);
  }

  get_interview_stats(interview_id: number) {
    return this.clientService.get<IInterviewStats>(`/interviews/${interview_id}/stats`);
  }
  get_interview_comment_stats(interview_id: number, comment_id: number) {
    return this.clientService.get<IInterviewStats>(`/interviews/${interview_id}/coments/${comment_id}/stats`);
  }
  get_interview_comment_reply_stats(interview_id: number, comment_id: number, reply_id: number) {
    return this.clientService.get<IInterviewStats>(`/interviews/${interview_id}/coments/${comment_id}/replies/${reply_id}/stats`);
  }

  get_user_activity_on_interview(interview_id: number) {
    return this.clientService.get<any>(`/interviews/${interview_id}/user-activity`);
  }
  get_user_activity_on_interview_comment(interview_id: number, comment_id: number) {
    return this.clientService.get<any>(`/interviews/${interview_id}/coments/${comment_id}/user-activity`);
  }
  get_user_activity_on_interview_comment_reply(interview_id: number, comment_id: number, reply_id: number) {
    return this.clientService.get<any>(`/interviews/${interview_id}/coments/${comment_id}/replies/${reply_id}/user-activity`);
  }

  get_interview_reactions(interview_id: number, min_id?: number) {
    const endpoint = min_id
      ? `/interviews/${interview_id}/reactions/${min_id}`
      : `/interviews/${interview_id}/reactions`;
    return this.clientService.get<IInterview[]>(endpoint);
  }
  get_interview_comment_reactions(interview_id: number, comment_id: number, min_id?: number) {
    const endpoint = min_id
      ? `/interviews/${interview_id}/coments/${comment_id}/reactions/${min_id}`
      : `/interviews/${interview_id}/coments/${comment_id}/reactions`;
    return this.clientService.get<IInterview[]>(endpoint);
  }
  get_interview_comment_reply_reactions(interview_id: number, comment_id: number, reply_id: number, min_id?: number) {
    const endpoint = min_id
      ? `/interviews/${interview_id}/coments/${comment_id}/replies/${reply_id}/reactions/${min_id}`
      : `/interviews/${interview_id}/coments/${comment_id}/replies/${reply_id}/reactions`;
    return this.clientService.get<IInterview[]>(endpoint);
  }

  get_interview_comments(interview_id: number, min_id?: number) {
    const endpoint = min_id
      ? `/interviews/${interview_id}/comments/${min_id}`
      : `/interviews/${interview_id}/comments`;
    return this.clientService.get<IInterviewComment[]>(endpoint);
  }
  get_interview_comment_replies(interview_id: number, comment_id: number, min_id?: number) {
    const endpoint = min_id
      ? `/interviews/${interview_id}/coments/${comment_id}/replies/${min_id}`
      : `/interviews/${interview_id}/coments/${comment_id}/replies`;
    return this.clientService.get<IInterviewComment[]>(endpoint);
  }

  get_latest_trending_skills_on_interviews() {
    return this.clientService.get<IInterview>(`/interviews/trending-skills`);
  }



  /** POST */

  create_interview(data: {
    owner_id: number,
    interviewer_id?: number,
    interviewee_id?: number,
    title: string,
    description: string,
    video_link: string,
    tags?: string,
  }) {
    return this.clientService.post(`/interviews`, data);
  }
  log_interview_seen(interview_id: number) {
    return this.clientService.post(`/interviews/${interview_id}/user-activity/seen`);
  }

  log_interview_details_expanded(interview_id: number) {
    return this.clientService.post(`/interviews/${interview_id}/user-activity/details-expanded`);
  }


  create_interview_comment(data: { owner_id: number, interview_id: number, body: string }) {
    return this.clientService.post(`/interviews/${data.interview_id}/comments`, data);
  }

  create_interview_comment_reply(interview_id: number, data: { owner_id: number, comment_id: number, body: string }) {
    return this.clientService.post(`/interviews/${interview_id}/comments/${data.comment_id}/replies`, data);
  }

  toggle_interview_like(interview_id: number) {
    return this.clientService.post(`/interviews/${interview_id}/toggle-reaction/${REACTIONS.LIKE}`);
  }
  toggle_interview_comment_like(interview_id: number, comment_id: number) {
    return this.clientService.post(`/interviews/${interview_id}/comments/${comment_id}/toggle-reaction/${REACTIONS.LIKE}`);
  }
  toggle_interview_comment_reply_like(interview_id: number, comment_id: number, reply_id: number) {
    return this.clientService.post(`/interviews/${interview_id}/comments/${comment_id}/replies/${reply_id}/toggle-reaction/${REACTIONS.LIKE}`);
  }






  /** PUT */

  update_interview(interview_id: number, data: {  }) {
    return this.clientService.put<any>(`/interviews/${interview_id}`);
  }
  update_interview_comment(interview_id: number, comment_id: number, data: {  }) {
    return this.clientService.put<any>(`/interviews/${interview_id}/comments/${comment_id}`);
  }
  update_interview_comment_reply(interview_id: number, comment_id: number, reply_id: number, data: {  }) {
    return this.clientService.put<any>(`/interviews/${interview_id}/comments/${comment_id}/replies/${reply_id}`);
  }





  /** DELETE */

  delete_interview(interview_id: number) {
    return this.clientService.delete<any>(`/interviews/${interview_id}`);
  }
  delete_interview_comment(interview_id: number, comment_id: number) {
    return this.clientService.delete<any>(`/interviews/${interview_id}/comments/${comment_id}`);
  }
  delete_interview_comment_reply(interview_id: number, comment_id: number, reply_id: number) {
    return this.clientService.delete<any>(`/interviews/${interview_id}/comments/${comment_id}/replies/${reply_id}`);
  }





}
