import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IngestionResponse {
  filename: string;
  chunks: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class IngestService {

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<IngestionResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<IngestionResponse>('/api/ingest', form);
  }
}
