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
        echo 'Cleaning up any existing test database...'
        sh '''
          # Stop and remove any container using port 8239
          sudo docker ps -a | grep 8239 | awk '{print $1}' | xargs -r sudo docker stop || true
          sudo docker ps -a | grep 8239 | awk '{print $1}' | xargs -r sudo docker rm || true
          # Also remove by name pattern if exists
          sudo docker stop auth-postgres-test-${BUILD_NUMBER} || true
          sudo docker rm auth-postgres-test-${BUILD_NUMBER} || true
        '''
        echo 'Starting test database...'
        sh '''
          sudo docker run -d \
            --name auth-postgres-test-${BUILD_NUMBER} \
            --network host \
            -e POSTGRES_USER=auth_test_user \
            -e POSTGRES_PASSWORD=auth_test_password \
            -e POSTGRES_DB=auth_test_db \
            -e PGPORT=8239 \
            postgres:15-alpine
        '''
        echo 'Waiting for database to be ready...'
        sh 'sleep 15'
        echo 'Checking database connectivity...'
        sh '''
          # Check if container is running
          sudo docker ps | grep auth-postgres-test-${BUILD_NUMBER}
          # Check container logs
          sudo docker logs auth-postgres-test-${BUILD_NUMBER}
          # Try to connect to database
          sudo docker exec auth-postgres-test-${BUILD_NUMBER} psql -U auth_test_user -d auth_test_db -c "SELECT 1" || echo "Connection failed"
        '''
        echo 'Setting up test database schema...'
        sh '''
          # Copy schema and migrations to container
          sudo docker cp test/schema.prisma auth-postgres-test-${BUILD_NUMBER}:/tmp/
          sudo docker cp test/migrations auth-postgres-test-${BUILD_NUMBER}:/tmp/ || true

          # Install Node.js and Prisma CLI in the container
          sudo docker exec auth-postgres-test-${BUILD_NUMBER} sh -c "
            apk add --no-cache nodejs npm && \
            npm install -g prisma@6.19.0 && \
            cd /tmp && \
            export DATABASE_URL='postgresql://auth_test_user:auth_test_password@localhost:8239/auth_test_db' && \
            prisma generate --schema=./schema.prisma && \
            prisma migrate deploy --schema=./schema.prisma || \
            prisma db push --schema=./schema.prisma --skip-generate --accept-data-loss
          "
        '''
      }
    }

    stage('E2E Tests') {
      steps {
        echo 'Generating Prisma test client...'
        sh 'npm run prisma:generate:test'
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
