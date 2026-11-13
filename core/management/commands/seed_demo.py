"""Popula o banco com dados fictícios para demonstração.

Uso:
    python manage.py seed_demo
    python manage.py seed_demo --password minha-senha

Todos os registros criados aqui são fictícios (nomes, CPF e patrimônios
inventados) e servem apenas para explorar a interface.
"""

import secrets

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Bem, Categoria, Gestor, Sala, Unidade

UNIDADES = [
    {"nome": "Unidade Centro", "endereco": "Rua das Acácias, 100"},
    {"nome": "Unidade Norte", "endereco": "Avenida Brasil, 250"},
]

CATEGORIAS = [
    "Informática",
    "Mobiliário",
    "Eletrodomésticos",
    "Veículos",
]

SALAS = {
    "Unidade Centro": ["Sala 101", "Sala 102", "Almoxarifado"],
    "Unidade Norte": ["Secretaria", "Sala 201"],
}

BENS = [
    {
        "nome": "Notebook Dell Latitude",
        "tombo": "2026000001",
        "categoria": "Informática",
        "unidade": "Unidade Centro",
        "sala": "Sala 101",
        "valor": "4500.00",
        "estado": "EXCELENTE",
    },
    {
        "nome": "Impressora HP LaserJet",
        "tombo": "2026000002",
        "categoria": "Informática",
        "unidade": "Unidade Centro",
        "sala": "Sala 102",
        "valor": "1200.00",
        "estado": "BOM",
    },
    {
        "nome": "Mesa de escritório",
        "tombo": "2026000003",
        "categoria": "Mobiliário",
        "unidade": "Unidade Centro",
        "sala": "Sala 101",
        "valor": "650.00",
        "estado": "REGULAR",
    },
    {
        "nome": "Cadeira giratória",
        "tombo": "2026000004",
        "categoria": "Mobiliário",
        "unidade": "Unidade Centro",
        "sala": "Sala 101",
        "valor": "480.00",
        "estado": "BOM",
    },
    {
        "nome": "Geladeira Frost Free",
        "tombo": "2026000005",
        "categoria": "Eletrodomésticos",
        "unidade": "Unidade Norte",
        "sala": "Secretaria",
        "valor": "2800.00",
        "estado": "EXCELENTE",
    },
    {
        "nome": "Projetor Epson",
        "tombo": "2026000006",
        "categoria": "Informática",
        "unidade": "Unidade Norte",
        "sala": "Sala 201",
        "valor": "3100.00",
        "estado": "BOM",
    },
    {
        "nome": "Veículo Furgão",
        "tombo": "2026000007",
        "categoria": "Veículos",
        "unidade": "Unidade Norte",
        "sala": None,
        "valor": "89000.00",
        "estado": "REGULAR",
    },
]

GESTORES = [
    {
        "nome": "Gestor Demonstração",
        "cpf": "000.000.001-00",
        "telefone": "(00) 00000-0001",
        "endereco": "Rua Exemplo, 1",
        "unidade": "Unidade Centro",
        "pode_cadastrar": True,
        "pode_editar": True,
    },
    {
        "nome": "Gestora Demonstração",
        "cpf": "000.000.002-00",
        "telefone": "(00) 00000-0002",
        "endereco": "Rua Exemplo, 2",
        "unidade": "Unidade Norte",
    },
]


class Command(BaseCommand):
    help = "Cria unidades, categorias, salas, bens e usuários fictícios."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            help="Senha dos usuários de demonstração (padrão: gerada aleatoriamente).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"] or secrets.token_urlsafe(9)

        unidades = {
            item["nome"]: Unidade.objects.get_or_create(**item)[0] for item in UNIDADES
        }

        categorias = {
            nome: Categoria.objects.get_or_create(nome=nome)[0] for nome in CATEGORIAS
        }

        salas = {}
        for unidade_nome, nomes in SALAS.items():
            for nome in nomes:
                salas[(unidade_nome, nome)] = Sala.objects.get_or_create(
                    nome=nome, unidade=unidades[unidade_nome]
                )[0]

        for item in BENS:
            Bem.objects.get_or_create(
                tombo=item["tombo"],
                defaults={
                    "nome": item["nome"],
                    "valor": item["valor"],
                    "estado_conservacao": item["estado"],
                    "categoria": categorias[item["categoria"]],
                    "unidade": unidades[item["unidade"]],
                    "sala": salas[(item["unidade"], item["sala"])] if item["sala"] else None,
                },
            )

        admin, admin_criado = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com", "is_staff": True, "is_superuser": True},
        )
        if admin_criado:
            admin.set_password(password)
            admin.save()

        for item in GESTORES:
            user, user_criado = User.objects.get_or_create(
                username=item["cpf"],
                defaults={"is_staff": True},
            )
            if user_criado:
                user.set_password(password)
                user.save()

            Gestor.objects.get_or_create(
                cpf=item["cpf"],
                defaults={
                    "user": user,
                    "nome": item["nome"],
                    "telefone": item["telefone"],
                    "endereco": item["endereco"],
                    "unidade": unidades[item["unidade"]],
                    "pode_cadastrar": item.get("pode_cadastrar", False),
                    "pode_editar": item.get("pode_editar", False),
                    "pode_dar_baixa": item.get("pode_dar_baixa", False),
                },
            )

        self.stdout.write(self.style.SUCCESS("Dados de demonstração criados."))
        self.stdout.write(f"  Usuário admin: admin / {password}")
        self.stdout.write(f"  Gestor:        {GESTORES[0]['cpf']} / {password}")
        self.stdout.write("  Todos os dados são fictícios.")
