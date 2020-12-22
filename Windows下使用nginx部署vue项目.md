# Windows下使用Nginx部署Vue项目

-----

### 1. 下载nginx

有Linux和windows两种版本，下载名字里面有windows的

[nginx: download](http://nginx.org/en/download.html)

### 2. 解压缩

下载完成后解压缩到文件夹中，不能有中文路径，**不要直接运行exe**

![](https://tcs.teambition.net/storage/31201f34b3bc2e30f6466e9ebff6288c1200?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwNzc2MjIzOCwiaWF0IjoxNjA3MTU3NDM4LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjAxZjM0YjNiYzJlMzBmNjQ2NmU5ZWJmZjYyODhjMTIwMCJ9.CnmKy2ssagARethJ-yfi8wBuG1MNLbHqUlOKdDoPKPA&download=image.png "")

### 3. 启动Nginx

打开命令行窗口，进入nginx程序根目录，使用`start nginx`启动nginx程序，启动后会看到一个不知道什么东西一闪而过，这是正常的，不是报错。启动完后使用`tasklist /fi "imagename eq nginx.exe"` 命令查看程序是否正常启动，如果没有下图所示的两个进程，则说明启动失败，可以在nginx程序根目录下的logs文件夹中查找原因。

![](https://tcs.teambition.net/storage/3120083a6dba40877d1289ad455e28a9927e?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwNzc2MjIzOCwiaWF0IjoxNjA3MTU3NDM4LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjAwODNhNmRiYTQwODc3ZDEyODlhZDQ1NWUyOGE5OTI3ZSJ9.u9WkHby2mKDE1CcA9nRzULPVcZmbHaV4jx106G5E2aE&download=image.png "")

### 4. 打包vue项目

vue项目根目录下运行 `npm run build` 命令打包项目，会在根目录下生成一个dist文件，把这个文件复制到你想复制的地方，建议不要有中文路径，毕竟报错莫名其妙的。

### 5. 配置Nginx

打开根目录下conf/nginx.conf，修改server节点。

监听端口 listen:：默认80，如果被占用可以自行设置

server_name：可以指定本机IP，提供给别人访问

修改完成后使用命令 `nginx -s reload` 重新加载配置文件

![](https://tcs.teambition.net/storage/31200cdea71590937df0ffe97e233d03ddeb?Signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBcHBJRCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9hcHBJZCI6IjU5Mzc3MGZmODM5NjMyMDAyZTAzNThmMSIsIl9vcmdhbml6YXRpb25JZCI6IiIsImV4cCI6MTYwNzc2MjIzOCwiaWF0IjoxNjA3MTU3NDM4LCJyZXNvdXJjZSI6Ii9zdG9yYWdlLzMxMjAwY2RlYTcxNTkwOTM3ZGYwZmZlOTdlMjMzZDAzZGRlYiJ9.-11vB3RSfkKBlGhJYrnGKsuWHYAaoos8hSw6R0NNOp8&download=image.png "")

### 6. 访问网站

根据配置文件上的配置访问对应的ip和端口

根据上图，访问的地址为`http://localhost:80`

### 7. 停止Nginx

使用命令 `nginx -s stop `或 `nginx -s quit` 关闭进程
