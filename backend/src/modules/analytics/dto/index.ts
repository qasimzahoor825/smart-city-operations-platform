export interface AnalyticsOverview {
  totalCitizens: number;
  totalOfficers: number;
  totalDepartments: number;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  pendingReview: number;
  fieldInspections: number;
  slaViolations: number;
  slaComplianceRate: number;
  avgResolutionHours: number;
  resolutionRate: number;
  activeAssets: number;
  assetsInMaintenance: number;
  activeEmergencies: number;
  totalEmergencies: number;
  pendingServiceRequests: number;
  totalFeedback: number;
  avgCitizenRating: number;
  generatedAt: string;
}

export interface ValueCount {
  key: string;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface DepartmentAnalytics {
  departmentId: string | null;
  departmentName: string | null;
  total: number;
  open: number;
  resolved: number;
  avgResolutionHours: number;
  slaViolations: number;
  officerCount: number;
  assets: number;
}

export interface AssetAnalytics {
  total: number;
  byStatus: ValueCount[];
  byCategory: ValueCount[];
  byDepartment: ValueCount[];
  operationalRate: number;
  healthScore: number;
}

export interface SlaAnalytics {
  complianceRate: number;
  violatedCount: number;
  atRiskCount: number;
  averageHours: number;
  byPriority: ValueCount[];
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface ForecastResult {
  days: number;
  windowDays: number;
  method: string;
  trend: "increasing" | "decreasing" | "stable";
  slope: number;
  avgDaily: number;
  historical: { date: string; value: number }[];
  forecast: ForecastPoint[];
  meta: {
    rSquared: number;
    residualStd: number;
    seasonalityDetected: boolean;
  };
  generatedAt: string;
}