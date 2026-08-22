from django.core.management.base import BaseCommand
from subjects.models import Subject

SUBJECTS = [
    'READING', 'RHYME', 'CONVERSATION', 'ENGLISH WRITER BOOK', 'NUMBER WORK BOOK', 'STORY TELLING',
    'ENGLISH', 'MATHEMATICS', 'SCIENCE', 'EVS', 'SOCIAL SCIENCE', 'QATAR HISTORY (ARAB)', 'QATAR HISTORY (NON-ARAB)',
    'GK', 'ART', 'CRAFT', 'MORAL SCIENCE', 'QURAN', 'DANCE', 'MUSIC', 'WORK EXPERIENCE', 'PT', 'LIBRARY',
    'ISLAMIYATH (ARAB)', 'ISLAMIYATH (NON-ARAB)', 'VALUE EDUCATION',
    'SL-HINDI', 'SL-URDU', 'SL-MALAYALAM', 'SL-ARABIC (ARAB)', 'SL-ARABIC (NON-ARAB)', 'SL-TAMIL', 'SL-FRENCH',
    'TL-HINDI', 'TL-MALAYALAM', 'TL-URDU', 'TL-ARABIC', 'TL-FRENCH', 'TL-TAMIL', 'TL-KANNADA', 'TL-MARATHI',
    'ICT/AI', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'INFORMATICS PRACTICES', 'COMPUTER SCIENCE', 'HOME SCIENCE',
    'PHYSICAL EDUCATION', 'ENGINEERING GRAPHICS', 'ACCOUNTANCY', 'BUSINESS STUDIES', 'ECONOMICS', 'HISTORY',
    'PSYCHOLOGY', 'POLITICAL SCIENCE', 'BUSINESS ADMINISTRATION', 'TOURISM', 'INSURANCE', 'INFORMATION TECHNOLOGY',
    'ARABIC (ARAB)',
]


class Command(BaseCommand):
    help = 'Load the default subject list'

    def handle(self, *args, **kwargs):
        created = 0
        for name in SUBJECTS:
            obj, was_created = Subject.objects.get_or_create(name=name)
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Done. {created} new subjects added.'))