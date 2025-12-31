
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatViewComponent } from './components/chat-view.component';
import { ImageViewComponent } from './components/image-view.component';
import { VideoViewComponent } from './components/video-view.component';
import { WriterViewComponent } from './components/writer-view.component';
import { CodeViewComponent } from './components/code-view.component';

type View = 'dashboard' | 'chat' | 'image' | 'video' | 'writer' | 'web' | 'app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ChatViewComponent, 
    ImageViewComponent, 
    VideoViewComponent, 
    WriterViewComponent, 
    CodeViewComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  currentView = signal<View>('dashboard');

  setView(view: View) {
    this.currentView.set(view);
  }

  // Helper for dashboard cards
  tools = [
    { id: 'chat', name: 'AI Chatbot', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', color: 'bg-blue-600', desc: 'Interactive assistant' },
    { id: 'image', name: 'Image Generator', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', customIcon: true, color: 'bg-purple-600', desc: 'Text to image creation' },
    { id: 'video', name: 'Video Generator', icon: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z', color: 'bg-rose-600', desc: 'Motion from text' },
    { id: 'writer', name: 'Content Writer', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', color: 'bg-green-600', desc: 'Blogs, emails & more' },
    { id: 'web', name: 'Website Builder', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20', color: 'bg-orange-600', desc: 'Generate web code' },
    { id: 'app', name: 'App Architect', icon: 'M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', color: 'bg-cyan-600', desc: 'App concepts & code' },
  ];
}
