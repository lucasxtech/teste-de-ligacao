#!/bin/bash

# Script para configurar o repositório Git e fazer o primeiro push

echo "🚀 Configurando repositório Git..."

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "🎉 Initial commit: Teste de Ligação - Diagnóstico de Internet"

echo "✅ Repositório Git configurado!"
echo ""
echo "📝 Próximos passos:"
echo "1. Crie um repositório no GitHub"
echo "2. Execute: git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git"
echo "3. Execute: git branch -M main"
echo "4. Execute: git push -u origin main"
echo ""
echo "🌐 Para fazer deploy:"
echo "- GitHub Pages: Configure em Settings > Pages"
echo "- Vercel: Conecte o repositório em vercel.com"
echo "- Netlify: Conecte o repositório em netlify.com"
