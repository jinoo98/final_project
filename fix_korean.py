import os

directory = r'c:\Users\User\Dev_F\final_project\frontend\src\pages'

# Common replacements for mangled Korean (utf-8 interpreted as latin1 and then saved as utf-8)
# This is a bit risky, but let's see.
# Alternatively, I can just replace the localhost part and hope for the best, 
# but I really should fix the Korean.

replacements = [
    ('?대찓??', '이메일'),
    ('鍮꾨?踰덊샇', '비밀번호'),
    ('紐⑥엫??紐⑤뱺寃?', '모임의 모든것'),
    ('?됰꽕??', '닉네임'),
    ('?앸뀈?붿씪', '생년월일'),
    ('?깅퀎', '성별'),
    ('?⑥꽦', '남성'),
    ('?ъ꽦', '여성'),
    ('???, '지출'),
    ('?낅젰?댁＜?몄슂', '입력해주세요'),
    ('?뚯썝媛€??, '회원가입'),
    ('硫붿씤', '메인'),
    ('濡쒓렇??, '로그인'),
    ('?쇱젙', '일정'),
    ('愿€由?', '관리'),
    ('??쒕낫??, '대시보드'),
    ('?꾧툑', '현금'),
    ('?곸닔利?', '영수증'),
    ('?낅줈?쒗븯怨?', '업로드하고'),
    ('?먮룞?줈', '자동으로'),
    ('?댁뿭??, '내역을'),
    ('湲곕줉?섏꽭??, '기록하세요'),
    ('?쒕쾭?€', '서버와'),
    ('?듭떊', '통신'),
    ('諛쒖깮?덉뒿?덈떎', '발생했습니다'),
]

for filename in os.listdir(directory):
    if filename.endswith('.jsx'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Also ensure localhost is gone
        content = content.replace('http://localhost:8000', '')
        
        # Apply Korean fixes
        for old, new in replacements:
            content = content.replace(old, new)
            
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done")
