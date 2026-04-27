from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read: allow if authenticated
        if request.method in permissions.SAFE_METHODS:
            return obj.owner == request.user
        # Write: only owner
        return obj.owner == request.user
