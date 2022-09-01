Q2TG-small
----

一个非常短小的Q2TG核心。  
只支持qq -> tg图片、文字、戳一戳的单向转发。tg端的文字回复会被发送到qq。

适宜用途：挂在自己的台式机上。

## 极简启动

```
node app.js
```

## 极简配置

settings.yml
```yml
TG_token: 1123124234:XXXXXXXXXXYYYYYYYYSSSSSSSSZZZZZZZZZ
# tg bot token

QQ_account: 1145141919
# bot qq号

uin: your_bot_name_Bot
# tg的bot名

password: qqpassword
# qq密码
QRCode: true

# 密码登录还是扫码登陆

bot_owner: Lhc_fl
# 拥有者的tgid

proxy: "http://127.0.0.1:10809"
# 用于TG，代理服务器地址
```

rules.json
```json
{
    "QQ": {
        "qq群号": "tg对应的chat.id"
    },
    "user": {
        "qq号": "对应的tg用户名",
        "qq号2": "tg用户名2"
    }
}
```




## TG端命令：

/boton：接受qq端转发
/botoff：关闭转发

注意，下载后建立rules.json和settings.json。格式见对应的example.json
