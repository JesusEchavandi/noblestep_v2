import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode$ = new BehaviorSubject<boolean>(false);
  private readonly THEME_KEY = 'noblestep-theme';

  constructor() {
    this.loadTheme();
  }

  getTheme(): Observable<boolean> {
    return this.isDarkMode$.asObservable();
  }

  isDarkMode(): boolean {
    return this.isDarkMode$.value;
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkMode$.value;
    this.setTheme(newTheme);
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode$.next(isDark);
    this.applyTheme(isDark);
    this.saveTheme(isDark);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme !== null) {
      const isDark = savedTheme === 'dark';
      this.isDarkMode$.next(isDark);
      this.applyTheme(isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark);
    }
  }

  private saveTheme(isDark: boolean): void {
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}
