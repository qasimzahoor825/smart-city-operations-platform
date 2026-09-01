import { collection } from "../../../core/database/repository";
import { UserRole } from "@smartcity/common";
import type { DepartmentMember } from "../dto";

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  managerId?: string | null;
  members: DepartmentMember[];
  createdAt: string;
  updatedAt: string;
}

export interface SeedComplaint {
  id: string;
  departmentId: string;
  citizenId: string;
  title: string;
  category?: string;
  status: "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  createdAt: string;
}

export interface OfficerCandidate {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
}

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

const membersOf = (userId: string, fullName: string, email: string, role: UserRole): DepartmentMember => ({
  userId,
  fullName,
  email,
  role,
  joinedAt: daysAgo(40),
});

export const seedDepartments: DepartmentRecord[] = [
  {
    id: "dept-public-works",
    name: "Public Works",
    code: "PW",
    description: "Roads, street lighting and public infrastructure maintenance.",
    managerId: "usr_head-pw",
    members: [
      membersOf("usr_head-pw", "Ayesha Khan", "head@publicworks.gov", UserRole.DEPARTMENT_HEAD),
      membersOf("usr_seed_officer1", "Bilal Ahmed", "officer@publicworks.gov", UserRole.OFFICER),
    ],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(4),
  },
  {
    id: "dept-water-sanitation",
    name: "Water & Sanitation",
    code: "WS",
    description: "Clean water supply, drainage and sanitation services.",
    managerId: "usr_seed_officer2",
    members: [membersOf("usr_seed_officer2", "Mana Patel", "mana@water.gov", UserRole.OFFICER)],
    createdAt: daysAgo(85),
    updatedAt: daysAgo(2),
  },
  {
    id: "dept-health",
    name: "Health Department",
    code: "HD",
    description: "Public health, hospitals and sanitation enforcement.",
    managerId: "usr_head_health",
    members: [
      membersOf("usr_head_health", "Dr. Naila Rehman", "health.head@smartcity.gov", UserRole.DEPARTMENT_HEAD),
      membersOf("usr_officer_health", "Hassan Malik", "health.officer@smartcity.gov", UserRole.OFFICER),
      membersOf("usr_seed_officer3", "Omar Farouk", "omar@health.gov", UserRole.OFFICER),
    ],
    createdAt: daysAgo(66),
    updatedAt: daysAgo(3),
  },
  {
    id: "dept-education",
    name: "Education Department",
    code: "ED",
    description: "Schools, colleges and education infrastructure.",
    managerId: "usr_head_education",
    members: [
      membersOf("usr_head_education", "Prof. Sana Tariq", "education.head@smartcity.gov", UserRole.DEPARTMENT_HEAD),
    ],
    createdAt: daysAgo(62),
    updatedAt: daysAgo(5),
  },
  {
    id: "dept-transport",
    name: "Transport Department",
    code: "TR",
    description: "Public transport, traffic zones and road safety.",
    managerId: "usr_head_transport",
    members: [
      membersOf("usr_head_transport", "Arif Mehmood", "transport.head@smartcity.gov", UserRole.DEPARTMENT_HEAD),
      membersOf("usr_officer_transport", "Zainab Ali", "transport.officer@smartcity.gov", UserRole.OFFICER),
    ],
    createdAt: daysAgo(58),
    updatedAt: daysAgo(6),
  },
  {
    id: "dept-electricity",
    name: "Electricity Authority",
    code: "EA",
    description: "Power grid, street lighting and electricity supply.",
    managerId: "usr_head_electricity",
    members: [
      membersOf("usr_head_electricity", "Eng. Kashif Javed", "electricity.head@smartcity.gov", UserRole.DEPARTMENT_HEAD),
      membersOf("usr_officer_electricity", "Adnan Raza", "electricity.officer@smartcity.gov", UserRole.OFFICER),
    ],
    createdAt: daysAgo(54),
    updatedAt: daysAgo(4),
  },
  {
    id: "dept-municipal",
    name: "Municipal Services",
    code: "MS",
    description: "Waste collection, parks and public spaces.",
    managerId: "usr_head_municipal",
    members: [
      membersOf("usr_head_municipal", "Rabia Sultana", "municipal.head@smartcity.gov", UserRole.DEPARTMENT_HEAD),
      membersOf("usr_officer_municipal", "Imran Baig", "municipal.officer@smartcity.gov", UserRole.OFFICER),
    ],
    createdAt: daysAgo(48),
    updatedAt: daysAgo(8),
  },
  {
    id: "dept-emergency",
    name: "Emergency Services",
    code: "ES",
    description: "Fire, rescue, medical and civil protection response.",
    managerId: "usr_head_emergency",
    members: [
      membersOf("usr_head_emergency", "Capt. Faisal Anwar", "emergency.head@smartcity.gov", UserRole.DEPARTMENT_HEAD),
      membersOf("usr_officer_emergency", "Daniyal Qureshi", "emergency.officer@smartcity.gov", UserRole.OFFICER),
    ],
    createdAt: daysAgo(44),
    updatedAt: daysAgo(2),
  },
];

export const seedDepartmentComplaints: SeedComplaint[] = [
  {
    id: "cmp_dept_1",
    departmentId: "dept-public-works",
    citizenId: "usr_seed_citizen1",
    title: "Pothole on Market Street",
    category: "ROAD",
    status: "RESOLVED",
    createdAt: daysAgo(28),
  },
  {
    id: "cmp_dept_2",
    departmentId: "dept-public-works",
    citizenId: "usr_seed_citizen1",
    title: "Street light outage downtown",
    category: "STREET_LIGHT",
    status: "IN_PROGRESS",
    createdAt: daysAgo(9),
  },
  {
    id: "cmp_dept_3",
    departmentId: "dept-water-sanitation",
    citizenId: "usr_seed_citizen2",
    title: "Public tap water leak",
    category: "WATER",
    status: "SUBMITTED",
    createdAt: daysAgo(3),
  },
  {
    id: "cmp_dept_4",
    departmentId: "dept-water-sanitation",
    citizenId: "usr_seed_citizen1",
    title: "Residential pipe burst",
    category: "WATER",
    status: "CLOSED",
    createdAt: daysAgo(15),
  },
];
const departments = collection<DepartmentRecord>("departments");

// Shared with the complaints module — department stats reflect real complaints.
const complaints = collection<SeedComplaint>("complaints");

// Live eligibility: every active user with staff access is assignable.
const users = collection<{ id: string; fullName: string; email: string; role: UserRole; isActive?: boolean }>(
  "users",
);

export const departmentRepository = {
  departments,
  complaints,

  get officerPool(): OfficerCandidate[] {
    return users
      .all()
      .filter(
        (u) =>
          u.isActive !== false &&
          (u.role === UserRole.OFFICER || u.role === UserRole.DEPARTMENT_HEAD),
      )
      .map((u) => ({
        userId: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
      }));
  },

  findByCode(code: string): DepartmentRecord | undefined {
    return departments.all().find((d) => d.code.toLowerCase() === code.toLowerCase());
  },

  findByName(name: string): DepartmentRecord | undefined {
    return departments.all().find((d) => d.name.toLowerCase() === name.toLowerCase());
  },
};

export default departmentRepository;