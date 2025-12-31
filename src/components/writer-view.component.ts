
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-writer-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col md:flex-row gap-6">
      <!-- Controls -->
      <div class="w-full md:w-80 flex flex-col gap-6">
        <div class="glass-panel p-6 rounded-2xl">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Content Writer
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-2">Content Type</label>
              <select [(ngModel)]="type" class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none">
                <option value="Blog Post">Blog Post</option>
                <option value="Social Media Post">Social Media Post</option>
                <option value="Email">Email</option>
                <option value="Essay">Essay</option>
                <option value="Ad Copy">Ad Copy</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-2">Topic / Description</label>
              <textarea 
                [(ngModel)]="topic" 
                rows="4"
                placeholder="What should I write about?"
                class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-2">Tone</label>
              <select [(ngModel)]="tone" class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none">
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
                <option value="Enthusiastic">Enthusiastic</option>
                <option value="Witty">Witty</option>
                <option value="Empathetic">Empathetic</option>
              </select>
            </div>

            <button 
              (click)="generate()" 
              [disabled]="isLoading() || !topic()"
              class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg py-3 transition-colors flex items-center justify-center gap-2">
              @if (isLoading()) {
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                <span>Write Content</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Output -->
      <div class="flex-1 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-700/50">
           <h3 class="font-semibold text-slate-300">Result</h3>
           <button (click)="copyToClipboard()" [disabled]="!output()" class="text-xs text-slate-400 hover:text-white flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
             Copy
           </button>
        </div>
        
        <div class="flex-1 overflow-y-auto pr-2">
          @if (output()) {
             <div class="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed font-light">
               {{ output() }}
             </div>
          } @else if (isLoading()) {
             <div class="space-y-3 animate-pulse mt-4">
               <div class="h-4 bg-slate-800 rounded w-3/4"></div>
               <div class="h-4 bg-slate-800 rounded w-full"></div>
               <div class="h-4 bg-slate-800 rounded w-5/6"></div>
               <div class="h-4 bg-slate-800 rounded w-full"></div>
             </div>
          } @else {
             <div class="h-full flex items-center justify-center text-slate-600 italic">
               Content will appear here...
             </div>
          }
        </div>
      </div>
    </div>
  `
})
export class WriterViewComponent {
  private geminiService = inject(GeminiService);
  
  type = signal('Blog Post');
  topic = signal('');
  tone = signal('Professional');
  
  isLoading = signal(false);
  output = signal('');

  async generate() {
    if (!this.topic()) return;
    this.isLoading.set(true);
    this.output.set('');

    const systemPrompt = `You are a professional content writer. Write a ${this.type()} with a ${this.tone()} tone.`;
    const userPrompt = `Topic: ${this.topic()}\n\nWrite high-quality, engaging content structured properly.`;

    try {
      const text = await this.geminiService.generateText(userPrompt, systemPrompt);
      this.output.set(text);
    } catch (error: any) {
      console.error(error);
      this.output.set(error.message || 'Error generating content. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.output());
  }
}
