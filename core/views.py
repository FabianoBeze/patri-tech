from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Unidade, Categoria, Bem, Gestor, Sala
from .serializers import UnidadeSerializer, CategoriaSerializer, BemSerializer, GestorSerializer, SalaSerializer

# --- VIEWSETS (CRUDs) ---

class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = Unidade.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

class BemViewSet(viewsets.ModelViewSet):
    queryset = Bem.objects.all()
    serializer_class = BemSerializer
    permission_classes = [permissions.IsAuthenticated]

class GestorViewSet(viewsets.ModelViewSet):
    queryset = Gestor.objects.all()
    serializer_class = GestorSerializer
    permission_classes = [permissions.IsAuthenticated]

class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- FUNÇÕES EXTRAS (Dashboard) ---

@api_view(['GET'])
def dashboard_resumo(request):
    total_bens = Bem.objects.count()
    total_unidades = Unidade.objects.count()
    total_categorias = Categoria.objects.count()
    
    # Soma o valor de todos os bens (trata caso seja None)
    valor_total = Bem.objects.aggregate(Sum('valor'))['valor__sum'] or 0

    return Response({
        "total_bens": total_bens,
        "total_unidades": total_unidades,
        "total_categorias": total_categorias,
        "valor_total": valor_total
    })