from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# 1. Imports das suas Views (Telas)
from core.views import (
    UnidadeViewSet, 
    CategoriaViewSet, 
    BemViewSet, 
    SalaViewSet,
    GestorViewSet,
    dashboard_resumo  # <--- O import do Dashboard que faltava
)

# 2. Imports da Autenticação (Login)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Configuração das Rotas Automáticas (CRUD)
router = DefaultRouter()
router.register(r'unidades', UnidadeViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'bens', BemViewSet)
router.register(r'salas', SalaViewSet)
router.register(r'gestores', GestorViewSet) 



urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 3. Rotas da API Principal (Unidades, Bens, Categorias)
    path('api/', include(router.urls)),

    # 4. Rota do Dashboard (A que estava faltando)
    path('api/dashboard-stats/', dashboard_resumo),

    # 5. Rotas de Login (Token)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]