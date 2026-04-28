import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UploadedFile {
  file: File;
  previewUrl: string | null;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  label       = input('Upload File');
  accept      = input('image/*,application/pdf');
  maxSizeMb   = input(10);
  hint        = input('');
  uploaded    = output<UploadedFile>();

  isDragging  = signal(false);
  file        = signal<UploadedFile | null>(null);
  error       = signal<string | null>(null);

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void { this.isDragging.set(false); }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files?.length) this.handleFile(files[0]);
  }

  onFileInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  private handleFile(file: File): void {
    this.error.set(null);
    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.error.set(`File must be under ${this.maxSizeMb()}MB`);
      return;
    }
    const isImage = file.type.startsWith('image/');
    const reader  = new FileReader();
    reader.onload = () => {
      const result: UploadedFile = {
        file,
        previewUrl: isImage ? reader.result as string : null
      };
      this.file.set(result);
      this.uploaded.emit(result);
    };
    if (isImage) reader.readAsDataURL(file);
    else reader.readAsText(file);
  }

  remove(): void { this.file.set(null); this.error.set(null); }
}