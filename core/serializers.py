from rest_framework import serializers
from .models import Unidade, Categoria, Bem
from .models import Unidade, Categoria, Bem, Gestor, Sala # Adicione Sala aqui
from django.contrib.auth.models import User # Importe o modelo User do Django


class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidade
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class BemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bem
        # O SEGREDO ESTÁ AQUI: '__all__' garante que o campo 'origem' seja enviado
        fields = '__all__'

class GestorSerializer(serializers.ModelSerializer):
    # Adicione um campo de senha que será apenas para escrita (write_only)
    # Não será retornado nas respostas da API
    password = serializers.CharField(write_only=True, required=False) # Tornar opcional para edições

    class Meta:
        model = Gestor
        fields = [
            'id', 'user', 'nome', 'cpf', 'telefone', 'endereco', 'unidade',
            'pode_cadastrar', 'pode_editar', 'pode_dar_baixa',
            'pode_cadastrar_unidade', 'pode_cadastrar_categoria',
            'pode_cadastrar_sala', 'pode_cadastrar_gestor',
            'criado_em', 'password'
        ]
        # Adicione 'password' aos campos que podem ser lidos/escritos, mas ele é write_only
        extra_kwargs = {'user': {'read_only': True}} # O campo 'user' será criado internamente

    def create(self, validated_data):
        # Remove o campo 'password' dos dados validados, se presente
        password = validated_data.pop('password', None)
        
        # Remove o campo 'user' dos dados validados, se presente, pois vamos criá-lo
        validated_data.pop('user', None)

        # Cria o usuário Django
        # O CPF será o username
        # A senha genérica será 'mudar123' (ou outra de sua escolha)
        # O usuário será um staff user para ter acesso ao admin e outras permissões
        user = User.objects.create_user(
            username=validated_data['cpf'],
            password=password if password else 'mudar123', # Usa a senha fornecida ou a genérica
            is_staff=True # Gestores geralmente são staff users
        )
        
        # Cria o Gestor e associa ao usuário recém-criado
        gestor = Gestor.objects.create(user=user, **validated_data)
        return gestor

    def update(self, instance, validated_data):
        # Lógica para atualização do gestor
        # Se a senha for fornecida, atualiza a senha do usuário associado
        password = validated_data.pop('password', None)
        if password:
            instance.user.set_password(password)
            instance.user.save()

        # Atualiza os outros campos do gestor
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = '__all__'
