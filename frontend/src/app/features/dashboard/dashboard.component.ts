import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ComplianceAnalyticsSummary,
  ContractAnalyticsSummary,
  ContractApproachingExpiry,
  DashboardSummaryResponse,
  ObligationAnalyticsSummary,
  RenewalAnalyticsSummary,
  RiskContractSummary
} from '../../core/models/dashboard.model';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-page">
      <!-- Header Banner -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Executive Dashboard</h1>
          <p class="page-subtitle">Real-time overview of contracts, obligations, renewals, compliance, and risk indicators.</p>
        </div>
        <div class="actions-group">
          <button mat-stroked-button (click)="loadDashboardData()" [disabled]="isLoading">
            <mat-icon>refresh</mat-icon>
            <span>Refresh Data</span>
          </button>
          <button mat-flat-button color="primary" (click)="exportPdf('contracts')">
            <mat-icon>picture_as_pdf</mat-icon>
            <span>Export PDF</span>
          </button>
          <button mat-flat-button color="accent" (click)="exportExcel('contracts')">
            <mat-icon>table_view</mat-icon>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Fetching real-time dashboard analytics from FastAPI backend...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="hasError && !isLoading" class="error-card">
        <mat-icon color="warn">error</mat-icon>
        <div>
          <h3>Failed to load dashboard statistics</h3>
          <p>Please verify backend connection and try again.</p>
        </div>
        <button mat-raised-button color="warn" (click)="loadDashboardData()">Retry</button>
      </div>

      <!-- Main Analytics Content -->
      <div *ngIf="!isLoading && !hasError" class="dashboard-content">

        <!-- 8 Key Performance Indicators Cards -->
        <div class="kpi-grid">
          <!-- Card 1: Total Contracts -->
          <mat-card class="kpi-card card-blue">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Total Contracts</span>
                <span class="kpi-value">{{ summary?.contracts?.total || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-blue-100 text-blue-600">
                <mat-icon>description</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>Active: <strong>{{ summary?.contracts?.active || 0 }}</strong> | Draft: <strong>{{ summary?.contracts?.draft || 0 }}</strong></span>
            </div>
          </mat-card>

          <!-- Card 2: Active Contracts -->
          <mat-card class="kpi-card card-emerald">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Active Contracts</span>
                <span class="kpi-value">{{ summary?.contracts?.active || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-emerald-100 text-emerald-600">
                <mat-icon>check_circle</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>Under Review: <strong>{{ summary?.contracts?.under_review || 0 }}</strong></span>
            </div>
          </mat-card>

          <!-- Card 3: Expired Contracts -->
          <mat-card class="kpi-card card-amber">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Expired Contracts</span>
                <span class="kpi-value">{{ summary?.contracts?.expired || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-amber-100 text-amber-600">
                <mat-icon>timer_off</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>Terminated: <strong>{{ summary?.contracts?.terminated || 0 }}</strong></span>
            </div>
          </mat-card>

          <!-- Card 4: Total Obligations -->
          <mat-card class="kpi-card card-indigo">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Total Obligations</span>
                <span class="kpi-value">{{ summary?.obligations?.total || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-indigo-100 text-indigo-600">
                <mat-icon>assignment</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>Completed: <strong>{{ summary?.obligations?.completed || 0 }}</strong></span>
            </div>
          </mat-card>

          <!-- Card 5: Overdue Obligations -->
          <mat-card class="kpi-card card-rose">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Overdue Tasks</span>
                <span class="kpi-value text-rose-600">{{ summary?.obligations?.overdue || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-rose-100 text-rose-600">
                <mat-icon>warning</mat-icon>
              </div>
            </div>
            <div class="kpi-footer text-rose-600">
              <span>Immediate Attention Required</span>
            </div>
          </mat-card>

          <!-- Card 6: Upcoming Renewals -->
          <mat-card class="kpi-card card-purple">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Upcoming Renewals</span>
                <span class="kpi-value">{{ summary?.renewals?.upcoming || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-purple-100 text-purple-600">
                <mat-icon>autorenew</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>In Progress: <strong>{{ summary?.renewals?.in_progress || 0 }}</strong></span>
            </div>
          </mat-card>

          <!-- Card 7: High Risk Contracts -->
          <mat-card class="kpi-card card-red">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">High Risk Contracts</span>
                <span class="kpi-value text-red-600">{{ summary?.compliance?.high_risk || 0 }}</span>
              </div>
              <div class="kpi-icon-wrapper bg-red-100 text-red-600">
                <mat-icon>report_problem</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>Non-Compliant: <strong>{{ summary?.compliance?.non_compliant || 0 }}</strong></span>
            </div>
          </mat-card>

          <!-- Card 8: Average Compliance Score -->
          <mat-card class="kpi-card card-teal">
            <div class="kpi-body">
              <div>
                <span class="kpi-label">Avg Compliance Score</span>
                <span class="kpi-value text-teal-700">{{ complianceAnalytics?.average_compliance_score || 100 }}%</span>
              </div>
              <div class="kpi-icon-wrapper bg-teal-100 text-teal-700">
                <mat-icon>gavel</mat-icon>
              </div>
            </div>
            <div class="kpi-footer">
              <span>Compliant: <strong>{{ summary?.compliance?.compliant || 0 }}</strong></span>
            </div>
          </mat-card>
        </div>

        <!-- Visual Analytics Charts Row -->
        <div class="charts-grid">
          <!-- Chart 1: Contract Status Distribution -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Contract Status Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-box">
              <canvas #contractStatusCanvas></canvas>
            </mat-card-content>
          </mat-card>

          <!-- Chart 2: Obligation Progress Chart -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Obligation Tracking Status</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-box">
              <canvas #obligationStatusCanvas></canvas>
            </mat-card-content>
          </mat-card>

          <!-- Chart 3: Compliance Status Chart -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Compliance Risk Breakdown</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-box">
              <canvas #complianceCanvas></canvas>
            </mat-card-content>
          </mat-card>

          <!-- Chart 4: Contract Category Breakdown -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Contracts by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content class="chart-box">
              <canvas #categoryCanvas></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tables Row: High-Risk Contracts & Upcoming Renewals -->
        <div class="tables-grid">
          <!-- High Risk Contracts Attention Table -->
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title class="flex-title">
                <mat-icon color="warn">warning</mat-icon>
                <span>High-Risk Contracts Requiring Attention</span>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="riskContracts.length === 0" class="empty-state">
                <mat-icon class="text-emerald-500">check_circle_outline</mat-icon>
                <p>No high-risk contracts identified. All evaluate compliant!</p>
              </div>

              <table mat-table [dataSource]="riskContracts" *ngIf="riskContracts.length > 0" class="w-full">
                <ng-container matColumnDef="contract_number">
                  <th mat-header-cell *matHeaderCellDef>Contract #</th>
                  <td mat-cell *matCellDef="let element">
                    <strong>{{ element.contract_number }}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Title</th>
                  <td mat-cell *matCellDef="let element">{{ element.title }}</td>
                </ng-container>

                <ng-container matColumnDef="risk_level">
                  <th mat-header-cell *matHeaderCellDef>Risk Level</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="badge badge-high-risk" *ngIf="element.risk_level === 'High'">High</span>
                    <span class="badge badge-medium-risk" *ngIf="element.risk_level === 'Medium'">Medium</span>
                    <span class="badge badge-low-risk" *ngIf="element.risk_level === 'Low'">Low</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="overdue_obligations">
                  <th mat-header-cell *matHeaderCellDef>Overdue</th>
                  <td mat-cell *matCellDef="let element" class="text-rose-600 font-bold">
                    {{ element.overdue_obligations }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="compliance_score">
                  <th mat-header-cell *matHeaderCellDef>Score</th>
                  <td mat-cell *matCellDef="let element">
                    {{ element.compliance_score }}%
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="riskColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: riskColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>

          <!-- Upcoming Renewals Table -->
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title class="flex-title">
                <mat-icon color="primary">autorenew</mat-icon>
                <span>Contracts Approaching Expiry</span>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="approachingRenewals.length === 0" class="empty-state">
                <mat-icon class="text-blue-500">info_outline</mat-icon>
                <p>No contracts expiring within 60 days.</p>
              </div>

              <table mat-table [dataSource]="approachingRenewals" *ngIf="approachingRenewals.length > 0" class="w-full">
                <ng-container matColumnDef="contract_number">
                  <th mat-header-cell *matHeaderCellDef>Contract #</th>
                  <td mat-cell *matCellDef="let element">
                    <strong>{{ element.contract_number }}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Title</th>
                  <td mat-cell *matCellDef="let element">{{ element.title }}</td>
                </ng-container>

                <ng-container matColumnDef="expiry_date">
                  <th mat-header-cell *matHeaderCellDef>Expiry Date</th>
                  <td mat-cell *matCellDef="let element">{{ element.expiry_date }}</td>
                </ng-container>

                <ng-container matColumnDef="days_remaining">
                  <th mat-header-cell *matHeaderCellDef>Days Left</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="badge badge-review">{{ element.days_remaining }} days</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="renewalColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: renewalColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .page-subtitle {
      margin-top: 4px;
      color: #64748b;
      font-size: 0.875rem;
    }
    .actions-group {
      display: flex;
      gap: 12px;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
      color: #64748b;
    }
    .error-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background-color: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 12px;
      color: #991b1b;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .kpi-card {
      padding: 16px;
      background-color: #ffffff !important;
      border: 1px solid #e2e8f0;
      border-radius: 12px;

      .kpi-body {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .kpi-label {
        display: block;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .kpi-value {
        font-size: 2.25rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.2;
        margin-top: 4px;
      }
      .kpi-icon-wrapper {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
      .kpi-footer {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
        font-size: 0.75rem;
        color: #64748b;
        font-weight: 500;

        strong {
          color: #0f172a;
        }
      }
    }

    .card-blue { border-top: 4px solid #2563eb !important; }
    .card-emerald { border-top: 4px solid #059669 !important; }
    .card-amber { border-top: 4px solid #d97706 !important; }
    .card-indigo { border-top: 4px solid #4338ca !important; }
    .card-rose { border-top: 4px solid #be123c !important; }
    .card-purple { border-top: 4px solid #7e22ce !important; }
    .card-teal { border-top: 4px solid #0f766e !important; }
    .card-cyan { border-top: 4px solid #0e7490 !important; }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 20px;
    }
    .chart-card {
      padding: 16px;
    }
    .chart-box {
      height: 260px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 20px;
    }
    .table-card {
      padding: 16px;
    }
    .flex-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 700;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: #64748b;
      gap: 8px;

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }
    .w-full {
      width: 100%;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('contractStatusCanvas') contractStatusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('obligationStatusCanvas') obligationStatusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('complianceCanvas') complianceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef<HTMLCanvasElement>;

  summary: DashboardSummaryResponse | null = null;
  contractAnalytics: ContractAnalyticsSummary | null = null;
  obligationAnalytics: ObligationAnalyticsSummary | null = null;
  renewalAnalytics: RenewalAnalyticsSummary | null = null;
  complianceAnalytics: ComplianceAnalyticsSummary | null = null;
  riskContracts: RiskContractSummary[] = [];
  approachingRenewals: ContractApproachingExpiry[] = [];

  isLoading = true;
  hasError = false;

  riskColumns: string[] = ['contract_number', 'title', 'risk_level', 'overdue_obligations', 'compliance_score'];
  renewalColumns: string[] = ['contract_number', 'title', 'expiry_date', 'days_remaining'];

  private charts: Chart[] = [];

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Canvas renders when data is loaded
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
        this.loadDetailedAnalytics();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.authService.logout();
          return;
        }
        this.hasError = true;
        this.notificationService.showError('Error connecting to FastAPI backend summary API.');
      }
    });
  }

  private loadDetailedAnalytics(): void {
    this.dashboardService.getContractSummary().subscribe({
      next: (res) => {
        this.contractAnalytics = res;
        this.renderCategoryChart();
        this.renderContractStatusChart();
      }
    });

    this.dashboardService.getObligationSummary().subscribe({
      next: (res) => {
        this.obligationAnalytics = res;
        this.renderObligationChart();
      }
    });

    this.dashboardService.getRenewalSummary().subscribe({
      next: (res) => {
        this.renewalAnalytics = res;
        this.approachingRenewals = res.contracts_approaching_expiry || [];
      }
    });

    this.dashboardService.getComplianceSummary().subscribe({
      next: (res) => {
        this.complianceAnalytics = res;
        this.renderComplianceChart();
      }
    });

    this.dashboardService.getRiskContracts().subscribe({
      next: (res) => {
        this.riskContracts = res || [];
      }
    });
  }

  private renderContractStatusChart(): void {
    if (!this.contractStatusCanvas || !this.summary) return;
    const ctx = this.contractStatusCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const c = this.summary.contracts;
    this.createChart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Draft', 'Under Review', 'Expired', 'Terminated'],
        datasets: [{
          data: [c.active, c.draft, c.under_review, c.expired, c.terminated],
          backgroundColor: ['#10b981', '#64748b', '#f59e0b', '#ef4444', '#94a3b8']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private renderObligationChart(): void {
    if (!this.obligationStatusCanvas || !this.summary) return;
    const ctx = this.obligationStatusCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const o = this.summary.obligations;
    this.createChart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pending', 'In Progress', 'Completed', 'Delayed', 'Overdue'],
        datasets: [{
          label: 'Obligation Count',
          data: [o.pending, o.in_progress, o.completed, o.delayed, o.overdue],
          backgroundColor: ['#64748b', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private renderComplianceChart(): void {
    if (!this.complianceCanvas || !this.summary) return;
    const ctx = this.complianceCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const comp = this.summary.compliance;
    this.createChart(ctx, {
      type: 'pie',
      data: {
        labels: ['Compliant', 'Pending', 'Delayed', 'Non-Compliant', 'High Risk'],
        datasets: [{
          data: [comp.compliant, comp.pending, comp.delayed, comp.non_compliant, comp.high_risk],
          backgroundColor: ['#10b981', '#cbd5e1', '#f59e0b', '#f43f5e', '#be123c']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private renderCategoryChart(): void {
    if (!this.categoryCanvas || !this.contractAnalytics) return;
    const ctx = this.categoryCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const catMap = this.contractAnalytics.contracts_by_category || {};
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    this.createChart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Software', 'Vendor', 'Service'],
        datasets: [{
          label: 'Contracts',
          data: data.length ? data : [0, 0, 0],
          backgroundColor: '#0284c7'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private createChart(ctx: CanvasRenderingContext2D, config: any): void {
    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }

  exportPdf(type: 'contracts' | 'obligations' | 'renewals' | 'compliance'): void {
    this.notificationService.showInfo('Generating PDF report from backend...');
    this.dashboardService.downloadPdfReport(type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ContractIQ_${type.toUpperCase()}_Report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('PDF downloaded successfully!');
      },
      error: () => this.notificationService.showError('Failed to generate PDF report.')
    });
  }

  exportExcel(type: 'contracts' | 'obligations' | 'renewals' | 'compliance'): void {
    this.notificationService.showInfo('Generating Excel spreadsheet...');
    this.dashboardService.downloadExcelReport(type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ContractIQ_${type.toUpperCase()}_Report.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Excel downloaded successfully!');
      },
      error: () => this.notificationService.showError('Failed to generate Excel report.')
    });
  }
}
