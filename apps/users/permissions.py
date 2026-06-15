from rest_framework.permissions import BasePermission

from .models import User


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.ROLE_ADMIN
        )


class IsAgent(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_agent
        )


class IsCollector(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.ROLE_AGENT_COLLECTOR
        )


class IsValidator(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.ROLE_AGENT_VALIDATOR
        )


class IsSalesAgent(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.ROLE_AGENT_SALES
        )


class IsMerchant(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.ROLE_MERCHANT
        )
