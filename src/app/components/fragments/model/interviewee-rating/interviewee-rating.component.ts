import { Component, Input } from '@angular/core';
import { IInterviewerRating } from 'src/app/interfaces/avenger.models.interface';

@Component({
  selector: 'app-interviewee-rating',
  templateUrl: './interviewee-rating.component.html',
  styleUrls: ['./interviewee-rating.component.scss']
})
export class IntervieweeRatingComponent {

  @Input() rating!: IInterviewerRating;

  constructor() {
  }

}
