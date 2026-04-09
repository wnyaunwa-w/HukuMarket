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
  deleteDoc,
  increment // 👈 Moved this to the top where it belongs!
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- BATCH LOGIC ---

export interface Batch {
  id?: string;
  userId: string;
  listingType?: 'live' | 'dressed';
  breed?: string;
  count: number;
  hatchDate?: string; 
  location: string;
  pricePerBird: number;
  createdAt: any;
  inquiries?: number; // 👈 ADDED FOR ANALYTICS
  soldCount?: number; // 👈 ADDED FOR ANALYTICS
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

// Update an existing Batch (Edit)
export async function updateBatch(batchId: string, updatedData: Partial<Batch>) {
  try {
    const batchRef = doc(db, "batches", batchId);
    await updateDoc(batchRef, updatedData);
    return true;
  } catch (error) {
    console.error("Error updating batch:", error);
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
    const allBatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[];

    const now = new Date();
    const EXPIRY_DAYS = 31; // 👈 Listings automatically vanish from the market after 31 days

    // THE DOUBLE FILTER (Zero-Stock & Ghost Listings)
    return allBatches.filter(batch => {
      // Rule 1: Hide if stock is 0
      if (batch.count <= 0) return false;

      // Rule 2: Hide if it's a Ghost Listing (older than 31 days)
      if (batch.createdAt?.toDate) {
        const createdDate = batch.createdAt.toDate();
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > EXPIRY_DAYS) return false;
      }

      return true; // Keep it on the public market!
    });

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
        count: currentCount - soldAmount,
        soldCount: increment(soldAmount) // Automatically tracks sold amount for analytics
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

// 🛡️ VERIFICATION SYSTEM (Admin Only)
// Verify or Unverify a Farmer
export async function toggleUserVerification(userId: string, isVerified: boolean) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      isVerified: isVerified 
    });
    return true;
  } catch (error) {
    console.error("Error toggling verification:", error);
    throw error;
  }
}

// 🗑️ DELETE USER & ALL THEIR LISTINGS
export async function deleteUser(userId: string) {
  try {
    // 1. Find all listings (batches) belonging to this user
    const batchesQuery = query(collection(db, "batches"), where("userId", "==", userId));
    const batchesSnapshot = await getDocs(batchesQuery);
    
    // 2. Delete every single batch we found
    const deletePromises = batchesSnapshot.docs.map(batchDoc => 
      deleteDoc(doc(db, "batches", batchDoc.id))
    );
    await Promise.all(deletePromises); // Runs all deletions at the same time

    // 3. Finally, delete the User Profile itself
    await deleteDoc(doc(db, "users", userId));
    
    return true;
  } catch (error) {
    console.error("Error deleting user and their listings:", error);
    throw error;
  }
}

// 📢 ADVERTISING SYSTEM

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  logoUrl: string;
  link: string;
  ctaText: string;
  type: 'dashboard_banner' | 'feed_card';
  active: boolean;
  startDate?: string;
  endDate?: string;
}

// ✅ Generic Function to Upload Ad Assets (Banner or Logo)
export async function uploadAdAsset(file: File, path: 'banners' | 'logos') {
  try {
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const storageRef = ref(storage, `ads/${path}/${uniqueFileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error uploading ${path}:`, error);
    throw error;
  }
}

// 1. Fetch all ACTIVE ads (Smart Filter: Hides Expired Ads)
export async function getActiveAds(type: 'dashboard_banner' | 'feed_card'): Promise<Ad[]> {
  const q = query(
    collection(db, "ads"), 
    where("active", "==", true),
    where("type", "==", type)
  );
  
  const snapshot = await getDocs(q);
  const now = new Date();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Ad))
    .filter(ad => {
      // If dates are set, strictly enforce them
      if (ad.startDate && new Date(ad.startDate) > now) return false; // Scheduled for future
      if (ad.endDate && new Date(ad.endDate) < now) return false;     // Expired
      
      return true; // Valid
    });
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

// 4. Toggle Ad Status
export async function toggleAdStatus(adId: string, currentStatus: boolean) {
  const ref = doc(db, "ads", adId);
  await updateDoc(ref, { active: !currentStatus });
}

// 5. Delete Ad
export async function deleteAd(adId: string) {
  await deleteDoc(doc(db, "ads", adId));
}

// 🧹 ADMIN UTILITY: Clean up orphaned batches (Listings with no matching user)
export async function cleanUpOrphanedBatches() {
  try {
    // 1. Get all active users
    const usersSnap = await getDocs(collection(db, "users"));
    const validUserIds = new Set(usersSnap.docs.map(doc => doc.id));

    // 2. Get all batches
    const batchesSnap = await getDocs(collection(db, "batches"));
    let deletedCount = 0;
    const deletePromises: Promise<void>[] = [];

    // 3. Check every batch. If the user doesn't exist, queue it for deletion.
    batchesSnap.docs.forEach(batchDoc => {
      const batchData = batchDoc.data();
      if (!validUserIds.has(batchData.userId)) {
        deletePromises.push(deleteDoc(doc(db, "batches", batchDoc.id)));
        deletedCount++;
      }
    });

    // 4. Execute all deletions
    await Promise.all(deletePromises);
    return deletedCount;
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
}

// 📈 TRACK BUYER INQUIRY
export async function trackBuyerInquiry(batchId: string) {
  if (!batchId) return;
  try {
    const batchRef = doc(db, "batches", batchId);
    await updateDoc(batchRef, {
      inquiries: increment(1)
    });
  } catch (error) {
    console.error("Failed to track inquiry:", error);
  }
}
// ==========================================
// HUKU MANAGEMENT (FLOCKS & LOGS)
// ==========================================

export async function createFlock(userId: string, flockData: any) {
  try {
    const docRef = await addDoc(collection(db, "flocks"), {
      userId,
      ...flockData,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, userId, ...flockData, status: 'active' };
  } catch (error) {
    console.error("Error creating flock", error);
    throw error;
  }
}

export async function getActiveFlock(userId: string) {
  try {
    const q = query(collection(db, "flocks"), where("userId", "==", userId), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting flock", error);
    return null;
  }
}

export async function addDailyLog(flockId: string, logData: any) {
  try {
    await addDoc(collection(db, "flock_logs"), {
      flockId,
      timestamp: new Date().toISOString(),
      ...logData
    });
  } catch (error) {
    console.error("Error adding log", error);
    throw error;
  }
}

export async function getFlockLogs(flockId: string) {
  try {
    const q = query(collection(db, "flock_logs"), where("flockId", "==", flockId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting logs", error);
    return [];
  }
}