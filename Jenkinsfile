pipeline {
  agent any

  // TRIGGERS DESABILITADOS - Apenas builds manuais
  // Descomentar quando estiver tudo estável
  // triggers {
  //   // Trigger on git pushes/commits
  //   githubPush()
  //
  //   // Poll SCM every 2 minutes for changes (fallback)
  //   pollSCM('H/2 * * * *')
  // }

  options {
    timestamps()
    durabilityHint('MAX_SURVIVABILITY')
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(false)
  }

  environment {
    NODE_ENV = 'test'
    CI = 'true'
    GIT_SSL_NO_VERIFY = 'true'
    GIT_TIMEOUT = '300'
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Checking out source code...'
        script {
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
      }
    }

    stage('Install Dependencies') {
      steps {
        echo 'Installing dependencies...'
        sh 'npm ci --cache /tmp/.npm'
      }
    }

    stage('Prisma Setup') {
      steps {
        echo 'Generating Prisma client...'
        sh 'npm run prisma:generate'
      }
    }

    stage('Code Quality') {
      parallel {
        stage('Linting') {
          steps {
            echo 'Running ESLint...'
            script {
              catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                sh 'npm run lint:check'
              }
            }
          }
        }
        stage('Formatting') {
          steps {
            echo 'Checking code formatting...'
            script {
              def formatStatus = sh(
                script: 'npm run format:check',
                returnStatus: true
              )
              if (formatStatus != 0) {
                echo 'Prettier found formatting issues. Marking build as UNSTABLE.'
                currentBuild.result = 'UNSTABLE'
              }
            }
          }
        }
      }
    }

    stage('Unit Tests') {
      steps {
        echo 'Running unit tests...'
        sh 'npm run test:ci'
      }
      post {
        always {
          script {
            if (fileExists('junit.xml')) {
              junit testResults: 'junit.xml'
            }
          }
          // Coverage desabilitado para otimizar tempo de build
          // publishCoverage adapters: [
          //   istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')
          // ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
          //
          // archiveArtifacts artifacts: 'coverage/**/*', fingerprint: true, allowEmptyArchive: true
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

    stage('Test Database Setup') {
      steps {
        echo 'Starting test database...'
        sh '''
          sudo docker run -d \
            --name auth-postgres-test-${BUILD_NUMBER} \
            -e POSTGRES_USER=auth_test_user \
            -e POSTGRES_PASSWORD=auth_test_password \
            -e POSTGRES_DB=auth_test_db \
            -p 8239:5432 \
            postgres:15-alpine
        '''
        sh 'sleep 10'  // Wait for database to be ready
        echo 'Setting up test database schema...'
        sh 'npm run db:setup:test'
      }
    }

    stage('E2E Tests') {
      steps {
        echo 'Running E2E tests...'
        sh 'npm run test:e2e:ci'
      }
      post {
        always {
          script {
            if (fileExists('test-results/junit.xml')) {
              junit testResults: 'test-results/junit.xml'
            }
          }
          archiveArtifacts artifacts: 'test-results/**/*', fingerprint: true, allowEmptyArchive: true
        }
      }
    }
  }

  post {
    always {
      echo 'Stopping test database...'
      sh 'sudo docker stop auth-postgres-test-${BUILD_NUMBER} || true'
      sh 'sudo docker rm auth-postgres-test-${BUILD_NUMBER} || true'
      echo 'Cleaning up workspace...'
      cleanWs()
    }
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed!'
      script {
        echo "Failed at stage: ${(env.STAGE_NAME ?: 'N/A')}"
      }
    }
    unstable {
      echo '⚠️ Pipeline completed with warnings!'
    }
  }
}
