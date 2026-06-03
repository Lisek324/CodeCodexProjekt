import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  router = inject(Router);
  service = inject(AuthService);
  courses = signal<any[]>([]);
  isLoading = signal(true);

  redirectToCourse(arg0: any) {
    this.router.navigate(['/courses']);
  }

  ngOnInit(): void {
    this.service.getCourses().subscribe({
      next: (res) => {
        this.courses.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}
