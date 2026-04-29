"""
SkillConnect Django Launcher
Injects site-packages path then delegates to Django's management command runner.
Run as: C:\Python314\python.exe -S launch_django.py migrate
         C:\Python314\python.exe -S launch_django.py runserver 0.0.0.0:8000
"""
import sys
import os

# 1. Inject our packages
sys.path.insert(0, r'C:\Users\nazis\OneDrive\Desktop\skill\Lib\site-packages')

# 2. Re-enable site so stdlib extras work (encodings etc. already loaded at this point)
#    We just need the packages — stdlib is fine from C:\Python314

# 3. Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 4. Run management command
from django.core.management import execute_from_command_line
execute_from_command_line(sys.argv)
