pipeline {
  agent any
  
  triggers {
    // Trigger on git pushes/commits
    githubPush()
    
    // Poll SCM every 2 minutes for changes (fallback)
    pollSCM('H/2 * * * *')
    
    // Optional: Trigger on PR events
    GenericTrigger(
      genericVariables: [
        [key: 'action', value: '$.action'],
        [key: 'number', value: '$.number'],
        [key: 'merge_commit_sha', value: '$.pull_request.merge_commit_sha']
      ],
      causeString: 'Triggered on $action PR #$number',
      token: 'auth-min-webhook-token',
      printContributedVariables: true,
      printPostContent: true,
      silentResponse: false
    )
  }
  
  options {
    timestamps()
    durabilityHint('PERFORMANCE_OPTIMIZED')
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(false)
    // IMPORTANTE: tirei o skipStagesAfterUnstable()
    // pra que stages continuem rodando mesmo se algo marcar UNSTABLE
    // skipStagesAfterUnstable()
  }
  
  environment {
    NODE_ENV = 'test'
    CI = 'true'
    IMAGE_NAME = 'auth-min'
    DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db'
    JWT_SECRET = 'test-jwt-secret-key-for-ci'
    GIT_SSL_NO_VERIFY = 'true'
    GIT_TIMEOUT = '300'
  }
  
  stages {
    stage('Checkout') {
      steps {
        echo 'Checking out source code...'
        script {
          // Configurar git para resolver problemas de timeout/SSL
          sh '''
            git config --global http.timeout 300
            git config --global http.lowSpeedLimit 0
            git config --global http.lowSpeedTime 300
            git config --global http.sslVerify false
          '''
        }
        retry(3) {
          checkout scm
        }
        sh 'git --version'
        sh 'ls -la'
      }
    }
    
    stage('Pre-build Setup') {
      steps {
        echo 'Setting up build environment...'
        sh 'node --version'
        sh 'npm --version'
        sh 'sudo docker --version || echo "Docker CLI available via sudo"'
      }
    }
    
    stage('Install Dependencies') {
      steps {
        echo 'Installing dependencies...'
        script {
          def nodeModulesExists = fileExists('node_modules')
          if (!nodeModulesExists) {
            echo 'node_modules not found, will install dependencies'
          }
        }
        sh 'npm ci --cache /tmp/.npm'
        stash includes: 'node_modules/**', name: 'node_modules'
      }
    }
    
    stage('Prisma Setup') {
      steps {
        echo 'Generating Prisma client...'
        sh 'npm run prisma:generate'
        sh 'npm run prisma:generate:test'
      }
    }
    
    stage('Code Quality') {
      parallel {
        stage('Linting') {
          steps {
            echo 'Running ESLint...'
            script {
              // Se ESLint falhar, marca build como UNSTABLE, mas não derruba o pipeline
              catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                sh 'npm run lint:check'
              }
            }
          }
          post {
            always {
              script {
                if (fileExists('eslint-reports')) {
                  publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'eslint-reports',
                    reportFiles: '*.html',
                    reportName: 'ESLint Report'
                  ])
                } else {
                  echo 'eslint-reports directory not found, skipping HTML publish.'
                }
              }
            }
          }
        }
        stage('Formatting') {
          steps {
            echo 'Checking code formatting...'
            script {
              // Prettier também só marca UNSTABLE se estiver quebrado
              def formatStatus = sh(
                script: 'npm run format:check',
                returnStatus: true
              )
              if (formatStatus != 0) {
                echo 'Prettier found formatting issues. Marking build as UNSTABLE, but continuing pipeline.'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }
    
    stage('Unit Tests') {
      steps {
        echo 'Running unit tests with coverage...'
        sh 'npm run test:coverage'
      }
      post {
        always {
          publishTestResults testResultsPattern: 'coverage/junit.xml'
          publishCoverage adapters: [
            istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')
          ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
          
          archiveArtifacts artifacts: 'coverage/**/*', fingerprint: true
        }
      }
    }
    
    stage('E2E Tests') {
      steps {
        echo 'Setting up test database and running E2E tests...'
        sh 'npm run ci:test'
      }
      post {
        always {
          publishTestResults testResultsPattern: 'test-results/junit.xml'
        }
      }
    }
    
    stage('Test Results Summary') {
      steps {
        echo 'Publishing comprehensive test results...'
        script {
          def testResults = [:]
          
          if (fileExists('coverage/junit.xml')) {
            testResults.unit = 'PASSED'
          }
          
          if (fileExists('test-results/junit.xml')) {
            testResults.e2e = 'PASSED'
          }
          
          echo "Test Results Summary: ${testResults}"
          
          if (testResults.unit == 'PASSED' && testResults.e2e == 'PASSED') {
            if (currentBuild.result == null || currentBuild.result == 'SUCCESS') {
              currentBuild.result = 'SUCCESS'
            }
            echo '✅ All tests passed successfully!'
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'coverage/**, test-results/**, eslint-reports/**', 
                          fingerprint: true, 
                          allowEmptyArchive: true
        }
      }
    }
    
    stage('Build Application') {
      steps {
        echo 'Building application...'
        sh 'npm run build'
        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
      }
    }
    
    stage('Security Audit') {
      parallel {
        stage('NPM Audit') {
          steps {
            echo 'Running NPM security audit...'
            script {
              def auditResult = sh(
                script: 'npm audit --audit-level=high --production',
                returnStatus: true
              )
              if (auditResult != 0) {
                echo 'NPM audit found vulnerabilities'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
        stage('Prisma Format Check') {
          steps {
            echo 'Checking Prisma schema formatting...'
            sh 'npx prisma format --schema=./prisma/schema.prisma --check'
          }
        }
      }
    }
    
    stage('Docker Build & Security Scan') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
          branch 'staging'
        }
      }
      steps {
        echo 'Building Docker image...'
        script {
          echo 'Building Docker image...'
          sh "sudo docker build -t ${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]} ."
          
          echo 'Running Trivy security scan...'
          sh """
            sudo docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
              -v \$(pwd):/workspace \\
              aquasec/trivy:latest image \\
              --exit-code 0 \\
              --severity HIGH,CRITICAL \\
              --format table \\
              ${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]} || true
          """
          
          if ((env.BRANCH_NAME ?: '') == 'main') {
            echo 'Tagging image as latest...'
            sh "sudo docker tag ${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]} ${env.IMAGE_NAME}:latest"
          }
        }
      }
    }
    
    stage('Image Registry Info') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
          branch 'staging'
        }
      }
      steps {
        echo 'Docker image built successfully!'
        script {
          echo "Image: ${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]}"
          echo "To push to registry, configure docker-hub-credentials in Jenkins"
          sh "sudo docker images | grep ${env.IMAGE_NAME} || true"
        }
      }
    }
    
    stage('Deploy') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
          branch 'staging'
        }
      }
      steps {
        echo "Deploying to ${env.BRANCH_NAME} environment..."
        script {
          def composeFile = (env.BRANCH_NAME ?: '') == 'main' ? 'docker-compose.prod.yml' : 'docker-compose.yml'
          
          echo "Deploying to ${env.BRANCH_NAME} environment using ${composeFile}"
          sh """
            export IMAGE_TAG=${env.GIT_COMMIT[0..7]}
            sudo docker compose -f ${composeFile} pull || true
            sudo docker compose -f ${composeFile} up -d --remove-orphans || echo "Deploy would run here in production"
          """
        }
      }
    }
    
    stage('Health Check') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
          branch 'staging'
        }
      }
      steps {
        echo 'Performing health check...'
        script {
          timeout(time: 5, unit: 'MINUTES') {
            waitUntil {
              def healthStatus = sh(
                script: 'curl -f http://localhost:3000/health || exit 1',
                returnStatus: true
              )
              return healthStatus == 0
            }
          }
        }
        echo 'Application is healthy and running!'
      }
    }
  }
  
  post {
    always {
      script {
        node {
          echo 'Cleaning up...'
          try {
            sh 'sudo docker system prune -f || true'
          } catch (Exception e) {
            echo "Docker cleanup failed: ${e.getMessage()}"
          }
          cleanWs()
        }
      }
    }
    success {
      echo 'Pipeline completed successfully!'
      script {
        if ((env.BRANCH_NAME ?: '') == 'main') {
          echo "✅ Production deployment successful for commit ${env.GIT_COMMIT[0..7]}"
        }
      }
    }
    failure {
      echo 'Pipeline failed!'
      script {
        echo "❌ Pipeline failed for branch ${(env.BRANCH_NAME ?: 'unknown')} at stage ${(env.STAGE_NAME ?: 'N/A')}"
      }
    }
    unstable {
      echo 'Pipeline completed with warnings!'
      script {
        echo "⚠️ Pipeline completed with warnings for branch ${(env.BRANCH_NAME ?: 'unknown')}"
      }
    }
  }
}