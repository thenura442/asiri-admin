import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-issue-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-issue-modal.component.html',
  styleUrl: './report-issue-modal.component.scss'
})
export class ReportIssueModalComponent implements OnInit {
  approval  = input<any>(null);
  closed    = output<void>();
  submitted = output<any>();

  issueCategory  = signal('');
  issueDetails   = signal('');
  affectedTests  = signal<Set<string>>(new Set());

  issueCategories = [
    'Insufficient quantity',
    'Not received',
    'Equipment failure',
    'Reagent unavailable',
    'Contamination',
    'Other'
  ];

  ngOnInit(): void {
    const a = this.approval();
    if (a) this.affectedTests.set(new Set(a.tests));
  }

  toggleTest(test: string): void {
    const set = new Set(this.affectedTests());
    set.has(test) ? set.delete(test) : set.add(test);
    this.affectedTests.set(set);
  }

  isAffected(test: string): boolean { return this.affectedTests().has(test); }

  get canSubmit(): boolean { return !!this.issueCategory() && !!this.issueDetails(); }

  submit(): void {
    const a = this.approval();
    this.submitted.emit({
      requestId: a?.requestId,
      category: this.issueCategory(),
      details: this.issueDetails(),
      affectedTests: Array.from(this.affectedTests())
    });
  }

  close(): void { this.closed.emit(); }
}