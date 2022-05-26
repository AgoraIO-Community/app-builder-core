pipeline {
    agent any
    stages {
        stage('Run Tests') {
            parallel {
                stage('Test On Mac') {
                    agent {
                        label "amzn-macos-n1"
                    }
                    steps {
                        sh "chmod 755 scripts/run-tests-mac.sh"
	                    sh "ls -la"
                        sh "sudo security lock-keychain ~/Library/Keychains/login.keychain-db"
                        sh "sudo security unlock-keychain ~/Library/Keychains/login.keychain-db"
                        sh "scripts/run-tests-mac.sh"
                    }
                }
                stage('Test On Linux') {
                    agent {
                        label "amzn-linux2-n4-ubuntu"
                    }
                    steps {
                        sh "chmod 755 scripts/run-tests-lnx.sh"
	                    sh "ls -la"
                        sh "scripts/run-tests-lnx.sh"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'cleaning up our workspace'
            deleteDir()
        }
    }

}
