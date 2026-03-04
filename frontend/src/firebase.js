// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging"; // getToken 추가

// Vite 환경 변수를 불러와서 객체에 담아줍니다.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// 다른 파일(컴포넌트)에서 가져다 쓸 수 있도록 export 해줍니다.
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

/**
 * 전역적으로 사용할 수 있도록 FCM 토큰을 요청하는 함수를 export 합니다.
 */
export const requestFcmToken = async () => {
    try {
        // 1. 브라우저의 알림 권한 확인 및 요청
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn("🚫 알림 권한이 거부되었습니다.");
            return null;
        }

        // 2. FCM 토큰 가져오기
        // 주의: Web Push Certificate(VAPID)가 설정되어 있어야 합니다.
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BFsL1_S_2zYf-z6X0-Z9X_X_X_X_X_X_X_X_X_X_X_X_X' // 예시 (본인의 키로 교체 필요)
        });

        if (token) {
            return token;
        } else {
            console.warn("⚠️ FCM 토큰을 가져올 수 없습니다. 권한 설정을 확인하세요.");
            return null;
        }
    } catch (error) {
        console.error("❌ FCM 토큰 요청 중 에러 발생:", error);
        return null;
    }
};