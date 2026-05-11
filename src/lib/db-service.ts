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
  increment 
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
  inquiries?: number; 
  soldCount?: number; 
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
    const EXPIRY_DAYS = 31;

    return allBatches.filter(batch => {
      if (batch.count <= 0) return false;
      if (batch.createdAt?.toDate) {
        const createdDate = batch.createdAt.toDate();
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > EXPIRY_DAYS) return false;
      }
      return true; 
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
        soldCount: increment(soldAmount) 
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

export async function getFavoriteIds(userId: string): Promise<string[]> {
  if (!userId) return []; 

  const q = collection(db, "users", userId, "favorites");
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
}

export async function getFavoriteBatches(userId: string): Promise<Batch[]> {
  if (!userId) return []; 

  const favIds = await getFavoriteIds(userId);
  if (favIds.length === 0) return [];

  const allBatches = await getAllBatches();
  return allBatches.filter(b => b.id && favIds.includes(b.id));
}

// ⚙️ GLOBAL SETTINGS & ADMIN ACTIONS

export async function getSubscriptionFee() {
  try {
    const docRef = doc(db, "settings", "general");
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data().subscriptionFee : 5; 
  } catch (error) {
    console.error("Error fetching fee:", error);
    return 5;
  }
}

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

export async function activateUserSubscription(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30); 
    
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

export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { isBlocked: !isBlocked });
    return !isBlocked;
  } catch (error) {
    console.error("Error toggling block:", error);
    throw error;
  }
}

// 🚨 FIXED: STRICT 1-YEAR VERIFICATION BADGE
export async function toggleUserVerification(userId: string, isVerified: boolean) {
  try {
    const userRef = doc(db, "users", userId);
    
    if (isVerified) {
      // ⏱️ NEW: If approving, stamp a strict 1-year (365 days) expiration date
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(startDate.getDate() + 365);
      
      await updateDoc(userRef, { 
        isVerified: true,
        verificationStartDate: startDate.toISOString(),
        verificationExpiryDate: expiryDate.toISOString()
      });
    } else {
      // 🛑 If revoking/unverifying, turn it off and clear the dates
      await updateDoc(userRef, { 
        isVerified: false,
        verificationStartDate: null,
        verificationExpiryDate: null
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error toggling verification:", error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const batchesQuery = query(collection(db, "batches"), where("userId", "==", userId));
    const batchesSnapshot = await getDocs(batchesQuery);
    
    const deletePromises = batchesSnapshot.docs.map(batchDoc => 
      deleteDoc(doc(db, "batches", batchDoc.id))
    );
    await Promise.all(deletePromises); 

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

export async function getActiveAds(type: 'dashboard_banner' | 'feed_card'): Promise<Ad[]> {
  const q = query(collection(db, "ads"), where("active", "==", true), where("type", "==", type));
  const snapshot = await getDocs(q);
  const now = new Date();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Ad))
    .filter(ad => {
      if (ad.startDate && new Date(ad.startDate) > now) return false; 
      if (ad.endDate && new Date(ad.endDate) < now) return false;     
      return true; 
    });
}

export async function createAd(adData: Omit<Ad, "id">) {
  return await addDoc(collection(db, "ads"), adData);
}

export async function getAllAds() {
  const q = query(collection(db, "ads"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
}

export async function toggleAdStatus(adId: string, currentStatus: boolean) {
  const ref = doc(db, "ads", adId);
  await updateDoc(ref, { active: !currentStatus });
}

export async function deleteAd(adId: string) {
  await deleteDoc(doc(db, "ads", adId));
}

export async function cleanUpOrphanedBatches() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const validUserIds = new Set(usersSnap.docs.map(doc => doc.id));
    const batchesSnap = await getDocs(collection(db, "batches"));
    let deletedCount = 0;
    const deletePromises: Promise<void>[] = [];

    batchesSnap.docs.forEach(batchDoc => {
      const batchData = batchDoc.data();
      if (!validUserIds.has(batchData.userId)) {
        deletePromises.push(deleteDoc(doc(db, "batches", batchDoc.id)));
        deletedCount++;
      }
    });

    await Promise.all(deletePromises);
    return deletedCount;
  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  }
}

export async function trackBuyerInquiry(batchId: string) {
  if (!batchId) return;
  try {
    const batchRef = doc(db, "batches", batchId);
    await updateDoc(batchRef, { inquiries: increment(1) });
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

export async function updateFlock(flockId: string, flockData: any) {
  try {
    await updateDoc(doc(db, "flocks", flockId), flockData);
  } catch (error) {
    console.error("Error updating flock", error);
    throw error;
  }
}

export async function getActiveFlocks(userId: string) {
  try {
    const q = query(collection(db, "flocks"), where("userId", "==", userId), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting flocks", error);
    return [];
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
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return logs.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error("Error getting logs", error);
    return [];
  }
}

// 🛠️ NEW: Native HTML5 Client-Side Image Compressor
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max dimensions for a mobile screen viewing a simple photo
        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 0.6 quality reduces a 5MB image to roughly 150KB!
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas compression failed'));
        }, 'image/jpeg', 0.6); 
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

// 📸 UPLOAD MORTALITY PHOTO (Now with built-in compression!)
export async function uploadMortalityPhoto(file: File, flockId: string) {
  try {
    // 1. Squash the massive 5MB photo down to ~150KB
    const compressedBlob = await compressImage(file);
    
    // 2. Upload the tiny version to Firebase
    const fileName = `mortality_evidence/${flockId}/${Date.now()}.jpg`; // Force JPG extension
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, compressedBlob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading compressed photo", error);
    throw error;
  }
}