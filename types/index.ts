// ==================== USER TYPES ====================

export type RolePreference = "consumer" | "owner" | "both";

export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface SavedAddress {
  id: string;
  label: string; // "Current Location" or "Other"
  address: string; // Full formatted: "Street, City, State, Pincode"
  coordinates: Coordinates;
  isActive: boolean;
}

export interface User {
  uid: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  location: string | null; // Currently active address
  coordinates: Coordinates | null;
  savedAddresses?: SavedAddress[]; // Max 2 addresses
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
  displayName: string | null;
  photoURL: string | null;
}

// ==================== RESTAURANT TYPES ====================

export type PriceRange = "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹";
export type RestaurantStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";
export type TableLocation = "indoor" | "outdoor" | "private";

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OperatingHours {
  open: string; 
  close: string; 
  closed: boolean;
}

export interface Table {
  tableId: string;
  capacity: number;
  tableNumber: string;
  location: TableLocation;
}

export interface RestaurantImages {
  coverImage: string;
  gallery: string[];
  menuImages?: string[];
}

export interface CancellationPolicy {
  allowCancellation: boolean;
  isRefundable: boolean; // Always false for non-refundable
  minimumNoticeHours: number; // Not used if non-refundable, but kept for future
}

export interface Restaurant {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerContact: string;

  // Basic Info
  name: string;
  description: string;
  cuisine: string[];
  priceRange: PriceRange;

  // Location
  address: Address;
  coordinates: Coordinates;

  // Contact
  phone: string;
  email?: string;
  website?: string;

  // Hours
  operatingHours: {
    monday: OperatingHours;
    tuesday: OperatingHours;
    wednesday: OperatingHours;
    thursday: OperatingHours;
    friday: OperatingHours;
    saturday: OperatingHours;
    sunday: OperatingHours;
  };

  // Tables
  tables: Table[];
  totalCapacity: number;

  // Images
  images: RestaurantImages;

  // Amenities
  amenities: string[];
  features: string[];

  // Booking Fee (Non-refundable)
  bookingFeePerPerson: number;
  cancellationPolicy: CancellationPolicy;

  // Status
  status: RestaurantStatus;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: string;

  // Stats
  totalBookings: number;
  averageRating?: number;
  totalReviews?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Search
  searchKeywords: string[];
}

// ==================== BOOKING TYPES ====================

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no-show";
export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";
export type CancelledBy = "user" | "restaurant" | "admin";

export interface Payment {
  amount: number;
  perPersonFee: number;
  totalGuests: number;
  currency: string;
  // Payment Gateway IDs (using Razorpay or Stripe)
  paymentIntentId?: string; 
  razorpayOrderId?: string; 
  razorpayPaymentId?: string; 
  razorpaySignature?: string; 
  status: PaymentStatus;
  paidAt?: Date;
  method?: PaymentMethod;
}

export interface Booking {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;

  // Booking Details
  date: Date; 
  timeSlot: string; 
  numberOfGuests: number;
  tableIds: string[]; 

  // Status
  status: BookingStatus;

  // Payment
  payment: Payment;

  // Special Requests
  specialRequests?: string;
  occasion?: string; 

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  completedAt?: Date;

  // Cancellation (User can cancel but NO REFUND)
  cancellationReason?: string;
  cancelledBy?: CancelledBy;

  // Non-refundable flag (always true for this app)
  isNonRefundable: boolean; 
}

// ==================== REVIEW TYPES (Optional - for future) ====================

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  bookingId: string;
  rating: number; 
  review: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}
