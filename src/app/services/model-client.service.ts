import { Injectable } from '@angular/core';
import { AnswerService } from './answer.service';
import { ConversationsService } from './conversations.service';
import { InterviewService } from './interview.service';
import { NoticeService } from './notice.service';
import { QuestionService } from './question.service';
import { SkillService } from './skill.service';
import { UsersService } from './users.service';



/* 
  This service is simply for consolidating other services relating to model CRUD api calls.
  The goal/intent is to reduce multiple imports in other components/services.
*/
@Injectable({
  providedIn: 'root'
})
export class ModelClientService {

  constructor(
    public readonly user: UsersService,
    public readonly conversation: ConversationsService,
    public readonly notice: NoticeService,
    public readonly interview: InterviewService,
    public readonly question: QuestionService,
    public readonly answer: AnswerService,
    public readonly skill: SkillService,
  ) { }
}
