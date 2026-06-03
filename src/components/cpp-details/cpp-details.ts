import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cpp-details',
  imports: [CommonModule,RouterLink],
  templateUrl: './cpp-details.html',
  styleUrl: './cpp-details.css',
})
export class CppDetails {
  readonly CPP_COURSE_ID = 3;

  isLoggedIn: boolean = false;

  service = inject(AuthService);
  router = inject(Router);
  hasCPPCourse$ = this.service.hasCourse(this.CPP_COURSE_ID);

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
