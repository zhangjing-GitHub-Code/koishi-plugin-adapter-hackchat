//import {} from 'hackchat-engine';
//import { Client } from 'hackchat-engine';
import { Context,Adapter,Bot, Session,Quester }from 'koishi';
import {HackchatBot, recvData} from './bot';
//import { Client as hcClient } from 'hackchat-engine';
import { Events } from './hcconstants';
import {} from './index';
/*class Internal{
  public hcl;
}*/
export class HackchatAdapter<C extends Context> extends Adapter.WsClient<C, HackchatBot<C>> {
  async prepare(){
    console.log('Pre of HAD');
      //console.log("The bot is:",this.bot);
    this.bot.internal.ws=this.bot.http.ws('wss://hack.chat/chat-ws');
    //this.bot.internal.ws.addEventListener('message',this.wsHandler);
    return this.bot.internal.ws;
  }
  static cthis;
  accept() {
    HackchatAdapter.cthis=this;
    console.log("Accp");
      //console.log("The bot is:",this.bot);
    this.socket.addEventListener('message',this.wsHandler);
    this.bot.internal.joinChan(this.bot.selfId,this.bot.password,'jing_zhangtest');
  }
  async wsHandler(evdat){
    let ct=HackchatAdapter.cthis;
    let data=(JSON.parse(evdat.data) as recvData);
    console.log(data);
    if(data.cmd=='onlineSet'){
      console.log("CONNECTED!");
      //console.log("The this is:",ct.bots);
      data.users.forEach((v)=>{
        if(v.isme){
          ct.bot.userId=v.userid.toString();
          console.log("Got Uid",v.userid);
        }
      });
      ct.bot.online();
    }else if(data.cmd==Events.NEW_MESSAGE){
      if(data.userid.toString()==ct.bot.userId){
        ct.bot.internal.hooks.forEach((v,k,m)=>{
          if(k==data.text){
            ct.bot.internal.hooks.delete(k);
            v(data.time);
          }
        });
      }
      //createSession();
    }
  }
}