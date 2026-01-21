from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnidadeViewSet, CategoriaViewSet, BemViewSet, GestorViewSet, SalaViewSet # Adicione SalaViewSet aqui

router = DefaultRouter()
router.register(r'unidades', UnidadeViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'bens', BemViewSet)
router.register(r'gestores', GestorViewSet)
router.register(r'salas', SalaViewSet) # Adicione esta linha

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]