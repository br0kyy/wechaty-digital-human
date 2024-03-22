import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { WechatyBuilder} from 'wechaty'
import { FileBox } from 'file-box'
import qrTerm from 'qrcode-terminal'
import axios from 'axios';
import { randomUUID } from 'crypto';
import FormData from 'form-data';
const { v4: uuidv4 } = require('uuid');

var fs = require('fs');
const path = require('path');

const welcome = `
=============== Powered by Wechaty ===============

Hello,

I'm a Wechaty Botie with the following super powers:

1. Accept Friend Request
2. Synthesize digital human

If you send "数字人生成" to me, you can generate your
own digital human following the steps. 
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me for more super powers!

Please wait... I'm trying to login in...

`

// 创建机器人
console.log(welcome)
const bot = WechatyBuilder.build({name: 'digital-human'});

const WECHATY_PUPPET_PADCHAT_TOKEN = 'puppet_padlocal_2bbf956781b1499989fea8b7ba5749fb';

const puppet = 'wechaty-puppet-padchat'; // 使用ipad 的方式接入。

const puppetOptions = {
  token: WECHATY_PUPPET_PADCHAT_TOKEN,
}

function onScan (qrcode, status) {
  qrTerm.generate(qrcode, { small: true });
}

  
// 功能实现
bot.on('scan', onScan);

bot.on('login', user => console.log(`User ${user} logined`));

var userText = null;
var fileBox = null;
var file_path = null;
var gender = 1;
var form = new FormData();
// 发送消息
bot.on('message', async message => {
    // var userText = null
    // 判断消息是否来自用户
    if(message.self()){
        return
    }
    // 判断消息内容是否为“数字人生成”
    if (message.text() === '数字人生成') {
        // 发送回复消息
        const example_face = FileBox.fromFile('example/example.jpg')
        await message.say('✅已开启数字人生成功能✅\n请输入:\n1.文案(上限10,000字)\n2.媒体文件\n3.数字人性别\n请在发送完之后输入“开始生成”\n例如⬇️')
        await message.say(example_face)
        // 初始化对话状态
    }else if(message.text() === '开始生成') {
      const fileData = fs.createReadStream(file_path);
      // 向用户发送进度消息
      await message.say('正在生成数字人，请稍后...');
      // 调用API
      const apiResponse = await callApi(userText, fileData);

      const name = uuidv4();  

      const videoFile = FileBox.fromBuffer(apiResponse, name + ".mp4");
      // 向用户发送视频文件
      await message.say(videoFile);
    }else if(message.text() === '男' || message.text() === '女'){
      if(message.text() === '男'){
        gender = 1;
      }else{
        gender = 2;
      }
    }else if(message.type() === bot.Message.Type.Text){
        // 其他情况直接返回
        // 等待用户回复
        // const reply = await message.room().wechaty.puppet.roomPayload(message.room().id)
        userText = await message.text();
        // console.log(userText)
        // console.log(message.type())
        // 获取用户回复的文案
        // const userText = reply.text()
    } else if(message.type() === bot.Message.Type.Image || message.type() === bot.Message.Type.Video){
        // 等待用户发送文件
        // 获取用户发送的文件
        fileBox = await message.toFileBox();
        file_path ="temp/input/" + fileBox.name;
        fileBox.toFile(file_path);
    }   
})

// 自动添加好友
bot.on('friendship', async friendship => {
  let logMsg
  const fileHelper = bot.Contact.load('filehelper')
  const Friendship = bot.Friendship

  try {
    logMsg = 'received `friend` event from ' + friendship.contact().name()
    await fileHelper.say(logMsg)
    console.log(logMsg)

    switch (friendship.type()) {
      /**
       *
       * 1. New Friend Request
       *
       * when request is set, we can get verify message from `request.hello`,
       * and accept this request by `request.accept()`
       */
      case Friendship.Type.Receive:
        if (friendship.hello() === 'ding') {
          logMsg = 'accepted automatically because verify messsage is "ding"'
          console.log('before accept')
          await friendship.accept()

          // if want to send msg , you need to delay sometimes
          const welcome_msg = "早上中午晚上好！\n我是你的数字人生成小助手！\n向我发送“数字人生成”开始使用吧！"
          await new Promise(r => setTimeout(r, 1000))
          await friendship.contact().say(welcome_msg)
          console.log('after accept')

        } else {
          logMsg = 'not auto accepted, because verify message is: ' + friendship.hello()
        }
        break

        /**
         *
         * 2. Friend Ship Confirmed
         *
         */
      case Friendship.Type.Confirm:
        logMsg = 'friend ship confirmed with ' + friendship.contact().name()
        break
    }
  } catch (e) {
    logMsg = e.message
  }

  console.log(logMsg)
  await fileHelper.say(logMsg)

})


async function callApi(text, file) {
  const form = new FormData();
  form.append('text', text);
  form.append('file', file); // Assuming 'file' is the path to the file
  form.append('gender', gender); 
  // console.log(form)
  try {
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://101.227.49.84:8000/api/videos/syth/',
      headers: { 
        ...form.getHeaders(),
      },
      data : form,
      responseType: 'arraybuffer' // 将响应数据以字节数组形式返回
    };

    const response = await axios.request(config);
    // const name = uuidv4();
    // const outputDirectory = 'temp/output'; // Directory to save the video
    // const filename = name + '.mp4'; // Name for the saved video file
    // const outputPath = path.join(outputDirectory, filename);
    // // 将十六进制数据转换成二进制数据
    // // 将二进制数据写入MP4文件
    // // fs.createWriteStream(apiResponse)

    // // 获取API返回的视频文件
    // fs.writeFileSync(outputPath, Buffer.from(response.data));
    // console.log('视频下载完成！');
    return response.data
  } catch (error) {
    console.error('下载视频时出错:', error);
    throw error;
  }
};



bot.start().then(() => console.log('Bot started.'));
