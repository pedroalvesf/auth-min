#!/bin/bash

# Script para criar job Pipeline no Jenkins automaticamente
set -e

echo "🔧 Configurando Job Pipeline no Jenkins"
echo "======================================="

# Verificar se Jenkins está rodando
if ! docker ps | grep -q jenkins-auth-min; then
    echo "❌ Jenkins não está rodando. Execute primeiro:"
    echo "./scripts/start-jenkins-simple.sh"
    exit 1
fi

echo "📋 INFORMAÇÕES IMPORTANTES:"
echo ""
echo "🌐 URL Jenkins: http://localhost:8080"
echo "🔐 Senha: $(docker exec jenkins-auth-min cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo 'Não disponível')"
echo ""

echo "📝 PASSO A PASSO MANUAL:"
echo ""
echo "1. 🌐 Acesse: http://localhost:8080"
echo "2. 🔐 Use a senha acima para fazer login inicial"
echo "3. 🔌 Clique em 'Install suggested plugins'"
echo "4. 👤 Crie um usuário admin:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo "   - Full name: Admin"
echo "   - Email: admin@localhost"
echo ""
echo "5. 🔧 Instalar plugins adicionais:"
echo "   - Manage Jenkins → Plugins → Available plugins"
echo "   - Procurar e instalar:"
echo "     ✓ GitHub Plugin"
echo "     ✓ Generic Webhook Trigger Plugin"
echo "     ✓ HTML Publisher Plugin"
echo "     ✓ Cobertura Plugin"
echo ""
echo "6. 📁 Criar novo Pipeline Job:"
echo "   - Dashboard → New Item"
echo "   - Item name: auth-min-pipeline"
echo "   - Tipo: Pipeline"
echo ""
echo "7. ⚙️  Configurar Pipeline:"
echo "   - Pipeline → Definition: Pipeline script from SCM"
echo "   - SCM: Git"
echo "   - Repository URL: $(git config --get remote.origin.url 2>/dev/null || echo 'https://github.com/seu-usuario/auth-min.git')"
echo "   - Branch: */main"
echo "   - Script Path: Jenkinsfile"
echo ""
echo "8. 🔔 Configurar Build Triggers:"
echo "   - ✅ GitHub hook trigger for GITScm polling"
echo "   - ✅ Poll SCM: H/2 * * * *"
echo ""
echo "9. 💾 Salvar e executar primeiro build"
echo ""

# Criar arquivo de configuração XML do job para importação manual
echo "📝 Criando arquivo de configuração do job..."
cat > ./jenkins_config/job-config.xml << 'EOF'
<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions>
    <org.jenkinsci.plugins.pipeline.modeldefinition.actions.DeclarativeJobAction plugin="pipeline-model-definition@1.8.5"/>
    <org.jenkinsci.plugins.pipeline.modeldefinition.actions.DeclarativeJobPropertyTrackerAction plugin="pipeline-model-definition@1.8.5">
      <jobProperties/>
      <triggers/>
      <parameters/>
      <options/>
    </org.jenkinsci.plugins.pipeline.modeldefinition.actions.DeclarativeJobPropertyTrackerAction>
  </actions>
  <description>Pipeline para auth-min - Testes automatizados e deployment</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/2 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
        <com.github.kostyasha.github.integration.branch.GitHubBranchTrigger plugin="github-integration@1.29.4">
          <spec></spec>
          <events>
            <org.jenkinsci.plugins.github.pullrequest.events.impl.GitHubPROpenEvent>
            </org.jenkinsci.plugins.github.pullrequest.events.impl.GitHubPROpenEvent>
          </events>
        </com.github.kostyasha.github.integration.branch.GitHubBranchTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.92">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>PLACEHOLDER_REPO_URL</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

# Substituir placeholder da URL do repositório
REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo 'https://github.com/seu-usuario/auth-min.git')
sed -i.bak "s|PLACEHOLDER_REPO_URL|${REPO_URL}|g" ./jenkins_config/job-config.xml
rm -f ./jenkins_config/job-config.xml.bak

echo ""
echo "✅ Arquivo de configuração criado em: ./jenkins_config/job-config.xml"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo ""
echo "1. Complete a configuração inicial do Jenkins no navegador"
echo "2. Execute o próximo script para configurar webhook GitHub:"
echo "   ./scripts/setup-github-webhook.sh"
echo ""
echo "3. Ou import a configuração automaticamente:"
echo "   - Manage Jenkins → Manage Nodes → Built-in Node → Configure"
echo "   - Copie o conteúdo de ./jenkins_config/job-config.xml"
echo ""
echo "4. Teste o pipeline:"
echo "   git add . && git commit -m 'test: trigger jenkins' && git push"
echo ""

# Verificar status do container
echo "📊 Status Jenkins:"
docker ps | grep jenkins