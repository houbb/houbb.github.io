/*
  事件集合
*/
Flag.Event = []; //事件集合
/*
 列表
 0 
*/
var CallOK = true;
var Message;
Flag.Event = function(ID,Map,Event,HeroLocation,Floor,callback){
  if(typeof(ID[0]) == "string" && typeof(ID[1]) != "undefined" && typeof(ID[1]) != "null"){
    switch(ID[0]){
      case "Door":
        alert("Door");
      break;
    }
    return;
  }
  switch(ID){
    case 0:
      if(Flag.Switch[0]){
        Message = ["[Npc=3,仙子]我的能力被魔王所封印。。。无法帮你更多了。。祝你好运"];
        Event.ShowMessageList(Message,function(){
          Flag.Move = false;
          Event.UnlockMove();
          Event.Enable("Controller");
        });
        return;
      }
      Event.Disable("Controller");
      Message = ["[Npc=3,仙子]哟，稀客啊，你怎么会到这里来？","[Hero]这里是哪里？我在这附近砍柴突然被一只很大的蝙蝠抓到这里来了！。","[Npc=3,仙子]这里就是外界传说中的魔塔，这一层之上的楼层都被魔物所占据","[Npc=3,仙子]几乎所有来到这里的人，除了打败在8层的魔物首领外不可能逃出这里……","[Npc=3,仙子]对了，还有魔王抓走了你们国的公主，如果救出了她你下半辈子都不用愁了","[Hero]让我过去吧！我会救出公主逃出去的！","[Npc=3,仙子]我看你有些战斗能力，这把红钥匙就给你了。祝你能打败魔王，逃出这里"];
      Event.ShowMessageList(Message,function(){
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        Flag.Switch[0] = true;
        Map.DoorOpen(5,2);
        Map.DrawItem(3,2,6,3);
        //Event.RemoveEvent("Npc",0,5,4);
      });
    break;
    case 1:
      if(!Event.EnemyExist("Now",0) && !Event.EnemyExist("Now",1)){
        Map.DoorOpen(9,8);
      }
    break;
    case 2:
      Map.DoorClose(3,7,3,1);
    break;
    case 3:
      Event.Disable("Controller");
      Message = ["[Npc=0,老人]勇士，救出公主打败魔王的重任就在你身上了，我也给不了你太多的帮助","[Npc=0,老人]这本怪物图鉴是我年轻时所收集的怪物数据，就送给你吧"];
      Event.ShowMessageList(Message,function(){
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        Flag.Switch[0] = true;
        Event.RemoveEvent("Npc",0,0,4);
        Event.AddEnemyBook();
        Event.GetItem("A1");
      });
    break;
    case 4:
      Event.OpenStore("[Npc=6,贪婪之神,勇士，如你拥有<Gold>金币我将能为你提供一些能力]生命 +800&PayHP:800=G-20|攻击 +3&PayATK:3=G-20|防御 +3&PayDEF:3=G-20|离开商店&CloseStore");
    break;
    case 5:
      if(!Event.EnemyExist("Now",0) && !Event.EnemyExist("Now",1) && !Event.EnemyExist("Now",2)){
        Map.DoorOpen(1,7);
      }
    break;
    case 6:
      Event.OpenStore("[Npc=0,经验老人,勇士，如你拥有足够的经验，我将能为你提供一些能力]综合能力(100经验)&PayLv:1000#7#7=E-100|攻击 +5(30经验)&PayATK:5=E-30|防御 +5(30经验)&PayDEF:5=E-30|离开&CloseStore");
    break;
    case 7:
      Event.Disable("Controller");
      Flag.EventRuning = true;
      Message = ["[Enemy=14,骷髅队长]很好，你竟然有能力闯到这里，不过我又怎么会让你从我这通过呢？","[Hero]别废话！我要杀了你！"];
      Event.AddEnemy(0,14,5,5,-1,12);
      window.setTimeout(function(){
      Event.ShowMessageList(Message,function(){
        Map.DoorClose(3,5,9,1);
        Map.DoorClose(3,5,1,1);
        Map.DoorClose(3,5,6,1);
        Map.DoorClose(3,4,5,1);
        Map.DoorClose(3,5,4,1);
        Map.DoorClose(3,6,5,1);
        Message = ["[Enemy=14,骷髅队长]噢？要是我手下们不肯呢？哈哈哈哈","[Enemy=14,骷髅队长]让骷髅族来与你战斗简直是侮辱我们","[Enemy=14,骷髅队长]除非解决掉这些初级法师，你才有资格挑战！"];
        window.setTimeout(function(){
          Event.ShowMessageList(Message,function(){
            Map.DoorOpen(4,8);
            Event.UnlockMove();
            Flag.EventRuning = false;
            Event.Enable("Controller");
            Event.RemoveEvent("Event",0,5,7);
          });
        },500);
      });
      },500);
    break;
    case 8:
      var Exist = false;
      for(var i = 1;i < 10;i++){
        if(Event.EnemyExist("Now",i)){
          Exist = true;
          break;
        }
      }
      if(!Exist){
        Message = ["[Enemy=14,骷髅队长]看来有两下子，不过初级法师是无法跟骷髅族媲美的！","[Enemy=14,骷髅队长]如果你能解决掉这群大蝙蝠的话，你才能向我们挑战！"];
        Event.ShowMessageList(Message,function(){
          Map.DoorOpen(6,8);
        });
      }
    break;
    case 9:
      var Exist = false;
      for(var i = 10;i < 19;i++){
        if(Event.EnemyExist("Now",i)){
          Exist = true;
          break;
        }
      }
      if(!Exist){
        Message = ["[Enemy=14,骷髅队长]这怎么可能！你不可能永远都那么幸运！","[Hero]你真是愚蠢至极，投降吧！","[Enemy=14,骷髅队长]不！你将无法战胜骷髅人！"];
        Event.ShowMessageList(Message,function(){
          Map.DoorOpen(8,6);
          Map.DoorOpen(8,4);
        });
      }
    break;
    case 10:
      var Exist = false;
      for(var i = 19;i < 28;i++){
        if(Event.EnemyExist("Now",i)){
          Exist = true;
          break;
        }
      }
      if(!Exist){
        Message = ["[Enemy=14,骷髅队长]啊！不可能！！他们竟然也失败了！。这是你逼我的！","[Enemy=14,骷髅队长]碰上骷髅武士你必死无疑，来这的勇者无一不死于他们的剑下！"];
        Event.ShowMessageList(Message,function(){
          Map.DoorOpen(6,2);
          Map.DoorOpen(4,2);
        });
      }
    break;
    case 11:
      var Exist = false;
      for(var i = 28;i < 37;i++){
        if(Event.EnemyExist("Now",i)){
          Exist = true;
          break;
        }
      }
      if(!Exist){
        Message = ["[Enemy=14,骷髅队长]你！！啊啊啊啊啊啊(接近失去理智)","[Hero]你已经没机会了，你手上的棋子已空，打开门让我上去！饶你不死！","[Enemy=14,骷髅队长]哼！除非我死了！来吧！我会将你碎尸万段！给我族人复仇！！！"];
        Event.ShowMessageList(Message,function(){
          Map.DoorOpen(2,4);
          Map.DoorOpen(2,6);
          Map.DoorOpen(5,6);
          Map.DoorOpen(4,5);
          Map.DoorOpen(5,4);
          Map.DoorOpen(6,5);
        });
      }
    break;
    case 12:
      Map.DoorOpen(5,1);
      Map.DoorOpen(5,9);
      Message = ["[Enemy=14,骷髅队长]不！！魔王大人会为我报仇的！勇士！你等着！！"];
      Event.ShowMessageList(Message,function(){
        Map.DrawItem(0,0,1,1);
        Map.DrawItem(1,0,3,1);
        Map.DrawItem(2,1,2,2);
        Map.DrawItem(3,0,1,3);
        Map.DrawItem(4,0,3,3);
        Map.DrawItem(5,7,7,1);
        Map.DrawItem(6,7,9,1);
        Map.DrawItem(7,7,8,2);
        Map.DrawItem(8,7,7,3);
        Map.DrawItem(9,7,9,3);
        Map.DrawItem(10,8,1,7);
        Map.DrawItem(11,8,3,7);
        Map.DrawItem(12,8,2,8);
        Map.DrawItem(13,8,1,9);
        Map.DrawItem(14,8,3,9);
        Map.DrawItem(15,11,7,7);
        Map.DrawItem(16,11,9,7);
        Map.DrawItem(17,12,8,8);
        Map.DrawItem(18,11,7,9);
        Map.DrawItem(19,11,9,9);
      });
    break;
    case 13:
      Event.Disable("Controller");
      if(!Flag.Switch[1]){
        Message = ["[Npc=1,奸商]呼！终于有人来了！不然我就被这墙压扁了！","[Npc=1,奸商]勇士，谢谢你！我这有一个地震卷轴你买不买，我便宜卖你，800金币吧","[Hero]你。。再说一遍。(勇士举起剑，脸上满满黑线)","[Npc=1,奸商]别别别，我刚只是跟你开玩笑呢，250，250吧","[Hero]那行。(死到临头都还想着钱，等等。你才是250！后悔救你！)","[Npc=1,奸商]嘿嘿嘿，凑够250就来吧！我在这等你！"];
        Event.ShowMessageList(Message,function(){
          Flag.Switch[1] =  true;
          Flag.Move = false;
          Event.UnlockMove();
          Event.Enable("Controller");
        });
      }
      else{
        var PayDone = false;
        if(parseInt(Event.getHero("Gold")) > 249){
          Event.Disable("Controller");
          Message = ["[Npc=1,奸商]哈哈哈，谢谢啦，告诉你个秘密吧","[Npc=1,奸商]听说魔王ZENO住在地下"];
          Event.ReduceGold(250);
          Event.AddTool("EarthQuake");
          PayDone = true;
        }
        else{
          Message = ["[Npc=1,奸商]唉，勇士，我做的也是小本生意啊，最低只能250，凑够再来吧"];
        }
        Event.ShowMessageList(Message,function(){
          Flag.Move = false;
          Event.UnlockMove();
          Event.Enable("Controller");
          if(PayDone){
            Event.GetItem("A7");
            Event.RemoveEvent("Npc",0,10,7);
          }
        });
      }
    break;
    case 14:
      Event.Disable("Controller");
      Message = ["[Npc=0,老人]能来到这真是不容易呢，从这开始的怪物都会很强","[Npc=0,老人]如果不增强实力的话完全是自寻死路","[Npc=0,老人]我听一个小偷说这座塔的1层不是最低层，你可以拿到右下角的下楼器下去","[Npc=0,老人]假如有随意门能绕开高级卫兵拿到下楼器，去零层前你还需要有地震卷轴","[Npc=0,老人]对了！我必须得告诉一些怪物的信息","[Npc=0,老人]红蝙蝠和冥骷髅吸血8%，大法师吸血25%","[Npc=0,老人]幽灵每回合攻击你2次，骑士护卫每回合攻击你3次","[Npc=0,老人]双手剑士每回合攻击你4次，骑士队长每回合攻击你5次！","[Npc=0,老人]你是来救公主的，这两个飞羽给你吧，希望能够帮到你，注意中心对称"];
      Event.ShowMessageList(Message,function(){
        Flag.Move = false;
        Event.RemoveEvent("Npc",1,9,3);
        Event.AddTool("Fly",2);
        Event.GetItem("A6");
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 15:
      if(!Event.EnemyExist("Now",0) && !Event.EnemyExist("Now",1)){
        Map.DoorOpen(9,8);
      }
    break;
    case 16:
      if(!Event.EnemyExist("Now",2) && !Event.EnemyExist("Now",3)){
        Map.DoorOpen(9,3);
      }
    break;
    case 17:
      if(!Event.EnemyExist("Now",9) && !Event.EnemyExist("Now",10) && !Event.EnemyExist("Now",11) && !Event.EnemyExist("Now",12)){
        Map.DoorOpen(5,5);
      }
    break;
    case 18:
      Event.Disable("Controller");
      Message = ["[Npc=0,老人]嘘。。楼上就是塔顶了！那可是魔王所处的地方，你可千万不要上去了","[Hero]不行，我得救出公主！不达目的我是不会走的","[Npc=0,老人]你手上的剑和盾都是古董啊，看来你也许有点实力","[Npc=0,老人]记住！如果没拿到神圣剑和神圣盾，千万不要挑战魔王！","[Npc=0,老人]这两样东西分别在楼上的左右侧层，需要打败镇守这两样东西的怪物","[Npc=0,老人]在这之前你还需要有能力打败骑士队长！务必记得存档！"];
      Event.ShowMessageList(Message,function(){
        Flag.Move = false;
        Event.RemoveEvent("Npc",0,6,0);
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 19:
      if(!Flag.Switch[2]){
        Event.Disable("Controller");
        Flag.EventRuning = true;
        Map.DoorClose(3,5,10,1);
        Message = ["[Enemy=28,骑士队长]你是第一个踏入这里的人类，但你也会是第一个死在这里的人类！","[Hero]受死吧！","[Enemy=28,骑士队长]你可以打败骷髅族但你不可能打败高贵的骑士族！我渴望和你战斗哈哈哈"];
        Event.ShowMessageList(Message,function(){
          Flag.Move = false;
          Event.UnlockMove();
          Event.Enable("Controller");
          Flag.EventRuning = false;
          Flag.Switch[2] = true;
        });
      }
    break;
    case 20:
      Event.Disable("Controller");
      Flag.EventRuning = true;
      Message = ["[Enemy=36,ZENO]哈哈哈哈，勇士这个场景是不是很熟悉？","[Hero]你是ZENO？？你不是死了么？？","[Enemy=36,ZENO]我曾经跟你说过我是不死的！只要我的精神力还在，就永远活着！","[Hero]什么？！公主在哪？快把她交出来！我相信神圣剑能够毁灭一切邪恶！","[Enemy=36,ZENO]公主？这货被我藏在一个你永远都找不到的地方！不过你放心，她一切安好","[Hero]放屁！我今天一定要杀了你！！","[Enemy=36,ZENO]看来你还是不明白自己的处境，魔法警卫","[Enemy=35,魔法警卫]在！","[Enemy=36,ZENO]给我把他押下去！对了，重置一下，换个地方，让他继续尝试"];
      Event.ReduceHP(parseInt(Event.getHero("HP")/2));
      Flag.Move = false;
      Event.RemoveEvent("Npc",0,5,0);
      Event.AddEnemy(13,36,5,0);
      Event.AddEnemy(14,35,5,1);
      Event.AddEnemy(15,35,5,3);
      window.setTimeout(function(){
        Event.ShowMessageList(Message,function(){
          Event.RemoveEvent("Enemy",13,5,0);
          Event.RemoveEvent("Enemy",14,5,1);
          Event.RemoveEvent("Enemy",4,4,2);
          Event.RemoveEvent("Enemy",15,5,3);
          Event.RemoveEvent("Enemy",5,6,2);
          Flag.EventRuning = false;
          var FloorIndex = Event.FindFloor("Unknown");
		  var FloorName = Map.Maps[FloorIndex][2].Name;
          Event.JumpFloor(FloorName,FloorIndex,2,5,10);
        });
      },500);
    break;
    case 21:
      Event.Disable("Controller");
      Message = ["[Enemy=28,骑士队长]看来我小看你了，来吧，让你见识什么叫五连击！什么才叫实力！"];
      Event.ShowMessageList(Message,function(){
        Event.DisableEvent("Now","Enemy",12,4);
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 22:
      Event.Disable("Controller");
      Message = ["[Enemy=28,骑士队长]唔。我的能量，我的铠甲，全部。都。。。他们都不会放过你的！！啊"];
      Event.ShowMessageList(Message,function(){
        Map.DoorOpen(0,5);
        Map.DoorOpen(10,5);
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 23:
      if(!Event.EnemyExist("Now",2) && !Event.EnemyExist("Now",3)){
        Map.DoorOpen(4,5);
      }
    break;
    case 24:
      if(!Event.EnemyExist("Now",12) && !Event.EnemyExist("Now",13)){
        Map.DoorOpen(6,5);
      }
    break;
    case 25:
      Event.Disable("Controller");
      Message = ["[Npc=1,商人]勇士，谢谢你把我救了出来，为了表达谢意","[Npc=1,商人]这十个随意门就给你了！"];
      Event.ShowMessageList(Message,function(){
        Flag.Move = false;
        Event.RemoveEvent("Npc",1,0,10);
        Event.AddTool("Door",10);
        Event.GetItem("A9");
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 26:
      Event.Disable("Controller");
      Message = ["[Npc=2,小偷]嘿！勇士，瞧见第六层的老头没，他是我朋友，谢谢你救了我","[Npc=2,小偷]我这有三把铁门钥匙，给你吧！"];
      Event.ShowMessageList(Message,function(){
        Flag.Move = false;
        Event.RemoveEvent("Npc",2,10,10);
        Event.AddKey("Iron",3);
        Map.DrawMessage("获得三把铁门钥匙","Tip");
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 27:
      if(!Event.EnemyExist("Now",7) && !Event.EnemyExist("Now",8)){
        Map.DoorOpen(3,4);
        Map.DoorOpen(7,4);
      }
    break;
    case 28:
      if(!Event.EnemyExist("Now",2) && !Event.EnemyExist("Now",3)){
        Map.DoorOpen(5,4);
      }
    break;
    case 29:
      var Exist = false;
      for(var i = 0;i < 9;i++){
        if(Event.EnemyExist("Now",i)){
          Exist = true;
          break;
        }
      }
      if(!Exist){
        Map.DoorOpen(5,2);
        Flag.Switch[3] = true;
      }
    break;
    case 30:
      if(!Flag.Switch[3]){
      	return;
      }
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Hero]这里。。不是刚开始的地方么。。。公主。。好像就在前面！"];
      Event.ShowMessageList(Message,function(){
      	Flag.EventRuning = false;
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 31:
      Event.Disable("Controller");
      Flag.EventRuning = true;
      Message = ["[Enemy=36,ZENO]你！你怎么发现这的！？？","[Hero]我不会再上你的当的！受死吧！，","[Enemy=36,ZENO]哈哈哈，还真是我失策了，一开始就应该夺去你的能力！","[Enemy=36,ZENO]魔法警卫！"];
      if(!Flag.Switch[3]){
      	  Message = ["[Enemy=36,ZENO]你可真是个天才，不杀魔龙也能到达这里，很有探索能力！"];
      	  Event.ShowMessageList(Message,function(){
      	  	Flag.EventRuning = false;
      	  	Flag.Move = false;
        	Event.UnlockMove();
        	Event.Enable("Controller");
        	var FloorIndex = Event.FindFloor(1);
		      var FloorName = Map.Maps[FloorIndex][2].Name;
        	Event.JumpFloor(FloorName,FloorIndex,2,5,10);
      	  });
      	  return;
      }
      Event.ShowMessageList(Message,function(){
      	Event.AddEnemy(1,35,HeroLocation[1] - 1,HeroLocation[2] - 1);
      	Event.AddEnemy(2,35,HeroLocation[1] - 1,HeroLocation[2] + 1);
      	Event.AddEnemy(3,35,HeroLocation[1] + 1,HeroLocation[2] - 1);
      	Event.AddEnemy(4,35,HeroLocation[1] + 1,HeroLocation[2] + 1);
      	Message = ["[Enemy=36,ZENO]封印他的能力！","[Enemy=35,魔法警卫]是！封印法阵展开"];
      	window.setTimeout(function(){
  			Event.ShowMessageList(Message,function(){
  			  Map.DrawBattleAnimate(0,HeroLocation[1],HeroLocation[2],function(){
  				    Event.ReduceHP(parseInt(Event.getHero("HP") * 0.9));
  				    Event.ReduceATK(parseInt(Event.getHero("ATK") * 0.9));
  				    Event.ReduceDEF(parseInt(Event.getHero("DEF") * 0.9));
      				Message = ["[Enemy=36,ZENO]勇士！来吧！来挑战我啊，为了公平起见我的能力也已经大幅削减","[Hero]ZENO！再见了！！！！"];
  			    	Event.ShowMessageList(Message,function(){
  		    			Flag.EventRuning = false;
  	    				Event.DisableEvent("Now","Enemy",0,4);
  			    		Flag.Move = false;
        			Event.UnlockMove();
        			Event.Enable("Controller");
        		});
        });
  			});
  		},500);
      });
    break;
    case 32:
    	Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Enemy=36,ZENO]不错嘛，小子，你是第一个打破我的镜像的人，不过，打败我还远着呢！"];
      Event.ShowMessageList(Message,function(){
        Event.AddEnemy(5,36,2,2,42);
        Message = ["[Enemy=36,ZENO]哈哈哈","[Hero]可恶，还没打死你么？！","[Enemy=36,ZENO]我说过我是不死的"];
        window.setTimeout(function(){      
      	   Event.ShowMessageList(Message,function(){
      	     Flag.EventRuning = false;
            Flag.Move = false;
            Event.UnlockMove();
            Event.Enable("Controller");
      	   });
        },500);
      });
    break;
    case 33:
      CallOK = false;
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Enemy=50,ZENO]从今天，2016年5月7日起，破坏神雷格纳洛克，你被逐出纪元魔塔了","[Enemy=49,雷格纳洛克]为什么？！我不也是在经典魔塔BOSS里面吗？","[Enemy=52,魔物首领古顿]为什么？看看你自4月23号你入驻纪元魔塔起，半个月来搞了多少破坏？","[Enemy=52,魔物首领古顿]100多层的塔已经被你拆掉了80多层了！！真是当之无愧的破坏神！","[Enemy=52,魔物首领古顿]就算我的石怪手下以及冥灵和ZENO的石头怪人手下再多。。","[Enemy=52,魔物首领古顿]也不够把被你破坏的墙补上！！！","[Enemy=53,冥灵魔王]你再不走，我看这塔迟早得塌。你赶紧离开这里，否则别怪我们不客气了！","[Enemy=50,ZENO]魔法警卫。直接把他轰出去！！"];
      Event.ShowMessageList(Message,function(){
        Message = ["[Enemy=49,雷格纳洛克]你们。！ZENO你别太欺负人了，想当初你在TSW塔时我们可是兄弟！","[Enemy=50,ZENO]现在不是了(冰冷)马上滚！","[Enemy=49,雷格纳洛克]别以为就你会叫手下，我也有！远古护卫！"];
        Event.AddEnemy(4,54,1,2);
        Event.AddEnemy(5,54,2,2);
        Event.AddEnemy(6,54,3,2);
        Event.AddEnemy(7,54,7,2);
        Event.AddEnemy(8,54,8,2);
        Event.AddEnemy(9,54,9,2);
        window.setTimeout(function(){
          Event.ShowMessageList(Message,function(){
            Event.AddEnemy(10,51,1,4);
            Event.AddEnemy(11,51,2,4);
            Event.AddEnemy(12,51,3,4);
            Event.AddEnemy(13,51,7,4);
            Event.AddEnemy(14,51,8,4);
            Event.AddEnemy(15,51,9,4);
            window.setTimeout(function(){
              Message = ["[Enemy=36,ZENO]不错不错，你这手下的确比我的强的多但是别忘了你现在在谁的地盘！","[Enemy=49,雷格纳洛克]如果你的手下打败了我的手下我就走！！！","[Enemy=36,ZENO]好，魔法警卫，进入近卫模式"];
              Event.ShowMessageList(Message,function(){
                Message = ["[Enemy=36,ZENO]看到了么？你所谓的远古护卫根本不是近卫魔法警卫的对手","[Enemy=50,ZENO]劝你立刻滚开，不然别怪重创你的手下","[Enemy=49,雷格纳洛克]行！我滚！ZENO你给我记着！！"];
                Map.DrawBattleAnimate(1,3,2);
                window.setTimeout(function(){
                  Map.DrawBattleAnimate(0,3,4,function(){
                    Event.RemoveEvent("Enemy",12,3,4);
                    Event.ShowMessageList(Message,function(){
                      Flag.Move = false;
                      Event.UnlockMove();
                      Event.Enable("Controller");
                      Flag.EventRuning = false;
                      CallOK = true;
                      callback();
                      var FloorIndex = Event.FindFloor("B");
		                   var FloorName = Map.Maps[FloorIndex][2].Name;
                      	Event.JumpFloor(FloorName,FloorIndex,2,5,10);
                    });
                  });
                },1300);
              });
            },500);
          });
        },500);      	  
      });
    break;
    case 34:
      Event.DisableStart(1);
      Event.OpenHelpPanel();
    break;
    case 35:
      CallOK = false;
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Enemy=49,雷格纳洛克]可恶的家伙，居然骗我去纪元魔塔待一阵子。现在好了，才过了半个月","[Enemy=49,雷格纳洛克]就被三个不是人的东西轰出来！"];
      Event.ShowMessageList(Message,function(){
        Map.DrawBattleAnimate(0,5,2,function(){
          Map.Event.drawImage(Map.Res["Stair"],64,0,32,32,160,64,32,32);
          Event.AddEnemy(0,49,5,2,-1,37);
          Message = ["[Enemy=49,雷格纳洛克]魔命棋妙！你躲哪去了！别以为你藏里面就没事！","[Enemy=49,雷格纳洛克]破坏之力！开启！"];
          window.setTimeout(function(){
                  Event.ShowMessageList(Message,function(){
              Event.RemoveWall(null,null,"All&0");
              Message = ["[Enemy=49,雷格纳洛克]我没地方立足了，我告诉你！你新装修的房子归我了！","[Npc=8,魔命棋妙]嘘～等等，我先撸完这关塔防魔塔","[Enemy=49,雷格纳洛克]你——————说——什么？(满脸黑线)","[Npc=8,魔命棋妙]这气息。。啊啊啊啊啊啊！破坏神大人！饶命啊！！咦。。墙咋没了","[Npc=8,魔命棋妙]破坏神大人，你刚刚说要新装修的房子？？其实刚刚你拆的这个就是。。。","[Enemy=49,雷格纳洛克]我*&%#*&#&%*$，我不管！你不给我就杀了你！","[Npc=8,魔命棋妙]啊。。。饶命啊！毕竟是我把你送进纪元的啊！(等等！转念一想)","[Npc=8,魔命棋妙](嘲讽)你这32×32像素的低级二维生物能对我造成多大伤害？","[Npc=8,魔命棋妙]啦啦啦啦啦～有种你就杀了我啊～来啊～","[Enemy=49,雷格纳洛克](手中持着魔命棋妙自己磨出来的“镰刀”)好，这可是你说的，受死吧！","[Npc=8,魔命棋妙]卧槽！救命啊！！来人啊啊啊啊啊！！如果勇士在这就好了T T","[Hero]噢？你是说我么？","[Npc=8,魔命棋妙]说曹操曹操就到！我上有八十岁老母，下有妻妾成群，你一定要救我啊！","[Enemy=49,雷格纳洛克]这。。剧本不对吧。。勇士不应该在主塔做循环战斗测试么！","[Hero]破坏神，别废话了，吃我剑击！"];
                      Event.ShowMessageList(Message,function(){
                Flag.Move = false;
                Event.UnlockMove();
                Event.Enable("Controller");
                Flag.EventRuning = false;
                CallOK = true;
                callback();
              });
            });
          },1000);
        });
      });
    break;
    case 36:
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Npc=8,魔命棋妙]勇士啊！！我只能靠你了，一定要救我QAQ"];
      Event.ShowMessageList(Message,function(){
      	Flag.EventRuning = false;
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
      });
    break;
    case 37:
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Enemy=49,雷格纳洛克]你。。居然打败了我的分身！看来他们三个也离死期不远了，哈哈哈哈哈","[Npc=8,魔命棋妙](松了一口气)呼。勇士，还好你及时出现啊！不然我就Over了QAQ","[Hero](满脸贱笑地说)魔命棋妙啊，我可救了你啊，你作为纪元魔塔的测试者～","[Hero]该给我点什么利益好呢？嘿嘿嘿！","[Npc=8,魔命棋妙]这。。。这我可帮不到你啊，主制作者是VC，你。找她去","[Hero](捡起那把“镰刀”，满脸黑线)你再说一遍，你给我什么啊？","[Npc=8,魔命棋妙](大难不死，必有后难。。)要不我叫641和俺要大触把魔龙触死怎样？","[Hero]不够！你还没告诉我怎么出去呢！","[Npc=8,魔命棋妙]好好好，给个折衷方案吧，我给你这把屠龙匕和两个飞羽 =。=","[Hero]这才像样！(这家伙怎么不告诉我如何作弊，看来也不是什么好人)","[Npc=8,魔命棋妙]哈哈，我这就送你出去～"];
      Event.ShowMessageList(Message,function(){
      	Flag.EventRuning = false;
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        Event.AddTool("Fly",2);
        Event.AddDragon();
        var FloorIndex = Event.FindFloor(4);
        Map.Maps[FloorIndex][1].push([2,2,1,1]);
		     var FloorName = Map.Maps[FloorIndex][2].Name;
        	Event.JumpFloor(FloorName,FloorIndex,2,10,10);
      });
    break;
    case 38:
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Npc=3,仙子]离开！！快离。。开这！我感觉我要控制不了了","[Hero]发生什么了？？？","[Npc=3,仙子]总之快离开！求求你不要再走下去了！！。。(眼神呆滞)"];
      if(Flag.Switch[5]){
        Message = ["[Npc=3,仙子].....救公主，救公主吧。"];
      }
      Event.ShowMessageList(Message,function(){
      	Flag.EventRuning = false;
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        Flag.Switch[5] = true;
      });
    break;
    case 39:
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Npc=13,公主]勇士，你终于来了！我可是等的好久啊！！","[Hero]走吧！我带你出去！","[Npc=13,公主]可惜。我不想走呢。。。。","[Hero]公主你说什么傻话，快跟我走吧，等下怪物就追来了！","[Npc=13,公主](奇怪的笑容)。。果然你还是没明白你的处境么？"];
      Event.ShowMessageList(Message,function(){
      	Flag.EventRuning = false;
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        var FloorIndex = Event.FindFloor("D");
		     var FloorName = Map.Maps[FloorIndex][2].Name;
        	Event.JumpFloor(FloorName,FloorIndex,0,5,1);
      });
    break;
    case 40:
      CallOK = false;
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Enemy=55,模仿者]你又一次上当了呢～哈哈哈哈哈哈","[Hero]不！不！不！ZENO你给我出来！不要再戏弄我了！一次又一次！","[Enemy=55,模仿者]这一切不正是你自己所创造的么？你能怪谁？","[Hero]我？！我创造？开什么玩笑","[Enemy=55,模仿者]你很快要进入下一轮回了哦","[Enemy=55,模仿者]听说人在梦中死亡就会真的死呢"];
      Event.ShowMessageList(Message,function(){
      	Flag.EventRuning = false;
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        CallOK = true;
        callback();
      });
    break;
    case 41:
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Message = ["[Enemy=55,模仿者]想跑？？在这里面你是跑不掉的，这里是地狱","[Hero]我杀了你！！！！"];
      Event.AddEnemy(2,55,5,3);
      window.setTimeout(function(){
        Event.ShowMessageList(Message,function(){
          Message = ["[Enemy=55,模仿者]你以为你这点能力能挑战我？？"];
          Map.DrawBattleAnimate(1,5,3,function(){
            Event.ShowMessageList(Message,function(){
                Message = ["[Hero]呜哇(一口血吐了出来)","[Enemy=55,模仿者]反正你迟早要被重置清理，我帮你死的快点","[Hero]你。。。。(晕倒)","[Enemy=36,ZENO]3秒后启动销毁吧"];
              Map.DrawBattleAnimate(0,5,2,function(){
                Event.setHero("HP",0);
                Event.ShowMessageList(Message,function(){
                  window.setTimeout(function(){
                    Message = ["[Hero]玩家，恭喜你！通关普通结局的纪元魔塔前传，请期待纪元魔塔正式版","[Npc=3,仙子]谢谢支持！"];
                    Event.ShowMessageList(Message,function(){
                      location.reload();
                    });
                  },3000);
                });
              });
            });
          });
        });
      },500); 
    break;
    case 42:
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Event.AddEnemy(6,52,3,1);
      window.setTimeout(function(){
        Map.DrawBattleAnimate(0,HeroLocation[1],HeroLocation[2],function(){
          Event.setHero("HP",1);
          Map.Fg.drawImage(Map.Res["Battle1"],32,96,32,32,HeroLocation[1] * 32,HeroLocation[2] * 32,32,32);
          Message = ["[Enemy=36,ZENO]魔物首领，干得好！这货妄图挑战我，不给他点颜色瞧瞧真是便宜他了。","[Enemy=36,ZENO]把他关起来，严加看守！","[Enemy=52,魔物首领古顿]是，魔王大人，来人！把这个人扔进负三层牢狱！让中级守卫去守","[Enemy=36,ZENO]还有一楼那个仙子一起抓进去，一切的一切该结束了。"];
          Event.ShowMessageList(Message,function(){
            window.setTimeout(function(){
              Message = ["[Hero]玩家，恭喜你！完美通关纪元魔塔前传，请期待纪元魔塔正式版","[Npc=3,仙子]谢谢支持！"];
              Event.ShowMessageList(Message,function(){
                location.reload();
              });
            },1500);
          });
        });
      },500);      
    break;
    case 43:
      Message = ["[Enemy=56,魔化仙子]我……我怎么可能被你打败……是你逼我用这一招的！","[Enemy=56,魔化仙子](喃喃自语)那黑暗中充满着无限力量的权杖啊。","[Enemy=56,魔化仙子]吾名伊拉，世人称我为仙子。吾为自愿投身黑。。黑暗的权杖！","[Hero]仙子这是要干什么？要自爆吗？等等，仙子胸口挂的是什么东西","[Hero]我看是这东西搞的鬼！(把仙子胸口的黑色徽章击飞)","[Enemy=56,魔化仙子]唔，黑暗领域。古顿大人我无法再为您效力了。(四周开始发生变化)"];
      Flag.EventRuning = true;
      Event.Disable("Controller");
      Event.AddEnemy(2,56,5,4);
      Event.ShowMessageList(Message,function(){
        Map.DrawItem(0,"A12",6,3);
        window.setTimeout(function(){
          var FloorIndex = Event.FindFloor("E");
		       var FloorName = Map.Maps[FloorIndex][2].Name;
        	  Event.JumpFloor(FloorName,FloorIndex,HeroLocation[0],HeroLocation[1],HeroLocation[2]);
        },400);
      });
    break;
    case 44:
      Message = ["[Npc=3,仙子](如梦初醒)我干了什么？那黑色的权杖在哪里？","[Hero]之前还挂在你的胸口上呢，之前看你不对劲，把这东西打到你旁边了。","[Npc=3,仙子]这可是象征极度黑暗的罪恶权杖！我看到这东西掉到了我旁边","[Npc=3,仙子]于是想用自己的力量摧毁它","[Npc=3,仙子]怎知，罪恶权杖突然发出数道黑色的射线，接下来发生的事情我都记不清了","[Npc=3,仙子]切记！不要拿起罪恶权杖！","[Hero]这罪恶权杖肯定不简单。对了，刚刚那个模仿者是怎么回事？","[Npc=3,仙子]什么？？模仿者？！难道。。(身体顿时变得僵硬)"];
      Event.ShowMessageList(Message,function(){
        Event.AddEnemy(0,52,5,0,-1,45);
        window.setTimeout(function(){
          Message = ["[Enemy=52,魔物首领古顿]仙子，在这里待了这么久，你以为我们都不管事吗？","[Enemy=52,魔物首领古顿]你放跑了这么多个俘虏，这账得跟你好好算算了！","[Enemy=52,魔物首领古顿]勇士，呵，至于你这一举一动都需要破仙子支撑的懦夫！","[Enemy=52,魔物首领古顿]我让你死在梦境里你不肯，那就让你体验体验无限的梦魇吧！","[Enemy=52,魔物首领古顿]我给你10秒的时间，如果谁能够将我打退一步我就不杀你们"];
          Event.ShowMessageList(Message,function(){
            Flag.EventRuning = false;
            Flag.Move = false;
            Event.UnlockMove();
            Event.Enable("Controller");
            window.setTimeout(function(){
              if(!Flag.Switch[6]){
                Flag.EventRuning = true;
      Event.Disable("Controller");
                Message = ["[Enemy=52,魔物首领古顿]时间到！真是可惜了呢","[Enemy=52,魔物首领古顿]哈哈哈，再见了！死灵裂爆！"];
                Event.ShowMessageList(Message,function(){
                Map.DrawBattleAnimate(0,5,4);
                  Map.DrawBattleAnimate(0,HeroLocation[1],HeroLocation[2],function(){
                    Event.setHero("HP",0);
                    window.setTimeout(function(){
                      Message = ["[Enemy=52,魔物首领古顿]真是群不堪一击的家伙，这仙子死几百次都不够平众怒","[Enemy=52,魔物首领古顿]倒是这人身体倒还行，炼成傀儡倒挺不错。","[Enemy=52,魔物首领古顿]来人！把这家伙拉到监狱里关起来，别再让这群俘虏跑了！","[Npc=3,仙子]恭喜你通关隐藏结局的纪元魔塔前传"];
                                    Event.ShowMessageList(Message,function(){
                        location.reload();
                      });
                    },200);
                  });
                });
              }
            },10000);
          });
        },500);
      });
    break;
    case 45:
      Flag.Switch[6] = true;
      if(Flag.Switch[7]){
        Message = ["[Enemy=52,魔物首领古顿]恩，罪恶权杖的威力果然很大，只有你能掌控它了，哈哈哈","[Hero]誓死效忠ZENO大人！","[Npc=3,仙子]恭喜你通关了最悲惨结局的纪元魔塔前传"];
        Event.ShowMessageList(Message,function(){
          location.reload();
        });
      }
    break;
    case 46:
      var ATKTimer = window.setInterval(function(){
        Event.AddATK(10000);
        if(Event.getHero("ATK") >= 900000){
          clearInterval(ATKTimer);
        }
      },100);
      Flag.Switch[7] = true;
    break;
  }
  if(CallOK && (!(typeof(callback) == "undefined" || callback == null))){
    callback();
  }
}
/*
  CallOK = false;
      Event.Disable("Controller");
      var Message;
      Message = ["[Enemy=26,魔法警卫]尽管你杀了我，但是还有千千万万的魔法警卫在等着你！"];
      Event.ShowMessageList(Message,function(){
        Event.DisableEvent("Now","Enemy",5,4);
        Flag.Move = false;
        Event.UnlockMove();
        Event.Enable("Controller");
        CallOK = true;
        callback();
      });
*/