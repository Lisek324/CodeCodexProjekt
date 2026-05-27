import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-angular-detail',
  imports: [],
  templateUrl: './angular-detail.html',
  styleUrl: './angular-detail.css',
})
export class AngularDetail {
   isLoggedIn = false;
service = inject(AuthService);

    buyAngularCourse(courseId: number) {
    this.service.buyCourse(courseId).subscribe({
      next: (res: any) => {
        window.location.href = res.url;
        } ,
        error: (err) => {
          console.error(err);
      }
    });
  }
}
