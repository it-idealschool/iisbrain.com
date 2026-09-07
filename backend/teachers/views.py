from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.utils import get_column_letter
from .models import Teacher, SECTION_TYPE_CHOICES, LEADERSHIP_ROLE_CHOICES
from .serializers import TeacherSerializer
from sitesettings.models import RegistrationSettings


class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'emp_no', 'qatar_id', 'email', 'position']

    def get_permissions(self):
        # Public self-registration: anyone can submit a new teacher record
        # (subject to the admin's on/off toggle, checked in create()).
        # Viewing/editing/deleting the list still requires login.
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            settings_row = RegistrationSettings.load()
            if not settings_row.teacher_registration_open:
                raise PermissionDenied('Teacher registration is currently closed.')
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        qs = Teacher.objects.all().prefetch_related('grade_divisions', 'subject_periods__subject')

        params = self.request.query_params
        position = params.get('position')
        section = params.get('section')
        gender = params.get('gender')
        continue_service = params.get('continue_service')
        class_teacher = params.get('class_teacher')
        section_type = params.get('section_type')
        is_coordinator = params.get('is_coordinator')
        is_hod = params.get('is_hod')
        leadership_role = params.get('leadership_role')

        if position:
            qs = qs.filter(position=position)
        if section:
            qs = qs.filter(section=section)
        if gender:
            qs = qs.filter(gender=gender)
        if continue_service:
            qs = qs.filter(continue_service=continue_service)
        if class_teacher:
            qs = qs.filter(class_teacher=class_teacher)
        if section_type:
            qs = qs.filter(section_type=section_type)
        if is_coordinator:
            qs = qs.filter(is_coordinator=is_coordinator)
        if is_hod:
            qs = qs.filter(is_hod=is_hod)
        if leadership_role:
            qs = qs.filter(leadership_role=leadership_role)

        return qs

    @action(detail=False, methods=['get'], url_path='export')
    def export_excel(self, request):
        """
        Current search + filter query params-ന് അനുസരിച്ചുള്ള teacher list
        Excel (.xlsx) ആയി download ചെയ്യുന്നു.
        """
        queryset = self.filter_queryset(self.get_queryset())

        wb = Workbook()
        ws = wb.active
        ws.title = "Teachers"

        headers = [
            "Name", "Emp No", "Qatar ID", "Email", "Contact Number",
            "Position", "Section", "Gender", "Date of Joining",
            "Contract Expiry", "Total Periods", "Class Teacher",
            "Continue Service",
        ]
        ws.append(headers)

        for t in queryset:
            ws.append([
                t.name,
                t.emp_no,
                t.qatar_id,
                t.email,
                t.contact_number,
                t.position,
                t.section,
                t.gender,
                t.doj.isoformat() if t.doj else "",
                t.contract_expiry.isoformat() if t.contract_expiry else "",
                t.total_periods,
                t.class_teacher,
                t.continue_service,
            ])

        for i in range(1, len(headers) + 1):
            ws.column_dimensions[get_column_letter(i)].width = 18

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="teachers.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=['get'], url_path='structure-report')
    def structure_report(self, request):
        """
        School structure report:
          - how many teachers handle each subject (and who handles the most subjects)
          - per section (Boys / Girls / Junior / KG): class teacher count, coordinator
            count, and the VP / HM / AHM assigned to that section
          - list of HODs by subject
        """
        teachers = list(
            Teacher.objects.all().prefetch_related('subject_periods__subject', 'hod_subject')
        )

        # --- Subject-wise teacher counts -----------------------------------
        subject_counts = {}
        teacher_subject_totals = []
        for t in teachers:
            subs = list(t.subject_periods.all())
            if subs:
                teacher_subject_totals.append({'teacher_id': str(t.id), 'name': t.name, 'subject_count': len(subs)})
            for sp in subs:
                key = str(sp.subject_id)
                if key not in subject_counts:
                    subject_counts[key] = {
                        'subject_id': key,
                        'subject_name': sp.subject.name,
                        'teacher_count': 0,
                        'required_teachers': sp.subject.required_teachers,
                    }
                subject_counts[key]['teacher_count'] += 1

        subject_list = sorted(subject_counts.values(), key=lambda x: -x['teacher_count'])
        teacher_subject_totals.sort(key=lambda x: -x['subject_count'])
        top_subject_teacher = teacher_subject_totals[0] if teacher_subject_totals else None

        # --- Section-wise breakdown ------------------------------------------
        sections = {}
        for code, label in SECTION_TYPE_CHOICES:
            sec_teachers = [t for t in teachers if t.section_type == code]
            class_teachers = [t for t in sec_teachers if t.class_teacher == 'YES']
            coordinators = [t for t in sec_teachers if t.is_coordinator == 'YES']

            leadership = {}
            for role_code, role_label in LEADERSHIP_ROLE_CHOICES:
                holder = next((t for t in sec_teachers if t.leadership_role == role_code), None)
                leadership[role_code] = {
                    'label': role_label,
                    'name': holder.name if holder else None,
                    'teacher_id': str(holder.id) if holder else None,
                }

            sections[code] = {
                'label': label,
                'total_teachers': len(sec_teachers),
                'class_teacher_count': len(class_teachers),
                'class_teachers': [{'id': str(t.id), 'name': t.name} for t in class_teachers],
                'coordinator_count': len(coordinators),
                'coordinators': [{'id': str(t.id), 'name': t.name} for t in coordinators],
                'leadership': leadership,
            }

        # --- HOD list -----------------------------------------------------
        hods = [
            {
                'subject_id': str(t.hod_subject_id),
                'subject_name': t.hod_subject.name,
                'teacher_id': str(t.id),
                'teacher_name': t.name,
            }
            for t in teachers
            if t.is_hod == 'YES' and t.hod_subject_id
        ]

        return Response({
            'subjects': subject_list,
            'top_subject_teacher': top_subject_teacher,
            'sections': sections,
            'hods': hods,
        })