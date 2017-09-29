pipeline {
    agent any     

    stages {
        stage('Checkout'){
            steps {                
                cleanWs()
                echo env.BRANCH_NAME
                checkout scm
            }
        }
        stage('Install') { 
            steps {
                sh 'cp tests/scripts/example-test-paths.js tests/scripts/test-paths.js'
                sh 'make install'
            }
        }
        stage('Build'){
            steps {
                dir("www"){
                    sh 'npm run build'
                }
            }
        }
    }
}
