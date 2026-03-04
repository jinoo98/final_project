import { useEffect } from 'react';

// VAPID 공개 키 (테스트용이므로 실제 운영 시에는 서버에서 동적으로 가져와야 함)
const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_VAPID_KEY_HERE';

export const usePushNotification = () => {
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications/');
                if (response.ok) {
                    const data = await response.json();
                    if (data.notifications && data.notifications.length > 0) {
                        for (const note of data.notifications) {
                            showSystemNotification(note.title, note.message);
                        }
                    }
                }
            } catch (error) {
                console.error('Fetch notifications error:', error);
            }
        };

        const showSystemNotification = async (title, message) => {
            const options = {
                body: message,
                icon: "/logo_192.png",
                badge: "/logo_192.png",
                vibrate: [200, 100, 200],
                tag: 'fee-reminder',
                renotify: true,
                data: { url: '/mypage' }
            };

            if (Notification.permission === 'granted') {
                try {
                    if ('serviceWorker' in navigator) {
                        const registration = await navigator.serviceWorker.ready;
                        if (registration && registration.showNotification) {
                            await registration.showNotification(title, options);
                            return;
                        }
                    }
                    new Notification(title, options);
                } catch (e) {
                    new Notification(title, options);
                }
            }
        };

        // 초기 권한 요청
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // 30초마다 새로운 알림 체크 (Polling)
        fetchNotifications(); // 초기 실행
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);
};
