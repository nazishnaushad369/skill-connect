import os
import django
import random
from datetime import date, time, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        from apps.skills.models import Skill
        from apps.matches.models import Match
        from apps.sessions.models import Session
        from apps.messages.models import Message
        from apps.feedback.models import Feedback

        self.stdout.write('Seeding database...')

        # Clear existing data
        Feedback.objects.all().delete()
        Session.objects.all().delete()
        Match.objects.all().delete()
        Message.objects.all().delete()
        Skill.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # Create users
        users_data = [
            {'name': 'Alice Chen', 'email': 'alice@skillconnect.io', 'bio': 'Full-stack developer passionate about teaching React and learning design.'},
            {'name': 'Bob Martinez', 'email': 'bob@skillconnect.io', 'bio': 'UX Designer with 5 years experience. Want to learn programming.'},
            {'name': 'Carol Kim', 'email': 'carol@skillconnect.io', 'bio': 'Data scientist who loves Python. Learning web dev on the side.'},
            {'name': 'David Okonkwo', 'email': 'david@skillconnect.io', 'bio': 'Marketing expert. Looking to learn data analytics.'},
            {'name': 'Emma Wilson', 'email': 'emma@skillconnect.io', 'bio': 'Photographer and graphic artist. Interested in coding.'},
        ]

        users = []
        for data in users_data:
            user = User.objects.create_user(password='Demo@1234', **data)
            users.append(user)
            self.stdout.write(f'  Created user: {user.name}')

        # Create admin
        if not User.objects.filter(email='admin@skillconnect.io').exists():
            User.objects.create_superuser(
                email='admin@skillconnect.io',
                name='Admin User',
                password='Admin@1234',
            )
            self.stdout.write('  Created admin: admin@skillconnect.io')

        # Create skills
        alice, bob, carol, david, emma = users
        skills_data = [
            (alice, 'React.js', 'Programming', 'teach'),
            (alice, 'JavaScript', 'Programming', 'teach'),
            (alice, 'UI/UX Design', 'Design', 'learn'),
            (alice, 'Figma', 'Design', 'learn'),
            (bob, 'UI/UX Design', 'Design', 'teach'),
            (bob, 'Figma', 'Design', 'teach'),
            (bob, 'Wireframing', 'Design', 'teach'),
            (bob, 'React.js', 'Programming', 'learn'),
            (carol, 'Python', 'Programming', 'teach'),
            (carol, 'Machine Learning', 'Data Science', 'teach'),
            (carol, 'JavaScript', 'Programming', 'learn'),
            (carol, 'Vue.js', 'Programming', 'learn'),
            (david, 'Digital Marketing', 'Marketing', 'teach'),
            (david, 'SEO', 'Marketing', 'teach'),
            (david, 'Python', 'Programming', 'learn'),
            (david, 'Data Analytics', 'Data Science', 'learn'),
            (emma, 'Photography', 'Creative', 'teach'),
            (emma, 'Graphic Design', 'Design', 'teach'),
            (emma, 'React.js', 'Programming', 'learn'),
            (emma, 'JavaScript', 'Programming', 'learn'),
        ]

        for user, skill_name, category, stype in skills_data:
            Skill.objects.create(user=user, skill_name=skill_name, category=category, skill_type=stype)

        self.stdout.write(f'  Created {len(skills_data)} skills')

        # Create matches
        Match.objects.create(user1=alice, user2=bob, matched_skill='UI/UX Design', status='accepted')
        Match.objects.create(user1=carol, user2=alice, matched_skill='JavaScript', status='accepted')
        Match.objects.create(user1=david, user2=carol, matched_skill='Python', status='pending')
        Match.objects.create(user1=emma, user2=alice, matched_skill='React.js', status='pending')
        self.stdout.write('  Created 4 matches')

        # Create sessions
        today = date.today()
        sessions = [
            Session.objects.create(user1=alice, user2=bob, title='React Basics Session', date=today + timedelta(days=2), time=time(14, 0), status='scheduled'),
            Session.objects.create(user1=bob, user2=alice, title='Figma Design Workshop', date=today + timedelta(days=5), time=time(10, 0), status='scheduled'),
            Session.objects.create(user1=carol, user2=alice, title='Python for Web Devs', date=today - timedelta(days=3), time=time(16, 0), status='completed'),
            Session.objects.create(user1=david, user2=carol, title='ML Introduction', date=today - timedelta(days=7), time=time(11, 0), status='completed'),
        ]
        self.stdout.write('  Created 4 sessions')

        # Create messages
        msg_pairs = [
            (alice, bob, 'Hey Bob! Ready for our React session?'),
            (bob, alice, 'Absolutely! Looking forward to it. Should I prepare anything?'),
            (alice, bob, 'Just have your dev environment ready. We will build a small app together.'),
            (carol, alice, 'Hi Alice, can we schedule a JS session this week?'),
            (alice, carol, 'Sure! How about Thursday 5pm?'),
        ]
        for sender, receiver, content in msg_pairs:
            Message.objects.create(sender=sender, receiver=receiver, content=content)
        self.stdout.write('  Created 5 messages')

        # Create feedback for completed sessions
        Feedback.objects.create(session=sessions[2], reviewer=alice, reviewee=carol, rating=5, comment='Carol is an amazing Python teacher! Very patient and clear.')
        Feedback.objects.create(session=sessions[3], reviewer=david, reviewee=carol, rating=4, comment='Great ML intro. Very knowledgeable.')
        self.stdout.write('  Created 2 feedback entries')

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write('\nDemo accounts:')
        self.stdout.write('  alice@skillconnect.io / Demo@1234')
        self.stdout.write('  bob@skillconnect.io / Demo@1234')
        self.stdout.write('  carol@skillconnect.io / Demo@1234')
        self.stdout.write('  admin@skillconnect.io / Admin@1234')
