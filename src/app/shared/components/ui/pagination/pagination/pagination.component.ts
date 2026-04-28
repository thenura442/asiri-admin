import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {
  @Input()  total      = 0;
  @Input()  pageSize   = 10;
  @Input()  currentPage = 1;
  @Output() pageChange  = new EventEmitter<number>();

  pages:      (number | '...')[] = [];
  totalPages  = 1;
  startItem   = 0;
  endItem     = 0;

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.startItem  = (this.currentPage - 1) * this.pageSize + 1;
    this.endItem    = Math.min(this.currentPage * this.pageSize, this.total);
    this.buildPages();
  }

  private buildPages(): void {
    const p = this.currentPage;
    const t = this.totalPages;
    const pages: (number | '...')[] = [];

    if (t <= 7) {
      for (let i = 1; i <= t; i++) pages.push(i);
    } else {
      pages.push(1);
      if (p > 3) pages.push('...');
      const start = Math.max(2, p - 1);
      const end   = Math.min(t - 1, p + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (p < t - 2) pages.push('...');
      pages.push(t);
    }
    this.pages = pages;
  }

  goTo(page: number | '...'): void {
    if (page === '...' || page === this.currentPage) return;
    this.pageChange.emit(page as number);
  }

  prev(): void { if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1); }
  next(): void { if (this.currentPage < this.totalPages) this.pageChange.emit(this.currentPage + 1); }
}