import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGenericTextInputEvent } from 'src/app/interfaces/common.interface';

@Component({
  selector: 'app-textarea-form',
  templateUrl: './textarea-form.component.html',
  styleUrls: ['./textarea-form.component.scss']
})
export class TextareaFormComponent {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<IGenericTextInputEvent>();


  textValue: string = '';

  constructor() { }

  onSubmit() {
    this.formSubmit.emit({ value: this.textValue, reset: () => { this.textValue = ''; } });
  }
}
