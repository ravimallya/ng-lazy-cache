import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<p>Resolved Data: {{ data }}</p>`
})
export class HomeComponent {
  data: string;

  constructor(route: ActivatedRoute) {
    this.data = route.snapshot.data['data'];
  }
}