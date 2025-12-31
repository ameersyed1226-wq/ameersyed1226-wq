
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-video-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col space-y-6">
      <!-- Header -->
      <div class="glass-panel p-6 rounded-2xl">
        <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
           AI Video Studio
        </h2>
        <p class="text-slate-400">Turn text into motion. This may take a minute or two.</p>
        
        <div class="mt-6 flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Video Prompt</label>
            <textarea 
              [(ngModel)]="prompt" 
              rows="3"
              placeholder="A cinematic drone shot of a misty mountain range at sunrise..."
              class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            ></textarea>
          </div>
          <div class="flex justify-end">
            <button 
              (click)="generate()" 
              [disabled]="isLoading() || !prompt()"
              class="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 transition-colors flex items-center justify-center gap-2">
              @if (isLoading()) {
                <div class="loader ease-linear rounded-full border-2 border-t-2 border-white h-5 w-5"></div>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                <span>Generate Video</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Result Area -->
      <div class="flex-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
        @if (videoUrl()) {
          <div class="flex flex-col items-center w-full max-w-2xl">
            <video controls [src]="videoUrl()" class="w-full rounded-lg shadow-2xl border border-slate-700 bg-black mb-4"></video>
            <a [href]="videoUrl()" download="nexus-ai-video.mp4" class="text-rose-400 hover:text-rose-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Video
            </a>
          </div>
        } @else if (isLoading()) {
           <div class="text-center">
             <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-700 h-12 w-12 mb-4 mx-auto" style="border-top-color: #f43f5e"></div>
             <p class="text-slate-400 animate-pulse">Rendering scenes... Please wait...</p>
             <p class="text-xs text-slate-600 mt-2">This can take 1-2 minutes</p>
           </div>
        } @else {
          <div class="text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 opacity-50"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <p>Your generated video will appear here</p>
          </div>
        }
      </div>
    </div>
  `
})
export class VideoViewComponent {
  private geminiService = inject(GeminiService);
  
  prompt = signal('');
  isLoading = signal(false);
  videoUrl = signal<string | null>(null);

  async generate() {
    if (!this.prompt()) return;
    this.isLoading.set(true);
    this.videoUrl.set(null);
    
    try {
      const result = await this.geminiService.generateVideo(this.prompt());
      this.videoUrl.set(result);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to generate video. Try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
