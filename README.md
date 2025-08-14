# Teste de Ligação - Diagnóstico de Internet

Um aplicativo web moderno para testar a velocidade da sua internet e diagnosticar problemas de conectividade. Desenvolvido com React, TypeScript e Vite.

## 🚀 Funcionalidades

- **Teste de Velocidade**: Mede download, upload e latência
- **Diagnóstico de Conectividade**: Verifica se seu dispositivo está pronto para chamadas
- **Interface Moderna**: Design responsivo com shadcn/ui
- **Tema Escuro/Claro**: Suporte a múltiplos temas
- **Resultados Detalhados**: Histórico e análise de performance

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Teste de Velocidade**: Cloudflare Speedtest
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **Notificações**: Sonner

## Como editar este código?

Existem várias maneiras de editar sua aplicação.

**Use seu IDE preferido**

Se você quiser trabalhar localmente usando seu próprio IDE, pode clonar este repositório e fazer push das alterações.

O único requisito é ter Node.js & npm instalados - [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <YOUR_GIT_URL>

# Passo 2: Navegue até o diretório do projeto.
cd <YOUR_PROJECT_NAME>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reload e preview instantâneo.
npm run dev
```

**Edite um arquivo diretamente no GitHub**

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e faça commit das mudanças.

**Use GitHub Codespaces**

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente Codespace.
- Edite arquivos diretamente dentro do Codespace e faça commit e push das suas alterações quando terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto é construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 Como fazer Deploy

Este projeto está configurado para deploy automático em várias plataformas:

### GitHub Pages (Recomendado)
1. Faça push do código para o GitHub
2. Vá em Settings > Pages
3. Selecione "GitHub Actions" como source
4. O deploy acontecerá automaticamente a cada push na branch `main`

### Vercel
1. Conecte seu repositório no [Vercel](https://vercel.com)
2. O deploy acontecerá automaticamente
3. URL será: `https://seu-projeto.vercel.app`

### Netlify
1. Conecte seu repositório no [Netlify](https://netlify.com)
2. Configure build command: `npm run build`
3. Configure publish directory: `dist`
4. O deploy acontecerá automaticamente

### Deploy Manual
```bash
npm run build
# Faça upload da pasta 'dist' para seu servidor
```

## Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói o projeto para produção
- `npm run build:dev` - Constrói o projeto em modo desenvolvimento
- `npm run lint` - Executa o linter
- `npm run preview` - Visualiza a versão de produção localmente
