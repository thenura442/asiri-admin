import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalService } from '@shared/services/modal/modal.service';
import { BranchService } from '@features/branches/services/branch/branch.service';
import { UserService } from '@features/users/services/user/user.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { CustomDropdownComponent, DropdownOption } from '@shared/components/ui/custom-dropdown/custom-dropdown/custom-dropdown.component';
import { CreateBranchDto } from '@core/models/branch.model';
import { BranchType } from '@core/enums/branch-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

interface ChecklistItem { label: string; required: boolean; done: boolean; }

@Component({
  selector: 'app-branch-add',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomDropdownComponent],
  templateUrl: './branch-add.component.html',
  styleUrl: './branch-add.component.scss'
})
export class BranchAddComponent implements OnInit {
  private router       = inject(Router);
  private modal        = inject(ModalService);
  private branchSvc    = inject(BranchService);
  private userSvc      = inject(UserService);
  private notification = inject(NotificationService);

  isSubmitting = signal(false);
  submitted    = signal(false);

  branchName    = signal('');
  branchCode    = signal('');
  branchType    = signal<string | null>(null);
  defaultLabId  = signal<string | null>(null);
  address       = signal('');
  city          = signal('');
  district      = signal<string | null>(null);
  province      = signal('');
  latitude      = signal('');
  longitude     = signal('');
  phone         = signal('');
  email         = signal('');
  openingTime   = signal('06:30');
  closingTime   = signal('16:00');
  serviceRadius = signal('');
  maxCapacity   = signal('');
  managerName   = signal('');
  managerPhone  = signal('');
  selectedManagerId = signal<string | null>(null);

  labBranches    = signal<DropdownOption[]>([]);
  managerOptions = signal<DropdownOption[]>([]);
  managerMap     = new Map<string, { name: string; phone: string }>();

  networkStats   = signal({ total: 0, labs: 0, centers: 0, districts: 0 });
  recentBranches = signal<{ initials: string; name: string; date: string; isOnline: boolean }[]>([]);

  errors = signal<Record<string, string>>({});

  branchTypeOptions: DropdownOption[] = [
    { value: 'lab',               label: 'Lab (Collection + Testing)',          dot: 'var(--accent)' },
    { value: 'collecting_center', label: 'Collecting Center (Collection Only)', dot: 'var(--sbl)'    },
  ];

  districtOptions: DropdownOption[] = [
    'Colombo','Gampaha','Kalutara','Kandy','Matale','Galle','Matara',
    'Hambantota','Jaffna','Kurunegala','Puttalam','Anuradhapura',
    'Polonnaruwa','Badulla','Moneragala','Ratnapura','Kegalle',
    'Trincomalee','Batticaloa','Ampara','Mannar','Vavuniya','Mullaitivu',
    'Kilinochchi','Nuwara Eliya'
  ].map(d => ({ value: d, label: d }));

  checklist = signal<ChecklistItem[]>([
    { label: 'Branch name entered',     required: true,  done: false },
    { label: 'Branch code entered',     required: false, done: false },
    { label: 'Branch type selected',    required: true,  done: false },
    { label: 'District / Province set', required: false, done: false },
    { label: 'GPS coordinates entered', required: true,  done: false },
    { label: 'Parent lab linked',       required: false, done: false },
  ]);

  ngOnInit(): void {
    this.loadLabs();
    this.loadManagers();
    this.loadNetworkStats();
  }

  private loadLabs(): void {
    this.branchSvc.getLabs().subscribe({
      next: (labs) => {
        this.labBranches.set(labs.map(l => ({ value: l.id, label: l.name, dot: 'var(--accent)' })));
      },
      error: () => {}
    });
  }

  private loadManagers(): void {
    this.userSvc.getAll({ role: 'lab_manager', limit: 100 }).subscribe({
      next: (res: any) => {
        this.managerOptions.set(
          res.data.map((u: any) => ({ value: u.id, label: u.fullName, meta: u.phone ?? '' }))
        );
        res.data.forEach((u: any) => {
          this.managerMap.set(u.id, { name: u.fullName, phone: u.phone ?? '' });
        });
      },
      error: () => {}
    });
  }

  private loadNetworkStats(): void {
    this.branchSvc.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        const labs      = res.data.filter(b => b.type === 'lab').length;
        const centers   = res.data.filter(b => b.type === 'collecting_center').length;
        const districts = new Set(res.data.map(b => b.district).filter(Boolean)).size;
        this.networkStats.set({ total: res.meta.total, labs, centers, districts });
        const recent = [...res.data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4)
          .map(b => ({
            initials: this.getInitials(b.name),
            name:     b.name,
            date:     this.timeAgo(b.createdAt),
            isOnline: b.isOnline
          }));
        this.recentBranches.set(recent);
      },
      error: () => {}
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  private timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  private updateCheck(i: number, done: boolean): void {
    const list = [...this.checklist()];
    list[i] = { ...list[i], done };
    this.checklist.set(list);
  }

  private clearError(field: string): void {
    const e = { ...this.errors() };
    delete e[field];
    this.errors.set(e);
  }

  onName(v: string):           void { this.branchName.set(v);   this.updateCheck(0, v.trim().length > 0); this.clearError('name'); }
  onCode(v: string):           void { this.branchCode.set(v);   this.updateCheck(1, v.trim().length > 0); }
  onAddress(v: string):        void { this.address.set(v);      this.clearError('address'); }
  onEmail(v: string):          void { this.email.set(v);        this.clearError('email'); }
  onType(v: string | null):    void {
    this.branchType.set(v);
    this.updateCheck(2, !!v);
    this.clearError('type');
    if (v === 'lab') { this.defaultLabId.set(null); this.updateCheck(5, true); }
    else { this.updateCheck(5, !!this.defaultLabId()); }
  }
  onDistrict(v: string|null):  void { this.district.set(v);     this.updateCheck(3, !!v); }
  onLat(v: string):            void { this.latitude.set(v);     this.maybeUpdateGps(); this.clearError('latitude'); }
  onLng(v: string):            void { this.longitude.set(v);    this.maybeUpdateGps(); this.clearError('longitude'); }
  onDefaultLab(v: string|null):void { this.defaultLabId.set(v); this.updateCheck(5, !!v); }
  onManagerSelect(id: string|null): void {
    this.selectedManagerId.set(id);
    if (id && this.managerMap.has(id)) {
      const m = this.managerMap.get(id)!;
      this.managerName.set(m.name);
      this.managerPhone.set(m.phone);
    } else {
      this.managerName.set('');
      this.managerPhone.set('');
    }
  }

  private maybeUpdateGps(): void {
    this.updateCheck(4, !!this.latitude() && !!this.longitude());
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.branchName().trim())   e['name']      = 'Branch name is required';
    if (!this.branchType())          e['type']      = 'Branch type is required';
    if (!this.address().trim())      e['address']   = 'Address is required';
    if (!this.latitude().trim())     e['latitude']  = 'Latitude is required';
    else if (isNaN(parseFloat(this.latitude())))  e['latitude']  = 'Must be a valid number e.g. 6.8720';
    if (!this.longitude().trim())    e['longitude'] = 'Longitude is required';
    else if (isNaN(parseFloat(this.longitude()))) e['longitude'] = 'Must be a valid number e.g. 79.8890';
    if (this.branchType() === 'collecting_center' && !this.defaultLabId())
      e['defaultLabId'] = 'Collecting centers must have a default lab';
    if (this.email() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()))
      e['email'] = 'Invalid email address';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  get isLab(): boolean { return this.branchType() === 'lab'; }

  submit(): void {
    this.submitted.set(true);
    if (!this.validate()) {
      this.notification.error('Validation Failed', 'Please fix the errors below before submitting');
      return;
    }
    this.isSubmitting.set(true);
    const dto: CreateBranchDto = {
      name:             this.branchName(),
      type:             this.branchType() as BranchType,
      address:          this.address(),
      latitude:         parseFloat(this.latitude()),
      longitude:        parseFloat(this.longitude()),
      operatingStart:   this.openingTime(),
      operatingEnd:     this.closingTime(),
      branchCode:       this.branchCode()    || null,
      phone:            this.phone()         || null,
      email:            this.email()         || null,
      district:         this.district(),
      province:         this.province()      || null,
      serviceRadiusKm:  this.serviceRadius() ? parseInt(this.serviceRadius()) : null,
      maxDailyCapacity: this.maxCapacity()   ? parseInt(this.maxCapacity())   : null,
      managerName:      this.managerName()   || null,
      managerPhone:     this.managerPhone()  || null,
      defaultLabId:     this.isLab ? null : this.defaultLabId(),
    };
    this.branchSvc.create(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (branch) => {
          this.notification.success('Branch Created', `"${branch.name}" registered successfully`);
          this.router.navigate(['/branches']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0)   this.notification.error('Connection Error', 'Cannot reach the server. Check your internet connection.');
          else if (err.status === 409) this.notification.error('Conflict', err.error?.message ?? 'A branch with this code already exists.');
          else if (err.status === 400) this.notification.error('Validation Error', Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message ?? 'Invalid data.');
          else if (err.status === 500) this.notification.error('Server Error', 'Something went wrong. Please try again.');
          else this.notification.error('Error', err.error?.message ?? 'Failed to create branch.');
        }
      });
  }

  cancel(): void { this.router.navigate(['/branches']); }
}