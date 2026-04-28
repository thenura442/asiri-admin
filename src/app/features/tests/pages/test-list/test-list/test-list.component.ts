import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { TestAddModalComponent } from '@features/tests/modals/test-add-modal/test-add-modal/test-add-modal.component';
import { TestEditModalComponent } from '@features/tests/modals/test-edit-modal/test-edit-modal/test-edit-modal.component';

type TestCategory = 'blood' | 'biochemistry' | 'hormones' | 'urine' | 'microbiology' | 'imaging';

interface LabTest {
  id: string;
  name: string;
  code: string;
  category: TestCategory;
  basePrice: number;
  turnaround: string;
  sampleType: string;
  prescriptionRequired: boolean;
  isActive: boolean;
  ordersThisMonth: number;
  description: string | null;
}

interface TestStats {
  total: number; active: number; categories: number; avgPrice: number;
}

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TestAddModalComponent, TestEditModalComponent],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.scss'
})
export class TestListComponent implements OnInit {
  private modal = inject(ModalService);

  activeFilter  = signal<'all' | TestCategory>('all');
  searchQuery   = signal('');
  showAddModal  = signal(false);
  editingTest   = signal<LabTest | null>(null);

  stats = signal<TestStats>({ total: 48, active: 42, categories: 6, avgPrice: 2450 });

  tests = signal<LabTest[]>([
    { id: 't1', name: 'Full Blood Count',           code: 'FBC-001', category: 'blood',        basePrice: 1500, turnaround: '4–6 hrs', sampleType: 'Blood', prescriptionRequired: false, isActive: true,  ordersThisMonth: 420, description: 'Complete blood cell count including RBC, WBC, platelets and haemoglobin.' },
    { id: 't2', name: 'Lipid Profile',              code: 'LIP-002', category: 'biochemistry', basePrice: 2800, turnaround: '6–8 hrs', sampleType: 'Blood', prescriptionRequired: false, isActive: true,  ordersThisMonth: 380, description: 'Measures cholesterol, HDL, LDL and triglycerides.' },
    { id: 't3', name: 'Fasting Blood Sugar',        code: 'FBS-003', category: 'blood',        basePrice: 800,  turnaround: '2–3 hrs', sampleType: 'Blood', prescriptionRequired: false, isActive: true,  ordersThisMonth: 310, description: 'Blood glucose measurement after 8-12 hours of fasting.' },
    { id: 't4', name: 'HBA1C',                      code: 'HBA-004', category: 'biochemistry', basePrice: 3200, turnaround: '6–8 hrs', sampleType: 'Blood', prescriptionRequired: false, isActive: true,  ordersThisMonth: 280, description: 'Glycated haemoglobin test for long-term diabetes monitoring.' },
    { id: 't5', name: 'Thyroid Panel (TSH, T3, T4)',code: 'THY-005', category: 'hormones',     basePrice: 4500, turnaround: '8–12 hrs', sampleType: 'Blood', prescriptionRequired: true,  isActive: true,  ordersThisMonth: 190, description: 'Complete thyroid function assessment.' },
    { id: 't6', name: 'Urine Full Report',          code: 'UFR-006', category: 'urine',        basePrice: 600,  turnaround: '2–3 hrs', sampleType: 'Urine', prescriptionRequired: false, isActive: false, ordersThisMonth: 0,   description: 'Microscopic and chemical analysis of urine sample.' },
    { id: 't7', name: 'Creatinine (Renal Panel)',   code: 'CRE-007', category: 'biochemistry', basePrice: 1200, turnaround: '4–6 hrs', sampleType: 'Blood', prescriptionRequired: false, isActive: true,  ordersThisMonth: 155, description: 'Kidney function test measuring creatinine clearance.' },
    { id: 't8', name: 'Complete Urine Culture',     code: 'CUC-008', category: 'microbiology', basePrice: 2500, turnaround: '48–72 hrs', sampleType: 'Urine', prescriptionRequired: true, isActive: true,  ordersThisMonth: 88, description: 'Culture and sensitivity test for urinary tract infections.' },
    { id: 't9', name: 'Vitamin D (25-OH)',           code: 'VTD-009', category: 'hormones',     basePrice: 3800, turnaround: '8–12 hrs', sampleType: 'Blood', prescriptionRequired: false, isActive: true,  ordersThisMonth: 210, description: '25-hydroxyvitamin D serum level measurement.' },
  ]);

  filters: { key: string; label: string }[] = [
    { key: 'all', label: 'All Tests' },
    { key: 'blood', label: 'Blood' },
    { key: 'biochemistry', label: 'Biochemistry' },
    { key: 'hormones', label: 'Hormones' },
    { key: 'urine', label: 'Urine' },
    { key: 'microbiology', label: 'Microbiology' },
  ];

  ngOnInit(): void {}

  filteredTests(): LabTest[] {
    let list = this.tests();
    if (this.activeFilter() !== 'all') list = list.filter(t => t.category === this.activeFilter());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
    return list;
  }

  setFilter(key: string): void { this.activeFilter.set(key as any); }
  onSearch(e: Event): void { this.searchQuery.set((e.target as HTMLInputElement).value); }

  toggleActive(test: LabTest): void {
    this.tests.update(list => list.map(t =>
      t.id === test.id ? { ...t, isActive: !t.isActive } : t
    ));
  }

  openEdit(test: LabTest): void { this.editingTest.set(test); }
  closeEdit(): void { this.editingTest.set(null); }
  closeAdd(): void  { this.showAddModal.set(false); }

  onTestSaved(data: any): void {
    this.modal.success(`Test "${data.name}" saved`);
    this.closeEdit();
    this.closeAdd();
  }

  confirmDelete(test: LabTest): void {
    this.modal.confirm({
      title: 'Delete Test',
      message: `Delete "${test.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true
    }).subscribe(ok => {
      if (ok) {
        this.tests.update(list => list.filter(t => t.id !== test.id));
        this.modal.success('Test deleted');
      }
    });
  }

  categoryClass(cat: TestCategory): string {
    const m: Record<TestCategory, string> = {
      blood: 'cat-blood', biochemistry: 'cat-bio', hormones: 'cat-hormone',
      urine: 'cat-urine', microbiology: 'cat-micro', imaging: 'cat-imaging'
    };
    return m[cat] ?? 'cat-bio';
  }

  categoryLabel(cat: TestCategory): string {
    const m: Record<TestCategory, string> = {
      blood: 'Blood', biochemistry: 'Biochemistry', hormones: 'Hormones',
      urine: 'Urine', microbiology: 'Microbiology', imaging: 'Imaging'
    };
    return m[cat] ?? cat;
  }

  formatPrice(price: number): string {
    return 'Rs. ' + price.toLocaleString('en-LK');
  }
}