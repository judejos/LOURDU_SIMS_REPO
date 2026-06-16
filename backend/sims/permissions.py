"""
SIMS — Role-Based Permission Classes
Every action is gated by the permission engine.
"""

from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """Only Super Admins have access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'superadmin'
        )


class IsManager(permissions.BasePermission):
    """Only Managers have access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'manager'
        )


class IsSuperAdminOrManager(permissions.BasePermission):
    """Super Admin or Manager access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role in ('superadmin', 'manager')
        )


class IsLeadOrAbove(permissions.BasePermission):
    """Lead, Manager, or Super Admin access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role in ('superadmin', 'manager', 'lead')
        )


class IsMentorOrAbove(permissions.BasePermission):
    """Mentor, Lead, Manager, or Super Admin access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role in ('superadmin', 'manager', 'lead', 'mentor')
        )


class IsStaffOrAbove(permissions.BasePermission):
    """Any staff role (not intern) has access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role in ('superadmin', 'manager', 'lead', 'mentor', 'staff')
        )


class IsIntern(permissions.BasePermission):
    """Only interns have access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'intern'
        )


class IsOwnerOrStaff(permissions.BasePermission):
    """Owner of the resource or staff member."""
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated or not hasattr(request.user, 'profile'):
            return False
        profile = request.user.profile
        # Staff always has access (scoped by entity elsewhere)
        if profile.is_staff_role:
            return True
        # Intern can only access their own data
        if hasattr(obj, 'user'):
            return obj.user == profile
        if hasattr(obj, 'intern'):
            return obj.intern == profile
        if hasattr(obj, 'assigned_to'):
            return obj.assigned_to == profile
        return False


class EntityScopedPermission(permissions.BasePermission):
    """
    Filters access to data within the user's entity.
    Super Admin sees all; others see only their entity's data.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'profile')

    def has_object_permission(self, request, view, obj):
        profile = request.user.profile
        if profile.role == 'superadmin':
            return True
        # Check if the object belongs to the user's entity
        if hasattr(obj, 'entity'):
            return obj.entity == profile.entity
        if hasattr(obj, 'user') and hasattr(obj.user, 'entity'):
            return obj.user.entity == profile.entity
        return True


class DomainScopedPermission(permissions.BasePermission):
    """
    Leads can only access data within their domain.
    Managers and Super Admins bypass this.
    """
    def has_object_permission(self, request, view, obj):
        profile = request.user.profile
        if profile.role in ('superadmin', 'manager'):
            return True
        if profile.role == 'lead' and hasattr(obj, 'domain'):
            return obj.domain == profile.domain
        return True


class AssignedInternPermission(permissions.BasePermission):
    """
    Mentors can only access interns assigned to their teams.
    """
    def has_object_permission(self, request, view, obj):
        profile = request.user.profile
        if profile.role in ('superadmin', 'manager', 'lead'):
            return True
        if profile.role == 'mentor':
            # Check if the intern is in one of the mentor's teams
            mentor_teams = profile.led_teams.all()
            if hasattr(obj, 'user'):
                return obj.user.teams.filter(id__in=mentor_teams).exists()
            if hasattr(obj, 'intern'):
                return obj.intern.teams.filter(id__in=mentor_teams).exists()
            if hasattr(obj, 'assigned_to'):
                return obj.assigned_to.teams.filter(id__in=mentor_teams).exists()
        return True


# =============================================================================
# Dashboard Access Flags — checked on every protected route mount
# =============================================================================

def get_user_permissions(user_profile):
    """
    Returns dashboard access flags and fine-grained permissions for a user.
    Called by GET /Sims/user-permissions/
    """
    role = user_profile.role

    # Base permissions by role
    permissions_map = {
        'superadmin': {
            'hasInternAccess': True,
            'hasAssetAccess': True,
            'hasAttendanceAccess': True,
            'hasPayrollAccess': True,
            'hasAdminAccess': True,
            'hasTaskAccess': True,
            'hasAIAccess': True,
            'canCreateEntity': True,
            'canManageStaff': True,
            'canApproveOnboarding': True,
            'canGenerateCertificates': True,
            'canViewAuditLog': True,
            'canManageDelegation': True,
            'canBulkImport': True,
            'canConfigureEntity': True,
        },
        'manager': {
            'hasInternAccess': True,
            'hasAssetAccess': True,
            'hasAttendanceAccess': True,
            'hasPayrollAccess': True,
            'hasAdminAccess': True,
            'hasTaskAccess': True,
            'hasAIAccess': True,
            'canCreateEntity': False,
            'canManageStaff': True,
            'canApproveOnboarding': True,
            'canGenerateCertificates': True,
            'canViewAuditLog': True,
            'canManageDelegation': True,
            'canBulkImport': True,
            'canConfigureEntity': True,
        },
        'lead': {
            'hasInternAccess': True,
            'hasAssetAccess': True,
            'hasAttendanceAccess': True,
            'hasPayrollAccess': False,
            'hasAdminAccess': False,
            'hasTaskAccess': True,
            'hasAIAccess': True,
            'canCreateEntity': False,
            'canManageStaff': False,
            'canApproveOnboarding': False,
            'canGenerateCertificates': True,
            'canViewAuditLog': False,
            'canManageDelegation': False,
            'canBulkImport': False,
            'canConfigureEntity': False,
        },
        'mentor': {
            'hasInternAccess': True,
            'hasAssetAccess': False,
            'hasAttendanceAccess': True,
            'hasPayrollAccess': False,
            'hasAdminAccess': False,
            'hasTaskAccess': True,
            'hasAIAccess': True,
            'canCreateEntity': False,
            'canManageStaff': False,
            'canApproveOnboarding': False,
            'canGenerateCertificates': False,
            'canViewAuditLog': False,
            'canManageDelegation': False,
            'canBulkImport': False,
            'canConfigureEntity': False,
        },
        'staff': {
            'hasInternAccess': True,
            'hasAssetAccess': False,
            'hasAttendanceAccess': True,
            'hasPayrollAccess': False,
            'hasAdminAccess': False,
            'hasTaskAccess': False,
            'hasAIAccess': False,
            'canCreateEntity': False,
            'canManageStaff': False,
            'canApproveOnboarding': False,
            'canGenerateCertificates': False,
            'canViewAuditLog': False,
            'canManageDelegation': False,
            'canBulkImport': False,
            'canConfigureEntity': False,
        },
        'intern': {
            'hasInternAccess': False,
            'hasAssetAccess': False,
            'hasAttendanceAccess': False,
            'hasPayrollAccess': False,
            'hasAdminAccess': False,
            'hasTaskAccess': False,
            'hasAIAccess': True,
            'canCreateEntity': False,
            'canManageStaff': False,
            'canApproveOnboarding': False,
            'canGenerateCertificates': False,
            'canViewAuditLog': False,
            'canManageDelegation': False,
            'canBulkImport': False,
            'canConfigureEntity': False,
        },
    }

    return permissions_map.get(role, permissions_map['intern'])
