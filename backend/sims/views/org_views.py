"""
SIMS — Organization Hierarchy Views
Entities, Branches, Departments, Domains, Entity-Departments
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from ..models import Entity, Branch, Department, Domain, EntityDepartment, EntityConfig
from ..serializers import (
    EntitySerializer, BranchSerializer, DepartmentSerializer,
    DomainSerializer, EntityDepartmentSerializer, EntityHierarchySerializer,
    EntityConfigSerializer,
)
from ..permissions import IsSuperAdmin, IsSuperAdminOrManager


class EntityListCreateView(APIView):
    """GET/POST /Sims/entities/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def get(self, request):
        profile = request.user.profile
        if profile.role == 'superadmin':
            queryset = Entity.objects.all()
        else:
            queryset = Entity.objects.filter(pk=profile.entity_id)
        serializer = EntitySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.profile.role != 'superadmin':
            return Response({'error': 'Only Super Admin can create entities'}, status=status.HTTP_403_FORBIDDEN)
        serializer = EntitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entity = serializer.save()
        # Create default config
        EntityConfig.objects.create(entity=entity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EntityDetailView(APIView):
    """PATCH/DELETE /Sims/entities/{pk}/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def patch(self, request, pk):
        try:
            entity = Entity.objects.get(pk=pk)
            serializer = EntitySerializer(entity, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Entity.DoesNotExist:
            return Response({'error': 'Entity not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            entity = Entity.objects.get(pk=pk)
            entity.is_active = False
            entity.save()
            return Response({'message': 'Entity deactivated'})
        except Entity.DoesNotExist:
            return Response({'error': 'Entity not found'}, status=status.HTTP_404_NOT_FOUND)


class BranchListCreateView(APIView):
    """GET/POST /Sims/branches/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def get(self, request):
        profile = request.user.profile
        if profile.role == 'superadmin':
            queryset = Branch.objects.all()
        else:
            queryset = Branch.objects.filter(entity=profile.entity)
        serializer = BranchSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BranchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BranchDetailView(APIView):
    """PATCH/DELETE /Sims/branches/{pk}/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def patch(self, request, pk):
        try:
            branch = Branch.objects.get(pk=pk)
            serializer = BranchSerializer(branch, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            branch = Branch.objects.get(pk=pk)
            branch.is_active = False
            branch.save()
            return Response({'message': 'Branch deactivated'})
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)


class DepartmentListCreateView(APIView):
    """GET/POST /Sims/departments/"""

    def get_permissions(self):
        # Public GET so the InternOnboarding form can populate the dropdown
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        queryset = Department.objects.filter(is_active=True)
        # Filter by entity only for authenticated non-superadmin users
        if request.user.is_authenticated:
            profile = request.user.profile
            if profile.role != 'superadmin' and profile.entity:
                queryset = queryset.filter(entity=profile.entity)
        serializer = DepartmentSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DepartmentDetailView(APIView):
    """GET/PATCH/DELETE /Sims/departments/{pk}/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            dept = Department.objects.get(pk=pk)
            serializer = DepartmentSerializer(dept)
            return Response(serializer.data)
        except Department.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            dept = Department.objects.get(pk=pk)
            serializer = DepartmentSerializer(dept, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Department.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            dept = Department.objects.get(pk=pk)
            dept.is_active = False
            dept.save()
            return Response({'message': 'Department deactivated'})
        except Department.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class DomainListCreateView(APIView):
    """GET/POST /Sims/domains/"""

    def get_permissions(self):
        # Public GET so the InternOnboarding form can populate the dropdown
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        queryset = Domain.objects.filter(is_active=True)
        serializer = DomainSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DomainSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DomainDetailView(APIView):
    """GET/PATCH/DELETE /Sims/domains/{pk}/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            domain = Domain.objects.get(pk=pk)
            serializer = DomainSerializer(domain)
            return Response(serializer.data)
        except Domain.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            domain = Domain.objects.get(pk=pk)
            serializer = DomainSerializer(domain, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Domain.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            domain = Domain.objects.get(pk=pk)
            domain.is_active = False
            domain.save()
            return Response({'message': 'Domain deactivated'})
        except Domain.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class DomainsByDepartmentView(APIView):
    """GET /Sims/domains-by-department/ — Domains grouped by department."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = Department.objects.filter(is_active=True)
        result = []
        for dept in departments:
            domains = Domain.objects.filter(department=dept, is_active=True)
            result.append({
                'department': DepartmentSerializer(dept).data,
                'domains': DomainSerializer(domains, many=True).data,
            })
        return Response(result)


class EntityDepartmentListCreateView(APIView):
    """GET/POST /Sims/entity-departments/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def get(self, request):
        profile = request.user.profile
        if profile.role == 'superadmin':
            queryset = EntityDepartment.objects.all()
        else:
            queryset = EntityDepartment.objects.filter(entity=profile.entity)
        serializer = EntityDepartmentSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EntityDepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EntityDepartmentDetailView(APIView):
    """PATCH/DELETE /Sims/entity-departments/{pk}/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def patch(self, request, pk):
        try:
            ed = EntityDepartment.objects.get(pk=pk)
            serializer = EntityDepartmentSerializer(ed, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except EntityDepartment.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            ed = EntityDepartment.objects.get(pk=pk)
            ed.delete()
            return Response({'message': 'Deleted'})
        except EntityDepartment.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class EntityHierarchyView(APIView):
    """GET /Sims/entity-hierarchy/ — Full hierarchy tree."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        if profile.role == 'superadmin':
            entities = Entity.objects.filter(is_active=True)
        else:
            entities = Entity.objects.filter(pk=profile.entity_id, is_active=True)
        serializer = EntityHierarchySerializer(entities, many=True)
        return Response(serializer.data)


class EntityConfigView(APIView):
    """GET/PATCH /Sims/entity-config/{entity_id}/"""
    permission_classes = [IsAuthenticated, IsSuperAdminOrManager]

    def get(self, request, entity_id):
        try:
            config = EntityConfig.objects.get(entity_id=entity_id)
            serializer = EntityConfigSerializer(config)
            return Response(serializer.data)
        except EntityConfig.DoesNotExist:
            return Response({'error': 'Config not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, entity_id):
        try:
            config = EntityConfig.objects.get(entity_id=entity_id)
            serializer = EntityConfigSerializer(config, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except EntityConfig.DoesNotExist:
            return Response({'error': 'Config not found'}, status=status.HTTP_404_NOT_FOUND)
