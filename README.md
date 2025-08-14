# 🚀 Teste de Ligação - GitHub Pages

Um aplicativo moderno para testar a velocidade da sua conexão de internet, construído com React, TypeScript e Tailwind CSS.

## 🌐 Demo

Acesse o aplicativo em: **https://lucasxtech.github.io/teste-de-ligacao**

## ✨ Funcionalidades

- 🚀 **Teste de Velocidade**: Medição precisa de download e upload
- 📊 **Diagnóstico de Rede**: Análise completa da sua conexão
- 🌙 **Tema Escuro/Claro**: Interface adaptável ao seu gosto
- 📱 **Responsivo**: Funciona perfeitamente em desktop e mobile
- ⚡ **Performance**: Carregamento rápido e interface fluida

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Router** - Navegação
- **Cloudflare Speedtest** - API de teste de velocidade

## 🚀 Deploy no GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages. Após cada push na branch `main`, o deploy acontece automaticamente.

### Configuração Manual (se necessário)

1. **Vá para Settings > Pages** no seu repositório GitHub
2. **Em "Source"**, selecione **"GitHub Actions"**
3. **Aguarde o deploy** - acontece automaticamente a cada push
4. **URL**: `https://SEU_USUARIO.github.io/teste-de-ligacao`

## 🏃‍♂️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Deploy manual (se necessário)
npm run deploy
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── SpeedTest.tsx   # Componente de teste de velocidade
│   ├── DiagnosticCard.tsx # Card de diagnóstico
│   └── ThemeToggle.tsx # Toggle de tema
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── lib/                # Utilitários
└── utils/              # Funções auxiliares
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build
- `npm run lint` - Verificação de código
- `npm run deploy` - Deploy manual para GitHub Pages

## 🌟 Características

- **PWA Ready** - Pronto para Progressive Web App
- **SEO Optimized** - Meta tags e estrutura otimizada
- **Accessibility** - Componentes acessíveis
- **Performance** - Lazy loading e otimizações
- **Modern UI** - Interface moderna e intuitiva

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se encontrar algum problema:

1. Verifique se está usando Node.js 18+
2. Limpe o cache: `npm run clean`
3. Reinstale as dependências: `rm -rf node_modules && npm install`
4. Abra uma issue no GitHub

---

**🎉 Divirta-se testando sua conexão!**
