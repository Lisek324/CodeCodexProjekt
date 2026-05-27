import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-html-details',
  imports: [CommonModule],
  templateUrl: './html-details.html',
  styleUrl: './html-details.css',
})
export class HtmlDetails {
  service = inject(AuthService);
  
  isLoggedIn = false;

  modules = [
    { title: 'Wprowadzenie do HTML5', lessons: 6, time: '45 min', completed: true },
    { title: 'Semantyczne znaczniki HTML', lessons: 8, time: '60 min', completed: true },
    { title: 'Podstawy CSS3', lessons: 10, time: '85 min', completed: false },
    { title: 'Flexbox i Grid', lessons: 7, time: '70 min', completed: false },
    { title: 'Responsywność i media queries', lessons: 6, time: '55 min', completed: false },
    { title: 'JavaScript dla początkujących', lessons: 12, time: '110 min', completed: false }
  ];

  buyHTMLCourse(courseId: number) {
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
