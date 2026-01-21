from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Unidade, Categoria, Bem, Gestor, Sala, Historico

# --- HISTÓRICO (Necessário para o rastreamento) ---
class HistoricoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = Historico
        fields = ['id', 'descricao', 'data', 'usuario_nome']

class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidade
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

# --- SALA (Com o nome da unidade para facilitar o front) ---
class SalaSerializer(serializers.ModelSerializer):
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)

    class Meta:
        model = Sala
        fields = ['id', 'nome', 'unidade', 'unidade_nome']

# --- BEM (Agora inclui o Histórico e nomes legíveis) ---
class BemSerializer(serializers.ModelSerializer):
    # Campos extras de leitura para facilitar o Front-end
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)
    sala_nome = serializers.CharField(source='sala.nome', read_only=True)
    
    # Aqui está a mágica: Traz o histórico junto com o bem
    historico = HistoricoSerializer(many=True, read_only=True)

    class Meta:
        model = Bem
        fields = '__all__'

# --- GESTOR (Mantida a SUA lógica original que cria usuários) ---
class GestorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Gestor
        fields = [
            'id', 'user', 'nome', 'cpf', 'telefone', 'endereco', 'unidade',
            'pode_cadastrar', 'pode_editar', 'pode_dar_baixa',
            'pode_cadastrar_unidade', 'pode_cadastrar_categoria',
            'pode_cadastrar_sala', 'pode_cadastrar_gestor',
            'criado_em', 'password'
        ]
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('user', None)

        user = User.objects.create_user(
            username=validated_data['cpf'],
            password=password if password else 'mudar123',
            is_staff=True
        )
        
        gestor = Gestor.objects.create(user=user, **validated_data)
        return gestor

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.user.set_password(password)
            instance.user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance