"""
SIMS — Payment Views

Permission matrix:
  GET  (list/history) : Admin (superadmin) + Manager  [IsManagerOrAbove]
  POST (create)       : SME (lead) only                [IsSME]
  PATCH (update)      : SME (lead) only                [IsSME]
  Interns always see their own records via self-scoped GET.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import PaymentRecord, PaymentHistory, FeeStructure, UserProfile
from ..serializers import PaymentRecordSerializer, PaymentHistorySerializer, FeeStructureSerializer
from ..permissions import IsManagerOrAbove, IsSME, IsSMEOrAbove


class PaymentListCreateView(APIView):
    """GET/POST /Sims/fees/"""

    def get_permissions(self):
        # Interns can GET (to see own record); staff need Manager+ or SME
        return [IsAuthenticated()]

    def get(self, request):
        profile = request.user.profile
        if profile.role == 'intern':
            # Intern sees only their own records
            qs = PaymentRecord.objects.filter(user=profile)
        elif profile.role in ('superadmin', 'manager'):
            # Admin / Manager — view all (entity-scoped)
            qs = PaymentRecord.objects.all()
            if profile.role != 'superadmin':
                qs = qs.filter(entity=profile.entity)
        elif profile.role == 'sme':
            # SME — see all records in their entity for payment management
            qs = PaymentRecord.objects.filter(entity=profile.entity)
        else:
            # mentor / staff — no payment access
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return Response(PaymentRecordSerializer(qs, many=True).data)

    def post(self, request):
        """Only SME can create payment records."""
        profile = request.user.profile
        if profile.role not in ('sme', 'superadmin'):
            return Response({'error': 'Only SME or Admin can create payment records'},
                            status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        if 'emp_id' in data:
            try:
                intern_profile = UserProfile.objects.get(emp_id=data['emp_id'])
                data['user'] = intern_profile.id
            except UserProfile.DoesNotExist:
                return Response({'error': f"Intern with emp_id {data['emp_id']} not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentRecordSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(entity=profile.entity)
        if payment.payment_mode == 'cash':
            payment.requires_approval = True
            payment.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentByUserView(APIView):
    """GET /Sims/fees/{empId}/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, emp_id):
        profile = request.user.profile
        # Intern can only view own records
        if profile.role == 'intern' and profile.emp_id != emp_id:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = UserProfile.objects.get(emp_id=emp_id)
            qs = PaymentRecord.objects.filter(user=user)
            upi_id = ''
            if profile.entity and hasattr(profile.entity, 'config'):
                upi_id = profile.entity.config.company_upi_id
            
            return Response({
                'payments': PaymentRecordSerializer(qs, many=True).data,
                'company_upi_id': upi_id
            })
        except UserProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class PaymentDetailView(APIView):
    """PATCH /Sims/fees/{pk}/ — SME updates payment status / finalizes."""
    permission_classes = [IsAuthenticated, IsSMEOrAbove]

    def patch(self, request, pk):
        profile = request.user.profile
        # Manager can only view, not patch payments
        if profile.role == 'manager':
            return Response({'error': 'Managers can view payments but not modify them'},
                            status=status.HTTP_403_FORBIDDEN)
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


class SubmitPaymentView(APIView):
    """PATCH /Sims/fees/{pk}/submit/ — Intern uploads screenshot & transaction ID."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        profile = request.user.profile
        try:
            payment = PaymentRecord.objects.get(pk=pk)
            # Ensure the intern is only submitting their own payment
            if payment.user != profile:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # They should only be able to submit if it's pending/overdue
            if payment.status not in ('pending', 'overdue'):
                return Response({'error': 'Payment is already submitted or paid'}, status=status.HTTP_400_BAD_REQUEST)

            # Accept transaction_id and screenshot
            transaction_id = request.data.get('transaction_id', '')
            screenshot = request.FILES.get('screenshot')

            if not transaction_id and not screenshot:
                return Response({'error': 'Must provide transaction ID or screenshot'}, status=status.HTTP_400_BAD_REQUEST)

            payment.transaction_id = transaction_id
            if screenshot:
                payment.screenshot = screenshot
            payment.status = 'submitted'
            payment.payment_mode = 'upi'
            payment.save()
            
            return Response(PaymentRecordSerializer(payment).data)
        except PaymentRecord.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class FeeStructureListCreateView(APIView):
    """GET/POST /Sims/fee-structure/ — SME manages fee structures."""
    permission_classes = [IsAuthenticated, IsSMEOrAbove]

    def get(self, request):
        profile = request.user.profile
        qs = FeeStructure.objects.filter(is_active=True)
        if profile.role != 'superadmin':
            qs = qs.filter(entity=profile.entity)
        return Response(FeeStructureSerializer(qs, many=True).data)

    def post(self, request):
        profile = request.user.profile
        if profile.role not in ('sme', 'superadmin'):
            return Response({'error': 'Only SME or Admin can create fee structures'},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = FeeStructureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(entity=profile.entity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
