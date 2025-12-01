# Sistema de Gestão de Demandas 

Sistema para gerenciamento de demandas de manutenção e produção, com fluxo de aprovação multinível (Solicitante -> Produção -> Manutenção -> Execução).

**Desenvolvido por:** Hendel / Ederson
**Supervisão:** Gabriel Borges

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- Git

### 1. Backend (Django)

1. Navegue até a pasta do projeto:
   ```bash
   cd Sistema_Demandas_Django
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # venv\Scripts\activate   # Windows
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Execute as migrações do banco de dados:
   ```bash
   python manage.py migrate
   ```

5. (Opcional) Crie usuários de teste:
   ```bash
   python create_test_users.py
   ```

6. Inicie o servidor:
   ```bash
   python manage.py runserver
   ```
   O backend estará rodando em: `http://127.0.0.1:8000`

### 2. Frontend (React)

1. Em outro terminal, navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O frontend estará acessível em: `http://localhost:5173`

---

## 🔗 Links Importantes

- **Aplicação Web:** [http://localhost:5173](http://localhost:5173)
- **Painel Administrativo:** [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
- **API (Browsable):** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

---

## 🌐 Guia de Hospedagem (Deploy)

Para hospedar em um servidor Linux (ex: Ubuntu na AWS, DigitalOcean, VPS):

### Backend
1. Use **Gunicorn** para servir o Django:
   ```bash
   pip install gunicorn
   gunicorn maintenance_system.wsgi:application --bind 0.0.0.0:8000
   ```
2. Configure o **Nginx** como proxy reverso para a porta 8000.
3. Configure as variáveis de ambiente (DEBUG=False, ALLOWED_HOSTS, Banco de Dados) no arquivo `settings.py` ou variáveis do sistema.

### Configuração MySQL

Para usar MySQL em produção:

1. Instale as dependências do sistema (Ubuntu/Debian):
   ```bash
   sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
   ```

2. O pacote `mysqlclient` já está no `requirements.txt`.

3. No arquivo `maintenance_system/settings.py`, altere a configuração `DATABASES`:

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'nome_do_banco',
           'USER': 'usuario_do_banco',
           'PASSWORD': 'senha_do_banco',
           'HOST': 'localhost',   # Ou IP do servidor de banco
           'PORT': '3306',
       }
   }
   ```

4. Crie o banco de dados no MySQL:
   ```sql
   CREATE DATABASE nome_do_banco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. Rode as migrações novamente para criar as tabelas no MySQL:
   ```bash
   python manage.py migrate
   ```

### Frontend
1. Gere a versão de produção (build):
   ```bash
   cd frontend
   npm run build
   ```
2. O conteúdo será gerado na pasta `frontend/dist`.
3. Configure o **Nginx** para servir os arquivos estáticos dessa pasta `dist`.

---

## 🔑 Credenciais de Teste (Local)

| Usuário | Senha | Função |
|---|---|---|
| `admin` | `admin` | Superusuário / Admin |
| `solicitante` | `123` | Solicitante |
| `sup_prod` | `123` | Supervisor de Produção |
| `sup_manut` | `123` | Supervisor de Manutenção |
| `gerente` | `123` | Gerente de Manutenção |
| `tecnico` | `123` | Técnico (Executor) |
| `eng_mec` | `123` | Eng. Mecânico |
| `eng_elet` | `123` | Eng. Elétrico |
