# 流水线+Dll登记操作文档

-----

### 1. 实现dll登记的目的

主要原因是代码实行分库管理后，各个业务系统与虚拟子系统之间实现完全解耦，两者之间没人任何关联，所以在下载业务系统的同时也需要下载虚拟子系统，而对于非开发人员（测试/实施）来讲，并不清楚一个业务系统需要使用到哪些虚拟子系统。所以，这里引入dll登记的概念，登记一个业务系统需要使用哪些虚拟子系统，以便测试/实施人员可以拿到业务系统后便可直接运行，不需要考虑我需要从哪里拷贝哪些dll进入程序主目录。

可支持以下功能的实现：

1. 业务系统编译时拉取最新的虚拟子系统dll至程序集目录

1. 业务系统编译时支持推送公用dll至相关目录(跨系统挂菜单)

1. 编译后的代码包(或虚拟子系统dll)支持发布到多个文件夹下(支持同一dll多医院发布)

1. 支持拉取ftp上第三方dll文件夹(递归拉取)

### 2. 实现思路

虚拟子系统在流水线编译时不再进行压缩包操作，而是把该虚拟子系统的解决方案生成的项目dll根据`Jenkinsfile.json`中配置内容发布到指定的ftp路径`/Halo/${医院名称}/AssemblyServerDll/`或`/Halo/${医院名称}/AssemblyClientDll/` 。相关的业务系统客户端发布至`/Halo/${医院名称}/AssemblyClient/`，服务端发布至`/Halo/${医院名称}/AssemblyServer/`。更改以前的以分支名区分的方式，主要原因就是存在有的医院的部分或全部程序是不存在独立分支(独立基线)的，所以改成按医院名称发布独立的程序。ftp目录结构如下图所示：  

![](https://tcs.teambition.net/storage/3120ec555c2c7d11c6c8205304e26d467060?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwOTIxMTc1NCwiaWF0IjoxNjA4NjA2OTU0LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjBlYzU1NWMyYzdkMTFjNmM4MjA1MzA0ZTI2ZDQ2NzA2MCJ9.9bNoQdGK6GU1NoOSOIJyMiT6H82VvE6yxU3RoLym3xQ&download=image.png "")

### 3. Jenkinsfile.json配置

首先看一下配置结构：

![](https://tcs.teambition.net/storage/31200e96e2cc561257f253e4172069d37076?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwOTIxMTc1NCwiaWF0IjoxNjA4NjA2OTU0LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjAwZTk2ZTJjYzU2MTI1N2YyNTNlNDE3MjA2OWQzNzA3NiJ9.uYTANjQhUVnIsl0gtmNTHyEE1l1WoPAqIudjiG1vEnI&download=image.png "")

节点解释：

- sln_name：解决方案名称，与项目中解决方案的名称保持一致，如果不同会造成找不到sln文件导致编译失败。

- server_package_name：服务包名称，业务系统格式为`AssemblyServer_{系统名称拼音首字母大写}`例如：AssemblyServer_MZZJ，虚拟子系统格式为`AssemblyServer_{子系统名称拼音首字母大写}_{供应商名称拼音首字母大写}`例如：AssemblyServer_ZNTX_WDXX(万达信息的智能提醒)。后面会根据是feature/dev/master等不同的流水线加上不同的后缀，用以区分不同的子业务系统。

- client_package_name：客户端包名称，业务系统格式为`AssemblyClient_{系统名称拼音首字母大写}`例如：AssemblyClient_MZZJ，虚拟子系统格式为`AssemblyServer_{子系统名称拼音首字母大写}_{供应商名称拼音首字母大写}`例如：AssemblyClient_ZNTX_WDXX(万达信息的智能提醒)。后面会根据是feature/dev/master等不同的流水线加上不同的后缀，用以区分不同的子业务系统。

- package_path：服务包和客户端包发布的路径。一般来说，医院基线只需要发布到该医院对应的目录下，例如：`dev_杭州市二`分支只需要发布到`/Halo/杭州市二`文件夹。dev基线可发布到多个路径，每个路径用英文逗号(,)分隔。应为`/Halo/${医院名称}`

- ftp_server：是否发布服务包至ftp

- ftp_client：是否发布客户端包至ftp

- isMainProgram：是否是主程序，例如门诊医生站，病区医生站，病区护士站等，主要是用来区分是否需要发布主程序包(zip)，如果设置为`false`，那就不需要发布主程序包(zip)，只需要发布`publishDllToClient`和`publishDllToServer`定义的相关dll至`AssemblyServerDll`和`AssemblyServerDll`目录即可。如果设置为`true`，并且`publishDllToClient`和`publishDllToServer`中定义了dll名称，则既会发布主程序包(zip),也会发布dll至相关目录

- pullServerDllPath：业务系统发布时用来寻找虚拟子系统服务端dll文件夹的路径

- pullClientDllPath：业务系统发布时用来寻找虚拟子系统客户端dll文件夹的路径

- pullAnyClient：表明当前业务系统需要拉取哪些dll进入`AssemblyClient`文件夹，以英文逗号(,)分隔。例如，dev从`"/Halo/dev/AssemblyServerDll"`中所需的dll，杭州市二从`"/Halo/杭州市二/AssemblyServerDll"`拉取所需的dll。某些医院(例如宁波市一)允许从`"/Halo/dev/AssemblyServerDll"`拉取dll,但不允许设置多个路径。可为空，即不拉取。

- pullAnyServer：表明当前业务系统需要拉取哪些dll进入`AssemblyServer`文件夹，以英文逗号(,)分隔。规则和上一条类似。可为空，即不拉取

- publishDllToServer：表明当前业务系统需要发布哪些dll进入`AssemblyServerDll`文件夹，以英文逗号(,)分隔。可为空，即不发布

- publishDllToClient：表明当前业务系统需要发布哪些dll进入`AssemblyClientDll`文件夹，以英文逗号(,)分隔。可为空，即不发布

配置后的语句需要进行校验，可以在[`https://www.sojson.com/`](https://www.sojson.com/)进行校验，点击<kbd>校验/格式化</kbd>后提示以下语句，则验证通过，配置文件可用。

![](https://tcs.teambition.net/storage/312039bc04c32b3af1c7bd7e67f502a1171f?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwOTIxMTc1NCwiaWF0IjoxNjA4NjA2OTU0LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjAzOWJjMDRjMzJiM2FmMWM3YmQ3ZTY3ZjUwMmExMTcxZiJ9.545F6I7167NbUVHpVFMYNOvqX_WdqaV_PidQC2UR9HM&download=image.png "")

### 4. 项目创建流水线(jenkins Pipeline)

> feature进行了简化，减掉了发布的过程，只留下读取配置文件的项目名称并进行编译。

GitLab webhook URL为： `http://jenkins.mediinfo.cn:10081/project/halo-common-feature`

Token为： `87c4abef8301b77d92fe2732d4a8313f`

**添加流水线步骤：**

GitLab仓库->设置->(Maintainer权限)集成->填写上面的Hook和Token->勾选Comments和Merge request events->点击<kbd>Add WebHooks</kbd>

> dev是改动后的，实现dll登记的流水线。

GitLab webhook URL为：`http://jenkins.mediinfo.cn:10081/project/halo-common-dev`

Token为： `2698289c451c27cf54eedb67f5553651`

**添加流水线步骤：**

GitLab仓库->设置->(Maintainer权限)集成->填写上面的Hook和Token->勾选Comments和Merge request events->点击<kbd>Add WebHooks</kbd>

> master 用途不明。暂时没有用到这条流水线，可以先不加

GitLab webhook URL为：`http://jenkins.mediinfo.cn:10081/project/halo-common-master`

Token为：`594375ce5607a76c371314d416b2c034`

> release为推送即进行编译发布，不再需要通过合并请求触发(可实现切换基线后即进行编译发布)

GitLab webhook URL为：`http://jenkins.mediinfo.cn:10081/project/halo-common-release`

Token为：`2698289c451c27cf54eedb67f5553651`

**添加流水线步骤：**

GitLab仓库->设置->(Maintainer权限)集成->填写上面的Hook和Token->勾选Push events,文本框内填写`release*`->点击<kbd>Add WebHooks</kbd>

### 5. 各子系统的改动

1. 收集每个主应用程序所需的dll目录，最好列个清单，方便后续查询

1. 各个程序仓库下增加Jenkinsconfig，内容按第三条Jenkinsconfig配置。

1. 各个程序仓库集成中修改集成选项中的WebHooks,内容按照第四条jenkins Pipeline配置

### 6. 创建基线

**创建dev基线**

1. 从dev分支创建新的dev_{医院名称}分支，选择halo6后，选择你要创建基线的业务系统(此处非常不建议全选)，点击<kbd>创建</kbd>

![](https://tcs.teambition.net/storage/312047c85eafe60309eb980a3a27bd7e70a5?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwOTIxMTc1NCwiaWF0IjoxNjA4NjA2OTU0LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjA0N2M4NWVhZmU2MDMwOWViOTgwYTNhMjdiZDdlNzBhNSJ9.tx4t3fFG8gRpOhTYfWrDvk2ykeiatC5shGaLCcuqY3Y&download=image.png "")

1. 输入源分支，新分支名称和发布路径，发布路径必填，一般情况下发布路径为医院名称，推送级别选择No One,合并级别选择Maintainer

![](https://tcs.teambition.net/storage/3120768a8332d15162adec223c85ec35a701?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwOTIxMTc1NCwiaWF0IjoxNjA4NjA2OTU0LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjA3NjhhODMzMmQxNTE2MmFkZWMyMjNjODVlYzM1YTcwMSJ9.XMPalbuEb5gcr2I47mhOJtTFNEpd3wD1LbS2uJh8shs&download=image.png "")

1. 点击确定后等待一会即可。

1. 创建完成后需要打开dev分支的jenkinsconfig.json文件，删除其中package_path节点的本医院名称的发布路径。因为一般情况下，刚开始都是通过dev分支开发的，等到临上线前才切换到dev_{医院名称}分支，所以创建基线之前需要将dev分支编译生成的包发送到医院目录下，创建基线后由dev_{医院名称}分支发布编译包至医院目录，所以要删除dev中的发布路径

**创建release基线**

1. 第一步同上

1. 输入源分支，新分支名称和发布路径，发布路径必填，一般情况下发布路径为`{医院名称}/release/{日期}`，推送级别选择No One,合并级别选择Maintainer

![](https://tcs.teambition.net/storage/31205bf2b36b08dfc20e058e4b9263ea3bdd?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwOTIxMTc1NCwiaWF0IjoxNjA4NjA2OTU0LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjA1YmYyYjM2YjA4ZGZjMjBlMDU4ZTRiOTI2M2VhM2JkZCJ9.Zlo2_71Ad69yittArkqH802aMVDWJvt82IkkKaV9AIA&download=image.png "")

1. 同上

1. 没啥可以做的了，等编译吧
