import { Component, Input } from '@angular/core';
import { IInterviewerRating } from 'src/app/interfaces/avenger.models.interface';

@Component({
  selector: 'app-interviewer-rating',
  templateUrl: './interviewer-rating.component.html',
  styleUrls: ['./interviewer-rating.component.scss']
})
export class InterviewerRatingComponent {

  @Input() rating!: IInterviewerRating;

  constructor() {
  }

}
