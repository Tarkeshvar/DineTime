import { Restaurant } from "../types";

export const DUMMY_RESTAURANTS: Partial<Restaurant>[] = [
  {
    id: "1",
    name: "The Spice Route",
    description: "Authentic Indian cuisine with a modern twist",
    cuisine: ["Indian", "North Indian", "Mughlai"],
    priceRange: "₹₹",
    address: {
      street: "123 MG Road",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
    },
    coordinates: {
      latitude: 26.8467,
      longitude: 80.9462,
    },
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      gallery: [],
    },
    bookingFeePerPerson: 50,
    amenities: ["WiFi", "Parking", "AC"],
    averageRating: 4.5,
    totalReviews: 250,
    status: "approved",
  },
  {
    id: "2",
    name: "Pizza Paradise",
    description: "Wood-fired pizzas and Italian delights",
    cuisine: ["Italian", "Pizza", "Continental"],
    priceRange: "₹₹₹",
    address: {
      street: "45 Hazratganj",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
    },
    coordinates: {
      latitude: 26.8467,
      longitude: 80.9462,
    },
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      gallery: [],
    },
    bookingFeePerPerson: 0,
    amenities: ["WiFi", "Outdoor Seating"],
    averageRating: 4.2,
    totalReviews: 180,
    status: "approved",
  },
  {
    id: "3",
    name: "Sushi Station",
    description: "Fresh sushi and Japanese cuisine",
    cuisine: ["Japanese", "Sushi", "Asian"],
    priceRange: "₹₹₹₹",
    address: {
      street: "78 Gomti Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
    },
    coordinates: {
      latitude: 26.8467,
      longitude: 80.9462,
    },
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
      gallery: [],
    },
    bookingFeePerPerson: 100,
    amenities: ["WiFi", "Valet", "Bar"],
    averageRating: 4.8,
    totalReviews: 320,
    status: "approved",
  },
];
