import math
from collections import defaultdict

from django.db.models import Count
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from students.models import Student, GRADE_CHOICES
from teachers.models import Teacher
from admin_staff.models import AdminStaff
from transport.models import TransportStaff

from .models import AcademicYear, SchoolManpowerSettings, GradeDivision, SubjectGradeRequirement
from .serializers import (
    AcademicYearSerializer,
    SchoolManpowerSettingsSerializer,
    GradeDivisionSerializer,
    SubjectGradeRequirementSerializer,
)

GRADE_ORDER = [code for code, _ in GRADE_CHOICES]
GRADE_LABELS = dict(GRADE_CHOICES)


def _grade_sort_key(grade):
    try:
        return GRADE_ORDER.index(grade)
    except ValueError:
        return len(GRADE_ORDER)


def ratio_status(ratio, target, margin):
    """GOOD / WARNING / CRITICAL classification for a student:teacher ratio.
    `target` and `margin` are configurable — never hard-coded thresholds."""
    if ratio is None:
        return 'INFO'
    if ratio <= target:
        return 'GOOD'
    if ratio <= target + margin:
        return 'WARNING'
    return 'CRITICAL'


def capacity_status(occupancy_pct, warning_pct):
    if occupancy_pct is None:
        return 'INFO'
    if occupancy_pct > 100:
        return 'CRITICAL'
    if occupancy_pct >= warning_pct:
        return 'WARNING'
    return 'GOOD'


def _normalize_class_label(text):
    """Free-text 'class teacher grade/division' fields are typed by hand
    (e.g. 'Grade-5 A', 'GRADE 5A', 'Grade - 5, A'), so compare loosely by
    stripping everything except letters and digits."""
    return ''.join(ch for ch in text.upper() if ch.isalnum())


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [permissions.IsAuthenticated]


class GradeDivisionViewSet(viewsets.ModelViewSet):
    queryset = GradeDivision.objects.all()
    serializer_class = GradeDivisionSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubjectGradeRequirementViewSet(viewsets.ModelViewSet):
    queryset = SubjectGradeRequirement.objects.select_related('subject').all()
    serializer_class = SubjectGradeRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]


class ManpowerSettingsView(APIView):
    """Singleton get/update for the school's configurable planning
    benchmarks (Section 33/37 of the spec)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_obj = SchoolManpowerSettings.load()
        return Response(SchoolManpowerSettingsSerializer(settings_obj).data)

    def put(self, request):
        settings_obj = SchoolManpowerSettings.load()
        serializer = SchoolManpowerSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class OverviewAnalyticsView(APIView):
    """Section 1 + 2: School Analytics KPI cards and the student:teacher
    ratio panel. All figures are computed live from the database — nothing
    here is a stored/cached snapshot."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_obj = SchoolManpowerSettings.load()

        total_students = Student.objects.count()
        total_teachers = Teacher.objects.exclude(continue_service='NO').count()
        total_admin_staff = AdminStaff.objects.count()
        total_transport_staff = TransportStaff.objects.count()
        total_employees = total_teachers + total_admin_staff + total_transport_staff

        total_grades = (
            Student.objects.exclude(grade='').values('grade').distinct().count()
        )
        total_divisions = (
            Student.objects.exclude(grade='').exclude(division='')
            .values('grade', 'division').distinct().count()
        )
        avg_students_per_class = (
            round(total_students / total_divisions, 1) if total_divisions else None
        )

        target_ratio = float(settings_obj.student_teacher_ratio_target)
        margin = float(settings_obj.ratio_warning_margin)
        current_ratio = round(total_students / total_teachers, 1) if total_teachers else None
        ratio_state = ratio_status(current_ratio, target_ratio, margin)

        required_teachers = math.ceil(total_students / target_ratio) if target_ratio else None
        teacher_gap = (
            total_teachers - required_teachers
            if required_teachers is not None else None
        )

        return Response({
            'kpis': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_admin_staff': total_admin_staff,
                'total_transport_staff': total_transport_staff,
                'total_employees': total_employees,
                'total_grades': total_grades,
                'total_divisions': total_divisions,
                'average_students_per_class': avg_students_per_class,
            },
            'student_teacher_ratio': {
                'current_ratio': current_ratio,
                'target_ratio': target_ratio,
                'status': ratio_state,
                'required_teachers': required_teachers,
                'current_teachers': total_teachers,
                'teacher_gap': teacher_gap,
            },
        })


class StudentGradeAnalyticsView(APIView):
    """Section 3: grade-wise student analysis table."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_obj = SchoolManpowerSettings.load()
        default_capacity = settings_obj.default_class_capacity
        warning_pct = settings_obj.class_capacity_warning_percentage

        rows = defaultdict(lambda: {'boys': 0, 'girls': 0, 'divisions': set()})
        qs = Student.objects.exclude(grade='').values('grade', 'division', 'gender')
        for rec in qs:
            g = rows[rec['grade']]
            if rec['gender'] == 'MALE':
                g['boys'] += 1
            elif rec['gender'] == 'FEMALE':
                g['girls'] += 1
            if rec['division']:
                g['divisions'].add(rec['division'])

        # Pull any explicitly configured per-grade capacity from GradeDivision rows.
        grade_capacity_overrides = {}
        for gd in GradeDivision.objects.exclude(capacity__isnull=True):
            grade_capacity_overrides.setdefault(gd.grade, []).append(gd.capacity)

        result = []
        for grade, data in rows.items():
            total = data['boys'] + data['girls']
            division_count = len(data['divisions']) or 1
            avg_per_class = round(total / division_count, 1)
            capacities = grade_capacity_overrides.get(grade)
            capacity = round(sum(capacities) / len(capacities)) if capacities else default_capacity
            occupancy_pct = round((avg_per_class / capacity) * 100, 1) if capacity else None
            result.append({
                'grade': grade,
                'grade_display': GRADE_LABELS.get(grade, grade),
                'boys': data['boys'],
                'girls': data['girls'],
                'total_students': total,
                'divisions': len(data['divisions']),
                'average_per_class': avg_per_class,
                'class_capacity': capacity,
                'status': capacity_status(occupancy_pct, warning_pct),
            })

        result.sort(key=lambda r: _grade_sort_key(r['grade']))
        return Response(result)


class ClassCapacityAnalyticsView(APIView):
    """Section 4: division/class-level strength & capacity analysis."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        settings_obj = SchoolManpowerSettings.load()
        default_capacity = settings_obj.default_class_capacity
        warning_pct = settings_obj.class_capacity_warning_percentage

        capacity_lookup = {
            (gd.grade, gd.division): gd.capacity
            for gd in GradeDivision.objects.exclude(capacity__isnull=True)
        }
        class_teacher_lookup = defaultdict(list)
        for t in Teacher.objects.exclude(class_teacher_grade_division=''):
            class_teacher_lookup[_normalize_class_label(t.class_teacher_grade_division)].append(t.name)

        rows = defaultdict(lambda: {'boys': 0, 'girls': 0})
        qs = Student.objects.exclude(grade='').exclude(division='').values('grade', 'division', 'gender')
        for rec in qs:
            key = (rec['grade'], rec['division'])
            if rec['gender'] == 'MALE':
                rows[key]['boys'] += 1
            elif rec['gender'] == 'FEMALE':
                rows[key]['girls'] += 1

        result = []
        for (grade, division), data in rows.items():
            total = data['boys'] + data['girls']
            capacity = capacity_lookup.get((grade, division), default_capacity)
            available = capacity - total if capacity else None
            occupancy_pct = round((total / capacity) * 100, 1) if capacity else None
            label = f"{GRADE_LABELS.get(grade, grade)} {division}"
            class_teachers = class_teacher_lookup.get(_normalize_class_label(label), [])
            result.append({
                'grade': grade,
                'grade_display': GRADE_LABELS.get(grade, grade),
                'division': division,
                'boys': data['boys'],
                'girls': data['girls'],
                'total_students': total,
                'class_capacity': capacity,
                'available_seats': available,
                'occupancy_percentage': occupancy_pct,
                'class_teacher': class_teachers[0] if class_teachers else None,
                'duplicate_class_teacher_assignment': len(class_teachers) > 1,
                'status': capacity_status(occupancy_pct, warning_pct),
            })

        result.sort(key=lambda r: (_grade_sort_key(r['grade']), r['division']))
        return Response(result)
