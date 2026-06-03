import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cpp-details',
  imports: [CommonModule],
  templateUrl: './cpp-details.html',
  styleUrl: './cpp-details.css',
})
export class CppDetails {
  isLoggedIn: boolean = false;

  service = inject(AuthService);
  router = inject(Router);
  hasCPPCourse$ = this.service.hasCourse(3);

  buyCPPCourse(courseId: number) {
    this.service.buyCourse(courseId).subscribe({
      next: (res: any) => {
        window.location.href = res.url;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  redirectToCourse(courseId: number) {
    if (this.service.isLoggedIn()) {
      this.service.getCourses().subscribe({
        next: (x: any) => {
          const cppCourse = x.find((course: any) => course.id === courseId);
          if (cppCourse) {
            this.router.navigate(['/course']);
          }
        }
      });
    }

  }
}
