# Guia de Deploy no Netlify - EaseQuote AI

Este guia fornece instruções passo a passo para fazer deploy da aplicação frontend no Netlify.

## 📋 Pré-requisitos

- Conta no Netlify (gratuita): [https://app.netlify.com/signup](https://app.netlify.com/signup)
- Projeto no GitHub/GitLab/Bitbucket (recomendado) ou acesso via CLI
- Variáveis de ambiente do Supabase:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 🚀 Método 1: Deploy via Netlify UI (Recomendado)

### Passo 1: Preparar o Repositório

1. Certifique-se de que seu código está commitado e pushado para o repositório Git:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

### Passo 2: Criar Arquivo de Configuração Netlify

Crie um arquivo `netlify.toml` na raiz do projeto `frontend/`:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "frontend/dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Passo 3: Conectar Repositório no Netlify

1. Acesse [https://app.netlify.com](https://app.netlify.com)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor Git (GitHub, GitLab, ou Bitbucket)
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório `easequote-supabase`

### Passo 4: Configurar Build Settings

Na tela de configuração do site:

1. **Base directory**: `frontend`
2. **Build command**: `npm run build`
3. **Publish directory**: `frontend/dist`
4. Clique em **"Show advanced"** e configure:
   - **Node version**: `20` (ou a versão que você está usando)

### Passo 5: Configurar Variáveis de Ambiente

1. Na tela de configuração, role até **"Environment variables"**
2. Clique em **"Add variable"** e adicione:

   ```
   VITE_SUPABASE_URL = seu_supabase_url_aqui
   VITE_SUPABASE_ANON_KEY = sua_supabase_anon_key_aqui
   ```

   **Como obter essas variáveis:**
   - Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
   - Vá em **Settings** → **API**
   - Copie:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Passo 6: Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build completar (geralmente 2-5 minutos)
3. Quando concluído, você verá um link como: `https://random-name-123.netlify.app`

### Passo 7: Configurar Redirects para SPA

Para garantir que rotas do React Router funcionem corretamente:

1. No Netlify Dashboard, vá em **Site settings** → **Build & deploy** → **Post processing**
2. Ou crie/edite o arquivo `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

---

## 🛠️ Método 2: Deploy via Netlify CLI

### Passo 1: Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Passo 2: Fazer Login

```bash
netlify login
```

Isso abrirá seu navegador para autenticação.

### Passo 3: Inicializar Site

No diretório raiz do projeto:

```bash
cd frontend
netlify init
```

Siga as instruções:
- Escolha **"Create & configure a new site"**
- Escolha seu time (ou crie um novo)
- Dê um nome ao site (ou deixe gerar automaticamente)
- Configure o build command: `npm run build`
- Configure o publish directory: `dist`

### Passo 4: Configurar Variáveis de Ambiente

```bash
netlify env:set VITE_SUPABASE_URL "seu_supabase_url_aqui"
netlify env:set VITE_SUPABASE_ANON_KEY "sua_supabase_anon_key_aqui"
```

### Passo 5: Criar Arquivo netlify.toml

Crie `frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Passo 6: Fazer Deploy

```bash
netlify deploy --prod
```

Ou para preview (sem publicar):

```bash
netlify deploy
```

---

## 🔧 Configurações Adicionais

### Configurar Domínio Customizado

1. No Netlify Dashboard, vá em **Site settings** → **Domain management**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `app.easequote.com`)
4. Siga as instruções para configurar DNS:
   - Adicione um registro CNAME apontando para `seu-site.netlify.app`
   - Ou configure um registro A com o IP fornecido pelo Netlify

### Configurar HTTPS Automático

O Netlify fornece HTTPS automático via Let's Encrypt. Basta configurar o domínio customizado.

### Configurar Branch Deploys

Para fazer deploy automático de branches específicas:

1. **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Configure:
   - **Production branch**: `main` ou `master`
   - **Branch deploys**: Ative para preview de PRs

### Configurar Notificações

1. **Site settings** → **Build & deploy** → **Deploy notifications**
2. Configure notificações via:
   - Email
   - Slack
   - Discord
   - GitHub

---

## 🔍 Troubleshooting

### Build Falha

**Erro: "Missing environment variables"**
- Verifique se todas as variáveis de ambiente estão configuradas no Netlify
- Certifique-se de que os nomes estão corretos (começam com `VITE_`)

**Erro: "Command failed"**
- Verifique se o Node version está correto
- Tente limpar o cache: **Site settings** → **Build & deploy** → **Clear build cache**

### Rotas não funcionam (404)

- Certifique-se de que o arquivo `_redirects` existe em `frontend/public/`
- Ou configure redirects no `netlify.toml`

### Variáveis de ambiente não funcionam

- Variáveis precisam começar com `VITE_` para serem expostas no Vite
- Após adicionar variáveis, faça um novo deploy
- Verifique se não há espaços extras nos valores

### Build muito lento

- Configure Node version específica
- Use build cache do Netlify
- Considere usar `npm ci` ao invés de `npm install`

---

## 📝 Checklist Final

- [ ] Código commitado e pushado
- [ ] Arquivo `netlify.toml` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build command correto (`npm run build`)
- [ ] Publish directory correto (`dist`)
- [ ] Redirects configurados para SPA
- [ ] Deploy realizado com sucesso
- [ ] Site funcionando corretamente
- [ ] Autenticação Supabase funcionando
- [ ] Rotas do React Router funcionando

---

## 🔗 Links Úteis

- [Documentação Netlify](https://docs.netlify.com/)
- [Netlify CLI Docs](https://cli.netlify.com/)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Supabase Dashboard](https://app.supabase.com)

---

## 💡 Dicas

1. **Use Deploy Previews**: Cada PR cria um preview URL único para testar antes de fazer merge
2. **Monitor Builds**: Configure notificações para saber quando builds falham
3. **Cache**: O Netlify cacheia `node_modules` automaticamente entre builds
4. **Environment Variables**: Use diferentes variáveis para produção e preview se necessário
5. **Analytics**: Ative Netlify Analytics para monitorar performance do site

---

## 🎉 Pronto!

Seu site está no ar! Qualquer push para a branch principal fará deploy automático.

Para atualizar o site, basta fazer:
```bash
git add .
git commit -m "Update"
git push origin main
```

O Netlify detectará automaticamente e fará um novo deploy.

