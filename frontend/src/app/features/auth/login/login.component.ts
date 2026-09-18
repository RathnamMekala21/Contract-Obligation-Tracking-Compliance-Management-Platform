import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header class="login-header">
          <div class="brand-logo">
            <mat-icon class="shield-icon">shield</mat-icon>
            <h1>Contract<span class="text-accent">IQ</span></h1>
          </div>
          <p class="subtitle">Compliance & Obligation Management Platform</p>
        </mat-card-header>

        <mat-card-content class="login-body">
          <div *ngIf="errorMessage" class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="name@company.com">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="••••••••">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div class="form-actions-row">
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-btn"
              [disabled]="loginForm.invalid || isLoading"
            >
              <mat-spinner diameter="20" *ngIf="isLoading" class="btn-spinner"></mat-spinner>
              <span *ngIf="!isLoading">Sign In</span>
            </button>
          </form>

          <div class="demo-credentials">
            <p class="demo-title">Demo Login Accounts:</p>
            <ul>
              <li><strong>Admin:</strong> user7&#64;contractiq.com / password123</li>
              <li><strong>Contract Manager:</strong> contract.manager&#64;contractiq.com / password123</li>
              <li><strong>Compliance Officer:</strong> user9&#64;contractiq.com / password123</li>
            </ul>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 16px;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 24px;
      border-radius: 16px !important;
      background-color: #ffffff;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
    }
    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .shield-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #0284c7;
    }
    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
    }
    .text-accent {
      color: #0284c7;
    }
    .subtitle {
      margin-top: 4px;
      color: #64748b;
      font-size: 0.875rem;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .w-full {
      width: 100%;
    }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #fef2f2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }
    .form-actions-row {
      display: flex;
      justify-content: flex-end;
      margin-top: -8px;
      margin-bottom: 12px;
    }
    .forgot-link {
      color: #0284c7;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }
    .submit-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      background-color: #0284c7 !important;
      color: #ffffff !important;
    }
    .btn-spinner {
      margin: 0 auto;
    }
    .demo-credentials {
      margin-top: 24px;
      padding: 12px;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
      font-size: 0.75rem;
      color: #475569;
    }
    .demo-title {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .demo-credentials ul {
      margin: 0;
      padding-left: 16px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['contract.manager@contractiq.com', [Validators.required, Validators.email]],
      password: ['password123', [Validators.required, Validators.minLength(4)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.showSuccess('Login successful! Redirecting to dashboard...');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMessage = `Cannot connect to backend API server at ${environment.apiUrl}. The server may be waking up (~30s cold start). Please wait a few seconds and try signing in again.`;
        } else {
          this.errorMessage = err.error?.detail || 'Invalid email or password. Please try again.';
        }
        this.notificationService.showError(this.errorMessage);
      }
    });
  }
}
