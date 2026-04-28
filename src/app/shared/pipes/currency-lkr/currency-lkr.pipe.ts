import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyLkr', standalone: true })
export class CurrencyLkrPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol = true): string {
    if (value === null || value === undefined) return '—';
    const formatted = value.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showSymbol ? `Rs. ${formatted}` : formatted;
  }
}