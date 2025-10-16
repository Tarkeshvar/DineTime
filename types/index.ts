export type RolePreference = "consumer" | "owner" | "both";

export interface User {
  uid: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  city?: string; // Optional now, will be set via location
  rolePreference: RolePreference;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  ownedRestaurants?: string[];
  bookingHistory?: string[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
}
