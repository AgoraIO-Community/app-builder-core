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
                        sh "run-tests-mac.sh"
                    }
                }
                stage('Test On Linux') {
                    agent {
                        label "amzn-linux2-n4-ubuntu"
                    }
                    steps {
                        sh "chmod 755 scripts/run-tests-lnx.sh"
	                    sh "ls -la"
                        sh "run-tests-lnx.sh"
                    }
                }
            }
        }
    }


    // stages {
    //     stage('build-dev') {
    //         environment {
    //             DEPLOYMENT_ENV = 'dev'
    //         }
    //         when {
                
    //             branch 'dev'
	// 	    }
    //         steps {
	// 			checkout scm
	// 			script {
	// 				sh "chmod 755 scripts/build.sh"
	// 				sh "ls -la"
	// 				sh "scripts/build.sh"
    //                 }
    //         }
    //     }
    // }
    post {
        always {
            echo 'cleaning up our workspace'
            deleteDir()
        }
    }

}
