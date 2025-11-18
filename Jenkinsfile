pipeline {
  agent {
    docker {
      image 'node:20-alpine'
      args '-u root --privileged -v /var/run/docker.sock:/var/run/docker.sock'
    }
  }
  
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
    ansiColor('xterm')
    durabilityHint('PERFORMANCE_OPTIMIZED')
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(false)
    // Skip builds when only documentation changes
    skipStagesAfterUnstable()
  }
  
  environment {
    NODE_ENV = 'test'
    CI = 'true'
    REGISTRY = credentials('docker-registry')
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
        sh 'apk add --no-cache docker-cli git'
        sh 'node --version'
        sh 'npm --version'
        sh 'docker --version'
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
            sh 'npm run lint:check'
          }
          post {
            always {
              publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'eslint-reports',
                reportFiles: '*.html',
                reportName: 'ESLint Report'
              ])
            }
          }
        }
        stage('Formatting') {
          steps {
            echo 'Checking code formatting...'
            sh 'npm run format:check'
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
          
          // Read test results if available
          if (fileExists('coverage/junit.xml')) {
            testResults.unit = 'PASSED'
          }
          
          if (fileExists('test-results/junit.xml')) {
            testResults.e2e = 'PASSED'
          }
          
          echo "Test Results Summary: ${testResults}"
          
          // Set build status based on tests
          if (testResults.unit == 'PASSED' && testResults.e2e == 'PASSED') {
            currentBuild.result = 'SUCCESS'
            echo '✅ All tests passed successfully!'
          }
        }
      }
      post {
        always {
          // Archive all test artifacts
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
          def image = docker.build("${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]}")
          
          echo 'Running Trivy security scan...'
          sh """
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
              -v \$(pwd):/workspace \\
              aquasec/trivy:latest image \\
              --exit-code 1 \\
              --severity HIGH,CRITICAL \\
              --format table \\
              ${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]}
          """
          
          if (env.BRANCH_NAME == 'main') {
            echo 'Tagging image as latest...'
            sh "docker tag ${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]} ${env.IMAGE_NAME}:latest"
          }
        }
      }
    }
    
    stage('Push to Registry') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
          branch 'staging'
        }
      }
      steps {
        echo 'Pushing Docker image to registry...'
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
            def image = docker.image("${env.IMAGE_NAME}:${env.GIT_COMMIT[0..7]}")
            image.push()
            
            if (env.BRANCH_NAME == 'main') {
              def latestImage = docker.image("${env.IMAGE_NAME}:latest")
              latestImage.push()
            }
          }
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
          def composeFile = env.BRANCH_NAME == 'main' ? 'docker-compose.prod.yml' : 'docker-compose.yml'
          
          echo "Deploying to ${env.BRANCH_NAME} environment using ${composeFile}"
          sh """
            export IMAGE_TAG=${env.GIT_COMMIT[0..7]}
            docker-compose -f ${composeFile} pull
            docker-compose -f ${composeFile} up -d --remove-orphans
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
      echo 'Cleaning up...'
      sh 'docker system prune -f || true'
      cleanWs()
    }
    success {
      echo 'Pipeline completed successfully!'
      script {
        if (env.BRANCH_NAME == 'main') {
          // Send success notification
          echo "✅ Production deployment successful for commit ${env.GIT_COMMIT[0..7]}"
        }
      }
    }
    failure {
      echo 'Pipeline failed!'
      script {
        // Send failure notification
        echo "❌ Pipeline failed for branch ${env.BRANCH_NAME} at stage ${env.STAGE_NAME}"
      }
    }
    unstable {
      echo 'Pipeline completed with warnings!'
      script {
        echo "⚠️ Pipeline completed with warnings for branch ${env.BRANCH_NAME}"
      }
    }
  }
}