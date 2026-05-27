import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-cpp-details',
  imports: [],
  templateUrl: './cpp-details.html',
  styleUrl: './cpp-details.css',
})
export class CppDetails {
  isLoggedIn: boolean = false;

  service = inject(AuthService);

    buyCPPCourse(courseId: number) {
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
