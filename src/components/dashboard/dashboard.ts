import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService, MyCoursesResponse } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  router = inject(Router);
  service = inject(AuthService);
  courses = signal<MyCoursesResponse[]>([]);
  isLoading = signal(true);

  redirectToCourse(id: number) {
    this.router.navigate(['/courses', id]);
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
