from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import Bem, Categoria, Gestor, Historico, Sala, Unidade


class ModelTests(TestCase):
    def test_str_do_bem_inclui_nome_e_tombo(self):
        unidade = Unidade.objects.create(nome="Unidade Centro")
        categoria = Categoria.objects.create(nome="Informática")
        bem = Bem.objects.create(
            nome="Notebook",
            tombo="2026000001",
            categoria=categoria,
            unidade=unidade,
        )
        self.assertEqual(str(bem), "Notebook (2026000001)")

    def test_str_da_sala_inclui_unidade(self):
        unidade = Unidade.objects.create(nome="Unidade Norte")
        sala = Sala.objects.create(nome="Sala 201", unidade=unidade)
        self.assertEqual(str(sala), "Sala 201 (Unidade Norte)")


class BaseApiTestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="senha-forte-123"
        )
        self.unidade = Unidade.objects.create(nome="Unidade Centro")
        self.unidade_destino = Unidade.objects.create(nome="Unidade Norte")
        self.categoria = Categoria.objects.create(nome="Informática")
        self.sala = Sala.objects.create(nome="Sala 101", unidade=self.unidade)
        self.sala_destino = Sala.objects.create(nome="Sala 201", unidade=self.unidade_destino)

    def criar_bem(self, **extra):
        dados = {
            "nome": "Notebook",
            "tombo": "2026000001",
            "valor": "4500.00",
            "categoria": self.categoria,
            "unidade": self.unidade,
            "sala": self.sala,
        }
        dados.update(extra)
        return Bem.objects.create(**dados)

    def autenticar_como_gestor(self, **permissoes):
        user = User.objects.create_user(username="000.000.001-00", password="senha-123")
        Gestor.objects.create(
            user=user,
            nome="Gestor Teste",
            cpf="000.000.001-00",
            telefone="(00) 00000-0000",
            endereco="Rua Teste, 1",
            unidade=self.unidade,
            **permissoes,
        )
        self.client.force_authenticate(user=user)
        return user


class AutenticacaoTests(BaseApiTestCase):
    def test_endpoints_exigem_autenticacao(self):
        for url in ["/api/bens/", "/api/unidades/", "/api/categorias/"]:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_retorna_access_e_refresh(self):
        resposta = self.client.post(
            "/api/token/", {"username": "admin", "password": "senha-forte-123"}, format="json"
        )
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertIn("access", resposta.data)
        self.assertIn("refresh", resposta.data)

    def test_login_com_senha_invalida_retorna_401(self):
        resposta = self.client.post(
            "/api/token/", {"username": "admin", "password": "errada"}, format="json"
        )
        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)


class BemApiTests(BaseApiTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin)

    def test_cria_bem(self):
        resposta = self.client.post(
            "/api/bens/",
            {
                "nome": "Impressora",
                "tombo": "2026000002",
                "valor": "1200.00",
                "categoria": self.categoria.id,
                "unidade": self.unidade.id,
                "sala": self.sala.id,
            },
            format="json",
        )
        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED, resposta.data)
        self.assertEqual(Bem.objects.count(), 1)

    def test_tombo_duplicado_retorna_400(self):
        self.criar_bem()
        resposta = self.client.post(
            "/api/bens/",
            {
                "nome": "Outro notebook",
                "tombo": "2026000001",
                "categoria": self.categoria.id,
                "unidade": self.unidade.id,
            },
            format="json",
        )
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tombo", resposta.data)

    def test_transferencia_entre_salas_registra_historico(self):
        bem = self.criar_bem()

        resposta = self.client.patch(
            f"/api/bens/{bem.id}/", {"sala": self.sala_destino.id}, format="json"
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK, resposta.data)
        historico = Historico.objects.filter(bem=bem)
        self.assertEqual(historico.count(), 1)
        registro = historico.first()
        self.assertIn("Sala 101", registro.descricao)
        self.assertIn("Sala 201", registro.descricao)
        self.assertEqual(registro.usuario, self.admin)

    def test_transferencia_entre_unidades_registra_historico(self):
        bem = self.criar_bem()

        self.client.patch(
            f"/api/bens/{bem.id}/",
            {"unidade": self.unidade_destino.id, "sala": self.sala_destino.id},
            format="json",
        )

        descricao = Historico.objects.get(bem=bem).descricao
        self.assertIn("Unidade Centro", descricao)
        self.assertIn("Unidade Norte", descricao)

    def test_endpoint_de_historico_do_bem(self):
        bem = self.criar_bem()
        Historico.objects.create(bem=bem, usuario=self.admin, descricao="Registro manual")

        resposta = self.client.get(f"/api/bens/{bem.id}/historico/")

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resposta.data), 1)
        self.assertEqual(resposta.data[0]["descricao"], "Registro manual")


class PermissoesTests(BaseApiTestCase):
    def test_gestor_sem_permissao_nao_cadastra_bem(self):
        self.autenticar_como_gestor(pode_cadastrar=False)

        resposta = self.client.post(
            "/api/bens/",
            {
                "nome": "Monitor",
                "tombo": "2026000009",
                "categoria": self.categoria.id,
                "unidade": self.unidade.id,
            },
            format="json",
        )

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)

    def test_gestor_com_permissao_cadastra_bem(self):
        self.autenticar_como_gestor(pode_cadastrar=True)

        resposta = self.client.post(
            "/api/bens/",
            {
                "nome": "Monitor",
                "tombo": "2026000009",
                "categoria": self.categoria.id,
                "unidade": self.unidade.id,
            },
            format="json",
        )

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED, resposta.data)


class GestorSerializerTests(BaseApiTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin)
        self.payload = {
            "nome": "Novo Gestor",
            "cpf": "000.000.003-00",
            "telefone": "(00) 00000-0003",
            "endereco": "Rua Teste, 3",
            "unidade": self.unidade.id,
        }

    @override_settings(DEFAULT_GESTOR_PASSWORD="")
    def test_exige_senha_quando_nao_ha_senha_padrao(self):
        resposta = self.client.post("/api/gestores/", self.payload, format="json")

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", resposta.data)
        self.assertFalse(Gestor.objects.exists())

    @override_settings(DEFAULT_GESTOR_PASSWORD="senha-padrao-123")
    def test_usa_senha_padrao_configurada(self):
        resposta = self.client.post("/api/gestores/", self.payload, format="json")

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED, resposta.data)
        gestor = Gestor.objects.get(cpf="000.000.003-00")
        self.assertTrue(gestor.user.check_password("senha-padrao-123"))

    def test_cria_usuario_com_senha_informada(self):
        payload = {**self.payload, "password": "senha-do-gestor-9"}

        resposta = self.client.post("/api/gestores/", payload, format="json")

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED, resposta.data)
        gestor = Gestor.objects.get(cpf="000.000.003-00")
        self.assertTrue(gestor.user.check_password("senha-do-gestor-9"))
        self.assertTrue(gestor.user.is_staff)


class DashboardTests(BaseApiTestCase):
    def test_resumo_exige_autenticacao(self):
        resposta = self.client.get("/api/dashboard-stats/")
        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_resumo_retorna_totais(self):
        self.criar_bem()
        self.client.force_authenticate(user=self.admin)

        resposta = self.client.get("/api/dashboard-stats/")

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data["total_bens"], 1)
        self.assertEqual(resposta.data["total_unidades"], 2)
        self.assertEqual(resposta.data["total_categorias"], 1)
