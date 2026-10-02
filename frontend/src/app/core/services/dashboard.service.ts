import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ComplianceAnalyticsSummary,
  ContractAnalyticsSummary,
  DashboardSummaryResponse,
  DepartmentAnalyticsSummary,
  ObligationAnalyticsSummary,
  RenewalAnalyticsSummary,
  RiskContractSummary
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardSummaryResponse> {
    return this.http.get<DashboardSummaryResponse>(`${this.baseUrl}/dashboard/summary`);
  }

  getContractSummary(): Observable<ContractAnalyticsSummary> {
    return this.http.get<ContractAnalyticsSummary>(`${this.baseUrl}/reports/contracts/summary`);
  }

  getObligationSummary(): Observable<ObligationAnalyticsSummary> {
    return this.http.get<ObligationAnalyticsSummary>(`${this.baseUrl}/reports/obligations/summary`);
  }

  getRenewalSummary(): Observable<RenewalAnalyticsSummary> {
    return this.http.get<RenewalAnalyticsSummary>(`${this.baseUrl}/reports/renewals/summary`);
  }

  getComplianceSummary(): Observable<ComplianceAnalyticsSummary> {
    return this.http.get<ComplianceAnalyticsSummary>(`${this.baseUrl}/reports/compliance/summary`);
  }

  getRiskContracts(): Observable<RiskContractSummary[]> {
    return this.http.get<RiskContractSummary[]>(`${this.baseUrl}/reports/risk`);
  }

  getDepartmentSummary(): Observable<DepartmentAnalyticsSummary> {
    return this.http.get<DepartmentAnalyticsSummary>(`${this.baseUrl}/reports/departments/summary`);
  }

  // --- Mock / Fallback Demo Methods ---

  getMockDashboardSummary(): Observable<DashboardSummaryResponse> {
    return of({
      contracts: {
        total: 24,
        active: 14,
        draft: 4,
        under_review: 3,
        approved: 2,
        expired: 2,
        terminated: 1
      },
      obligations: {
        total: 48,
        pending: 12,
        in_progress: 18,
        completed: 14,
        overdue: 3,
        delayed: 1
      },
      renewals: {
        upcoming: 5,
        in_progress: 3,
        renewed: 8,
        expired: 2,
        cancelled: 0
      },
      compliance: {
        compliant: 18,
        pending: 3,
        delayed: 1,
        non_compliant: 1,
        high_risk: 1
      }
    });
  }

  getMockContractSummary(): Observable<ContractAnalyticsSummary> {
    return of({
      total_contracts: 24,
      active_contracts: 14,
      draft_contracts: 4,
      under_review_contracts: 3,
      approved_contracts: 2,
      expired_contracts: 2,
      terminated_contracts: 1,
      contracts_by_category: {
        'Software & SaaS': 9,
        'Vendor Services': 6,
        'Non-Disclosure Agreement': 4,
        'Employment & HR': 3,
        'Real Estate Lease': 2
      }
    });
  }

  getMockObligationSummary(): Observable<ObligationAnalyticsSummary> {
    return of({
      total_obligations: 48,
      pending_obligations: 12,
      in_progress_obligations: 18,
      completed_obligations: 14,
      delayed_obligations: 1,
      overdue_obligations: 3
    });
  }

  getMockRenewalSummary(): Observable<RenewalAnalyticsSummary> {
    return of({
      upcoming_renewals: 5,
      renewals_in_progress: 3,
      renewed_contracts: 8,
      expired_renewals: 2,
      cancelled_renewals: 0,
      contracts_approaching_expiry: [
        {
          contract_id: 101,
          contract_number: 'CNT-2024-001',
          title: 'Cloud Enterprise Infrastructure License',
          expiry_date: '2026-10-15',
          days_remaining: 15
        },
        {
          contract_id: 102,
          contract_number: 'CNT-2024-009',
          title: 'Global IT Managed Support Services',
          expiry_date: '2026-10-30',
          days_remaining: 30
        },
        {
          contract_id: 103,
          contract_number: 'CNT-2024-014',
          title: 'Corporate HQ Security & Facilities Agreement',
          expiry_date: '2026-11-12',
          days_remaining: 43
        }
      ]
    });
  }

  getMockComplianceSummary(): Observable<ComplianceAnalyticsSummary> {
    return of({
      total_contracts_evaluated: 24,
      compliant_contracts: 18,
      pending_contracts: 3,
      delayed_contracts: 1,
      non_compliant_contracts: 1,
      high_risk_contracts: 1,
      average_compliance_score: 92.5
    });
  }

  getMockRiskContracts(): Observable<RiskContractSummary[]> {
    return of([
      {
        contract_id: 101,
        contract_number: 'CNT-2024-007',
        title: 'Third-Party Payment Gateway Integration',
        risk_level: 'High',
        overdue_obligations: 2,
        compliance_score: 65.0
      },
      {
        contract_id: 104,
        contract_number: 'CNT-2024-019',
        title: 'Legacy Data Center Hardware Support',
        risk_level: 'Medium',
        overdue_obligations: 1,
        compliance_score: 78.0
      }
    ]);
  }

  getMockDepartmentSummary(): Observable<DepartmentAnalyticsSummary> {
    return of({
      departments: [
        { department: 'IT & Infrastructure', contracts: 10, obligations: 22, overdue: 1 },
        { department: 'Legal & Compliance', contracts: 6, obligations: 12, overdue: 1 },
        { department: 'Human Resources', contracts: 5, obligations: 8, overdue: 0 },
        { department: 'Finance & Accounting', contracts: 3, obligations: 6, overdue: 1 }
      ]
    });
  }

  downloadPdfReport(reportType: 'contracts' | 'obligations' | 'renewals' | 'compliance'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${reportType}/export/pdf`, {
      responseType: 'blob'
    });
  }

  downloadExcelReport(reportType: 'contracts' | 'obligations' | 'renewals' | 'compliance'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${reportType}/export/excel`, {
      responseType: 'blob'
    });
  }
}
