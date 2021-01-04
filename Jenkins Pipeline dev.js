pipeline {
    agent {
        label 'windows'
    }

    options {
        gitLabConnection('gitlab')
        gitlabBuilds(builds: ['Dev Prepare', 'Dev Build', 'Dev Test' ,'Dev Deploy'])
    }

    environment {
        dingTalkToken = 'c35bf28c850990efb3bb11e041980f56639f2f01e057cf0e8170e92ab4d30c2a'
    }

    stages {
        stage('Prepare'){
            steps{
                script{
                    updateGitlabCommitStatus name: 'Dev Prepare', state: 'running'
                    try {
                        // 进入前先删除内部的所有文件，防止出现拉取异常
						            powershell(returnStdout: true, script: 'Remove-Item * -recurse -force')
                        // change it to be your credentialsId and url
                        git branch: '${gitlabTargetBranch}', changelog: false, credentialsId: 'gitlab', poll: false, url: "${gitlabSourceRepoHttpUrl}"
                        script {
                            // 解决方案名称
                            sln_name = ""
                            // 服务包名称
                            server_package_name = ""
                            // 客户端包名称
                            client_package_name = ""
                            // 包路径
                            package_path = ""
                            // 是否往FTP上发送服务端包
                            ftp_server = ""
                            // 是否往服务器上发送客户端包
                            ftp_client = ""
							              // 是否业务主程序
							              isMainProgram = ""
					              		// 单独发布dll的路径
					              		pullServerDllPath = ""
					              		pullClientDllPath = ""
					              		// 是否需要拉取单独dll
					              		pullAnyServer = ""
					              		pullAnyClient = ""
			              				// 是否需要单独发布dll
					              		publishDllToServer = ""
					              		publishDllToClient = ""

				              			// 读取本地配置文件中配置信息
				              			json_file = "${env.WORKSPACE}/Jenkinsconfig.json"
					              		file_contents = readFile json_file
					              		println file_contents
                            if(file_contents){
				              				echo "配置文件读取成功,开始解析json"
                                // 读取JSON
                            	JenkinsconfigJson = readJSON text : "${file_contents}"
					              			echo "${JenkinsconfigJson}"
                            	// 将读取到的解决方案名称赋值给变量
                            	sln_name = JenkinsconfigJson.sln_name
                            	// 将读取到的服务包名称赋值给变量
                            	server_package_name = JenkinsconfigJson.server_package_name
                            	// 将读取到的客户端包名称赋值给变量
                            	client_package_name = JenkinsconfigJson.client_package_name
                            	// 将读取到的包路径赋值给变量
                            	package_path = JenkinsconfigJson.package_path
                            	// 将读取到的是否往FTP上发送服务端包赋值给变量
                            	ftp_server = JenkinsconfigJson.ftp_server
                            	// 将读取到的是否往服务器上发送客户端包赋值给变量
                            	ftp_client = JenkinsconfigJson.ftp_client
				              				isMainProgram = JenkinsconfigJson.isMainProgram
					              			pullServerDllPath = JenkinsconfigJson.pullServerDllPath
					              			pullClientDllPath = JenkinsconfigJson.pullClientDllPath
					              			pullAnyServer = JenkinsconfigJson.pullAnyServer
					              			pullAnyClient = JenkinsconfigJson.pullAnyClient
					              			publishDllToServer = JenkinsconfigJson.publishDllToServer
					              			publishDllToClient = JenkinsconfigJson.publishDllToClient
                              }

					                	echo "开始打印读取配置文件获取的变量"
				                	  // 打印得到的变量
                            echo "sln_name：${sln_name}"
                            echo "server_package_name：${server_package_name}"
                            echo "client_package_name：${client_package_name}"
                            echo "package_path：${package_path}"
                            echo "ftp_server：${ftp_server}"
                            echo "ftp_client：${ftp_client}"
					              		echo "isMainProgram：${isMainProgram}"
					              		echo "pullServerDllPath：${pullServerDllPath}"
					              		echo "pullClientDllPath：${pullClientDllPath}"
                            echo "pullAnyClient：${pullAnyClient}"
				              			echo "pullAnyServer：${pullAnyServer}"
					              		echo "publishDllToServer：${publishDllToServer}"
						              	echo "publishDllToClient：${publishDllToClient}"
					              		echo "开始打印gitlab变量"
                            GIT_COMMIT_ID = powershell(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                            echo "GIT_COMMIT_ID：${GIT_COMMIT_ID}"
				              			IMAGE_TAG = "${GIT_COMMIT_ID}-snapshot"
				              			echo "IMAGE_TAG：${IMAGE_TAG}"
                            INGRESS_HOST = "dev-${gitlabSourceRepoName}-${gitlabMergeRequestIid}"
				              			echo "INGRESS_HOST：${INGRESS_HOST}"
                            MR_URL = "${gitlabSourceRepoHomepage}/merge_requests/${gitlabMergeRequestIid}"
					              		echo "MR_URL：${MR_URL}"

                            build_tag = "dev-${gitlabSourceRepoName}-${gitlabTargetBranch}-${GIT_COMMIT_ID}"
                            currentBuild.displayName = "#" + BUILD_NUMBER + "_" + gitlabMergeRequestIid + "_" + build_tag
                        }
                    } catch(Exception ex){
			              			echo "捕获到异常：" + ex.message;
                          updateGitlabCommitStatus name: 'Dev Prepare', state: 'failed'
                          throw ex;
                    } finally {

                    }
                    updateGitlabCommitStatus name: 'Dev Prepare', state: 'success'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    updateGitlabCommitStatus name: 'Dev Build', state: 'running'
                    try {
                        echo "开始编译..."
                        powershell(returnStdout: true, script: 'Remove-Item AssemblyClient/* -recurse')
                        powershell(returnStdout: true, script: 'Remove-Item AssemblyServer/* -recurse')
                        powershell(returnStdout: true, script: "Remove-Item ${server_package_name}_Dev.zip -recurse")
                        powershell(returnStdout: true, script: "Remove-Item ${client_package_name}_Dev.zip -recurse")
				             		git branch: '${gitlabTargetBranch}', changelog: false, credentialsId: 'gitlab', poll: false, url: "${gitlabSourceRepoHttpUrl}"
				         				powershell(returnStdout: true, script: "msbuild ${sln_name}.sln")
				         				git branch: 'master', changelog: false, credentialsId: 'gitlab', poll: false, url: "https://git.mediinfo.cn:10080/zbb/configs/halo6.git"
                    } catch(Exception ex){
				         				echo "捕获到异常：" + ex.message;
                        updateGitlabCommitStatus name: 'Dev Build', state: 'failed'
                        throw ex;
                    } finally {

                    }
                    updateGitlabCommitStatus name: 'Dev Build', state: 'success'
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    updateGitlabCommitStatus name: 'Dev Test', state: 'running'
                    try {
                        echo "开始进行单元测试..."
                    } catch(Exception ex){
                        updateGitlabCommitStatus name: 'Dev Test', state: 'failed'
                        throw ex;
                    } finally {

                    }
                    updateGitlabCommitStatus name: 'Dev Test', state: 'success'
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    updateGitlabCommitStatus name: 'Dev Deploy', state: 'running'

			         			// 拉取需要的服务端dll
			     					if(pullAnyServer){
				     				    echo "ps将执行命令：C:/GnuWin32/bin/wget.exe -r -c -nH -np ftp://pubhis6:pubhis6@122.224.75.130${pullServerDllPath}/*"
			     						powershell(returnStdout: true, script: "C:/GnuWin32/bin/wget.exe -r -c -nH -np ftp://pubhis6:pubhis6@122.224.75.130${pullServerDllPath}/*")
			     						// 循环,将需要的dll放入Assembly中
				     					for(item in pullAnyServer.tokenize(',')){
				     						echo "ps将执行命令：cp -r -Force .${pullServerDllPath}/${item} ./AssemblyServer/"
					     					powershell(returnStdout: true, script: "cp -r -Force .${pullServerDllPath}/${item} ./AssemblyServer/")
			     						}
			     					}

			     					// 拉取需要的客户端dll
			     					if(pullAnyClient){
			     					    echo "ps将执行命令：C:/GnuWin32/bin/wget.exe -r -c -nH -np ftp://pubhis6:pubhis6@122.224.75.130${pullClientDllPath}/*"
		     			  				powershell(returnStdout: true, script: "C:/GnuWin32/bin/wget.exe -r -c -nH -np ftp://pubhis6:pubhis6@122.224.75.130${pullClientDllPath}/*")
		     					  		// 循环,将需要的dll放入Assembly中
							  				for(item in pullAnyClient.tokenize(',')){
								  				echo "ps将执行命令：cp -r -Force .${pullClientDllPath}/${item} ./AssemblyClient/"
									  			powershell(returnStdout: true, script: "cp -r -Force .${pullClientDllPath}/${item} ./AssemblyClient/")
								  			}
						  				}
                    try {
                        echo "开始进行发布..."
				            		// 需要发布到多个文件夹下的情况
				            		for(pub in package_path.tokenize(',')){
				            			if ("${ftp_server}" == "true")
					            		{
						            		// 如果是虚拟子系统需要单独发布dll至指定目录
						            		if("${isMainProgram}" == "false"){
						            			echo "发布虚拟子系统服务端..."
						            			for(item in publishDllToServer.tokenize(',')){
						            				echo "发布指定的dll ${item} 至目录${pub}/AssemblyServerDll"
						            				// 先把需要发布的dll复制到外面来，ftp publisher找不到文件夹里面的资源
						            				echo "ps将执行命令：cp -r -Force ./AssemblyServer/${item} ./"
							            			powershell(returnStdout: true, script: "cp -r -Force ./AssemblyServer/${item} ./")
							            			ftpPublisher alwaysPublishFromMaster: false, continueOnError: true, failOnError: true, publishers: [
							            				[configName: 'his6', transfers: [
							            				[asciiMode: false, cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false,
							            				noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: "${pub}/AssemblyServerDll", remoteDirectorySDF: false,
							            				removePrefix: '', sourceFiles: "${item}"]
							            				], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]
						            				]
						            			}
				            				}
				            				else{
					            				// 不然就将压缩包发布到业务系统目录
					            				// 压缩服务端程序集
					            				echo "发布业务系统服务端..."
						            			echo "准备发布zip包至目录${pub}/AssemblyServer"
						            			// 先删除掉上一次留下的zip包
							            		powershell(returnStdout: true, script: "Remove-Item ${server_package_name}_Dev.zip -recurse")
							            		zip zipFile: "${server_package_name}_Dev.zip", archive: false, dir: 'AssemblyServer'
							            		ftpPublisher alwaysPublishFromMaster: false, continueOnError: true, failOnError: true, publishers: [
								            		[configName: 'his6', transfers: [
							            				[asciiMode: false, cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false,
							            				noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: "${pub}/AssemblyServer", remoteDirectorySDF: false,
							            				removePrefix: '', sourceFiles: "${server_package_name}_Dev.zip"]
							            			], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]
						            			]
							            		// 还存在需要将特定dll发布的情况，如跨系统挂菜单
							            		if(publishDllToServer){
							            			echo "发布业务系统dll..."
								            		for(item in publishDllToServer.tokenize(',')){
								            			echo "发布指定的dll ${item} 至目录${pub}/AssemblyServerDll"
								            			// 先把需要发布的dll复制到外面来，ftp publisher找不到文件夹里面的资源
								            			echo "ps将执行命令：cp -r -Force ./AssemblyServer/${item} ./"
								            			powershell(returnStdout: true, script: "cp -r -Force ./AssemblyServer/${item} ./")
							            				ftpPublisher alwaysPublishFromMaster: false, continueOnError: true, failOnError: true, publishers: [
									            			[configName: 'his6', transfers: [
									            			[asciiMode: false, cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false,
									            			noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: "${pub}/AssemblyServerDll", remoteDirectorySDF: false,
									            			removePrefix: '', sourceFiles: "${item}"]
								            				], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]
							            				]
						            				}
					            				}
				            				}
			            				}

					            		if ("${ftp_client}" == "true")
					            		{
					            			// 如果是虚拟子系统需要单独发布dll至指定目录
					            			if("${isMainProgram}" == "false"){
				            					echo "发布虚拟子系统客户端..."
						            			for(item in publishDllToClient.tokenize(',')){
			            							echo "发布指定的dll ${item} 至目录${pub}/AssemblyClientDll"
		            								// 先把需要发布的dll复制到外面来，ftp publisher找不到文件夹里面的资源
			            							echo "ps将执行命令：cp -r -Force ./AssemblyClient/${item} ./"
		            								powershell(returnStdout: true, script: "cp -r -Force ./AssemblyClient/${item} ./")
				            						ftpPublisher alwaysPublishFromMaster: false, continueOnError: true, failOnError: true, publishers: [
		            									[configName: 'his6', transfers: [
			            								[asciiMode: false, cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false,
				            							noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: "${pub}/AssemblyClientDll", remoteDirectorySDF: false,
			            								removePrefix: '', sourceFiles: "${item}"]
		            									], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]
				            						]
			            						}
		            						}
	            							else{
					            				// 压缩客户端程序集
				            					echo "发布业务系统客户端..."
					            				echo "准备发布zip包至目录${pub}/AssemblyClient"
				            					// 先删除掉上一次留下的zip包
					            				powershell(returnStdout: true, script: "Remove-Item ${client_package_name}_Dev.zip -recurse")
				            					zip zipFile: "${client_package_name}_Dev.zip", archive: false, dir: 'AssemblyClient'
				            					ftpPublisher alwaysPublishFromMaster: false, continueOnError: true, failOnError: true, publishers: [
				            						[configName: 'his6', transfers: [
				            						[asciiMode: false, cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false,
				            						noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: "/${pub}/AssemblyClient", remoteDirectorySDF: false,
				            						removePrefix: '', sourceFiles: "${client_package_name}_Dev.zip"]
				            						], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]
				            					]
				            					// 还存在需要将特定dll发布的情况，如跨系统挂菜单
				            					if(publishDllToClient){
				            						echo "准备发布业务系统dll..."
				            						for(item in publishDllToClient.tokenize(',')){
				            							echo "发布指定的dll ${item} 至目录${pub}/AssemblyClientDll"
				            							// 先把需要发布的dll复制到外面来，ftp publisher找不到文件夹里面的资源
				            							echo "ps将执行命令：cp -r -Force ./AssemblyClient/${item} ./"
				            							powershell(returnStdout: true, script: "cp -r -Force ./AssemblyClient/${item} ./")
				            							ftpPublisher alwaysPublishFromMaster: false, continueOnError: true, failOnError: true, publishers: [
				            								[configName: 'his6', transfers: [
				            								[asciiMode: false, cleanRemote: false, excludes: '', flatten: false, makeEmptyDirs: false,
				            								noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: "${pub}/AssemblyClientDll", remoteDirectorySDF: false,
		            	            	    ], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]
		            									]
		            								}
					            				}
	            							}
	            						}
	            					}
                    } catch(Exception ex){
				            		echo "捕获到异常：" + ex.message;
                        updateGitlabCommitStatus name: 'Dev Deploy', state: 'failed'
                        throw ex;
                    } finally {

                    }
                    powershell(returnStdout: true, script: "Remove-Item ${server_package_name}_Dev.zip -recurse")
                    powershell(returnStdout: true, script: "Remove-Item ${client_package_name}_Dev.zip -recurse")
                    updateGitlabCommitStatus name: 'Dev Deploy', state: 'success'
                    addGitLabMRComment comment: "App ${gitlabSourceRepoName} preview link: <a href='http://localhost'>${gitlabSourceRepoName}</a>"
                }
            }
        }
    }

    post {
        success {
            powershell("Invoke-WebRequest -UseBasicParsing -Method POST -uri 'https://oapi.dingtalk.com/robot/send?access_token=${dingTalkToken}'  -Header @{\"content-type\"= \"application/json\"} -Body ([Text.Encoding]::GetEncoding(28591).GetString([Text.Encoding]::UTF8.GetBytes('{\"msgtype\":\"markdown\",\"markdown\":{\"title\":\"Dev Build Success\",\"text\":\"##Build Success!  \n #### Environment Type: Dev \n  #### Jenkins Build: [${BUILD_DISPLAY_NAME}](${BUILD_URL}) \n #### App Name: [${gitlabSourceRepoName}] \n #### Merge Request ID: [${gitlabMergeRequestIid}](${MR_URL}) \n #### Commit By: ${gitlabUserName}\"}}')))")
        }
        failure {
            powershell("Invoke-WebRequest -UseBasicParsing -Method POST -uri 'https://oapi.dingtalk.com/robot/send?access_token=${dingTalkToken}'  -Header @{\"content-type\"= \"application/json\"} -Body ([Text.Encoding]::GetEncoding(28591).GetString([Text.Encoding]::UTF8.GetBytes('{\"msgtype\":\"markdown\",\"markdown\":{\"title\":\"Dev Build Failed\",\"text\":\"##Build Failed!  \n #### Environment Type: Dev \n  #### Jenkins Build: [${BUILD_DISPLAY_NAME}](${BUILD_URL}) \n #### App Name: [${gitlabSourceRepoName}] \n #### Merge Request ID: [${gitlabMergeRequestIid}](${MR_URL}) \n #### Commit By: ${gitlabUserName}\"}}')))")
        }
    }
}
