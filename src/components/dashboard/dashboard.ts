import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  service=inject(AuthService);
  courses = signal<any[]>([]);

  ngOnInit(): void {
    this.service.getCourses().subscribe({
      next: (x: any) => {
        this.courses.set(x);
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
      }
    });
  }
}
