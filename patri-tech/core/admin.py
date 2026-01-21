from django.contrib import admin
from .models import Unidade, Categoria, Bem
from .models import Unidade, Categoria, Bem, Gestor

@admin.register(Unidade)
class UnidadeAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'endereco')
    search_fields = ('nome',)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome')
    search_fields = ('nome',)

@admin.register(Gestor)
class GestorAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'unidade', 'telefone')
    search_fields = ('nome', 'cpf')    

@admin.register(Bem)
class BemAdmin(admin.ModelAdmin):
    # Trocamos 'eh_doacao' por 'origem' aqui na lista
    list_display = ('tombo', 'nome', 'categoria', 'unidade', 'situacao', 'estado_conservacao', 'origem', 'valor')
    
    # E trocamos aqui no filtro lateral também
    list_filter = ('unidade', 'categoria', 'situacao', 'estado_conservacao', 'origem')
    
    search_fields = ('nome', 'tombo')