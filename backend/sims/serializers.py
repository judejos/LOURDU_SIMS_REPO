"""
SIMS — Serializers for all models.
Handles data validation, nested representations, and API data transformation.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Entity, Branch, Domain,
    UserProfile, Team, Project, Task, Subtask, TaskComment, TaskStatusHistory,
    AttendanceRecord, LeaveRequest, AttendanceClaim,
    Asset, AssetIssue, AssetHistory,
    FeeStructure, PaymentRecord, PaymentHistory,
    Document, Feedback, StudentStaffFeedback,
    OnboardingSubmission, Notification, ActivityLog,
    ProfileUpdateRequest, EntityConfig, RoleDelegation,
    Certificate, Promotion, PasswordResetOTP,
)


# =============================================================================
# Organization Hierarchy
# =============================================================================

class EntitySerializer(serializers.ModelSerializer):
    branch_count = serializers.SerializerMethodField()

    class Meta:
        model = Entity
        fields = '__all__'

    def get_branch_count(self, obj):
        return obj.branches.count()


class BranchSerializer(serializers.ModelSerializer):
    entity_name = serializers.CharField(source='entity.name', read_only=True)

    class Meta:
        model = Branch
        fields = '__all__'


class DomainSerializer(serializers.ModelSerializer):
    entity_name = serializers.CharField(source='entity.name', read_only=True)

    class Meta:
        model = Domain
        fields = '__all__'


class EntityHierarchySerializer(serializers.ModelSerializer):
    """Full entity hierarchy tree for visualization."""
    branches = serializers.SerializerMethodField()
    domains = DomainSerializer(many=True, read_only=True)

    class Meta:
        model = Entity
        fields = ['id', 'name', 'is_active', 'branches', 'domains']

    def get_branches(self, obj):
        branches = obj.branches.filter(is_active=True)
        return BranchSerializer(branches, many=True).data


# =============================================================================
# Users & Profiles
# =============================================================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True, default='')
    entity_name = serializers.CharField(source='entity.name', read_only=True, default='')
    projects_info = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_projects_info(self, obj):
        from .models import Project
        projects = Project.objects.filter(team__interns=obj, is_deleted=False).distinct()
        return list(projects.values('id', 'name', 'team_lead__full_name', 'team_lead__user__email'))


class UserProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True, default='')
    projects_info = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'emp_id', 'full_name', 'username', 'email', 'role',
            'user_status', 'domain_name', 'phone',
            'scheme', 'shift_timing', 'photo', 'start_date', 'end_date',
            'created_at', 'projects_info',
        ]

    def get_projects_info(self, obj):
        from .models import Project
        projects = Project.objects.filter(team__interns=obj, is_deleted=False).distinct()
        return list(projects.values('id', 'name', 'team_lead__full_name', 'team_lead__user__email'))


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    emp_id = serializers.CharField(max_length=50)
    full_name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)
    domain = serializers.IntegerField(required=False, allow_null=True)
    entity = serializers.IntegerField(required=False, allow_null=True)
    shift_timing = serializers.CharField(required=False, default='Standard')
    phone = serializers.CharField(required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def validate_emp_id(self, value):
        if UserProfile.objects.filter(emp_id=value).exists():
            raise serializers.ValidationError('Employee ID already exists.')
        return value


class UserFullDetailSerializer(serializers.ModelSerializer):
    """Full user detail including academic and personal info."""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True, default='')
    entity_name = serializers.CharField(source='entity.name', read_only=True, default='')
    teams = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = '__all__'

    def get_teams(self, obj):
        return list(obj.teams.values_list('name', flat=True))

    def get_document_count(self, obj):
        return obj.documents.filter(is_deleted=False).count()


# =============================================================================
# Teams
# =============================================================================

class TeamSerializer(serializers.ModelSerializer):
    mentor_name = serializers.CharField(source='mentor.full_name', read_only=True, default='')
    intern_count = serializers.SerializerMethodField()
    intern_list = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = '__all__'

    def get_intern_count(self, obj):
        return obj.interns.count()

    def get_intern_list(self, obj):
        return list(obj.interns.values('id', 'emp_id', 'full_name', 'user_status'))


# =============================================================================
# Projects & Tasks
# =============================================================================

class ProjectSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True, default='')
    team_lead_name = serializers.CharField(source='team_lead.full_name', read_only=True, default='')
    domain_name = serializers.CharField(source='domain.name', read_only=True, default='')
    task_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    team_interns = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_task_count(self, obj):
        return obj.tasks.filter(is_deleted=False).count()

    def get_completion_percentage(self, obj):
        tasks = obj.tasks.filter(is_deleted=False)
        total = tasks.count()
        if total == 0:
            return 0
        completed = tasks.filter(status__in=['completed', 'verified']).count()
        return round((completed / total) * 100)

    def get_team_interns(self, obj):
        if obj.team:
            return list(obj.team.interns.values_list('id', flat=True))
        return []


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True, default='')

    class Meta:
        model = TaskComment
        fields = '__all__'
        read_only_fields = ['author', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default='')
    project_name = serializers.CharField(source='project.name', read_only=True, default='')
    is_overdue = serializers.BooleanField(read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'

    def get_comment_count(self, obj):
        return obj.comments.count()


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight task serializer for list views."""
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True, default='')
    project_name = serializers.CharField(source='project.name', read_only=True, default='')
    is_overdue = serializers.BooleanField(read_only=True)
    subtask_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'status', 'priority', 'task_type',
            'assigned_to', 'assigned_to_name', 'project', 'project_name',
            'due_date', 'committed_date', 'progress', 'is_overdue',
            'subtask_count', 'sla_hours', 'created_at',
        ]

    def get_subtask_count(self, obj):
        return obj.subtasks.count()


class TaskStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='')

    class Meta:
        model = TaskStatusHistory
        fields = '__all__'


# =============================================================================
# Attendance & Leave
# =============================================================================

class AttendanceRecordSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='user.emp_id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'


class LeaveRequestSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='user.emp_id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    days = serializers.IntegerField(read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, default='')

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['user', 'approved_by', 'created_at']


class AttendanceClaimSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='user.emp_id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True, default='')

    class Meta:
        model = AttendanceClaim
        fields = '__all__'
        read_only_fields = ['user', 'reviewed_by', 'created_at']


# =============================================================================
# Assets
# =============================================================================

class AssetSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True, default='')

    class Meta:
        model = Asset
        fields = '__all__'


class AssetIssueSerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True, default='')

    class Meta:
        model = AssetIssue
        fields = '__all__'


class AssetHistorySerializer(serializers.ModelSerializer):
    asset_code = serializers.CharField(source='asset.asset_code', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True, default='')
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True, default='')

    class Meta:
        model = AssetHistory
        fields = '__all__'


# =============================================================================
# Payments
# =============================================================================

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = '__all__'


class PaymentRecordSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='user.emp_id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = PaymentRecord
        fields = '__all__'


class PaymentHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='')

    class Meta:
        model = PaymentHistory
        fields = '__all__'


# =============================================================================
# Documents
# =============================================================================

class DocumentSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='user.emp_id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['user', 'reviewed_by', 'reviewed_at', 'version', 'created_at']


# =============================================================================
# Feedback
# =============================================================================

class FeedbackSerializer(serializers.ModelSerializer):
    intern_name = serializers.CharField(source='intern.full_name', read_only=True)
    intern_emp_id = serializers.CharField(source='intern.emp_id', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True, default='')
    average_score = serializers.FloatField(read_only=True)

    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['reviewer', 'created_at']


class StudentStaffFeedbackSerializer(serializers.ModelSerializer):
    intern_name = serializers.CharField(source='intern.full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)

    class Meta:
        model = StudentStaffFeedback
        fields = '__all__'
        read_only_fields = ['intern', 'created_at']


# =============================================================================
# Onboarding
# =============================================================================

class OnboardingSubmissionSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True, default='')

    class Meta:
        model = OnboardingSubmission
        fields = '__all__'
        read_only_fields = ['status', 'emp_id', 'reviewed_by', 'credentials_sent', 'created_at']


# =============================================================================
# Notifications
# =============================================================================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


# =============================================================================
# Activity Logs
# =============================================================================

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'


# =============================================================================
# Profile Update Requests
# =============================================================================

class ProfileUpdateRequestSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='user.emp_id', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = ProfileUpdateRequest
        fields = '__all__'
        read_only_fields = ['user', 'reviewed_by', 'created_at']


# =============================================================================
# Entity Config
# =============================================================================

class EntityConfigSerializer(serializers.ModelSerializer):
    entity_name = serializers.CharField(source='entity.name', read_only=True)

    class Meta:
        model = EntityConfig
        fields = '__all__'


# =============================================================================
# Delegation
# =============================================================================

class RoleDelegationSerializer(serializers.ModelSerializer):
    delegator_name = serializers.CharField(source='delegator.full_name', read_only=True)
    delegate_name = serializers.CharField(source='delegate.full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = RoleDelegation
        fields = '__all__'


# =============================================================================
# Certificates
# =============================================================================

class CertificateSerializer(serializers.ModelSerializer):
    intern_name = serializers.CharField(source='intern.full_name', read_only=True)
    intern_emp_id = serializers.CharField(source='intern.emp_id', read_only=True)

    class Meta:
        model = Certificate
        fields = '__all__'


# =============================================================================
# Promotions
# =============================================================================

class PromotionSerializer(serializers.ModelSerializer):
    intern_name = serializers.CharField(source='intern.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, default='')

    class Meta:
        model = Promotion
        fields = '__all__'


# =============================================================================
# Dashboard Summary
# =============================================================================

class AdminDashboardSummarySerializer(serializers.Serializer):
    """Serializer for GET /Sims/admin/dashboard-summary/"""
    intern_counts = serializers.DictField()
    attendance = serializers.DictField()
    payment_summary = serializers.DictField()
    dept_active_counts = serializers.ListField()


class LoginSerializer(serializers.Serializer):
    """Login credentials."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Password reset — request OTP."""
    email = serializers.EmailField()


class PasswordResetVerifySerializer(serializers.Serializer):
    """Password reset — verify OTP."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class PasswordResetUpdateSerializer(serializers.Serializer):
    """Password reset — set new password."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)
