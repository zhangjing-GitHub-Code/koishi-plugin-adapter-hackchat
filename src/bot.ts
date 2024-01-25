import {Context,Session,Fragment,Schema,Bot,Quester}from 'koishi';
//import { Config } from '.';
import { HackchatAdapter } from './adapter';
import { OPCodes } from './hcconstants';
import { SendOptions } from '@satorijs/protocol';
export interface recvData{
  channel: string,
  cmd: string,
  level: number,
  nick: string,
  text:string,
  time:number,
  trip: string,
  uType: string,
  userid: number,
  users?: userData[];
}
export interface userData extends recvData{
  color: false
  hash: string,
  isBot: boolean,
  isme: boolean,
  level: number,
  uType: string,
}
export const aSleep = (ms)=> {
  return new Promise(resolve=>setTimeout(resolve, ms))
}
class hcInternal{
  ws;
  hooks=new Map<string,CallableFunction>();
  constructor(){
    ;
  }
  wsendJSON(data){
    if(!this.ws)return;
    this.ws.send(JSON.stringify(data));
  }
  joinChan(username='KoishiHC',password='',chan){
    try {
      console.log("Attm to join ",chan," as ",username,"#",password);
      if (!username|| typeof username!== 'string') {
        return false;
        //throw new Error(Errors.INVALID_NAME);
      }

      if (!chan || typeof chan !== 'string') {
        return false;
        //throw new Error(Errors.INVALID_CHANNEL);
      }

      // @todo: this will be changed with the multichannel patch
      //this.chan = chan;

      this.wsendJSON({
        cmd: OPCodes.JOIN,
        nick: username+"#"+password,
        //pass: password,
        channel: chan,
      });
    } catch (e) {
      console.error(" Join fail with ",e);
      return false;
    }
  }
  sayMsg(chan,text:string){
    if(!this.ws)return;
    this.ws.send({
      cmd: OPCodes.CHAT,
      chan,
      text
    });
  }
  async hookId(cont:string,cb:Function){
    this.hooks[cont]=cb;
    while(cont in this.hooks.keys){
      await aSleep(50);
    }
  }
}

export class HackchatBot<C extends Context> extends Bot<C> {
  internal:hcInternal;
  http: Quester;
  password: string;
  constructor(ctx:C,config:HackchatBot.Config){
    super(ctx,config,'hackchat');
    console.log("CON of HBOT");
    this.http = ctx.http.extend({
      ...config,
      headers: {
        'User-Agent': `Koishi (https://koishi.chat/v4.15.5)`
      },
    })
    this.selfId=config.selfId?config.selfId:'KoishiHB'; // TODO: Schema // config.selfid;
    this.password=config.password?config.password:'';
    this.platform='hackchat';
    this.internal=new hcInternal();
    ctx.plugin(HackchatAdapter,this);
    //this.sendMessage('jing_zhangtest','BOT?');
  }
  async sendMessage(channelId: string, content: Fragment, guildId?: string, options?: SendOptions): Promise<string[]> {
    this.internal.sayMsg(channelId,content.toString());
    let ti:number;
    await this.internal.hookId(content.toString(),async (data)=>{ti=data.time});
    return [ti.toString()];
  }
}

export namespace HackchatBot{
  export interface Config {
  	selfId:string,
  	password: string
  }
  
  export const Config: Schema<Config> = Schema.object({
  	selfId: Schema.string().required().description("bot 用户名"),
  	password: Schema.string().description("bot 密码(用于区分唯一性)"),
    endpoint: Schema.string().default('wss://hack.chat/chat-ws').description("自定义服务器，不懂请不要动"),
  });
}
//export default HackchatBot;