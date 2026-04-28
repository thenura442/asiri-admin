import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, count = 2): string {
    if (!value) return '?';
    return value
      .trim()
      .split(/\s+/)
      .slice(0, count)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }
}