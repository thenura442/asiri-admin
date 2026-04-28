import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receive-samples-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receive-samples-modal.component.html',
  styleUrl: './receive-samples-modal.component.scss'
})
export class ReceiveSamplesModalComponent implements OnInit {
  approval  = input<any>(null);
  closed    = output<void>();
  confirmed = output<any>();

  receivedBy      = signal('');
  conditionNotes  = signal('');
  sampleCondition = signal<'good' | 'compromised' | 'rejected'>('good');
  receivedAt      = signal('');

  checkedTests = signal<Set<string>>(new Set());

  ngOnInit(): void {
    const now = new Date();
    this.receivedAt.set(now.toTimeString().slice(0, 5));
    const a = this.approval();
    if (a) this.checkedTests.set(new Set(a.tests));
  }

  toggleTest(test: string): void {
    const set = new Set(this.checkedTests());
    set.has(test) ? set.delete(test) : set.add(test);
    this.checkedTests.set(set);
  }

  isChecked(test: string): boolean { return this.checkedTests().has(test); }

  get canConfirm(): boolean { return this.checkedTests().size > 0 && this.sampleCondition() !== 'rejected'; }

  confirm(): void {
    const a = this.approval();
    this.confirmed.emit({
      requestId: a?.requestId,
      receivedBy: this.receivedBy(),
      condition: this.sampleCondition(),
      notes: this.conditionNotes(),
      tests: Array.from(this.checkedTests())
    });
  }

  close(): void { this.closed.emit(); }
}