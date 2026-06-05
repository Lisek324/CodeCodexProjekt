import { Component, inject } from '@angular/core';
import { AuthService, MyCoursesResponse } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-angular-detail',
  imports: [CommonModule,RouterLink],
  templateUrl: './angular-detail.html',
  styleUrl: './angular-detail.css',
})
export class AngularDetail {
  readonly ANGULAR_COURSE_ID = 2;

  isLoggedIn = false;
  service = inject(AuthService);
  router = inject(Router);

  hasAngularCourse$ = this.service.hasCourse(this.ANGULAR_COURSE_ID);
  redirectToCourse(courseId: number) {
    if (this.service.isLoggedIn()) {
      this.service.getCourses().subscribe({
        next: (x) => {
          const angularCourse = x.find((course: MyCoursesResponse) => course.id === courseId);
          if (angularCourse) {
            this.router.navigate(['/course']);
          }
        }
      });
    }

  }
  buyAngularCourse(courseId: number) {
    this.service.buyCourse(courseId).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
