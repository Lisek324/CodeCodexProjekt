import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MaterialModule } from './material/material.module';
import { AuthService } from '../services/auth-service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink, MaterialModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('projektKursy');
  service = inject(AuthService);
  avatar = this.service.avatarUrl();
}
