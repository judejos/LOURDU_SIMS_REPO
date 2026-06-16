"""
SIMS — Signals for automatic notifications and audit logging.
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import (
    Task, LeaveRequest, AttendanceClaim, Document,
    PaymentRecord, Notification, OnboardingSubmission
)


@receiver(post_save, sender=Task)
def notify_task_assignment(sender, instance, created, **kwargs):
    """Notify intern when a task is assigned to them."""
    if created and instance.assigned_to:
        Notification.objects.create(
            user=instance.assigned_to,
            title='New Task Assigned',
            message=f'You have been assigned a new task: "{instance.title}"',
            notification_type='task_assigned',
            priority='attention',
            related_type='task',
            related_id=instance.pk,
        )


@receiver(pre_save, sender=Task)
def notify_task_status_change(sender, instance, **kwargs):
    """Notify on task status change."""
    if instance.pk:
        try:
            old_instance = Task.objects.get(pk=instance.pk)
            if old_instance.status != instance.status and instance.assigned_to:
                Notification.objects.create(
                    user=instance.assigned_to,
                    title='Task Status Updated',
                    message=f'Task "{instance.title}" status changed to {instance.get_status_display()}',
                    notification_type='task_status',
                    priority='informational',
                    related_type='task',
                    related_id=instance.pk,
                )
        except Task.DoesNotExist:
            pass


@receiver(pre_save, sender=LeaveRequest)
def notify_leave_status(sender, instance, **kwargs):
    """Notify intern when leave is approved or rejected."""
    if instance.pk:
        try:
            old_instance = LeaveRequest.objects.get(pk=instance.pk)
            if old_instance.status != instance.status and instance.status in ('approved', 'rejected'):
                Notification.objects.create(
                    user=instance.user,
                    title=f'Leave {instance.status.title()}',
                    message=f'Your leave request from {instance.start_date} to {instance.end_date} has been {instance.status}.',
                    notification_type='leave_status',
                    priority='attention',
                    related_type='leave_request',
                    related_id=instance.pk,
                )
        except LeaveRequest.DoesNotExist:
            pass


@receiver(pre_save, sender=AttendanceClaim)
def notify_claim_status(sender, instance, **kwargs):
    """Notify intern when attendance claim is approved or rejected."""
    if instance.pk:
        try:
            old_instance = AttendanceClaim.objects.get(pk=instance.pk)
            if old_instance.status != instance.status and instance.status in ('approved', 'rejected'):
                Notification.objects.create(
                    user=instance.user,
                    title=f'Attendance Claim {instance.status.title()}',
                    message=f'Your attendance claim for {instance.date} has been {instance.status}.',
                    notification_type='attendance_claim',
                    priority='informational',
                    related_type='attendance_claim',
                    related_id=instance.pk,
                )
        except AttendanceClaim.DoesNotExist:
            pass


@receiver(pre_save, sender=Document)
def notify_document_status(sender, instance, **kwargs):
    """Notify intern when document is approved or rejected."""
    if instance.pk:
        try:
            old_instance = Document.objects.get(pk=instance.pk)
            if old_instance.status != instance.status and instance.status in ('approved', 'rejected'):
                Notification.objects.create(
                    user=instance.user,
                    title=f'Document {instance.status.title()}',
                    message=f'Your {instance.get_doc_type_display()} has been {instance.status}.',
                    notification_type='document_status',
                    priority='attention',
                    related_type='document',
                    related_id=instance.pk,
                )
        except Document.DoesNotExist:
            pass


@receiver(pre_save, sender=PaymentRecord)
def notify_payment_status(sender, instance, **kwargs):
    """Notify intern when payment status changes."""
    if instance.pk:
        try:
            old_instance = PaymentRecord.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                Notification.objects.create(
                    user=instance.user,
                    title=f'Payment {instance.status.title()}',
                    message=f'Your payment of ₹{instance.amount} has been marked as {instance.status}.',
                    notification_type='payment_status',
                    priority='attention',
                    related_type='payment',
                    related_id=instance.pk,
                )
        except PaymentRecord.DoesNotExist:
            pass
