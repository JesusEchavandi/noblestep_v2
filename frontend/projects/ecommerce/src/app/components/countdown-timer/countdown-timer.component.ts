import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!expired) {
      <div class="countdown-timer">
        <div class="timer-label">{{ label }}</div>
        <div class="timer-display">
          <div class="time-unit">
            <div class="time-value">{{ days }}</div>
            <div class="time-label">Días</div>
          </div>
          <div class="separator">:</div>
          <div class="time-unit">
            <div class="time-value">{{ hours }}</div>
            <div class="time-label">Horas</div>
          </div>
          <div class="separator">:</div>
          <div class="time-unit">
            <div class="time-value">{{ minutes }}</div>
            <div class="time-label">Min</div>
          </div>
          <div class="separator">:</div>
          <div class="time-unit">
            <div class="time-value">{{ seconds }}</div>
            <div class="time-label">Seg</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .countdown-timer {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: var(--color-white);
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      text-align: center;
      box-shadow: var(--shadow-lg);
    }

    .timer-label {
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--spacing-sm);
      opacity: 0.9;
    }

    .timer-display {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .time-unit {
      background: rgba(255, 255, 255, 0.15);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      min-width: 60px;
      backdrop-filter: blur(10px);
    }

    .time-value {
      font-size: var(--font-size-3xl);
      font-weight: bold;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .time-label {
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-xs);
      opacity: 0.8;
    }

    .separator {
      font-size: var(--font-size-2xl);
      font-weight: bold;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0.3; }
    }

    @media (max-width: 768px) {
      .time-unit {
        min-width: 50px;
        padding: var(--spacing-xs) var(--spacing-sm);
      }

      .time-value {
        font-size: var(--font-size-2xl);
      }

      .time-label {
        font-size: 0.65rem;
      }
    }
  `]
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() endDate!: Date;
  @Input() label: string = 'Oferta termina en:';

  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  expired: boolean = false;

  private interval: any;

  ngOnInit() {
    this.updateTimer();
    this.interval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  updateTimer() {
    const now = new Date().getTime();
    const end = new Date(this.endDate).getTime();
    const distance = end - now;

    if (distance < 0) {
      this.expired = true;
      if (this.interval) {
        clearInterval(this.interval);
      }
      return;
    }

    this.days = this.pad(Math.floor(distance / (1000 * 60 * 60 * 24)));
    this.hours = this.pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    this.minutes = this.pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    this.seconds = this.pad(Math.floor((distance % (1000 * 60)) / 1000));
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
