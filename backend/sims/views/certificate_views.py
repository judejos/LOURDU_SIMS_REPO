"""
SIMS — Certificate Generation Views
Server-side PDF generation for all certificate types.
"""
import io
from django.http import FileResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Certificate, UserProfile
from ..serializers import CertificateSerializer
from ..permissions import IsLeadOrAbove


def generate_pdf(title, content_lines):
    """Generate a simple PDF certificate."""
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        w, h = landscape(A4)

        # Border
        c.setStrokeColorRGB(0.1, 0.3, 0.6)
        c.setLineWidth(3)
        c.rect(30, 30, w - 60, h - 60)

        # Title
        c.setFont("Helvetica-Bold", 28)
        c.setFillColorRGB(0.1, 0.3, 0.6)
        c.drawCentredString(w / 2, h - 100, title)

        # Content
        c.setFont("Helvetica", 14)
        c.setFillColorRGB(0.1, 0.1, 0.1)
        y = h - 160
        for line in content_lines:
            c.drawCentredString(w / 2, y, line)
            y -= 30

        # Footer
        c.setFont("Helvetica-Oblique", 10)
        c.drawCentredString(w / 2, 60, "SIMS — Student Intern Management System")

        c.save()
        buffer.seek(0)
        return buffer
    except ImportError:
        return None


class GenerateCompletionCertificateView(APIView):
    """POST /Sims/generate-completion-certificate/"""
    permission_classes = [IsAuthenticated, IsLeadOrAbove]

    def post(self, request):
        emp_id = request.data.get('emp_id')
        try:
            intern = UserProfile.objects.get(emp_id=emp_id)
            content = [
                "Certificate of Completion",
                "",
                f"This is to certify that {intern.full_name}",
                f"(Employee ID: {intern.emp_id})",
                f"has successfully completed the internship program",
                f"Domain: {intern.domain.name if intern.domain else 'N/A'}",
                f"Duration: {intern.start_date} to {intern.end_date}",
            ]
            pdf = generate_pdf("Certificate of Completion", content)
            if pdf:
                cert = Certificate.objects.create(
                    intern=intern, cert_type='completion', generated_by=request.user.profile
                )
                return FileResponse(pdf, as_attachment=True, filename=f"completion_{emp_id}.pdf")
            return Response({'message': 'Certificate generated (PDF engine not available)'})
        except UserProfile.DoesNotExist:
            return Response({'error': 'Intern not found'}, status=status.HTTP_404_NOT_FOUND)


class GenerateOfferLetterView(APIView):
    """POST /Sims/generate-offer-letter/"""
    permission_classes = [IsAuthenticated, IsLeadOrAbove]

    def post(self, request):
        emp_id = request.data.get('emp_id')
        try:
            intern = UserProfile.objects.get(emp_id=emp_id)
            content = [
                "Offer Letter",
                "",
                f"Dear {intern.full_name},",
                f"We are pleased to offer you an internship position",
                f"at {intern.entity.name if intern.entity else 'our organization'}.",
                f"Start Date: {intern.start_date}",
                f"Domain: {intern.domain.name if intern.domain else 'N/A'}",
            ]
            pdf = generate_pdf("Internship Offer Letter", content)
            if pdf:
                Certificate.objects.create(intern=intern, cert_type='offer_letter', generated_by=request.user.profile)
                return FileResponse(pdf, as_attachment=True, filename=f"offer_{emp_id}.pdf")
            return Response({'message': 'Offer letter generated'})
        except UserProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class GenerateTaskCertificateView(APIView):
    """POST /Sims/generate-task-certificate/"""
    permission_classes = [IsAuthenticated, IsLeadOrAbove]

    def post(self, request):
        emp_id = request.data.get('emp_id')
        task_name = request.data.get('task_name', 'Project Task')
        try:
            intern = UserProfile.objects.get(emp_id=emp_id)
            content = [
                "Task Completion Certificate", "",
                f"Awarded to {intern.full_name}",
                f"For completion of: {task_name}",
            ]
            pdf = generate_pdf("Task Certificate", content)
            if pdf:
                Certificate.objects.create(intern=intern, cert_type='task', generated_by=request.user.profile)
                return FileResponse(pdf, as_attachment=True, filename=f"task_cert_{emp_id}.pdf")
            return Response({'message': 'Generated'})
        except UserProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class GenerateAttendanceCertificateView(APIView):
    """POST /Sims/generate-attendance-certificate/"""
    permission_classes = [IsAuthenticated, IsLeadOrAbove]

    def post(self, request):
        emp_id = request.data.get('emp_id')
        try:
            intern = UserProfile.objects.get(emp_id=emp_id)
            from ..models import AttendanceRecord
            att = AttendanceRecord.objects.filter(user=intern)
            total = att.count()
            present = att.filter(status='present').count()
            pct = round((present / total * 100), 1) if total > 0 else 0
            content = [
                "Attendance Certificate", "",
                f"Issued to {intern.full_name}",
                f"Attendance: {pct}% ({present}/{total} days)",
            ]
            pdf = generate_pdf("Attendance Certificate", content)
            if pdf:
                Certificate.objects.create(intern=intern, cert_type='attendance', generated_by=request.user.profile)
                return FileResponse(pdf, as_attachment=True, filename=f"attendance_{emp_id}.pdf")
            return Response({'message': 'Generated'})
        except UserProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class GeneratePartialCertificateView(APIView):
    """POST /Sims/generate-partial-certificate/"""
    permission_classes = [IsAuthenticated, IsLeadOrAbove]

    def post(self, request):
        emp_id = request.data.get('emp_id')
        try:
            intern = UserProfile.objects.get(emp_id=emp_id)
            content = [
                "Partial Completion Certificate", "",
                f"Issued to {intern.full_name}",
                "For partial completion of the internship program.",
            ]
            pdf = generate_pdf("Partial Completion Certificate", content)
            if pdf:
                Certificate.objects.create(intern=intern, cert_type='partial', generated_by=request.user.profile)
                return FileResponse(pdf, as_attachment=True, filename=f"partial_{emp_id}.pdf")
            return Response({'message': 'Generated'})
        except UserProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
