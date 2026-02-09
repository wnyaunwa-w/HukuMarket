import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,      
  runTransaction,
  deleteDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- BATCH LOGIC ---

export interface Batch {
  id?: string;
  userId: string;
  breed: string;
  count: number;
  hatchDate: string; 
  location: string;
  pricePerBird: number;
  createdAt: any;
}

// 1. Create Batch
export async function createBatch(batchData: Omit<Batch, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, "batches"), {
      ...batchData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding batch: ", error);
    throw error;
  }
}

// 2. Real-time Listener (Producer Dashboard)
export function subscribeToBatches(userId: string, callback: (data: Batch[]) => void) {
  const q = query(
    collection(db, "batches"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, 
    (snapshot) => {
      const batches = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Batch[];
      callback(batches);
    },
    (error) => {
      console.log("Stream closed (likely due to logout)");
    }
  );
}

// 3. Fetch All Batches (Public Market)
export async function getAllBatches() {
  try {
    const q = query(collection(db, "batches"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[];
  } catch (error) {
    console.error("Error fetching market:", error);
    return [];
  }
}

// 🗑️ DELETE BATCH (Farmer Dashboard)
export async function deleteBatch(batchId: string) {
  try {
    await deleteDoc(doc(db, "batches", batchId));
    return true;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw error;
  }
}

// --- PROFILE LOGIC ---

// 4. Get User Profile
export async function getUserProfile(userId: string) {
  try {
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// 5. Update User Profile
export async function updateUserProfile(userId: string, data: any) {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, data, { merge: true }); 
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// 6. Upload Image Function
export async function uploadProfileImage(userId: string, file: File) {
  try {
    const storageRef = ref(storage, `avatars/${userId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    await updateUserProfile(userId, { photoURL: url });
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// --- STOCK & REVIEWS LOGIC ---

// 7. Update Stock (Reduce Quantity)
export async function updateBatchStock(batchId: string, soldAmount: number) {
  try {
    const batchRef = doc(db, "batches", batchId);
    
    await runTransaction(db, async (transaction) => {
      const batchDoc = await transaction.get(batchRef);
      if (!batchDoc.exists()) throw "Batch does not exist!";

      const currentCount = batchDoc.data().count;
      if (currentCount < soldAmount) {
        throw "Not enough birds in stock!";
      }

      transaction.update(batchRef, { 
        count: currentCount - soldAmount 
      });
    });
    return true;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
}

// 8. Add Review
export async function addReview(farmerId: string, reviewerId: string, rating: number, comment: string) {
  try {
    await addDoc(collection(db, "reviews"), {
      farmerId,
      reviewerId,
      rating,
      comment,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error leaving review:", error);
    throw error;
  }
}

// 9. Get Reviews for a Farmer
export async function getFarmerReviews(farmerId: string) {
  try {
    const q = query(
      collection(db, "reviews"), 
      where("farmerId", "==", farmerId), 
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting reviews:", error);
    return [];
  }
}

// 10. Admin: Get All Users
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// ❤️ FAVORITES SYSTEM

// Toggle Favorite status
export async function toggleFavorite(userId: string, batchId: string) {
  if (!userId) throw new Error("User ID is required");

  const docRef = doc(db, "users", userId, "favorites", batchId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await deleteDoc(docRef);
    return false; // Removed
  } else {
    await setDoc(docRef, { 
      batchId, 
      addedAt: new Date().toISOString() 
    });
    return true; // Added
  }
}

// Get all favorited batch IDs for a user
export async function getFavoriteIds(userId: string): Promise<string[]> {
  if (!userId) return []; 

  const q = collection(db, "users", userId, "favorites");
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
}

// Get full batch details for favorites
export async function getFavoriteBatches(userId: string): Promise<Batch[]> {
  if (!userId) return []; 

  const favIds = await getFavoriteIds(userId);
  if (favIds.length === 0) return [];

  const allBatches = await getAllBatches();
  return allBatches.filter(b => b.id && favIds.includes(b.id));
}

// ⚙️ GLOBAL SETTINGS & ADMIN ACTIONS

// Get the current subscription fee (defaults to 5 if not set)
export async function getSubscriptionFee() {
  try {
    const docRef = doc(db, "settings", "general");
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data().subscriptionFee : 5; // Default $5
  } catch (error) {
    console.error("Error fetching fee:", error);
    return 5;
  }
}

// Update the subscription fee
export async function updateSubscriptionFee(newFee: number) {
  try {
    const docRef = doc(db, "settings", "general");
    await setDoc(docRef, { subscriptionFee: newFee }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating fee:", error);
    throw error;
  }
}

// ✅ ACTIVATE USER (Updated with Expiry Calculation)
export async function activateUserSubscription(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    
    // 1. Calculate dates
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30); // Add 30 days
    
    // 2. Save to database
    await updateDoc(userRef, { 
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate.toISOString(),
      subscriptionExpiryDate: expiryDate.toISOString() 
    });
    return true;
  } catch (error) {
    console.error("Error activating user:", error);
    throw error;
  }
}

// 🛑 DEACTIVATE USER
export async function deactivateUserSubscription(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { subscriptionStatus: 'inactive' });
    return true;
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw error;
  }
}

// 🚫 BLOCK/UNBLOCK USER
export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      isBlocked: !isBlocked 
    });
    return !isBlocked;
  } catch (error) {
    console.error("Error toggling block:", error);
    throw error;
  }
}

// 🗑️ DELETE USER
export async function deleteUser(userId: string) {
  try {
    // 1. Delete User Profile
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// 📢 ADVERTISING SYSTEM

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  ctaText: string;
  type: 'dashboard_banner' | 'feed_card';
  active: boolean;
}

// 1. Fetch all ACTIVE ads (For Users)
export async function getActiveAds(type: 'dashboard_banner' | 'feed_card'): Promise<Ad[]> {
  const q = query(
    collection(db, "ads"), 
    where("active", "==", true),
    where("type", "==", type)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
}

// 2. Create an Ad (For Admin)
export async function createAd(adData: Omit<Ad, "id">) {
  return await addDoc(collection(db, "ads"), adData);
}

// 3. Fetch ALL ads (Active & Inactive - For Admin Panel)
export async function getAllAds() {
  const q = query(collection(db, "ads"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
}

// 4. Toggle Ad Status (Active/Inactive)
export async function toggleAdStatus(adId: string, currentStatus: boolean) {
  const ref = doc(db, "ads", adId);
  await updateDoc(ref, { active: !currentStatus });
}

// 5. Delete Ad
export async function deleteAd(adId: string) {
  await deleteDoc(doc(db, "ads", adId));
}