from rest_framework.permissions import BasePermission


class IsAuthor(BasePermission):
    """
    Разрешает доступ только автору карточки
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.id == obj.author.id


class IsStaff(BasePermission):
    """
    Разрешает доступ администратору или модератору
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.is_staff


class IsAuthorOrStaff(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (request.user.is_staff or request.user.id == obj.author.id)
