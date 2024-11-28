from rest_framework.permissions import BasePermission

class IsAuthor(BasePermission):
    """
    Разрешает доступ только автору карточки
    """

    def has_object_permission(self, request, view, obj):
        return request.user == obj.author
    
class IsStaff(BasePermission):
    """
    Разрешает доступ администратору или модератору
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff

