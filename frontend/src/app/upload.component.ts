import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngestService, IngestionResponse } from './ingest.service';

export interface UploadEvent {
  filename: string;
  chunks: number;
  success: boolean;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  @Output() uploaded = new EventEmitter<UploadEvent>();

  state: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  message = '';
  dragging = false;

  constructor(private ingestService: IngestService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.ingest(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.ingest(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(): void {
    this.dragging = false;
  }

  private ingest(file: File): void {
    this.state = 'uploading';
    this.message = `Indexation de ${file.name}...`;

    this.ingestService.upload(file).subscribe({
      next: (res: IngestionResponse) => {
        this.state = 'success';
        this.message = `${res.filename} • ${res.chunks} chunks indexés`;
        this.uploaded.emit({ filename: res.filename, chunks: res.chunks, success: true });
        setTimeout(() => { this.state = 'idle'; this.message = ''; }, 4000);
      },
      error: () => {
        this.state = 'error';
        this.message = 'Erreur lors de l\'indexation.';
        this.uploaded.emit({ filename: file.name, chunks: 0, success: false });
        setTimeout(() => { this.state = 'idle'; this.message = ''; }, 4000);
      }
    });
  }
}
