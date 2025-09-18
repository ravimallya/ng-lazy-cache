import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html', // Updated to match new file name
  styleUrls: ['./app.component.scss'] // Updated to match new file name
})
export class AppComponent {
  protected readonly title = signal('demo-app');
}