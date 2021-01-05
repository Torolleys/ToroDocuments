
# 消息

-----

### 提醒类型
1. 静默：右上角信息图标处提示数量
2. 通知：右下角弹出框，不会自动关闭，需要点击表示消息已读并做相应的处理，有<button><font color=black><b>关闭</b></font></button>按钮，点击后关闭弹出框
3. 独占：模态窗口，该窗口未被关闭时，不允许执行该窗体以外的操作

### 普通消息
1. 消息列表中点击后即为已读，移入已处理

### 危急值消息
1. 右下角有<button><font color=black><b>接收</b></font></button>和<button><font color=black><b>处理</b></font></button>两个按钮
2. 某一个医生点击<button><font color=black><b>接收</b></font></button>后其他接收到该消息医生不可点击<button><font color=black><b>接收</b></font></button>和<button><font color=black><b>处理</b></font></button>，按钮设置enable设为false。状态变更为已读并且移入已处理
3. 点击处理后需要打开系统内的某一功能

### 医嘱变动表信息监控
1. 当halo对`YZ_BIANDONGXX`进行操作时，查询出其中`ZHUANGTAI`字段为 <b>0</b> (未接收)的数据总量，在特定医生护士客户端的右下角弹出小窗口进行提醒。
2. 当医生或者护士点击小窗口后，`ZHUANGTAI`设置为 <b>1</b> (已接收),并打开系统内的某一功能
3. 当上一条消息未被及时处理，再次发送一条新的消息时，需要加上上一条消息中需要处理的数据。
4. 消息窗口不会自动关闭，但是可以点击<button><font color=black><b>关闭</b></font></button>按钮关闭弹窗，关闭后一段时间若是没有对相关的数据进行操作，需要进行再次提醒
5. `SELECE * FROM YZ_BIANDONGXX WHERE ZHUANGTAI = 0`

### 自定义SQL进行数据库监控
1. 需要自定义执行频率，频率不可过高
2. 右下角弹窗提醒
