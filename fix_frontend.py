import os
import re

directory = r'c:\Users\User\Dev_F\final_project\frontend\src\pages'
localhost_pattern = re.compile(r'http://localhost:8000')

# For fixing the broken encoding, we might need to manually fix common strings if they are broken.
# But if it's just the localhost replacement we want, let's focus on that first.
# Wait, if I already broke the encoding, I should try to fix it.

for filename in os.listdir(directory):
    if filename.endswith('.jsx'):
        path = os.path.join(directory, filename)
        try:
            # Try reading as utf-8 (which might fail if PowerShell mangled it)
            # PowerShell often saves as UTF-16 LE with BOM or something else.
            # Let's try to detect or just read as bytes and see.
            with open(path, 'rb') as f:
                content = f.read()
            
            # If it was saved as UTF-8 by my last command, let's keep it.
            # But the content itself might be mangled.
            
            # Let's try to just fix the localhost part properly on the original files if possible?
            # No, I already overthrew them.
            pass
        except Exception as e:
            print(f"Error reading {filename}: {e}")

print("Script finished")
