import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

const MOCK_RESTAURANTS = [
  {
    name: "The Spice Route",
    description:
      "Experience authentic Indian cuisine with a modern twist. Our chefs bring traditional recipes from across India with contemporary presentation.",
    cuisine: ["Indian", "North Indian", "Mughlai"],
    priceRange: "₹₹",
    ownerId: "mock_owner_1",
    ownerName: "Rajesh Kumar",
    ownerContact: "+91 98765 43210",
    address: {
      street: "123 MG Road, Near City Mall",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      landmark: "Opposite Central Park",
    },
    coordinates: {
      latitude: 26.8467,
      longitude: 80.9462,
    },
    phone: "+91 522 1234567",
    email: "contact@spiceroute.com",
    website: "https://spiceroute.com",
    operatingHours: {
      monday: { open: "11:00", close: "23:00", closed: false },
      tuesday: { open: "11:00", close: "23:00", closed: false },
      wednesday: { open: "11:00", close: "23:00", closed: false },
      thursday: { open: "11:00", close: "23:00", closed: false },
      friday: { open: "11:00", close: "23:30", closed: false },
      saturday: { open: "11:00", close: "23:30", closed: false },
      sunday: { open: "11:00", close: "23:00", closed: false },
    },
    tables: [
      { tableId: "T1", capacity: 2, tableNumber: "1", location: "indoor" },
      { tableId: "T2", capacity: 4, tableNumber: "2", location: "indoor" },
      { tableId: "T3", capacity: 4, tableNumber: "3", location: "indoor" },
      { tableId: "T4", capacity: 6, tableNumber: "4", location: "indoor" },
      { tableId: "T5", capacity: 2, tableNumber: "5", location: "outdoor" },
      { tableId: "T6", capacity: 4, tableNumber: "6", location: "outdoor" },
    ],
    totalCapacity: 22,
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      ],
      menuImages: [],
    },
    amenities: ["WiFi", "Parking", "AC", "Live Music", "Wheelchair Accessible"],
    features: ["Family Friendly", "Romantic", "Group Dining"],
    bookingFeePerPerson: 50,
    cancellationPolicy: {
      allowCancellation: true,
      isRefundable: false,
      minimumNoticeHours: 0,
    },
    status: "approved",
    totalBookings: 0,
    averageRating: 4.5,
    totalReviews: 250,
    searchKeywords: ["spice", "route", "indian", "north", "mughlai", "lucknow"],
  },
  {
    name: "Pizza Paradise",
    description:
      "Authentic wood-fired pizzas made with imported Italian ingredients. Experience Naples in every bite!",
    cuisine: ["Italian", "Pizza", "Continental"],
    priceRange: "₹₹₹",
    ownerId: "mock_owner_2",
    ownerName: "Marco Rossi",
    ownerContact: "+91 98765 43211",
    address: {
      street: "45 Hazratganj, First Floor",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      landmark: "Above ICICI Bank",
    },
    coordinates: {
      latitude: 26.8489,
      longitude: 80.9456,
    },
    phone: "+91 522 2234567",
    email: "hello@pizzaparadise.com",
    operatingHours: {
      monday: { open: "12:00", close: "23:00", closed: false },
      tuesday: { open: "12:00", close: "23:00", closed: false },
      wednesday: { open: "12:00", close: "23:00", closed: false },
      thursday: { open: "12:00", close: "23:00", closed: false },
      friday: { open: "12:00", close: "00:00", closed: false },
      saturday: { open: "12:00", close: "00:00", closed: false },
      sunday: { open: "12:00", close: "23:00", closed: false },
    },
    tables: [
      { tableId: "T1", capacity: 2, tableNumber: "1", location: "indoor" },
      { tableId: "T2", capacity: 2, tableNumber: "2", location: "indoor" },
      { tableId: "T3", capacity: 4, tableNumber: "3", location: "indoor" },
      { tableId: "T4", capacity: 4, tableNumber: "4", location: "outdoor" },
      { tableId: "T5", capacity: 6, tableNumber: "5", location: "outdoor" },
    ],
    totalCapacity: 18,
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      ],
      menuImages: [],
    },
    amenities: ["WiFi", "Outdoor Seating", "AC", "Bar"],
    features: ["Romantic", "Date Night", "Casual Dining"],
    bookingFeePerPerson: 0,
    cancellationPolicy: {
      allowCancellation: true,
      isRefundable: false,
      minimumNoticeHours: 0,
    },
    status: "approved",
    totalBookings: 0,
    averageRating: 4.2,
    totalReviews: 180,
    searchKeywords: ["pizza", "paradise", "italian", "continental", "lucknow"],
  },
  {
    name: "Sushi Station",
    description:
      "Premium Japanese dining experience with the freshest sushi, sashimi, and traditional Japanese dishes.",
    cuisine: ["Japanese", "Sushi", "Asian"],
    priceRange: "₹₹₹₹",
    ownerId: "mock_owner_3",
    ownerName: "Kenji Tanaka",
    ownerContact: "+91 98765 43212",
    address: {
      street: "78 Gomti Nagar Extension",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
      landmark: "Near Phoenix Palassio Mall",
    },
    coordinates: {
      latitude: 26.8512,
      longitude: 80.9931,
    },
    phone: "+91 522 3234567",
    email: "reservations@sushistation.com",
    website: "https://sushistation.com",
    operatingHours: {
      monday: { open: "00:00", close: "00:00", closed: true },
      tuesday: { open: "18:00", close: "23:30", closed: false },
      wednesday: { open: "18:00", close: "23:30", closed: false },
      thursday: { open: "18:00", close: "23:30", closed: false },
      friday: { open: "18:00", close: "00:30", closed: false },
      saturday: { open: "12:00", close: "00:30", closed: false },
      sunday: { open: "12:00", close: "23:30", closed: false },
    },
    tables: [
      { tableId: "T1", capacity: 2, tableNumber: "1", location: "indoor" },
      { tableId: "T2", capacity: 2, tableNumber: "2", location: "indoor" },
      { tableId: "T3", capacity: 4, tableNumber: "3", location: "indoor" },
      { tableId: "T4", capacity: 4, tableNumber: "4", location: "private" },
      { tableId: "T5", capacity: 8, tableNumber: "5", location: "private" },
    ],
    totalCapacity: 20,
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800",
        "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=800",
      ],
      menuImages: [],
    },
    amenities: ["WiFi", "Valet Parking", "AC", "Bar", "Private Dining"],
    features: ["Fine Dining", "Business Dining", "Special Occasions"],
    bookingFeePerPerson: 100,
    cancellationPolicy: {
      allowCancellation: true,
      isRefundable: false,
      minimumNoticeHours: 0,
    },
    status: "approved",
    totalBookings: 0,
    averageRating: 4.8,
    totalReviews: 320,
    searchKeywords: ["sushi", "station", "japanese", "asian", "lucknow"],
  },
  {
    name: "Cafe Aroma",
    description:
      "Cozy cafe serving artisanal coffee, fresh pastries, and light bites. Perfect for work or relaxation.",
    cuisine: ["Cafe", "Continental", "Fast Food"],
    priceRange: "₹",
    ownerId: "mock_owner_4",
    ownerName: "Priya Sharma",
    ownerContact: "+91 98765 43213",
    address: {
      street: "12 Indira Nagar",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226016",
      landmark: "Near Inox Cinema",
    },
    coordinates: {
      latitude: 26.8756,
      longitude: 80.9989,
    },
    phone: "+91 522 4234567",
    email: "info@cafearoma.com",
    operatingHours: {
      monday: { open: "08:00", close: "22:00", closed: false },
      tuesday: { open: "08:00", close: "22:00", closed: false },
      wednesday: { open: "08:00", close: "22:00", closed: false },
      thursday: { open: "08:00", close: "22:00", closed: false },
      friday: { open: "08:00", close: "23:00", closed: false },
      saturday: { open: "08:00", close: "23:00", closed: false },
      sunday: { open: "09:00", close: "22:00", closed: false },
    },
    tables: [
      { tableId: "T1", capacity: 2, tableNumber: "1", location: "indoor" },
      { tableId: "T2", capacity: 2, tableNumber: "2", location: "indoor" },
      { tableId: "T3", capacity: 4, tableNumber: "3", location: "indoor" },
      { tableId: "T4", capacity: 2, tableNumber: "4", location: "outdoor" },
      { tableId: "T5", capacity: 4, tableNumber: "5", location: "outdoor" },
    ],
    totalCapacity: 14,
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      ],
      menuImages: [],
    },
    amenities: ["WiFi", "Power Outlets", "AC", "Outdoor Seating"],
    features: ["Work Friendly", "Pet Friendly", "Casual"],
    bookingFeePerPerson: 0,
    cancellationPolicy: {
      allowCancellation: true,
      isRefundable: false,
      minimumNoticeHours: 0,
    },
    status: "approved",
    totalBookings: 0,
    averageRating: 4.3,
    totalReviews: 150,
    searchKeywords: ["cafe", "aroma", "coffee", "continental", "lucknow"],
  },
  {
    name: "Royal Nawab",
    description:
      "Experience royal Awadhi cuisine in a regal ambiance. Signature kebabs, biryanis, and traditional delicacies.",
    cuisine: ["Indian", "Mughlai", "Awadhi"],
    priceRange: "₹₹₹",
    ownerId: "mock_owner_5",
    ownerName: "Nawab Syed Ali",
    ownerContact: "+91 98765 43214",
    address: {
      street: "56 Aminabad Main Road",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226018",
      landmark: "Near Gole Market",
    },
    coordinates: {
      latitude: 26.8389,
      longitude: 80.9145,
    },
    phone: "+91 522 5234567",
    email: "reservations@royalnawab.com",
    website: "https://royalnawab.com",
    operatingHours: {
      monday: { open: "12:00", close: "23:00", closed: false },
      tuesday: { open: "12:00", close: "23:00", closed: false },
      wednesday: { open: "12:00", close: "23:00", closed: false },
      thursday: { open: "12:00", close: "23:00", closed: false },
      friday: { open: "12:00", close: "23:30", closed: false },
      saturday: { open: "12:00", close: "23:30", closed: false },
      sunday: { open: "12:00", close: "23:00", closed: false },
    },
    tables: [
      { tableId: "T1", capacity: 4, tableNumber: "1", location: "indoor" },
      { tableId: "T2", capacity: 4, tableNumber: "2", location: "indoor" },
      { tableId: "T3", capacity: 6, tableNumber: "3", location: "indoor" },
      { tableId: "T4", capacity: 8, tableNumber: "4", location: "private" },
      { tableId: "T5", capacity: 10, tableNumber: "5", location: "private" },
    ],
    totalCapacity: 32,
    images: {
      coverImage:
        "https://images.unsplash.com/photo-1585937421612-70a008356ccf?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
      ],
      menuImages: [],
    },
    amenities: ["Valet Parking", "AC", "Live Music", "Private Dining"],
    features: ["Traditional", "Family Dining", "Celebrations"],
    bookingFeePerPerson: 75,
    cancellationPolicy: {
      allowCancellation: true,
      isRefundable: false,
      minimumNoticeHours: 0,
    },
    status: "approved",
    totalBookings: 0,
    averageRating: 4.6,
    totalReviews: 420,
    searchKeywords: [
      "royal",
      "nawab",
      "mughlai",
      "awadhi",
      "biryani",
      "lucknow",
    ],
  },
];

export const addMockRestaurants = async () => {
  try {
    console.log("🍽️ Adding mock restaurants to Firestore...");

    for (const restaurant of MOCK_RESTAURANTS) {
      const docRef = await addDoc(collection(db, "restaurants"), {
        ...restaurant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        approvedBy: "system",
      });
      console.log(`✅ Added: ${restaurant.name} (ID: ${docRef.id})`);
    }

    console.log("🎉 All mock restaurants added successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error adding mock restaurants:", error);
    return false;
  }
};
