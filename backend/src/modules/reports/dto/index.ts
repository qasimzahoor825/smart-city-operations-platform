export interface ReportOverview {
  departments: number;
  officers: number;
  assets: number;
  complaints: number;
  emergencies: number;
  appointments: number;
  generatedAt: string;
}

export interface DepartmentBreakdown {
  departmentId: string | null;
  departmentName: string | null;
  total: number;
  open: number;
  resolved: number;
  avgResolutionHours: number;
}

export interface ReportAnalytics {
  totalComplaints: number;
  resolvedComplaints: number;
  resolutionRate: number;
  avgResolutionHours: number;
  slaBreachCount: number;
  byDepartment: DepartmentBreakdown[];
  generatedAt: string;
}

export interface ExportReportQuery {
  format?: "json" | "csv";
}

export interface ReportExport {
  format: "json" | "csv";
  generatedAt: string;
  data: unknown;
}