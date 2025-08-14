# Script PowerShell para configurar o repositório Git e fazer o primeiro push

Write-Host "🚀 Configurando repositório Git..." -ForegroundColor Green

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "🎉 Initial commit: Teste de Ligação - Diagnóstico de Internet"

Write-Host "✅ Repositório Git configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Crie um repositório no GitHub"
Write-Host "2. Execute: git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git"
Write-Host "3. Execute: git branch -M main"
Write-Host "4. Execute: git push -u origin main"
Write-Host ""
Write-Host "🌐 Para fazer deploy:" -ForegroundColor Yellow
Write-Host "- GitHub Pages: Configure em Settings > Pages"
Write-Host "- Vercel: Conecte o repositório em vercel.com"
Write-Host "- Netlify: Conecte o repositório em netlify.com"
