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
        sh 'pnpm --version'
      }
    }

    stage('Install Dependencies') {
      steps {
        echo 'Installing dependencies...'
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Prisma Setup') {
      steps {
        echo 'Generating Prisma client...'
        sh 'pnpm prisma:generate'
      }
    }

    stage('Code Quality') {
      parallel {
        stage('Linting') {
          steps {
            echo 'Running ESLint...'
            script {
              catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                sh 'pnpm lint:check'
              }
            }
          }
        }
        stage('Formatting') {
          steps {
            echo 'Checking code formatting...'
            script {
              def formatStatus = sh(
                script: 'pnpm format:check',
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
        sh 'pnpm test:ci'
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
        sh 'pnpm build'
        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
      }
    }

    stage('Test Database Setup') {
      environment {
        DATABASE_URL = 'postgresql://auth_test_user:auth_test_password@host.docker.internal:8239/auth_test_db'
      }
      steps {
        echo 'Cleaning up any existing test database...'
        sh '''
          sudo docker stop auth-postgres-test-${BUILD_NUMBER} || true
          sudo docker rm auth-postgres-test-${BUILD_NUMBER} || true
          sudo docker ps -a | grep ":8239->" | awk '{print $1}' | xargs -r sudo docker stop || true
          sudo docker ps -a | grep ":8239->" | awk '{print $1}' | xargs -r sudo docker rm || true
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
        sh '''
          for i in $(seq 1 30); do
            if sudo docker exec auth-postgres-test-${BUILD_NUMBER} pg_isready -U auth_test_user -d auth_test_db -q; then
              echo "Database is ready after ${i} attempts"
              break
            fi
            echo "Waiting for database... attempt ${i}/30"
            sleep 2
          done
        '''
        echo 'Pushing test schema to database...'
        sh 'pnpm dlx prisma db push --schema=./test/schema.prisma --force-reset'
      }
    }

    stage('E2E Tests') {
      environment {
        DATABASE_URL = 'postgresql://auth_test_user:auth_test_password@host.docker.internal:8239/auth_test_db'
      }
      steps {
        echo 'Generating Prisma test client...'
        sh 'pnpm prisma:generate:test'
        sh 'mkdir -p test-results'
        echo 'Running E2E tests...'
        sh 'pnpm test:e2e:ci'
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
