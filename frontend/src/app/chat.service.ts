import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface StreamToken {
  token: string;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private ws!: WebSocket;
  private token$ = new Subject<StreamToken>();

  connect(): void {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    this.ws = new WebSocket(`${protocol}://${location.host}/ws/rag`);

    this.ws.onmessage = (event) => {
      const data: StreamToken = JSON.parse(event.data);
      this.token$.next(data);
    };

    this.ws.onerror = () => {
      this.token$.next({ token: 'Erreur de connexion au serveur.', done: true });
    };
  }

  ask(question: string): Observable<StreamToken> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      this.ws.onopen = () => this.ws.send(JSON.stringify({ question }));
    } else {
      this.ws.send(JSON.stringify({ question }));
    }
    return this.token$.asObservable();
  }

  disconnect(): void {
    this.ws?.close();
  }
}
