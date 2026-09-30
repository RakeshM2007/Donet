import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


export async function createDonationCareAccount(
    fullName,
    email,
    phone,
    city,
    address,
    password,
    role
) {

    try {

        // Create account in Firebase Authentication
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Save additional information in Firestore
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                fullName: fullName,
                email: email,
                phone: phone,
                city: city,
                address: address,
                role: role,
                status: "active",
                createdAt: serverTimestamp()
            }
        );

        console.log(
            "DonationCare account created:",
            user.uid
        );

        return {
            success: true,
            uid: user.uid
        };

    } catch (error) {

        console.error(
            "Firebase registration error:",
            error
        );

        return {
            success: false,
            error: error
        };
    }
}