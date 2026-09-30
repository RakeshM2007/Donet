/**
 * DONATIONCARE - FIREBASE FIRESTORE SERVICE
 * Handles real-time synchronization between Cloud Firestore and the frontend.
 */

import { 
    isFirebaseConfigured, 
    db, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
} from "./firebase-config.js";

const FirebaseService = {
    isAvailable: () => isFirebaseConfigured() && db !== null,

    // =========================================================================
    // 1. USERS COLLECTION
    // =========================================================================
    async saveUser(user) {
        if (!this.isAvailable()) return false;
        try {
            const userRef = doc(db, "users", user.id);
            await setDoc(userRef, {
                ...user,
                firestoreUpdatedAt: serverTimestamp()
            }, { merge: true });
            return true;
        } catch (e) {
            console.error("Firestore saveUser error:", e);
            return false;
        }
    },

    async fetchUsers() {
        if (!this.isAvailable()) return [];
        try {
            const colRef = collection(db, "users");
            const snap = await getDocs(colRef);
            const users = [];
            snap.forEach(d => users.push(d.data()));
            return users;
        } catch (e) {
            console.error("Firestore fetchUsers error:", e);
            return [];
        }
    },

    // =========================================================================
    // 2. DONATIONS COLLECTION
    // =========================================================================
    async saveDonation(donation) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "donations", donation.id);
            await setDoc(docRef, {
                ...donation,
                firestoreUpdatedAt: serverTimestamp()
            }, { merge: true });
            return true;
        } catch (e) {
            console.error("Firestore saveDonation error:", e);
            return false;
        }
    },

    async updateDonation(donationId, fields) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "donations", donationId);
            await updateDoc(docRef, {
                ...fields,
                firestoreUpdatedAt: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error("Firestore updateDonation error:", e);
            return false;
        }
    },

    async deleteDonation(donationId) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "donations", donationId);
            await deleteDoc(docRef);
            return true;
        } catch (e) {
            console.error("Firestore deleteDonation error:", e);
            return false;
        }
    },

    async fetchDonations() {
        if (!this.isAvailable()) return [];
        try {
            const colRef = collection(db, "donations");
            const snap = await getDocs(colRef);
            const items = [];
            snap.forEach(d => items.push(d.data()));
            return items;
        } catch (e) {
            console.error("Firestore fetchDonations error:", e);
            return [];
        }
    },

    listenToDonations(callback) {
        if (!this.isAvailable()) return null;
        try {
            const colRef = collection(db, "donations");
            return onSnapshot(colRef, (snap) => {
                const items = [];
                snap.forEach(d => items.push(d.data()));
                callback(items);
            }, (err) => console.error("Firestore donations listener error:", err));
        } catch (e) {
            return null;
        }
    },

    // =========================================================================
    // 3. REQUESTS COLLECTION
    // =========================================================================
    async saveRequest(request) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "requests", request.id);
            await setDoc(docRef, {
                ...request,
                firestoreUpdatedAt: serverTimestamp()
            }, { merge: true });
            return true;
        } catch (e) {
            console.error("Firestore saveRequest error:", e);
            return false;
        }
    },

    async updateRequest(requestId, fields) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "requests", requestId);
            await updateDoc(docRef, {
                ...fields,
                firestoreUpdatedAt: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error("Firestore updateRequest error:", e);
            return false;
        }
    },

    async deleteRequest(requestId) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "requests", requestId);
            await deleteDoc(docRef);
            return true;
        } catch (e) {
            console.error("Firestore deleteRequest error:", e);
            return false;
        }
    },

    async fetchRequests() {
        if (!this.isAvailable()) return [];
        try {
            const colRef = collection(db, "requests");
            const snap = await getDocs(colRef);
            const items = [];
            snap.forEach(d => items.push(d.data()));
            return items;
        } catch (e) {
            console.error("Firestore fetchRequests error:", e);
            return [];
        }
    },

    listenToRequests(callback) {
        if (!this.isAvailable()) return null;
        try {
            const colRef = collection(db, "requests");
            return onSnapshot(colRef, (snap) => {
                const items = [];
                snap.forEach(d => items.push(d.data()));
                callback(items);
            }, (err) => console.error("Firestore requests listener error:", err));
        } catch (e) {
            return null;
        }
    },

    // =========================================================================
    // 4. CHATS COLLECTION
    // =========================================================================
    async saveChat(conv) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "chats", conv.id);
            await setDoc(docRef, {
                ...conv,
                firestoreUpdatedAt: serverTimestamp()
            }, { merge: true });
            return true;
        } catch (e) {
            console.error("Firestore saveChat error:", e);
            return false;
        }
    },

    async fetchChats() {
        if (!this.isAvailable()) return [];
        try {
            const colRef = collection(db, "chats");
            const snap = await getDocs(colRef);
            const chats = [];
            snap.forEach(d => chats.push(d.data()));
            return chats;
        } catch (e) {
            console.error("Firestore fetchChats error:", e);
            return [];
        }
    },

    listenToChats(callback) {
        if (!this.isAvailable()) return null;
        try {
            const colRef = collection(db, "chats");
            return onSnapshot(colRef, (snap) => {
                const chats = [];
                snap.forEach(d => chats.push(d.data()));
                callback(chats);
            }, (err) => console.error("Firestore chats listener error:", err));
        } catch (e) {
            return null;
        }
    },

    // =========================================================================
    // 5. NOTIFICATIONS COLLECTION
    // =========================================================================
    async saveNotification(notif) {
        if (!this.isAvailable()) return false;
        try {
            const docRef = doc(db, "notifications", notif.id);
            await setDoc(docRef, {
                ...notif,
                firestoreUpdatedAt: serverTimestamp()
            }, { merge: true });
            return true;
        } catch (e) {
            console.error("Firestore saveNotification error:", e);
            return false;
        }
    },

    async fetchNotifications() {
        if (!this.isAvailable()) return [];
        try {
            const colRef = collection(db, "notifications");
            const snap = await getDocs(colRef);
            const list = [];
            snap.forEach(d => list.push(d.data()));
            return list;
        } catch (e) {
            console.error("Firestore fetchNotifications error:", e);
            return [];
        }
    },

    listenToNotifications(callback) {
        if (!this.isAvailable()) return null;
        try {
            const colRef = collection(db, "notifications");
            return onSnapshot(colRef, (snap) => {
                const list = [];
                snap.forEach(d => list.push(d.data()));
                callback(list);
            }, (err) => console.error("Firestore notifications listener error:", err));
        } catch (e) {
            return null;
        }
    },

    // =========================================================================
    // 6. INITIAL DATA SYNC ENGINE
    // =========================================================================
    async initialSync() {
        if (!this.isAvailable()) return;
        console.log("🔥 Syncing local storage with Cloud Firestore...");

        try {
            // 1. Sync Users
            const fireUsers = await this.fetchUsers();
            if (fireUsers.length > 0) {
                const localUsers = JSON.parse(localStorage.getItem('dms_users') || '[]');
                // Merge without duplicates
                const merged = [...fireUsers];
                localUsers.forEach(lu => {
                    if (!merged.some(fu => fu.id === lu.id || fu.email === lu.email)) {
                        merged.push(lu);
                        this.saveUser(lu); // Upload local-only users to Firestore
                    }
                });
                localStorage.setItem('dms_users', JSON.stringify(merged));
            } else {
                // If firestore is empty, upload local users
                const localUsers = JSON.parse(localStorage.getItem('dms_users') || '[]');
                for (const u of localUsers) {
                    await this.saveUser(u);
                }
            }

            // 2. Sync Donations
            const fireDonations = await this.fetchDonations();
            if (fireDonations.length > 0) {
                const localDonations = JSON.parse(localStorage.getItem('dms_donations') || '[]');
                const merged = [...fireDonations];
                localDonations.forEach(ld => {
                    if (!merged.some(fd => fd.id === ld.id)) {
                        merged.push(ld);
                        this.saveDonation(ld);
                    }
                });
                localStorage.setItem('dms_donations', JSON.stringify(merged));
            } else {
                const localDonations = JSON.parse(localStorage.getItem('dms_donations') || '[]');
                for (const d of localDonations) {
                    await this.saveDonation(d);
                }
            }

            // 3. Sync Requests
            const fireRequests = await this.fetchRequests();
            if (fireRequests.length > 0) {
                const localRequests = JSON.parse(localStorage.getItem('dms_requests') || '[]');
                const merged = [...fireRequests];
                localRequests.forEach(lr => {
                    if (!merged.some(fr => fr.id === lr.id)) {
                        merged.push(lr);
                        this.saveRequest(lr);
                    }
                });
                localStorage.setItem('dms_requests', JSON.stringify(merged));
            } else {
                const localRequests = JSON.parse(localStorage.getItem('dms_requests') || '[]');
                for (const r of localRequests) {
                    await this.saveRequest(r);
                }
            }

            // 4. Sync Chats
            const fireChats = await this.fetchChats();
            if (fireChats.length > 0) {
                localStorage.setItem('dms_chats', JSON.stringify(fireChats));
            }

            // 5. Setup Live Listeners
            this.listenToDonations((items) => {
                localStorage.setItem('dms_donations', JSON.stringify(items));
                window.dispatchEvent(new CustomEvent('dms:donations-updated', { detail: items }));
            });

            this.listenToRequests((items) => {
                localStorage.setItem('dms_requests', JSON.stringify(items));
                window.dispatchEvent(new CustomEvent('dms:requests-updated', { detail: items }));
            });

            this.listenToChats((chats) => {
                localStorage.setItem('dms_chats', JSON.stringify(chats));
                window.dispatchEvent(new CustomEvent('dms:chats-updated', { detail: chats }));
            });

            this.listenToNotifications((notifs) => {
                localStorage.setItem('dms_notifications', JSON.stringify(notifs));
                window.dispatchEvent(new CustomEvent('dms:notifications-updated', { detail: notifs }));
            });

            console.log("✅ Cloud Firestore dual-sync active!");
        } catch (e) {
            console.error("Initial Firestore sync error:", e);
        }
    }
};

// Expose globally to window object for access by script.js and page scripts
window.DMS_FIREBASE = FirebaseService;

// Automatically execute initial sync on DOM ready if configured
document.addEventListener("DOMContentLoaded", () => {
    if (FirebaseService.isAvailable()) {
        FirebaseService.initialSync();
    }
});

export default FirebaseService;
