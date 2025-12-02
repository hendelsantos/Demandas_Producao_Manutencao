# Sistema de Gestão de Demandas 

Sistema para gerenciamento de demandas de manutenção e produção, com fluxo de aprovação multinível (Solicitante -> Produção -> Manutenção -> Execução).

**Desenvolvido por:** Hendel / Ederson
**Supervisão:** Gabriel Borges

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Python 3.8+**
- **Node.js 16+**
- **Git**

### 1. Backend (Django)

#### Passo 1: Clone e navegue
```bash
git clone https://github.com/hendelsantos/Demandas_Producao_Manutencao.git
cd Sistema_Demandas_Django
```

#### Passo 2: Configurar Ambiente Virtual

**Linux / Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate
```

#### Passo 3: Instalar e Rodar
```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
python manage.py migrate

# (Opcional) Criar usuários de teste
python populate_users.py

# Iniciar servidor
python manage.py runserver
```
O backend estará rodando em: `http://127.0.0.1:8000`

### 2. Frontend (React)

Abra um **novo terminal** e execute:

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
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

Senha padrão para todos: `password123`

| Usuário | Função | Descrição |
|---|---|---|
| `admin` | **Admin** | Superusuário (Acesso total) |
| `sup_prod` | **Supervisor Produção** | Aprova demandas iniciais |
| `sup_maint` | **Supervisor Manutenção** | Define se é Técnica ou Engenharia |
| `gerente` | **Gerente Manutenção** | Aprova demandas de Engenharia |
| `tec_hyd` | **Executante (Hidráulica)** | Encarregado de turno |
| `tec_elec` | **Executante (Elétrica)** | Encarregado de turno |
| `tec_mech` | **Executante (Mecânica)** | Encarregado de turno |
| `eng_mech` | **Eng. Mecânico** | Responsável por projetos mecânicos |
| `eng_elec` | **Eng. Elétrico** | Responsável por projetos elétricos |
