# 🚀 Guia Completo de Deploy

Este projeto está configurado para deploy automático em várias plataformas. Escolha a opção que preferir:

## 📋 Pré-requisitos

1. **GitHub**: Crie um repositório no GitHub
2. **Node.js**: Certifique-se de ter Node.js 18+ instalado
3. **Git**: Configure seu Git localmente

## 🔧 Configuração Inicial

### 1. Criar repositório no GitHub
- Vá para [github.com](https://github.com)
- Clique em "New repository"
- Dê um nome ao repositório (ex: `teste-de-ligacao`)
- **NÃO** inicialize com README, .gitignore ou license
- Clique em "Create repository"

### 2. Conectar repositório local ao GitHub
```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO e SEU_REPOSITORIO)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Renomear branch para main
git branch -M main

# Fazer push inicial
git push -u origin main
```

## 🌐 Opções de Deploy

### 🎯 GitHub Pages (Recomendado - Gratuito)

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Deploy automático via GitHub Actions
- ✅ Integração perfeita com GitHub
- ✅ HTTPS automático

**Configuração:**
1. Vá para Settings > Pages no seu repositório
2. Em "Source", selecione "GitHub Actions"
3. O deploy acontecerá automaticamente a cada push na branch `main`
4. URL será: `https://SEU_USUARIO.github.io/SEU_REPOSITORIO`

### ⚡ Vercel (Recomendado - Gratuito)

**Vantagens:**
- ✅ Deploy muito rápido
- ✅ Preview automático para PRs
- ✅ Analytics incluídos
- ✅ Domínio personalizado gratuito

**Configuração:**
1. Vá para [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Clique em "New Project"
4. Selecione seu repositório
5. Clique em "Deploy"
6. URL será: `https://SEU_REPOSITORIO.vercel.app`

### 🌊 Netlify (Gratuito)

**Vantagens:**
- ✅ Deploy automático
- ✅ Formulários incluídos
- ✅ Funções serverless
- ✅ Domínio personalizado

**Configuração:**
1. Vá para [netlify.com](https://netlify.com)
2. Conecte sua conta GitHub
3. Clique em "New site from Git"
4. Selecione seu repositório
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Clique em "Deploy site"

### 🔥 Firebase Hosting (Gratuito)

**Vantagens:**
- ✅ Integração com Google Cloud
- ✅ CDN global
- ✅ Analytics incluídos
- ✅ Domínio personalizado

**Configuração:**
1. Instale Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Inicialize: `firebase init hosting`
4. Configure:
   - Public directory: `dist`
   - Single-page app: `yes`
5. Deploy: `firebase deploy`

## 🔄 Deploy Automático

O projeto já está configurado com:

- **GitHub Actions** (`.github/workflows/deploy.yml`)
- **Vercel** (`vercel.json`)
- **Netlify** (`netlify.toml`)

Apenas conecte o repositório na plataforma escolhida e o deploy será automático!

## 📱 Testando o Deploy

Após o deploy, teste:

1. ✅ Aplicação carrega corretamente
2. ✅ Teste de velocidade funciona
3. ✅ Tema escuro/claro funciona
4. ✅ Responsividade em mobile
5. ✅ Navegação entre páginas

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint do código
npm run lint

# Push para GitHub
git add .
git commit -m "feat: nova funcionalidade"
git push
```

## 🆘 Solução de Problemas

### Erro de Build
- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique se o Node.js é versão 18+: `node --version`

### Erro de Deploy
- Verifique os logs na plataforma de deploy
- Certifique-se de que o build local funciona: `npm run build`

### Problemas de Roteamento
- Verifique se o arquivo de configuração da plataforma está correto
- Para SPA, configure redirects para `/index.html`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de deploy
2. Teste localmente primeiro
3. Consulte a documentação da plataforma escolhida
4. Abra uma issue no GitHub

---

**🎉 Parabéns! Seu projeto está pronto para produção!**
