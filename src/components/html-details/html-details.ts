import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-html-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './html-details.html',
  styleUrl: './html-details.css',
})
export class HtmlDetails implements OnInit {
  readonly HTML_COURSE_ID = 1;
  service = inject(AuthService);
  router = inject(Router);
  hasHtmlCourse$!: Observable<boolean>;

  buyHtmlCourse(courseId: number) {
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
          const htmlCourse = x.find((course: any) => course.id === courseId);
          if (htmlCourse) {
            this.router.navigate(['/course']);
          }
        }
      });
    }

  }
  ngOnInit(): void {
    this.hasHtmlCourse$ = this.service.hasCourse(1);
  }
}

