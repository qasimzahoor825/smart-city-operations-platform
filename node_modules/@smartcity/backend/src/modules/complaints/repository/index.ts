import { collection } from "../../../core/database/repository";
import { TicketPriority, TicketStatus } from "@prisma/client";

export interface StoredComplaint {
  id: string;
  ref: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  latitude?: number | null;
  longitude?: number | null;
  location?: number[] | null;
  address?: string | null;
  imageUrls: string[];
  slaHours: number;
  slaDeadline: string | null;
  slaBreached: boolean;
  resolvedAt: string | null;
  citizenId: string;
  citizenName: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  escalatedViaSla?: boolean;
  ai?: {
    category?: string | null;
    priority?: string | null;
    departmentId?: string | null;
    departmentName?: string | null;
    summary?: string | null;
    source?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoredComplaintComment {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface StoredComplaintTimeline {
  id: string;
  complaintId: string;
  status: TicketStatus;
  note: string | null;
  actorId: string | null;
  createdAt: string;
}

export interface StoredFeedback {
  id: string;
  complaintId: string;
  citizenId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const nowMs = Date.now();
const hoursAgo = (h: number): string => new Date(nowMs - h * 3_600_000).toISOString();
const hoursFrom = (h: number): string => new Date(nowMs + h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(nowMs - d * 86_400_000).toISOString();

const seedComplaints: StoredComplaint[] = [
  {
    id: "cmp_seed_001",
    ref: "CMP-24-8F3K2A",
    title: "Streetlight out on Main Street",
    description: "The streetlight at the corner of Main and 5th has been out for over a week.",
    category: "STREET_LIGHT",
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    latitude: 31.5497,
    longitude: 74.3436,
    address: "Main St & 5th Ave",
    imageUrls: [],
    slaHours: 12,
    slaDeadline: hoursAgo(4),
    slaBreached: true,
    resolvedAt: null,
    citizenId: "usr_seed_citizen1",
    citizenName: "Sarah Jenkins",
    assignedToId: "usr_seed_officer1",
    assignedToName: "Bilal Ahmed",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(6),
  },
  {
    id: "cmp_seed_002",
    ref: "CMP-24-77LQ0D",
    title: "Large pothole near City Market",
    description: "Deep pothole causing traffic congestion and vehicle damage.",
    category: "ROAD",
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
    latitude: 31.5204,
    longitude: 74.3587,
    address: "City Market roundabout",
    imageUrls: [],
    slaHours: 24,
    slaDeadline: hoursAgo(20),
    slaBreached: false,
    resolvedAt: daysAgo(1),
    citizenId: "usr_seed_citizen2",
    citizenName: "James Carter",
    assignedToId: "usr_seed_officer1",
    assignedToName: "Bilal Ahmed",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  },
  {
    id: "cmp_seed_003",
    ref: "CMP-24-1AW9Q4",
    title: "Water leak flooding sidewalk",
    description: "Underground pipe leak is flooding a residential sidewalk.",
    category: "WATER",
    status: TicketStatus.SUBMITTED,
    priority: TicketPriority.CRITICAL,
    latitude: 31.5598,
    longitude: 74.3522,
    address: "12 Garden Avenue",
    imageUrls: [],
    slaHours: 4,
    slaDeadline: hoursFrom(2),
    slaBreached: false,
    resolvedAt: null,
    citizenId: "usr_seed_citizen1",
    citizenName: "Sarah Jenkins",
    assignedToId: null,
    assignedToName: null,
    departmentId: null,
    departmentName: null,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: "cmp_seed_004",
    ref: "CMP-24-29T6QH",
    title: "Missed garbage collection",
    description: "Garbage bins at the park entrance were not collected this week.",
    category: "GARBAGE",
    status: TicketStatus.ASSIGNED,
    priority: TicketPriority.LOW,
    address: "Riverside Park, west entrance",
    imageUrls: [],
    slaHours: 72,
    slaDeadline: hoursFrom(50),
    slaBreached: false,
    resolvedAt: null,
    citizenId: "usr_seed_citizen2",
    citizenName: "James Carter",
    assignedToId: "usr_seed_officer1",
    assignedToName: "Bilal Ahmed",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: "cmp_seed_005",
    ref: "CMP-24-15N0E8",
    title: "Transformer humming noise",
    description: "Loud humming from the transformer behind the school compounds.",
    category: "ELECTRICITY",
    status: TicketStatus.REJECTED,
    priority: TicketPriority.HIGH,
    imageUrls: [],
    slaHours: 12,
    slaDeadline: hoursAgo(30),
    slaBreached: true,
    resolvedAt: null,
    citizenId: "usr_seed_citizen2",
    citizenName: "James Carter",
    assignedToId: null,
    assignedToName: null,
    departmentId: null,
    departmentName: null,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
  },
  {
    id: "cmp_seed_006",
    ref: "CMP-24-1R5B3M",
    title: "Damaged swings at Central Park",
    description: "Two swings are broken and pose a safety risk to children.",
    category: "PARK",
    status: TicketStatus.CLOSED,
    priority: TicketPriority.MEDIUM,
    address: "Central Park playground",
    imageUrls: [],
    slaHours: 24,
    slaDeadline: hoursAgo(140),
    slaBreached: false,
    resolvedAt: daysAgo(5),
    citizenId: "usr_seed_citizen1",
    citizenName: "Sarah Jenkins",
    assignedToId: "usr_seed_officer1",
    assignedToName: "Bilal Ahmed",
    departmentId: "dept-public-works",
    departmentName: "Public Works",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(5),
  },
];

const seedComments: StoredComplaintComment[] = [
  {
    id: "ccm_seed_001",
    complaintId: "cmp_seed_001",
    authorId: "usr_seed_officer1",
    authorName: "Bilal Ahmed",
    body: "Crew dispatched, bulb replacement ordered.",
    createdAt: hoursAgo(10),
  },
  {
    id: "ccm_seed_002",
    complaintId: "cmp_seed_001",
    authorId: "usr_seed_citizen1",
    authorName: "Sarah Jenkins",
    body: "Thanks for the update, please prioritise the intersection.",
    createdAt: hoursAgo(8),
  },
  {
    id: "ccm_seed_003",
    complaintId: "cmp_seed_002",
    authorId: "usr_seed_citizen2",
    authorName: "James Carter",
    body: "The pothole has been patched. Thank you!",
    createdAt: daysAgo(1),
  },
];

const seedTimelines: StoredComplaintTimeline[] = [
  {
    id: "ctl_seed_001",
    complaintId: "cmp_seed_001",
    status: TicketStatus.SUBMITTED,
    note: "Complaint submitted",
    actorId: "usr_seed_citizen1",
    createdAt: daysAgo(3),
  },
  {
    id: "ctl_seed_002",
    complaintId: "cmp_seed_001",
    status: TicketStatus.ASSIGNED,
    note: "Assigned to Bilal Ahmed",
    actorId: "usr_head-pw",
    createdAt: daysAgo(2),
  },
  {
    id: "ctl_seed_003",
    complaintId: "cmp_seed_001",
    status: TicketStatus.IN_PROGRESS,
    note: "Status changed to IN_PROGRESS. SLA deadline (12h) exceeded",
    actorId: "usr_seed_officer1",
    createdAt: hoursAgo(6),
  },
  {
    id: "ctl_seed_004",
    complaintId: "cmp_seed_002",
    status: TicketStatus.SUBMITTED,
    note: "Complaint submitted",
    actorId: "usr_seed_citizen2",
    createdAt: daysAgo(5),
  },
  {
    id: "ctl_seed_005",
    complaintId: "cmp_seed_002",
    status: TicketStatus.IN_PROGRESS,
    note: "Marked in progress by field crew",
    actorId: "usr_seed_officer1",
    createdAt: daysAgo(3),
  },
  {
    id: "ctl_seed_006",
    complaintId: "cmp_seed_002",
    status: TicketStatus.RESOLVED,
    note: "Pothole patched",
    actorId: "usr_seed_officer1",
    createdAt: daysAgo(1),
  },
  {
    id: "ctl_seed_007",
    complaintId: "cmp_seed_005",
    status: TicketStatus.SUBMITTED,
    note: "Complaint submitted",
    actorId: "usr_seed_citizen2",
    createdAt: daysAgo(4),
  },
  {
    id: "ctl_seed_008",
    complaintId: "cmp_seed_005",
    status: TicketStatus.REJECTED,
    note: "Outside public works jurisdiction",
    actorId: "usr_head-pw",
    createdAt: daysAgo(3),
  },
];

export const complaintRepository = {
  complaints: collection<StoredComplaint>("complaints"),
  comments: collection<StoredComplaintComment>("complaint_comments"),
  timeline: collection<StoredComplaintTimeline>("complaint_timelines"),
  feedback: collection<StoredFeedback>("feedback"),

  // Test fixtures — used by `reset()` in the test runner only, never on boot.
  reset(): void {
    this.complaints.seed(seedComplaints);
    this.comments.seed(seedComments);
    this.timeline.seed(seedTimelines);
    this.feedback.seed([]);
  },
};

export default complaintRepository;