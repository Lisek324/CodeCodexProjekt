import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-angular-detail',
  imports: [CommonModule,RouterLink],
  templateUrl: './angular-detail.html',
  styleUrl: './angular-detail.css',
})
export class AngularDetail {
  isLoggedIn = false;
  service = inject(AuthService);
  router = inject(Router);

  hasAngularCourse$ = this.service.hasCourse(2);
  redirectToCourse(courseId: number) {
    if (this.service.isLoggedIn()) {
      this.service.getCourses().subscribe({
        next: (x: any) => {
          const angularCourse = x.find((course: any) => course.id === courseId);
          if (angularCourse) {
            this.router.navigate(['/course']);
          }
        }
      });
    }

  }
  buyAngularCourse(courseId: number) {
    this.service.buyCourse(courseId).subscribe({
      next: (res: any) => {
        window.location.href = res.url;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
