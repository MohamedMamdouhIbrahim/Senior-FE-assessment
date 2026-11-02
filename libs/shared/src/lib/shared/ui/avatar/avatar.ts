import { Component, input } from '@angular/core';

@Component({
  selector: 'task-management-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  readonly type = input<'primary' | 'secondary' | 'tertiary'>('primary');
  readonly text = input<string>('');
}
