"""
SIMS — Payment Views
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import PaymentRecord, PaymentHistory, FeeStructure, UserProfile
from ..serializers import PaymentRecordSerializer, PaymentHistorySerializer, FeeStructureSerializer
from ..permissions import IsStaffOrAbove, IsSuperAdminOrManager


class PaymentListCreateView(APIView):
    """GET/POST /Sims/fees/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        if profile.role == 'intern':
            qs = PaymentRecord.objects.filter(user=profile)
        else:
            qs = PaymentRecord.objects.all()
            if profile.role != 'superadmin':
                qs = qs.filter(entity=profile.entity)
        return Response(PaymentRecordSerializer(qs, many=True).data)

    def post(self, request):
        serializer = PaymentRecordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(entity=request.user.profile.entity)
        if payment.payment_mode == 'cash':
            payment.requires_approval = True
            payment.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentByUserView(APIView):
    """GET /Sims/fees/{empId}/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, emp_id):
        try:
            user = UserProfile.objects.get(emp_id=emp_id)
            qs = PaymentRecord.objects.filter(user=user)
            return Response(PaymentRecordSerializer(qs, many=True).data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class PaymentDetailView(APIView):
    """PATCH /Sims/fees/{pk}/"""
    permission_classes = [IsAuthenticated, IsStaffOrAbove]

    def patch(self, request, pk):
        try:
            payment = PaymentRecord.objects.get(pk=pk)
            old = PaymentRecordSerializer(payment).data
            serializer = PaymentRecordSerializer(payment, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            PaymentHistory.objects.create(
                payment=payment, changed_by=request.user.profile,
                old_data=old, new_data=serializer.data
            )
            return Response(serializer.data)
        except PaymentRecord.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class FeeStructureListCreateView(APIView):
    """GET/POST /Sims/fee-structure/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def get(self, request):
        profile = request.user.profile
        qs = FeeStructure.objects.filter(is_active=True)
        if profile.role != 'superadmin':
            qs = qs.filter(entity=profile.entity)
        return Response(FeeStructureSerializer(qs, many=True).data)

    def post(self, request):
        serializer = FeeStructureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(entity=request.user.profile.entity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
