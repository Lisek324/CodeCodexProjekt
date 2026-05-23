import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  logout(): void {
   // Implement logout logic here, such as clearing authentication tokens and redirecting to the login page.
  }
}
