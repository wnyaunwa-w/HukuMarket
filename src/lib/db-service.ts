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
  deleteDoc // 👈 Added this to fix the "Cannot find name" error
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

// ❤️ FAVORITES SYSTEM (NEWLY ADDED)

// Toggle Favorite status
export async function toggleFavorite(userId: string, batchId: string) {
  // Guard clause to prevent "undefined" errors
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
  if (!userId) return []; // Guard clause for safety

  const q = collection(db, "users", userId, "favorites");
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
}

// Get full batch details for favorites (for the Notification check)
export async function getFavoriteBatches(userId: string): Promise<Batch[]> {
  if (!userId) return []; // Guard clause for safety

  const favIds = await getFavoriteIds(userId);
  if (favIds.length === 0) return [];

  // Fetch all batches and filter. 
  // (In a larger app, we would use document lookups, but this is efficient for now)
  const allBatches = await getAllBatches();
  return allBatches.filter(b => b.id && favIds.includes(b.id));
}