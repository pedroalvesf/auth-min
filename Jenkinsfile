pipeline {
  agent any

  // Triggers disabled - manual builds only
  // triggers {
  //   githubPush()
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
          sudo docker ps -a | grep 8239 | awk '{print $1}' | xargs -r sudo docker stop || true
          sudo docker ps -a | grep 8239 | awk '{print $1}' | xargs -r sudo docker rm || true
          sudo docker stop auth-postgres-test-${BUILD_NUMBER} || true
          sudo docker rm auth-postgres-test-${BUILD_NUMBER} || true
        '''
        echo 'Starting test database...'
        sh '''
          sudo docker run -d \
            --name auth-postgres-test-${BUILD_NUMBER} \
            -p 8239:5432 \
            -e POSTGRES_USER=auth_test_user \
            -e POSTGRES_PASSWORD=auth_test_password \
            -e POSTGRES_DB=auth_test_db \
            postgres:15-alpine
        '''
        echo 'Waiting for database to be ready...'
        sh 'sleep 15'
        echo 'Checking database connectivity...'
        sh '''
          sudo docker ps | grep auth-postgres-test-${BUILD_NUMBER}
          sudo docker logs auth-postgres-test-${BUILD_NUMBER}
          sudo docker exec auth-postgres-test-${BUILD_NUMBER} psql -U auth_test_user -d auth_test_db -c "SELECT 1" || echo "Connection failed"
        '''
        echo 'Setting up test database schema...'
        sh '''
          sudo docker cp test/schema.prisma auth-postgres-test-${BUILD_NUMBER}:/tmp/
          sudo docker cp test/migrations auth-postgres-test-${BUILD_NUMBER}:/tmp/ || true

          sudo docker exec auth-postgres-test-${BUILD_NUMBER} sh -c "
            apk add --no-cache nodejs npm && \
            npm install -g prisma@6.19.0 && \
            cd /tmp && \
            export DATABASE_URL='postgresql://auth_test_user:auth_test_password@localhost:5432/auth_test_db' && \
            prisma generate --schema=./schema.prisma && \
            prisma migrate deploy --schema=./schema.prisma || \
            prisma db push --schema=./schema.prisma --skip-generate --accept-data-loss
          "
        '''
      }
    }

    stage('E2E Tests') {
      environment {
        DATABASE_URL = 'postgresql://auth_test_user:auth_test_password@localhost:8239/auth_test_db'
      }
      steps {
        echo 'Generating Prisma test client...'
        sh 'npm run prisma:generate:test'
        sh 'mkdir -p test-results'
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
      echo 'Pipeline completed successfully!'
    }
    failure {
      echo 'Pipeline failed!'
      script {
        echo "Failed at stage: ${(env.STAGE_NAME ?: 'N/A')}"
      }
    }
    unstable {
      echo 'Pipeline completed with warnings!'
    }
  }
}
