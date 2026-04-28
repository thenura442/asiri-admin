import { Component, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-fleet-map',
  standalone: true,
  imports: [],
  templateUrl: './fleet-map.component.html',
  styleUrl: './fleet-map.component.scss'
})
export class FleetMapComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private map: any = null;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private async initMap(): Promise<void> {
    // Leaflet loaded via global script tag — window.L
    const L = (window as any)['L'];
    if (!L) return;

    this.map = L.map('fleet-map', { zoomControl: false }).setView([6.9271, 79.9612], 12);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(this.map);

    // Mock driver locations
    const drivers = [
      { lat: 6.9542, lng: 79.8868, initials: 'AJ', color: '#10b981', name: 'Aruna J.',  status: 'Available' },
      { lat: 6.9050, lng: 79.9550, initials: 'KM', color: '#eab308', name: 'Kasun M.',  status: 'On Break' },
      { lat: 6.8830, lng: 79.8940, initials: 'SP', color: '#3b82f6', name: 'Sunil P.',  status: 'In Progress' },
      { lat: 6.9350, lng: 80.0120, initials: 'DC', color: '#ef4444', name: 'Dinesh C.', status: 'Emergency' },
      { lat: 6.8450, lng: 79.9720, initials: 'PS', color: '#10b981', name: 'Prasad S.', status: 'Available' },
    ];

    drivers.forEach(d => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative">
          <div style="position:absolute;inset:-6px;border-radius:50%;background:${d.color};opacity:.12;animation:mp 2.5s infinite"></div>
          <div style="width:36px;height:36px;background:#002B4C;border-radius:50%;border:2.5px solid #fff;
            box-shadow:0 2px 10px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;
            color:rgba(255,255,255,.9);font-size:10px;font-weight:800;
            font-family:'Plus Jakarta Sans',sans-serif;position:relative;z-index:1">${d.initials}</div>
          <div style="position:absolute;bottom:-1px;right:-1px;width:11px;height:11px;
            border-radius:50%;background:${d.color};border:2px solid #fff;z-index:2"></div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker([d.lat, d.lng], { icon })
        .addTo(this.map)
        .bindPopup(`<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 0">
          <div style="font-weight:700;font-size:14px;color:#002B4C">${d.name}</div>
          <div style="font-size:12px;color:#6b8299;margin-top:2px">${d.status}</div>
        </div>`, { closeButton: false });
    });

    // Add ping animation
    const style = document.createElement('style');
    style.textContent = '@keyframes mp{0%{transform:scale(.8);opacity:.12}50%{transform:scale(1.5);opacity:.04}100%{transform:scale(.8);opacity:.12}}';
    document.head.appendChild(style);
  }
}