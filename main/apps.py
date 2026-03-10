from django.apps import AppConfig


class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main'

    def ready(self):
        import os
        import threading
        # runserver 는 auto-reload 때문에 ready()가 두 번 호출됨.
        # RUN_MAIN='true' 인 실제 워커 프로세스에서만 모델을 로드합니다.
        if os.environ.get('RUN_MAIN') != 'true':
            return

        from .ocr_service import load_ocr_model
        # 백그라운드 스레드로 실행 → 서버가 즉시 시작됨
        t = threading.Thread(target=load_ocr_model, daemon=True)
        t.start()
