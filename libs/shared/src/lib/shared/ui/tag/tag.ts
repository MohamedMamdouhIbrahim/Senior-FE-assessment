import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'task-management-tag',
  imports: [],
  templateUrl: './tag.html',
  styleUrl: './tag.css',
})
export class Tag {
  readonly priority = input<'high' | 'medium' | 'low'>('medium');

  readonly tagText = computed(() => {
    const priority = this.priority();
    return priority === 'high' ? 'HIGH' : priority === 'medium' ? 'MEDIUM' : 'LOW';
  });
}
