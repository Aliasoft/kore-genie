import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, StreamToken } from './chat.service';
import { Subscription } from 'rxjs';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  messages: Message[] = [];
  question = '';
  loading = false;

  private sub?: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.connect();
  }

  send(): void {
    const q = this.question.trim();
    if (!q || this.loading) return;

    this.messages.push({ role: 'user', text: q });
    this.question = '';
    this.loading = true;

    const assistantMsg: Message = { role: 'assistant', text: '', streaming: true };
    this.messages.push(assistantMsg);

    this.sub = this.chatService.ask(q).subscribe((token: StreamToken) => {
      if (!token.done) {
        assistantMsg.text += token.token;
        this.scrollToBottom();
      } else {
        assistantMsg.streaming = false;
        this.loading = false;
        this.sub?.unsubscribe();
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chatService.disconnect();
  }
}
