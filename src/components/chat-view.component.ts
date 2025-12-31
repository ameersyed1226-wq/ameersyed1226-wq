
import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { Chat } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">Nexus Chat</h2>
          <p class="text-xs text-slate-400">Ask me anything</p>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" #scrollContainer>
        @if (messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>Start a conversation...</p>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div class="flex" [class.justify-end]="msg.role === 'user'">
            <div [class]="'max-w-[80%] rounded-2xl p-4 ' + (msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700')">
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
            </div>
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-start">
            <div class="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700 flex gap-2 items-center">
              <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-slate-800/50 border-t border-slate-700">
        <div class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="sendMessage()"
            placeholder="Type your message..." 
            class="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            [disabled]="isLoading()"
          />
          <button 
            (click)="sendMessage()" 
            [disabled]="!userInput() || isLoading()"
            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatViewComponent implements AfterViewChecked {
  private geminiService = inject(GeminiService);
  private chatSession: Chat;
  
  messages = signal<Message[]>([]);
  userInput = signal('');
  isLoading = signal(false);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    this.chatSession = this.geminiService.createChat();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', text }]);
    this.userInput.set('');
    this.isLoading.set(true);

    try {
      const response = await this.chatSession.sendMessage({ message: text });
      this.messages.update(msgs => [...msgs, { role: 'model', text: response.text }]);
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'Sorry, I encountered an error. Please try again.';
      const errStr = JSON.stringify(error);
      if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota')) {
        errorMsg = '⚠️ Quota exceeded. Please wait a minute before sending another message.';
      }
      this.messages.update(msgs => [...msgs, { role: 'model', text: errorMsg }]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
