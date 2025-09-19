import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product {
  private route = inject(ActivatedRoute);
  product: any;
  ngOnInit() {
    this.product = this.route.snapshot.data['product'];
  }
}
