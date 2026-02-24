import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NotificationComponent, BackToTopComponent],
  template: `
    <app-navbar></app-navbar>
    <app-notification></app-notification>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-back-to-top></app-back-to-top>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NobleStep Shop';
}
