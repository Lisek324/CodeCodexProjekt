import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
redirectToCourse(arg0: any) {
throw new Error('Method not implemented.');
}

  service=inject(AuthService);
  courses = signal<any[]>([]);
  isLoading = signal(true);
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
