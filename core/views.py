from rest_framework import viewsets, permissions
from rest_framework.generics import GenericAPIView
from rest_framework.serializers import Serializer
from rest_framework import serializers
from django.db.models import Sum
from .permissions import (
    IsGestorWithCadastrarPermission,
    IsGestorWithEditarPermission,
    IsGestorWithCadastrarCategoriaPermission,
    IsGestorWithEditarCategoriaPermission,
    IsGestorWithDarBaixaPermission,
    IsGestorWithCadastrarGestorPermission,
    IsGestorWithCadastrarSalaPermission,
    IsGestorWithEditarSalaPermission,
    OrPermission,  # Importar a classe OrPermission personalizada
    AndPermission, # Importar a classe AndPermission personalizada
)
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Unidade, Categoria, Bem, Gestor, Sala, Historico
from .serializers import UnidadeSerializer, CategoriaSerializer, DashboardResumoView,BemSerializer, GestorSerializer, SalaSerializer, HistoricoSerializer
from .permissions import (
    IsGestorWithCadastrarPermission,
    IsGestorWithEditarPermission,
    IsGestorWithCadastrarCategoriaPermission,
    IsGestorWithEditarCategoriaPermission,
    IsGestorWithDarBaixaPermission,
    IsGestorWithCadastrarGestorPermission,
    IsGestorWithCadastrarSalaPermission,
    IsGestorWithEditarSalaPermission,
    IsGestorWithCadastrarUnidadePermission,
    IsGestorWithCadastrarCategoriaPermission,
    IsGestorWithCadastrarSalaPermission,
    IsGestorWithCadastrarGestorPermission
)
class DashboardResumoSerializer(Serializer):
    total_bens = serializers.IntegerField()
    total_unidades = serializers.IntegerField()
    total_categorias = serializers.IntegerField()
    valor_total = serializers.DecimalField(max_digits=10, decimal_places=2)
# --- VIEWSETS (CRUDs) ---

class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = Unidade.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarCategoriaPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarCategoriaPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class BemViewSet(viewsets.ModelViewSet):
    queryset = Bem.objects.all()
    serializer_class = BemSerializer
    permission_classes = [permissions.IsAuthenticated]

    # --- LÓGICA DE RASTREAMENTO (HISTÓRICO) ---
    def perform_update(self, serializer):
        # 1. Pega os dados ANTIGOS (antes de salvar)
        bem_antigo = self.get_object()
        old_unidade = bem_antigo.unidade
        old_sala = bem_antigo.sala
        
        # 2. Salva os NOVOS dados e pega o objeto atualizado
        bem_novo = serializer.save()

        # 3. Compara se mudou Unidade ou Sala
        mudancas = []
        
        # Verifica mudança de Unidade (Transferência Externa)
        if old_unidade != bem_novo.unidade:
            nome_antigo = old_unidade.nome if old_unidade else "Sem Unidade"
            nome_novo = bem_novo.unidade.nome if bem_novo.unidade else "Sem Unidade"
            # FRASE ALTERADA AQUI:
            mudancas.append(f"Bem transferido da Unidade '{nome_antigo}' para '{nome_novo}'")

        # Verifica mudança de Sala (Movimentação Interna)
        if old_sala != bem_novo.sala:
            nome_antigo = old_sala.nome if old_sala else "Sem Sala"
            nome_novo = bem_novo.sala.nome if bem_novo.sala else "Sem Sala"
            # FRASE ALTERADA AQUI:
            mudancas.append(f"Bem transferido da Sala '{nome_antigo}' para '{nome_novo}'")

        # 4. Se houve mudança, cria o registro no histórico
        if mudancas:
            texto_historico = ". ".join(mudancas)
            Historico.objects.create(
                bem=bem_novo,
                usuario=self.request.user, # Pega o usuário logado automaticamente
                descricao=texto_historico
            )

    # Rota extra para o Front-end pegar o histórico: /api/bens/ID/historico/
    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        bem = self.get_object()
        # Pega todo o histórico desse bem
        historico = bem.historico.all()
        serializer = HistoricoSerializer(historico, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarPermission))]
        elif self.action == 'dar_baixa':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithDarBaixaPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class GestorViewSet(viewsets.ModelViewSet):
    queryset = Gestor.objects.all()
    serializer_class = GestorSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarGestorPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarGestorPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarSalaPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarSalaPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

    def get_queryset(self):
        queryset = Sala.objects.all()
        # Captura o ID da unidade que o React vai enviar na URL (?unidade=1)
        unidade_id = self.request.query_params.get('unidade')
        
        if unidade_id:
            # Filtra apenas as salas daquela unidade
            queryset = queryset.filter(unidade_id=unidade_id)
            
        return queryset

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

class HistoricoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Historico.objects.all()
    serializer_class = HistoricoSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Historico.objects.all()
        bem_id = self.request.query_params.get('bem') # Pega o ?bem=ID
        if bem_id:
            # Certifique-se que o nome do campo no Model é 'bem'
            queryset = queryset.filter(bem_id=bem_id) 
        return queryset.order_by('-data')


class DashboardResumoView(GenericAPIView):
    serializer_class = DashboardResumoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        total_bens = Bem.objects.count()
        total_unidades = Unidade.objects.count()
        total_categorias = Categoria.objects.count()
        valor_total = Bem.objects.aggregate(Sum('valor'))['valor__sum'] or 0
        
        data = {
            "total_bens": total_bens,
            "total_unidades": total_unidades,
            "total_categorias": total_categorias,
            "valor_total": valor_total
        }
        serializer = self.get_serializer(data)
        return Response(serializer.data)

dashboard_resumo = DashboardResumoView.as_view()