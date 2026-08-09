/**
 * @smartcity/shared — Aggregated domain contracts shared between the web
 * frontend and all backend microservices.
 */
export * from "@smartcity/common";
export interface RegisterUserDto {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role?: string;
    departmentCode?: string;
}
export interface LoginUserDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface RefreshDto {
    refreshToken: string;
}
export interface ForgotPasswordDto {
    email: string;
}
export interface ResetPasswordDto {
    token: string;
    password: string;
}
export interface VerifyEmailDto {
    token: string;
}
export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    phoneNumber?: string | null;
    departmentId?: string | null;
    isEmailVerified: boolean;
}
export interface AuthSession {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface CreateComplaintDto {
    title: string;
    description: string;
    category: string;
    priority?: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    imageUrls?: string[];
}
export interface UpdateComplaintDto {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    address?: string;
    imageUrls?: string[];
}
export interface ComplaintStatusDto {
    status: string;
    note?: string;
    assignedToId?: string;
    departmentId?: string;
}
export interface CommentDto {
    body: string;
}
export interface NotificationDto {
    userId?: string;
    title: string;
    message: string;
    type?: string;
    channel?: string;
    payload?: Record<string, unknown>;
}
export interface NotificationPrefsDto {
    email: boolean;
    push: boolean;
    sms: boolean;
    categories: string[];
}
export interface InitiatePaymentDto {
    userId: string;
    billType: string;
    amount: number;
    currency?: string;
    description?: string;
}
export interface Point {
    latitude: number;
    longitude: number;
}
export interface MapMarkerDto {
    id: string;
    type: string;
    title: string;
    latitude: number;
    longitude: number;
    status?: string;
    payload?: Record<string, unknown>;
}
export interface CreateEmergencyDto {
    type: string;
    title: string;
    description: string;
    severity?: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
}
