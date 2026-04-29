import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TestService, TestParams } from '../../../services/test/test.service';
import { ModalService } from '@shared/services/modal/modal.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { Test } from '@core/models/test.model';
import { SampleType } from '@core/enums/sample-type.enum';
import { TestAddModalComponent } from '@features/tests/modals/test-add-modal/test-add-modal/test-add-modal.component';
import { TestEditModalComponent } from '@features/tests/modals/test-edit-modal/test-edit-modal/test-edit-modal.component';

interface TestStats {
  total:    number;
  active:   number;
  inactive: number;
  avgPrice: number;
}

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TestAddModalComponent, TestEditModalComponent],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.scss'
})
export class TestListComponent implements OnInit {
  private testSvc      = inject(TestService);
  private modal        = inject(ModalService);
  private notification = inject(NotificationService);

  activeFilter  = signal<'all' | 'blood' | 'urine' | 'active' | 'inactive'>('all');
  searchQuery   = signal('');
  isLoading     = signal(false);
  showAddModal  = signal(false);
  editingTest   = signal<Test | null>(null);

  stats = signal<TestStats>({ total: 0, active: 0, inactive: 0, avgPrice: 0 });
  tests = signal<Test[]>([]);

  filters = [
    { key: 'all',      label: 'All Tests' },
    { key: 'blood',    label: 'Blood' },
    { key: 'urine',    label: 'Urine' },
    { key: 'active',   label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
  ];

  ngOnInit(): void {
    this.loadTests();
  }

  private loadTests(): void {
    const filter = this.activeFilter();

    const params: TestParams = {
      page:       1,
      limit:      100,
      search:     this.searchQuery() || undefined,
      sampleType: (filter === 'blood' || filter === 'urine') ? filter : undefined,
      isActive:   filter === 'active' ? true : filter === 'inactive' ? false : undefined,
    };

    this.isLoading.set(true);
    this.testSvc.getAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.tests.set(res.data);
          // Compute stats from the full list
          const active   = res.data.filter(t => t.isActive).length;
          const inactive = res.data.filter(t => !t.isActive).length;
          const avgPrice = res.data.length
            ? Math.round(res.data.reduce((sum, t) => sum + Number(t.price), 0) / res.data.length)
            : 0;
          this.stats.set({ total: res.meta.total, active, inactive, avgPrice });
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)        this.notification.error('Connection Error', 'Cannot reach the server. Check your internet.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else                         this.notification.error('Error', err.error?.message ?? 'Failed to load tests.');
        }
      });
  }

  setFilter(key: string): void {
    this.activeFilter.set(key as any);
    this.loadTests();
  }

  onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.loadTests();
  }

  toggleActive(test: Test): void {
    const dto = { isActive: !test.isActive };
    this.testSvc.update(test.id, dto).subscribe({
      next: (updated) => {
        this.tests.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.notification.success(
          updated.isActive ? 'Test Activated' : 'Test Deactivated',
          `${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}.`
        );
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Error', err.error?.message ?? 'Failed to update test status.');
      }
    });
  }

  openAdd(): void  { this.showAddModal.set(true); }
  closeAdd(): void { this.showAddModal.set(false); }

  openEdit(test: Test): void  { this.editingTest.set(test); }
  closeEdit(): void           { this.editingTest.set(null); }

  onTestAdded(test: Test): void {
    this.notification.success('Test Added', `${test.name} has been added successfully.`);
    this.closeAdd();
    this.loadTests();
  }

  onTestUpdated(test: Test): void {
    this.notification.success('Test Updated', `${test.name} has been updated successfully.`);
    this.closeEdit();
    this.loadTests();
  }

  confirmDelete(test: Test): void {
    this.modal.confirm({
      title:        'Delete Test',
      message:      `Delete "${test.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger:       true
    }).subscribe(ok => {
      if (!ok) return;
      this.testSvc.delete(test.id).subscribe({
        next: () => {
          this.notification.success('Test Deleted', `${test.name} has been removed.`);
          this.loadTests();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) this.notification.error('Cannot Delete', err.error?.message ?? 'Test may be used in active job requests.');
          else                    this.notification.error('Error', err.error?.message ?? 'Failed to delete test.');
        }
      });
    });
  }

  sampleTypeLabel(st: SampleType): string {
    return { blood: 'Blood', urine: 'Urine' }[st] ?? st;
  }

  sampleTypeBadgeClass(st: SampleType): string {
    return { blood: 'cat-blood', urine: 'cat-urine' }[st] ?? 'cat-bio';
  }

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString('en-LK');
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}