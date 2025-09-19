import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  private route = inject(ActivatedRoute);
  data: any[] = [];
  ngOnInit() {
    this.data = this.route.snapshot.data['products'];
  };
}
