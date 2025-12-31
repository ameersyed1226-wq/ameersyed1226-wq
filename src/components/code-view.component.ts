
import { Component, signal, inject, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-code-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col md:flex-row gap-6">
      <!-- Controls -->
      <div class="w-full md:w-80 flex flex-col gap-6">
        <div class="glass-panel p-6 rounded-2xl border-t-4" [class.border-t-orange-500]="mode() === 'web'" [class.border-t-cyan-500]="mode() === 'app'">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            @if (mode() === 'web') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Website Generator
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              App Generator
            }
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
              <textarea 
                [(ngModel)]="description" 
                rows="6"
                [placeholder]="mode() === 'web' ? 'Describe the website (e.g., A landing page for a coffee shop with a hero section...)' : 'Describe the app (e.g., A fitness tracker with workout logs and progress charts...)'"
                class="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors resize-none"
                [class.focus:border-orange-500]="mode() === 'web'"
                [class.focus:border-cyan-500]="mode() === 'app'"
              ></textarea>
            </div>

            <button 
              (click)="generate()" 
              [disabled]="isLoading() || !description()"
              class="w-full text-white font-medium rounded-lg py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              [class.bg-orange-600]="mode() === 'web'"
              [class.hover:bg-orange-700]="mode() === 'web'"
              [class.bg-cyan-600]="mode() === 'app'"
              [class.hover:bg-cyan-700]="mode() === 'app'"
            >
              @if (isLoading()) {
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                <span>Generate {{ mode() === 'web' ? 'Website' : 'Prototype' }}</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Output -->
      <div class="flex-1 glass-panel rounded-2xl p-0 relative overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-3 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
           <div class="flex items-center gap-4">
             <!-- Window Controls decoration -->
             <div class="flex gap-1.5">
               <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
               <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
               <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
             </div>

             <!-- View Tabs -->
             @if (output()) {
               <div class="flex bg-slate-800 rounded-lg p-1 gap-1">
                 <button 
                   (click)="activeTab.set('preview')"
                   [class]="activeTab() === 'preview' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
                   class="px-3 py-1 text-xs font-medium rounded transition-all">
                   Preview
                 </button>
                 <button 
                   (click)="activeTab.set('code')"
                   [class]="activeTab() === 'code' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
                   class="px-3 py-1 text-xs font-medium rounded transition-all">
                   Code
                 </button>
               </div>
             }
           </div>

           <!-- Action Buttons -->
           <div class="flex items-center gap-4">
             <button (click)="downloadCode()" [disabled]="!output()" class="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                 <span>Download</span>
             </button>

             <button (click)="copyToClipboard()" [disabled]="!output()" class="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
               @if (copySuccess()) {
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                 <span class="text-green-500">Copied!</span>
               } @else {
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                 <span>Copy Code</span>
               }
             </button>
           </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 overflow-hidden relative bg-[#0d1117]">
          @if (output()) {
             @if (activeTab() === 'preview') {
               <div class="w-full h-full flex items-center justify-center bg-slate-900">
                 @if (mode() === 'app') {
                   <!-- Mobile Device Frame for App -->
                   <div class="relative w-[375px] h-[750px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-700">
                      <div class="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-20"></div>
                      <iframe [src]="previewUrl()" sandbox="allow-scripts allow-same-origin" class="w-full h-full bg-white border-none"></iframe>
                   </div>
                 } @else {
                   <!-- Full width for Web -->
                   <iframe [src]="previewUrl()" sandbox="allow-scripts allow-same-origin" class="w-full h-full bg-white border-none"></iframe>
                 }
               </div>
             } @else {
               <div class="absolute inset-0 overflow-auto p-4">
                 <pre class="font-mono text-sm text-slate-300 leading-relaxed"><code>{{ output() }}</code></pre>
               </div>
             }
          } @else if (isLoading()) {
             <div class="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
               <span class="font-mono animate-pulse">> Architecting solution...</span>
               <span class="font-mono animate-pulse delay-75">> Writing logic...</span>
               <span class="font-mono animate-pulse delay-150">> Compiling prototype...</span>
             </div>
          } @else {
             <div class="h-full flex items-center justify-center text-slate-700 italic">
               // Generated output will appear here
             </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CodeViewComponent implements OnDestroy {
  private geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);
  
  mode = input.required<'web' | 'app'>();
  description = signal('');
  isLoading = signal(false);
  output = signal('');
  activeTab = signal<'code' | 'preview'>('preview');
  copySuccess = signal(false);
  
  previewUrl = signal<SafeResourceUrl | null>(null);
  private currentBlobUrl: string | null = null;

  ngOnDestroy() {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
  }

  async generate() {
    if (!this.description()) return;
    this.isLoading.set(true);
    this.output.set('');
    this.previewUrl.set(null);

    const isWeb = this.mode() === 'web';
    
    // STRICT Prompt Strategy: NO IMAGES allowed to prevent broken links.
    const systemPrompt = isWeb 
      ? `You are an expert Frontend Developer. Generate a complete, single-file HTML structure with embedded CSS (Tailwind via CDN) and basic JS for the requested website. 
IMPORTANT: 
1. Do NOT use <img> tags or external image URLs. Use CSS background colors, patterns, or SVG icons instead.
2. Output ONLY the raw HTML code. Start immediately with <!DOCTYPE html>.
3. Do NOT use markdown code blocks.`
      : `You are an expert Mobile App Prototyper. Generate a complete, single-file HTML/CSS/JS mobile app prototype using Tailwind CSS. 
IMPORTANT:
1. Design must look like a native mobile app.
2. Do NOT use <img> tags or external image URLs. Use CSS background colors, SVG icons, or text avatars instead.
3. Output ONLY the raw HTML code. Start immediately with <!DOCTYPE html>.
4. Do NOT use markdown code blocks.`;
    
    const userPrompt = `Requirement: ${this.description()}`;

    try {
      const text = await this.geminiService.generateText(userPrompt, systemPrompt);
      
      let cleanText = text.trim();
      
      // Robust Extraction Logic: Handle Markdown blocks or Raw Text
      const codeBlockMatch = cleanText.match(/```(?:html)?\s*([\s\S]*?)```/);
      
      if (codeBlockMatch && codeBlockMatch[1]) {
        // If content is wrapped in markdown ```html ... ```, extract it
        cleanText = codeBlockMatch[1].trim();
      } else {
        // Fallback: If no markdown wrapping, look for DOCTYPE or html tag
        const docTypeIndex = cleanText.indexOf('<!DOCTYPE html');
        const htmlTagIndex = cleanText.indexOf('<html');
        
        if (docTypeIndex !== -1) {
          cleanText = cleanText.substring(docTypeIndex);
        } else if (htmlTagIndex !== -1) {
          cleanText = cleanText.substring(htmlTagIndex);
        }
      }
      
      // Final sanity check: Ensure it looks like HTML
      if (!cleanText.startsWith('<')) {
        // If it still doesn't look like code, it might be an error message from AI
        console.warn('Generated text does not look like HTML:', cleanText);
      }
      
      this.output.set(cleanText);
      this.updatePreview(cleanText);
      this.activeTab.set('preview');
    } catch (error: any) {
      console.error(error);
      this.output.set(error.message || 'Error generating code. Please try again.');
      this.activeTab.set('code');
    } finally {
      this.isLoading.set(false);
    }
  }

  updatePreview(code: string) {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
    const blob = new Blob([code], { type: 'text/html' });
    this.currentBlobUrl = URL.createObjectURL(blob);
    this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.currentBlobUrl));
  }

  copyToClipboard() {
    if (!this.output()) return;
    navigator.clipboard.writeText(this.output()).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  }

  downloadCode() {
    if (!this.output()) return;
    
    const isWeb = this.mode() === 'web';
    const content = this.output();
    const fileName = isWeb ? 'website.html' : 'mobile-app-prototype.html';
    const mimeType = 'text/html';

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    window.URL.revokeObjectURL(url);
  }
}
