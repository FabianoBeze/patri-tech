from django.db import models
from django.contrib.auth.models import User

# --- UNIDADE ---
class Unidade(models.Model):
    nome = models.CharField(max_length=100)
    endereco = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.nome

# --- CATEGORIA ---
class Categoria(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

# --- SALA ---
class Sala(models.Model):
    nome = models.CharField(max_length=100)
    unidade = models.ForeignKey(Unidade, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.nome} ({self.unidade.nome})"

# --- BEM ---
class Bem(models.Model):
    SITUACAO_CHOICES = [
        ('RECUPERAVEL', 'Recuperável'),
        ('ANTIECONOMICO', 'Antieconômico'),
        ('IRRECUPERAVEL', 'Irrecuperável'),
        ('OCIOSO', 'Ocioso'),
    ]

    ESTADO_CHOICES = [
        ('EXCELENTE', 'Excelente - Nota 10'),
        ('BOM', 'Bom - Nota 8'),
        ('REGULAR', 'Regular - Nota 5'),
    ]

    ORIGEM_CHOICES = [
        ('PROPRIO', 'Próprio'),
        ('DOACAO', 'Doação'),
        ('ALUGADO', 'Alugado'),
    ]

    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    tombo = models.CharField(max_length=20, unique=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    situacao = models.CharField(max_length=20, choices=SITUACAO_CHOICES, default='RECUPERAVEL')
    estado_conservacao = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='EXCELENTE')
    origem = models.CharField(max_length=20, choices=ORIGEM_CHOICES, default='PROPRIO')

    data_baixa = models.DateField(null=True, blank=True)
    obs_baixa = models.TextField(blank=True, null=True)

    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    unidade = models.ForeignKey(Unidade, on_delete=models.PROTECT)
    sala = models.ForeignKey(Sala, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Sala")    
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} ({self.tombo})"

# --- GESTOR ---
class Gestor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20)
    endereco = models.CharField(max_length=200)
    unidade = models.ForeignKey(Unidade, on_delete=models.PROTECT)
    
    pode_cadastrar = models.BooleanField(default=False, verbose_name="Pode Cadastrar Bens?")
    pode_editar = models.BooleanField(default=False, verbose_name="Pode Editar Bens?")
    pode_dar_baixa = models.BooleanField(default=False, verbose_name="Pode dar Baixa?")
    pode_cadastrar_unidade = models.BooleanField(default=False, verbose_name="Pode Cadastrar Unidades?")
    pode_cadastrar_categoria = models.BooleanField(default=False, verbose_name="Pode Cadastrar Categorias?")
    pode_cadastrar_sala = models.BooleanField(default=False, verbose_name="Pode Cadastrar Salas?")
    pode_cadastrar_gestor = models.BooleanField(default=False, verbose_name="Pode Cadastrar Gestores?")
    
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

# --- HISTÓRICO ---
class Historico(models.Model):
    bem = models.ForeignKey(Bem, on_delete=models.CASCADE, related_name='historico')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    descricao = models.TextField()
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data']

    def __str__(self):
        return f"{self.bem.nome} - {self.data}"