from rest_framework import permissions
from .models import Gestor

class IsGestor(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o usuário é um Gestor ativo.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return Gestor.objects.filter(user=request.user, user__is_active=True).exists()

class IsGestorWithCadastrarPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar
        except Gestor.DoesNotExist:
            return False

class IsGestorWithEditarPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de editar.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_editar
        except Gestor.DoesNotExist:
            return False

class IsGestorWithDarBaixaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de dar baixa.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_dar_baixa
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarUnidadePermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar unidade.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_unidade
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarCategoriaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar categoria.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_categoria
        except Gestor.DoesNotExist:
            return False

class IsGestorWithEditarCategoriaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de editar categoria.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_editar_categoria
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarSalaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar sala.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_sala
        except Gestor.DoesNotExist:
            return False

class IsGestorWithEditarSalaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de editar sala.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_editar_sala
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarGestorPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar gestor.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_gestor
        except Gestor.DoesNotExist:
            return False

def _resolve_permission(permission):
    """Aceita tanto classes de permissão quanto instâncias já criadas."""
    return permission() if isinstance(permission, type) else permission


class OrPermission(permissions.BasePermission):
    """
    Combina permissões com lógica OR.

    Aceita classes (``IsAuthenticated``) ou instâncias (``AndPermission(...)``).
    """
    def __init__(self, *permissions):
        self.permissions = permissions

    def has_permission(self, request, view):
        return any(
            _resolve_permission(permission).has_permission(request, view)
            for permission in self.permissions
        )

    def has_object_permission(self, request, view, obj):
        return any(
            _resolve_permission(permission).has_object_permission(request, view, obj)
            for permission in self.permissions
        )

class AndPermission(permissions.BasePermission):
    """
    Combina permissões com lógica AND.

    Aceita classes (``IsAuthenticated``) ou instâncias (``OrPermission(...)``).
    """
    def __init__(self, *permissions):
        self.permissions = permissions

    def has_permission(self, request, view):
        return all(
            _resolve_permission(permission).has_permission(request, view)
            for permission in self.permissions
        )

    def has_object_permission(self, request, view, obj):
        return all(
            _resolve_permission(permission).has_object_permission(request, view, obj)
            for permission in self.permissions
        )