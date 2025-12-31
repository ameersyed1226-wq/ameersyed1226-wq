
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-image-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col space-y-6">
      <!-- Header -->
      <div class="glass-panel p-6 rounded-2xl">
        <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
           AI Image Studio
        </h2>
        <p class="text-slate-400">Describe your imagination and let the AI paint it for you.</p>
        
        <div class="mt-6 flex flex-col gap-4">
          <!-- Prompt Input -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
            <textarea 
              [(ngModel)]="prompt" 
              rows="2"
              placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
              class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            ></textarea>
          </div>

          <div class="flex flex-col md:flex-row gap-4">
             <!-- Style Selection -->
             <div class="flex-1">
               <label class="block text-sm font-medium text-slate-400 mb-1">Art Style</label>
               <select [(ngModel)]="selectedStyle" class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                 @for (style of styles; track style) {
                   <option [value]="style">{{ style }}</option>
                 }
               </select>
             </div>

             <!-- Aspect Ratio -->
             <div class="w-full md:w-48">
               <label class="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
               <select [(ngModel)]="aspectRatio" class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500">
                 <option value="1:1">Square (1:1)</option>
                 <option value="16:9">Landscape (16:9)</option>
                 <option value="3:4">Portrait (3:4)</option>
               </select>
             </div>

             <!-- Button -->
             <div class="flex items-end w-full md:w-auto">
                <button 
                  (click)="generate()" 
                  [disabled]="isLoading() || !prompt()"
                  class="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl px-8 py-3 transition-colors flex items-center justify-center gap-2 h-[46px]">
                  @if (isLoading()) {
                    <div class="loader ease-linear rounded-full border-2 border-t-2 border-white h-5 w-5"></div>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>Generate</span>
                  }
                </button>
             </div>
          </div>
        </div>
      </div>

      <!-- Result Area -->
      <div class="flex-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
        @if (generatedImage()) {
          <div class="relative group max-w-full max-h-full flex flex-col items-center gap-4 animate-[fadeIn_0.5s_ease-out]">
            <img [src]="generatedImage()" class="max-w-full max-h-[550px] rounded-lg shadow-2xl border border-slate-700" alt="Generated AI Image" />
            
            <a [href]="generatedImage()" download="nexus-ai-image.jpg" class="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full border border-slate-600 flex items-center gap-2 transition-colors shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Image
            </a>
          </div>
        } @else if (isLoading()) {
           <div class="text-center">
             <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-700 h-12 w-12 mb-4 mx-auto" style="border-top-color: #a855f7"></div>
             <p class="text-slate-400 animate-pulse mt-4 text-lg">Dreaming up your image...</p>
             <p class="text-slate-500 text-sm mt-2">Using Imagen 3 model</p>
           </div>
        } @else {
          <div class="text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p class="text-lg">Your generated image will appear here</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ImageViewComponent {
  private geminiService = inject(GeminiService);
  
  prompt = signal('');
  aspectRatio = signal('1:1');
  
  styles = [
    'No Style',
    'Photorealistic',
    'Cinematic',
    'Cartoon',
    'Anime / Manga',
    'Cyberpunk',
    '3D Render',
    'Oil Painting',
    'Watercolor',
    'Pixel Art',
    'Logo Design',
    'Abstract'
  ];
  selectedStyle = signal('No Style');

  isLoading = signal(false);
  generatedImage = signal<string | null>(null);

  async generate() {
    if (!this.prompt()) return;
    this.isLoading.set(true);
    this.generatedImage.set(null);
    
    // Construct prompt with style
    let finalPrompt = this.prompt();
    if (this.selectedStyle() !== 'No Style') {
      finalPrompt = `${this.selectedStyle()} style: ${finalPrompt}`;
    }

    try {
      const result = await this.geminiService.generateImage(finalPrompt, this.aspectRatio());
      this.generatedImage.set(result);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to generate image. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
