//确保页面内容都载入了
window.onload = function(){
	//测试是否出错，如果出错抛出错误
	try{
		/* 初始化 */
		//获取所有元素
		var CilentWidth = document.documentElement.clientWidth; //获得设备宽度
		var CilentHeight = document.documentElement.clientHeight; //获得设备高度
		var GameGroup = document.getElementById("GameGroup"); //获得游戏容器
		var GameStart = document.getElementById("GameStart"); //获得开始画面
		var GameLoading = document.getElementById("GameLoading"); //获得加载文字
		var LoadTip = document.getElementById("LoadTip"); //获得加载时的提示
		var LoadProgressBar = document.getElementById("LoadProgressBar"); //获得加载进度条
		var LoadProgress = document.getElementById("LoadProgress"); //获得加载进度
		var CanvasGroup = document.getElementById("CanvasGroup"); //获得画布容器
		var WaitDraw = document.getElementById("GameLoading");
		var GoFloorButton = document.getElementById("GoFloorButton");
		var EnemyBookButton = document.getElementById("EnemyBookButton");
		var ToolsButton = document.getElementById("ToolsButton");
		var SettingButton = document.getElementById("SettingButton");
		var SaveGameButton =  document.getElementById("SaveGame");
		var LoadGameButton = document.getElementById("LoadGame");
		var HelpButton = document.getElementById("HelpButton");
		var ControlGroup = document.getElementById("ControlGroup"); //获得控制界面
		var Controller = document.getElementById("Controller"); //获得控制按钮
		var Controller2 = document.getElementById("Controller2"); //获得被触发的控制按钮
		var ZoomBox = document.getElementById("ZoomBox"); //获得缩放选择框
		var Property = document.getElementById("Property");
		var MapBg = document.getElementById("MapBg"); //获得背景画布
		var MapEvent = document.getElementById("MapEvent"); //获得事件画布
		var MapFg = document.getElementById("MapFg"); //获得前景画布
		var SystemUI = document.getElementById("SystemUI"); //获得界面画布
		var DataUpdate = document.getElementById("DataUpdate"); //获得数据画布
		var TestButton = document.getElementById("Test");
		
function StartGame(){
   var GlobalAnimate = []; //全局动画
		var GlobalAnimateResName = ""; //全局动画当前绘制的资源名称
		var GlobalAnimateStep = 0; //全局动画当前步骤
		var GlobalAnimateTimer = window.setInterval(function(){
		  if(GlobalAnimate.length > 0){
		    for(var i = 0;i < GlobalAnimate.length;i++){
		      //防止重复定义
		      var ResName,IconX,IconY,IconW,IconH,X,Y;
		      if(GlobalAnimate[i][1] != null){
		        var Step = [0,32,96,64]; //定义动画顺序
		        ResName = GlobalAnimate[i][2]; //获得该帧动画的资源名
		        IconX = Step[GlobalAnimateStep];
		        IconY = GlobalAnimate[i][5][2];
		        IconW = GlobalAnimate[i][5][3];
		        IconH = GlobalAnimate[i][5][4];
		        X = GlobalAnimate[i][3] * IconW;
		        Y = GlobalAnimate[i][4] * IconH;
		        Map.ClearMap(Map.Event,X,Y,IconW,IconH); 
		        Map.Event.drawImage(Map.Res[ResName],IconX,IconY,IconW,IconH,X,Y,IconW,IconH);
		      }
		      else{
		        ResName = GlobalAnimate[i][2];
		        IconX = GlobalAnimate[i][5][GlobalAnimateStep][1];
		        IconY = GlobalAnimate[i][5][GlobalAnimateStep][2];
		        IconW = GlobalAnimate[i][5][GlobalAnimateStep][3];
		        IconH = GlobalAnimate[i][5][GlobalAnimateStep][4];
		        X = GlobalAnimate[i][3] * 32;
		        Y = GlobalAnimate[i][4] * 32;
		        Map.ClearMap(Map.Event,X,Y,IconW,IconH); 
		         Map.Event.drawImage(Map.Res[ResName],IconX,IconY,IconW,IconH,X,Y,IconW,IconH);
		      }
		    }
		    GlobalAnimateStep++;
		    if(GlobalAnimateStep > 3){
		      GlobalAnimateStep = 0;
		    }
		  }
		},200); //全局动画定时器	
		var Temp;
		//定义变量
		var Version = "Beta 1.1.6";
		document.title = "纪元魔塔前传 & " + Version;
		var Hero = new Object();
		Hero["Name"] = "勇士";
		Hero["HP"] = 1000;
		Hero["ATK"] = 10;
		Hero["DEF"] = 10;
		Hero["Gold"] = 0;
		Hero["Exp"] = 0;
		Hero["YellowKey"] = 0;
		Hero["BlueKey"] = 0;
		Hero["RedKey"] = 0;
		Hero["IronKey"] = 0;
		Hero["GreenKey"] = 0;
		Hero["PayGold"] = 0;
		var Floor = 3; //当前楼层
		var Map,Event;
		var Zoom = 1;
		var SLMode = "";
		var HeroLocation = [2,5,10]; //勇士当前朝向和坐标
		var NoPassLocation = []; //禁止通行的坐标
		var ItemLocation = []; //物品的坐标
		var DoorLocation = []; //门的坐标
		var StairLocation = []; //楼梯口坐标
		var EnemyLocation = []; //怪物坐标
		var NpcLocation = []; //Npc坐标
		var EventLocation = []; //事件坐标
		var HeroMove = 4;
	 	var AnimateStep = 2;
	 	var BattleAnimateStep = 0;
	 	var MoveStepNum = 0;
	 	var HeroIconData;
	 	var StoreOptionNum = 10;
	 	var StoreOptionTemp = "";
	 	var HelpPanelPage = 1;
	 	var StoreChoose = 0;
	 	var SLPanelChoose = 1;
	 	var ToolPanelChoose = 0;
	 	var WindowMode = 0; //0竖屏 1横屏
	 	var EnemyPage = 0;
	 	var NowFloor = 0;
	 	var LastTalk = "";
	 	var StartTip = "内测人员你好\n\n当前版本：" +Version+ "\n* 特别注意：为了适应新版本，旧存档会被清除\n\n更新内容：\n1.[New]商店制作完毕，手机点击选择要购买的能力值后再点击一次即可购买，电脑上下方向键选择，空格键购买\n2.增加三种墙模式：可破可震不可门、可门不可破不可震、可破可震可门\n3.修改框颜色为白色\n-3层准备大改\n\n修复内容：\n1.修复商店方向键向上到最顶部加HP向下到最底部关闭商店的问题\n2.修复飞羽无法飞到楼梯口的问题\n3.修复往地图添加物品并获得后又重现的问题\n4.修复道具用光后道具栏无法再打开的问题\n5.修复电脑上选择道具后使用却都是使用第一个道具的问题\n6.修复进入一些道具界面点击勇士勇士能够发生原地转向的问题\n\n*如发现本提示版本与作者发布的最新版本号不同，请清除浏览器缓存刷新重试";
	 	var StartX = 0;
		var StartY = 0;
		var ControllerMode = 1; //控制模式，0触屏，1按键
	 	var LastHead = 5;
		var MoveTimeout,WaitSave,WaitLoad,FloorTipOut,WaitChooseFloor;
  		var UpTimer,LeftTimer,DownTimer,RightTimer,MoveTimer,RunTimer,MessageInTimer,MessageOutTimer,WaitOut,WaitNextMessageTimer,ShowWordTimer,EnemyBookAnimate,FloorTipTimer,MessageIconAnimate,ChooseFloorTimer,BattleAnimateTimer;
		var AnimateNoPass = 0;
		var ResPath = "./Res/"; //资源路径
		//资源名称列表
		var ResNameList = ['Hero','Npc1','Npc2','Npc3','Enemy1','Enemy2','Enemy3','Enemy4','Enemy5','Enemy6','Enemy7','Enemy8','Enemy9','Enemy10','Enemy11','Enemy12','Enemy13','Enemy14','Enemy15','Store','Terrain','Stair','Door1','Door2','Door3','Door4','Gem','Weapon','Floor','Item1','Item2','Item3','Star','Lava','Water','Name','Battle1'];
		var ResData = {}; //存储所有图片对象的数组
		var MapsData = MapSet;
		var IconsData = IconSet; //所有图标坐标数据
		var EnemyData = EnemySet;
		var ItemsData = ItemSet; //所有物品数据
		var ToolsData = ItemSet.Tool;
		var NowProgress = 0; //当前加载进度
		
		//更新加载提示内容
		function UpdateLoadTip(Content){
			LoadTip.innerHTML = Content;
		}
		//更新加载进度条
		function UpdateLoadProgress(Progress){
			LoadProgress.style.width = Progress + "px";
		}
		//加载图片资源
		function LoadImage(Path,ResName,ResNum,callback){
			var Img = new Image(); //创建一个图片对象
			Img.src = Path; //获得图片路径
			//如果该图片已经缓存则直接回调
			if(Img.complete){
				callback(ResName,ResNum,Img);
				return;
			}
			//未缓存则等待加载完成后回调
			Img.onload = function(){
				callback(ResName,ResNum,Img);
			}
		}
		
		//加载资源
		function LoadResource(ResPath,ResNameList,callback){
			var ResTemp = {}; //临时存储对象
			for(var r = 0;r < ResNameList.length;r++){
				var ResName = ResNameList[r]; //获得资源名称
				UpdateLoadTip("Load " + ResName + ".png...");
				//开始加载图片
				LoadImage(ResPath + ResName + ".png",ResName,ResNameList.length,function(ResName,ResNum,Img){
				  //图片加载完成
				  var rnum = 0; //资源个数
				  ResData[ResName] = Img; //存入图片对象数组
				  UpdateLoadTip(ResName + ".png - Done");
				  var Num = parseInt(LoadProgressBar.offsetWidth/ResNum); //计算进度
				  UpdateLoadProgress(NowProgress += Num);
				  for(var r in ResData){rnum++}; //统计资源数量
				  if(rnum == ResNum){
				    UpdateLoadTip("Done");
				    var NowOpacity = 1; //当前透明度150%
					UpdateLoadProgress(LoadProgressBar.offsetWidth - 20);
					var MessageOutTimer = setInterval(function(){
  					GameStart.style.opacity = NowOpacity -= 0.1; //开始渐变到透明度为0
  						if(NowOpacity <= 0){
    						clearInterval(MessageOutTimer);
    						GameStart.style.display = "none"; //隐藏开始界面
      						callback();
      					}
     			 	},40);
			  	 }
		      });
			}
			//完成后返回所有资源
			return ResTemp;
		}
		
		//重置大小
		function Resize(Map){
			CilentWidth = document.documentElement.clientWidth; //重新获得设备宽度
			CilentHeight = document.documentElement.clientHeight; //重新获得设备高度	
			if(CilentWidth <= 490){
				GameGroup.style.width = CilentWidth + "px"; //将游戏容器宽度设置为设备宽度
				GameGroup.style.height = CilentHeight + "px"; //将游戏容器高度设置为设备高度
			  	WindowMode = 0;
			  	CanvasGroup.style.width = "352px";
			   CanvasGroup.style.height = "512px";
			  	MapBg.style.marginTop = "100px";
			  	MapEvent.style.marginTop = "100px";
			  	MapFg.style.marginTop = "100px";
			  	SystemUI.style.marginTop = "100px";
			  	DataUpdate.style.marginTop = "100px";
			   MapBg.style.marginLeft = "0px";
			  	MapEvent.style.marginLeft = "0px";
			  	MapFg.style.marginLeft = "0px";
			  	SystemUI.style.marginLeft = "0px";
			  	DataUpdate.style.marginLeft = "0px";
			  	Property.width = 352;
			  	Property.height = 512;
			}
			else{
				GameGroup.style.width = "800px"; //将游戏容器宽度设置为设备宽度
				GameGroup.style.height = CilentHeight + "px"; //将游戏容器高度设置为设备高度
			  	WindowMode = 1;
			  	var Left = 122 + "px";
			  	CanvasGroup.style.width = "474px";
			 	 CanvasGroup.style.height = "352px";
			  	MapBg.style.marginTop = "0px";
			  	MapEvent.style.marginTop = "0px";
			  	MapFg.style.marginTop = "0px";
			  	SystemUI.style.marginTop = "0px";
			  	DataUpdate.style.marginTop = "0px";
			  	MapBg.style.marginLeft = Left;
			  	MapEvent.style.marginLeft = Left;
			  	MapFg.style.marginLeft = Left;
			  	SystemUI.style.marginLeft = Left;
			  	DataUpdate.style.marginLeft = Left;
			  	Property.width = 452;
			  	Property.height = 352;	  	
			}
			if(TestNull(Map)){
			  Map.DrawPropertyGroup();
			}
		}
		
		//属性刷新
		function UpdateProperty(){
		  Map.DrawPropertyGroup();
		}
		
		function Vibrate(Time){
		  if (navigator.vibrate) {
       navigator.vibrate(Time);
     }
     else if(navigator.webkitVibrate){
       navigator.webkitVibrate(Time);
     }
		}
		
		//事件触发
		function EventTrigger(X,Y,Type){
		  var Exist = false;
		  if(X < 0 || X > 10 || Y < 0 || Y > 10){
		    return false;
		  }
		  if(Flag.RunOver){
		    return true;
		  }
		  Flag.RunOver = true;
			for(var n = 0;n < NoPassLocation.length;n++){
				if(X == NoPassLocation[n][0] && Y == NoPassLocation[n][1]){
				  if(Type == "Fly"){
				    Exist = true;
				    break;
				  }
				  HeroStop();
					//console.log("触发了禁止通过事件 坐标(" + NoPassLocation[n][0] +","+ NoPassLocation[n][1] + ")");
					return false;
				}
			}
			var EventData = MapsData[Floor][2];
			for(var d = 0;d < DoorLocation.length;d++){
			  if(X == DoorLocation[d][1] && Y == DoorLocation[d][2]){
			    if(Type == "Fly"){
				    Exist = true;
				    break;
				  }
				Flag.Move = false;
			    var DoorEventData = EventData.Door;
			    Event.OpenDoor(DoorEventData[d],X,Y);
			    return false;
			  }
			}
			
			for(var s = 0;s < StairLocation.length;s++){
				if(X == StairLocation[s][1] && Y == StairLocation[s][2] && !Flag.JumpFloor){
				if(Type == "Fly"){
				    break;
			  	}
				 Flag.LockMove = true;
				 Flag.JumpFloor = true; //防止死循环跳跃
				 HeroStop();
					var ToX = StairLocation[s][3];
					var ToY = StairLocation[s][4];
					var ToHead = StairLocation[s][5];
					var ToFloor = StairLocation[s][6];
					var FloorIndex = Event.FindFloor(ToFloor);
					var FloorName = Map.Maps[FloorIndex][2].Name;
					Event.JumpFloor(FloorName,FloorIndex,ToHead,ToX,ToY);
					return true;
				}
			}
			
			for(var e = 0;e < EnemyLocation.length;e++){
				if(X == EnemyLocation[e][2] && Y == EnemyLocation[e][3]){
				  if(Type == "Fly"){
				    Exist = true;
				    break;
				  }
				  var EnemyEventData = EventData.Enemy;
				  if(TestNull(EnemyEventData[e][4]) && EnemyEventData[e][4] != -1){
				    Flag.Event(EnemyEventData[e][4],Map,Event,HeroLocation,Floor);
				  }
				  else{
				     Event.OpenBattle(EnemyEventData[e]);
				  }
				  return false;
				}
			}
			
			for(var n = 0;n < NpcLocation.length;n++){
				if(X == NpcLocation[n][2] && Y == NpcLocation[n][3]){
				  if(Type == "Fly"){
				    Exist = true;
				    break;
				  }
				  var NpcEventData = EventData.Npc;
				  if(TestNull(NpcEventData[n][4]) && NpcEventData[n][4] != -1){
				    Flag.Event(NpcEventData[n][4],Map,Event,HeroLocation,Floor);
				  }
					return false;
				}
			}
			
			for(var i = 0;i < ItemLocation.length;i++){
				if(X == ItemLocation[i][2] && Y == ItemLocation[i][3]){
				  if(Type == "Fly"){
				    Exist = true;
				    break;
				  }
				  var ItemEventData = EventData.Item;
				 if(TestNull(ItemEventData[i][4]) && ItemEventData[i][4] != -1){
				    Flag.Event(ItemEventData[i][4],Map,Event,HeroLocation,Floor);
				  }
				  Event.AddItem(ItemLocation[i][1],ItemLocation[i][0],X,Y);
					return true;
				}
			}
			
			for(var v = 0;v < EventLocation.length;v++){
			  if(X == EventLocation[v][1] && Y == EventLocation[v][2]){
			    if(Type == "Fly" && EventLocation[v][4] != 2){
				    Exist = true;
				    break;
				}
			    var FloorEventData = EventData.Event;
			    Event.RunEvent(EventLocation[v][4]);
			    return true;
			  }
			}
			if(Type == "Fly" && Exist){
				 return "Exist";
			}
			return true;
		}
		
		function XYMod(_TouchX,_TouchY,Left,Top,X,Y,W,H){
		  var TouchX = _TouchX - (Left * Zoom);
		  var TouchY = _TouchY - (Top * Zoom);
		  if(TouchX > X * Zoom && TouchX < (X + W) * Zoom && TouchY > Y * Zoom && TouchY < (Y + H) * Zoom){
		    return true;
		  }
		  return false;
		}

		//测试参数是否为Null
		function TestNull(Obj){
			return ((typeof(Obj) == "undefined" || Obj == null)?false:true); //如果未定义或者null返回false，反之true
		}
		
		function getHeadXY(_Head){
		  var Head = HeroLocation[0];
		  if(TestNull(_Head)){
		    Head = _Head;
		  }
		  var X = HeroLocation[1];
		  var Y = HeroLocation[2];
		  switch(Head){
		    case 0:Y--;break;
		    case 1:X--;break;
		    case 2:Y++;break;
		    case 3:X++;break;
		  }
		  return [Head,X,Y];
		}
		
		//使勇士停下
		function HeroStop(){
		  clearInterval(UpTimer);
		  clearInterval(LeftTimer);
		  clearInterval(DownTimer);
		  clearInterval(RightTimer);
		}
		
		//创建Event对象的工厂函数
		function CreateEventControl(EnemyData,callback){
		  var e = new Object();
		  e.Enemys = EnemyData;
		  
		  e.EnemyExist = function(EnemyFloor,ID){
		    if(EnemyFloor == "Now"){
		      EnemyFloor = Floor;
		    }
		    var EnemyData = Map.Maps[EnemyFloor][2].Enemy;
		    for(var i = 0;i < EnemyData.length;i++){
        if(EnemyData[i][0] == ID){
          return true;
        }
      }
      return false;
		  }
		  
		  e.FindFloor = function(FloorNum){
		    var MapData = Map.Maps;
		    for(var f = 0;f < MapData.length;f++){
		      if(MapData[f][2].Floor == FloorNum){
		        return f;
		      }
		    }
		    return false;
		  }
		  
		  e.TestNo = function(Type,_Floor){
		    if(!TestNull(_Floor)){
		      _Floor = Floor;
		    }
		    else{
		      _Floor = e.FindFloor(_Floor);
		    }
		    var NoData = Map.Maps[_Floor][2].No;
		    for(var t = 0;t < NoData.length;t++){
		      if(NoData[t] == Type){
		        return true;
		      }
		    }
		    return false;
		  }
		  
		  e.getHero = function(Name){
		    return Hero[Name];
		  }
		  
		  e.setHero = function(Name,Val){
		    Hero[Name] = Val;
		    UpdateProperty();
		  }
		  
		  e.AddKey = function(Key,Val){
		    switch(Key){
		      case "Yellow": if(Hero["YellowKey"] < 99){Hero["YellowKey"] += Val;} break;
		      case "Blue": if(Hero["BlueKey"] < 99){Hero["BlueKey"] += Val;} break;
		      case "Red": if(Hero["RedKey"] < 99){Hero["RedKey"] += Val;} break;
		      case "Green": if(GreenKey < 99){GreenKey += Val;} break;
		      case "Iron": if(Hero["IronKey"] < 99){Hero["IronKey"] += Val;} break;
		      case "KeyHub1":
		        if(Hero["YellowKey"] < 99){Hero["YellowKey"]++;}
		        if(Hero["BlueKey"] < 99){Hero["BlueKey"]++;}
		        if(Hero["RedKey"] < 99){Hero["RedKey"]++;}
		      break;
		      case "KeyHub2":
		        if(Hero["YellowKey"] < 99){Hero["YellowKey"]+=3;}
		        if(Hero["BlueKey"] < 99){Hero["BlueKey"]+=3;}
		        if(Hero["RedKey"] < 99){Hero["RedKey"]+=3;}
		      break;
		    }
		    UpdateProperty();
		  }
		  
		  e.ReduceKey = function(Key,Val){
		    switch(Key){
		      case "Yellow": Hero["YellowKey"] -= Val; break;
		      case "Blue": Hero["BlueKey"] -= Val; break;
		      case "Red": Hero["RedKey"] -= Val; break;
		      case "Green": GreenKey -= Val; break;
		      case "Iron": Hero["IronKey"] -= Val; break;
		    }
		    UpdateProperty();
		  }
		  
		  e.AddHP = function(Val){
		    Hero["HP"] += Val;
		    UpdateProperty();
		  }
		  
		  e.ReduceHP = function(Val){
		    if(Val > Hero["HP"]){
		      Hero["HP"] = 0;
		  			UpdateProperty();
		  			Map.DrawGameOver(function(){});
		      return;
		    }
		    Hero["HP"] -= Val;
		    UpdateProperty();
		  }
		  
		  e.AddATK = function(Val){
		    Hero["ATK"] += Val;
		    UpdateProperty();
		  }
		  
		  e.ReduceATK = function(Val){
		    Hero["ATK"] -= Val;
		    UpdateProperty();
		  }
		  
		  e.AddDEF = function(Val){
		    Hero["DEF"] += Val;
		    UpdateProperty();
		  }
		  
		  e.ReduceDEF = function(Val){
		    Hero["DEF"] -= Val;
		    UpdateProperty();
		  }
		  
		  e.AddGold = function(Val){
		    Hero["Gold"] += Val;
		    UpdateProperty();
		  }
		  
		  e.ReduceGold = function(Val){
		    Hero["Gold"] -= Val;
		    UpdateProperty();
		  }
		  
		  e.AddExp = function(Val){
		    Hero["Exp"] += Val;
		    UpdateProperty();
		  }
		  
		  e.ReduceExp = function(Val){
		    Hero["Exp"] -= Val;
		    UpdateProperty();
		  }
		  
		  e.AddItem = function(Type,ID,X,Y){
		    var ItemEventData = Map.Maps[Floor][2].Item;
		    var ItemData = ItemSet.GetData("All",Type);
					Map.DrawMessage(ItemData,"Item");
					eval("Event." + ItemData[5] + ";");
					e.RemoveEvent("Item",ID,X,Y);
		  }
		  
		  e.AddEnemy = function(ID,EnemyID,X,Y,EventID1,EventID2,EventID3,_Floor){
		    IconData = Map.Icons.GetData("Enemy",EnemyID);
		    if(TestNull(_Floor)){
		      
		    }
		    else{
		      if(TestNull(EventID1)){
		        Map.Maps[Floor][2].Enemy.push([ID,EnemyID,X,Y,EventID1,EventID2,EventID3]);
		      }
		      else{
		        Map.Maps[Floor][2].Enemy.push([ID,EnemyID,X,Y]);
		      }
		      EnemyLocation.push([ID,EnemyID,X,Y]);
		      Map.DrawEnemy(ID,EnemyID,X,Y,IconData);
		    }
		  }
		  
		  e.GetItem = function(Type){
		    var ItemData = ItemSet.GetData("All",Type);
					Map.DrawMessage(ItemData,"Item");
		  }
		  
		  e.AddTool = function(Type,Val){
		    if(!TestNull(Val)){
		      Val = 1;
		    }
		    if(Val >= 0){
		      ToolsData[Type][4] += Val;
		    }
		    else{
		      ToolsData[Type][4] = Val;
		    }
		  }
		  
		  e.AddDragon = function(){
		    e.AddTool("Dragon",-1);
		  }
		  
		  e.AddEnemyBook = function(){
		    e.AddTool("EnemyBook",-1);
		    e.Enable("EnemyBookButton");
		    e.Enable("EnemyBook");
		  }
		  
		  e.AddGoFloor = function(){
		    e.AddTool("GoFloor1",-1);
		  	  e.Enable("GoFloorButton");
		  	  e.Enable("GoFloor");
		  }
		  
		  e.AddHolyWater = function(){
		    e.AddTool("HolyWater");
		  }
		  
		  e.AddIce = function(){
		    e.AddTool("Ice",-1);
		    e.Enable("LockIceButton");
		  }
		  
		  e.AddPickaxe = function(){
		    e.AddTool("Pickaxe");
		  }
		  
		  e.AddDownFloor = function(){
		    e.AddTool("DownFloor");
		  }
		  
		  e.RemoveDoor = function(X,Y){
		    var DoorEventData = MapsData[Floor][2].Door;	
		    for(var d = 0;d < DoorEventData.length;d++){
		      if(DoorEventData[d][1] == X && DoorEventData[d][2] == Y){
		        var DoorType = DoorEventData[d][0];
		        DoorEventData.splice(d,1);
		        DoorLocation.splice(d,1);
		        return DoorType;
		      }
		    }
		  }
		  
		  e.RunEvent = function(EventID,callback){
		    Flag.Event(EventID,Map,Event,HeroLocation,Floor,function(){
		      if(TestNull(callback)){
		        callback();
		      }
		    });
		  }
		  
		  e.OpenDoor = function(DoorEventData,X,Y){
			    var KeyColor;
			    switch(DoorEventData[0]){
			      case 0:
			        if(TestNull(DoorEventData[3]) && DoorEventData[3] == 1){
			          Map.DrawMessage("被一种未知力量所封印","Tip");
			          return false;
			        }
			        else if(Hero["YellowKey"] > 0){
			          Event.ReduceKey("Yellow",1);
			          Map.DoorOpen(X,Y);    
			          return false;
			        }
			        else{
			          KeyColor = "黄";
			        }
			      break;
			      case 1:
			        if(TestNull(DoorEventData[3]) && DoorEventData[3] == 1){
			          Map.DrawMessage("被一种未知力量所封印","Tip");
			          return false;
			        }
			        else if(Hero["BlueKey"] > 0){
			          Event.ReduceKey("Blue",1);
			          Map.DoorOpen(X,Y);
			          return false;
			        }
			        else{
			          KeyColor = "蓝";
			        }
			      break;
			      case 2:
			        if(TestNull(DoorEventData[3]) && DoorEventData[3] == 1){
			          Map.DrawMessage("被一种未知力量所封印","Tip");
			          return false;
			        }
			        else if(Hero["RedKey"] > 0){
			          Event.ReduceKey("Red",1);
			          Map.DoorOpen(X,Y);      
			          return false;
			        }
			        else{
			          KeyColor = "红";
			        }
			      break;
			      case 3:
			        if(TestNull(DoorEventData[3]) && DoorEventData[3] == 1){
			          Map.DrawMessage("被一种未知力量所封印","Tip");
			          return false;
			        }
			        else if(true){
			          Map.DoorOpen(X,Y);			 
			          return false;
			        }
			        else{
			          Map.DrawMessage("被一种未知力量所封印","Tip");
			          return false;
			        }
			      break;
			      case 5:
			      case 6:
			      case 12:
			      case 13:
			      case 14:
			      case 15:
			        if(TestNull(DoorEventData[3]) && DoorEventData[3] == 1){
			          return false;
			        }
			        else if(true){
			          Map.DoorOpen(X,Y);     
			          return false;
			        }
			        else{
			          Map.DrawMessage("这面墙好像有些不一样","Tip");
			          return false;
			        }
			      break;
			      case 7:
			        if(TestNull(DoorEventData[3]) && DoorEventData[3] == 1){
			          return false;
			        }
			        else if(Hero["IronKey"] > 0){
			          Event.ReduceKey("Iron",1);
			          Map.DoorOpen(X,Y);      
			          return false;
			        }
			        else{
			          KeyColor = "铁";
			        }
			      break;
			      case 15:
			        return false;
			      break;
			    }
			    Map.DrawMessage("没有足够的" +KeyColor+ "钥匙","Tip");
			    return false;
		  }
		  
		  e.AddDoor = function(DoorType,X,Y,Pass){
		    (Map.Maps[Floor][2].Door).push([DoorType,X,Y,Pass]);
		    DoorLocation.push([DoorType,X,Y]);
		  }
		  
		  e.RemoveEventID = function(Type,ID){
		    var MapEventData = MapsData[Floor][2];
		    var EventData = eval("MapEventData." + Type);
		    for(var i = 0;i < EventData.length;i++){
		      if(EventData[i][0] == ID && TestNull(EventData[i][4])){
		        EventData[i].splice(4,1);	        
		      }
		    }
		  }
		  
		  e.DisableEvent = function(EventFloor,EventType,ID,Type){
		    if(EventFloor == "Now"){
		      EventFloor = Floor;
		    }
		    var MapEventData = Map.Maps[EventFloor][2];
		    var EventData = MapEventData[EventType];
		    for(var i = 0;i < EventData.length;i++){
		      if(EventData[i][0] == ID){
		        EventData[i].splice(Type,1,-1);
		      }
		    }
		  }
		  
		  e.RemoveAnimate = function(Type,X,Y){
		    var Exist;
		    var AnimateData = Map.Maps[Floor][2].Animate;
		    for(var a = 0;a < GlobalAnimate.length;a++){
		      if(GlobalAnimate[a][0][1] == "Animate" && GlobalAnimate[a][2] == Type && GlobalAnimate[a][3] == X && GlobalAnimate[a][4] == Y){
		        GlobalAnimate.splice(a,1);
		        for(var l = 0;l < NoPassLocation.length;l++){
		          if(NoPassLocation[l][0] == X && NoPassLocation[l][1] == Y){
		            Map.ClearMap(Map.Event,X * 32,Y * 32,32,32);
		            NoPassLocation.splice(l,1);
		          }
		        }
		        for(var i = 0;i < AnimateData.length;i++){
		          if(typeof(AnimateData[i]) == "string" && AnimateData[i].split("-")[0] == Type){
		            Exist = true;
		          }
		          else if(Exist){
		            if(AnimateData[i][0] == X && AnimateData[i][1] == Y){
		              AnimateData.splice(i,1);
		              return true;
		            }
		          }
		        }
		      }
		    }
		    return false;
		  }
		  
		  e.RemoveEvent = function(Type,ID,X,Y){
		    var MapEventData = Map.Maps[Floor][2];
		    var EventData = MapEventData[Type];
		    //清除事件
		    for(var v = 0;v < EventData.length;v++){
		      if(EventData[v][0] == ID){
		        EventData.splice(v,1);	        
		      }
		    }
		    //清除动画
		    for(var a = 0;a < GlobalAnimate.length;a++){
		      if(GlobalAnimate[a][0][0] == ID && GlobalAnimate[a][0][1] == Type){
		        GlobalAnimate.splice(a,1);
		      }
		    }
		    //清除坐标
		    for(var l = 0;l < eval(Type + "Location.length");l++){
		      if(eval(Type + "Location[" +l+ "][0]") == ID){
		        Map.ClearMap(Map.Event,X * 32,Y * 32,32,32);
		        eval(Type + "Location.splice(" +l+ ",1);");
		      }
		    }
		  }
		  
		  e.StartBattle = function(EnemyData){
		    
		  }
		  
		  e.OpenBattle = function(EnemyData){
		  	if(Flag.Battle){
		  	  Map.DrawMessage("战斗未完成，你发现了bug","Tip");
		  		return;
		  	}
		  	e.Disable("Controller");
		  	e.Disable("ChangeHead");
		  	e.Enable("Battle");
		  	if(Flag.BattleAnimate){
		  		 e.StartBattle(EnemyData);
		  	}
		  	else{
		  		_EnemyData = e.Enemys.GetData("All",EnemyData[1]);
		  		var Damage = e.getDamage(_EnemyData[0],_EnemyData[7],Hero["ATK"],Hero["DEF"],_EnemyData[2],_EnemyData[3],_EnemyData[4]);
		  		if(Hero["HP"] > Damage){
		  			Hero["HP"] -= Damage;
		  			Hero["Gold"] += _EnemyData[5];
		  			Hero["Exp"] += _EnemyData[6];
		  			UpdateProperty();
		  			Map.DrawMessage("获得" + _EnemyData[5] + "金币 " + _EnemyData[6] + "经验","Tip");
		  			e.Enable("Controller");
		  			e.Disable("Battle");
		  			e.Enable("ChangeHead");
		  			if(TestNull(EnemyData[5]) && EnemyData[5] != -1){
		  			  e.RemoveEvent("Enemy",EnemyData[0],EnemyData[2],EnemyData[3]); 			    e.RunEvent(EnemyData[5],function(){
		  			    
		  			    return;
		  			  });
		  			}
		  			e.RemoveEvent("Enemy",EnemyData[0],EnemyData[2],EnemyData[3]);
		  		}
		  		else {
		  			Hero["HP"] = 0;
		  			UpdateProperty();
		  			if(TestNull(EnemyData[6]) && EnemyData[6] != -1){
		  			    e.RunEvent(EnemyData[6],function(){
		  			    e.Disable("Battle");
		  			    e.Disable("ToolsPanel");
		  			    Map.DrawGameOver(function(){
		  				    location.reload();
		  			    });
		  			  });
		  			}
		  			else{
		  			  e.Disable("Battle");
		  			  e.Disable("ToolsPanel");
		  			  Map.DrawGameOver(function(){
		  				  location.reload();
		  			  });
		  			}
		  		}
		  	}
		  }
		  
		  e.getDamage = function(ID,SkillData,ATK,DEF,EnemyHP,EnemyATK,EnemyDEF){
		     var Temp = SkillData.split("&");
		     var SkillType = parseInt(Temp[0]);
		     var SkillVal;
		     if(TestNull(Temp[1])){
		       SkillVal = Temp[1].split("|");
		     }
		  	  var Damage = 0;
		  	  var MC = false;
		  	  var First = false;
		  	  var Combo = 1;
		  	  var SpecialDamage = 0;
		  	  if(ID > 38 && ID < 48 && ToolsData["Dragon"][4] == -1){
		        ATK = ATK * 2;
		     }
		  	  var Temp1 = Math.ceil(EnemyHP/(ATK - EnemyDEF));
		  	  switch(SkillType){
		  	  	  case 1:
		  	  	  	First = true;
		  	  	  break;
		  	  	  case 2:
		  	  	  	Combo = parseInt(SkillVal[0]);
		  	  	  break;
		  	  	  case 3:
		  	  	  	SpecialDamage = Math.floor((Hero["HP"] * parseFloat(SkillVal[0])));
		  	  	  break;
		  	  	  case 4:
		  	  	  	MC = true;
		  	  	  break;
		  	  	  case 5:
		  	  	    if(Hero["ATK"] > EnemyATK){
		  	  	      EnemyATK = ATK;
		  	  	    }
		  	  	  break;
		  	  }
		  	  DamageTemp = SpecialDamage + (Combo * ((First)?(Temp1):(Temp1 - 1))) * ((EnemyATK - ((MC)?(0):(DEF)) < 0)?(0):(EnemyATK - ((MC)?(0):(DEF))));
		  	  if(ATK <= EnemyDEF && (SkillType == 1)){
		  	  	 Damage = 9999999;
		  	  }
		  	  else if(ATK <= EnemyDEF){
		  	    Damage = 9999999;
		  	  }
		  	  else if(DamageTemp < 0){
		  	  	 Damage = 9999999;
		  	  }
		  	  else if((SkillType != 4 && SkillType != 3) && (EnemyATK < DEF || (ATK > (EnemyDEF + EnemyHP)) && (SkillType != 1))){
		  	  	 Damage = 0;
		  	  }
		  	  else{
		  	  	  Damage = DamageTemp;
		  	  }
		      return Damage;
		  }
		  
		  //打开楼层传送器
		  e.OpenGoFloor = function(Type){
		    if(Flag.DisableGoFloor || Flag.ShowStorePanel || Flag.SL || Flag.Battle || Flag.ShowToolsPanel || Flag.ShowSettingPanel || Flag.ShowEnemyBook || Flag.ShowHelpPanel){
		      return;
		    }
		    if(e.TestNo("GoFloor")){
		      Map.DrawMessage("传送权杖的法力似乎消失了...","Tip");
		      return;
		    }
		    Flag.Move = false;
		    e.LockMove();
		    e.Disable("SL");
		    e.Disable("ChangeHead");
		    if(TestNull(Type)){
		      Map.DrawGoFloorPanel(Type);
		    }
		    else{
		      NowFloor = Map.Maps[Floor][2].Floor;
		      Map.DrawGoFloorPanel();
		    }
		  }
		  
		  e.CloseGoFloor = function(){
		    if(!Flag.ShowGoFloor){
		      return;
		    }
		    Flag.ShowGoFloor = false;
		    Map.ClearMap(Map.UI);
		    Map.ClearMap(Map.Data);
		    e.UnlockMove();
		    e.Enable("SL");
		    e.Enable("ChangeHead");
		  }
		  
		  e.GoToFloor = function(ToFloor){
		    var NowFloor = Map.Maps[Floor][2].Floor;
		    if(ToFloor == NowFloor){
		      e.CloseGoFloor();
		      Map.DrawMessage("已在该楼层，不能传送","Tip");
		      return;
		    }
		    var FloorIndex = Event.FindFloor(ToFloor);
		    if(FloorIndex === false){
		      return false;
		    }
		    FloorData = Map.Maps[FloorIndex][2];
		    var FloorName = FloorData.Name;
		    var StairData;
		    var StairsData = FloorData.Stair;
		    var Type = (ToFloor > NowFloor)?("Up"):("Down");
		    if(StairsData.length == 1){
		      StairData = StairsData[0];
		    }
		    else{
		      for(var s = 0;s < StairsData.length;s++){
		        if(Type == "Up" && StairsData[s][7] == 0){
		          StairData = StairsData[s];
		        }
		        else if(Type == "Down" && StairsData[s][7] == 1){
		          StairData = StairsData[s];
		        }
		      }
		    }
		    var ToX = StairData[1];
		    var ToY = StairData[2];
		    var ToHead = 2;
		    e.CloseGoFloor();
		    e.JumpFloor(FloorName,FloorIndex,ToHead,ToX,ToY);
		    return true;
		  }
		  
		  //打开怪物图鉴
		  e.OpenEnemyBook = function(Type){
		    if(Flag.ShowStorePanel || Flag.SL || Flag.Battle || Flag.DisableEnemyBook || Flag.ShowToolsPanel || Flag.ShowSettingPanel || Flag.ShowGoFloor || Flag.ShowGetItemPanel || Flag.ShowHelpPanel){
		      return;
		    }
		    if(e.TestNo("EnemyBook")){
		      Map.DrawMessage("怪物图鉴变得一片空白...","Tip");
		      return;
		    }
		    if(!TestNull(Type)){
		      EnemyPage = 0;
		      Type = "Now";
		    }
		    clearInterval(MessageInTimer);
       		clearTimeout(WaitOut);
       		clearInterval(MessageOutTimer);
       		clearInterval(FloorTipTimer);
       		clearTimeout(FloorTipOut);
		    e.LockMove();
		    e.Disable("SL");
		    e.Disable("ChangeHead");
		    Flag.ShowEnemyBook = true;
		    var AllEnemy = Map.Maps[Floor][2].Enemy;
		    var EnemyData;
		    var SkillData;
		    var Damage;
		    var PageNum = 0;
		    var EnemyListTemp = [];
		    var EnemyList = [[]];
		    for(var i = 0;i < AllEnemy.length;i++){
		      var Exist = false;
		      EnemyData = e.Enemys.GetData("All",AllEnemy[i][1]);

		      for(var l = 0;l <  EnemyListTemp.length;l++){
		        if(EnemyListTemp[l][0] == EnemyData[0]){
		          Exist = true;
		          break;
		        }
		      }
		      if(!Exist){
		        var SkillType = (EnemyData[7].split("&"))[0];
		        SkillData = e.Enemys.GetData("Skill",parseInt(SkillType));
		        if(EnemyData[7] == "5" && Hero["ATK"] > EnemyData[3]){
		          EnemyData[3] = Hero["ATK"];
		        }
		        Damage = e.getDamage(EnemyData[0],EnemyData[7],Hero["ATK"],Hero["DEF"],EnemyData[2],EnemyData[3],EnemyData[4]);
		        EnemyData[8] = Damage;
		        EnemyData[9] = SkillData;
		        EnemyListTemp.push(EnemyData);
		      }
		    }
		    EnemyListTemp.sort(function(a,b){
		      var SortTemp = 1;
		      if(a[8] < 9999999){
		        SortTemp = a[8] - b[8];
		      }
		      else{
		        SortTemp = a[4] - b[4];
		      }
		      if(b[8] == 0){
		      	 if(a[5] == b[5]){
		      	 	SortTemp = a[6] - b[6];
		      	 }
		      	 else{
		      	 	 SortTemp = a[5] - b[5];
		      	 }
		      }
		      return SortTemp;
		    });
		    for(var t = 0;t < EnemyListTemp.length;t++){
		      EnemyList[PageNum].push(EnemyListTemp[t]);
		      if(EnemyList[PageNum].length == 6){
		          PageNum++;
		          EnemyList.push([]);
		      }
		    }
		    
		    var Page = (Type == "Now")?EnemyPage:(Type == "Last")?(EnemyPage - 1):(EnemyPage + 1);
		    if(TestNull(EnemyList[Page]) && TestNull(EnemyList[Page][0])){
		      EnemyPage = Page;
		      Map.DrawEnemyBox(EnemyList,EnemyPage);
		    }
		    else{
		      Map.DrawEnemyBox(EnemyList,EnemyPage);
		    }
		  }
		  
		  e.CloseEnemyBook = function(){
		    if(!Flag.ShowEnemyBook){
		      return;
		    }
		    e.UnlockMove();
		    e.Enable("SL");
		    e.Enable("ChangeHead");
		    Flag.ShowEnemyBook = false;
		    clearInterval(EnemyBookAnimate);
		    Map.ClearMap(Map.Data);
		    Map.ClearMap(Map.UI);
		  }
		  
		  e.OpenToolsPanel = function(ToolChoose){
		    if(Flag.ShowStorePanel || Flag.SL || Flag.Battle || Flag.ShowSettingPanel || Flag.ShowGoFloor || Flag.ShowEnemyBook || Flag.ShowGetItemPanel || Flag.ShowHelpPanel){
		      return;
		    }
		    if(e.TestNo("Tool")){
		      Map.DrawMessage("你的道具都失去了法力...","Tip");
		      return;
		    }
		    var Exist = true;
		    Flag.ShowToolsPanel = true;
		    e.LockMove();
		    clearInterval(MessageInTimer);
     		clearTimeout(WaitOut);
     		clearInterval(MessageOutTimer);
     		clearInterval(FloorTipTimer);
     		clearTimeout(FloorTipOut);
     		e.Disable("ChangeHead");
     		var ToolList = [[],[]];
     		var Temp;
     		for(var t in ToolsData){
     		  if(ToolsData[t][4] > 0){
     		    ToolList[0].push([t,ToolsData[t]]);
     		    if(TestNull(ToolList[0][ToolChoose])){
     		      Temp = ToolList[0][ToolChoose];
     		    }
     		  }
     		  else if(ToolsData[t][4] == -1){
     		    ToolList[1].push([t,ToolsData[t]]);
     		    if(TestNull(ToolList[1][ToolChoose - 12])){
     		      Temp = ToolList[1][ToolChoose - 12];
     		    }
     		  }
     		}
     		if(TestNull(ToolChoose)){
     			Map.DrawToolPanel(ToolList,ToolChoose);
     			if(!TestNull(ToolList[0][ToolChoose]) && !TestNull(ToolList[1][ToolChoose - 12])){
     			  return false;
     			}
     			return Temp;
     		}
		    Map.DrawToolPanel(ToolList);
		  }
		  
		  e.CloseToolsPanel = function(){
		    if(!Flag.ShowToolsPanel){
		      return;
		    }
		    Flag.ShowToolsPanel = false;
		    Map.ClearMap(Map.Data);
		    Map.ClearMap(Map.UI);
		    e.UnlockMove();
		    e.Enable("ChangeHead");
		  }
		  
		  e.UseTool = function(ToolName){
		    if(ToolsData[ToolName][4] == 0){
		      return;
		    }
		    e[ToolName]();
		  }
		  
		  e.Pickaxe = function(){
		    var HeadData = getHeadXY();
		    X = HeadData[1];
		    Y = HeadData[2];
		    e.CloseToolsPanel();
		    e.RemoveWall(X,Y,"Wall");
		  }
		  
		  e.EarthQuake = function(){
		    e.CloseToolsPanel();
		    e.RemoveWall(null,null,"All");
		  }
		  
		  e.UpFloor = function(){
		    e.CloseToolsPanel();
		    var ToFloor = Map.Maps[Floor][2].Floor;
		    if(e.GoToFloor(++ToFloor)){
		      ToolsData["UpFloor"][4]--;
		    }
		    else{
		      Map.DrawMessage("无法再上楼了","Tip");
		    }
		  }
		  
		  e.DownFloor = function(){
		    e.CloseToolsPanel();
		    var ToFloor = Map.Maps[Floor][2].Floor;
		    if(e.GoToFloor(--ToFloor)){
		      ToolsData["DownFloor"][4]--;
		    }
		    else{
		      Map.DrawMessage("无法再下楼了","Tip");
		    }
		  }
		  
		  e.Fly = function(){
		    e.CloseToolsPanel();
		    var X = 10 - HeroLocation[1];
		    var Y = 10 - HeroLocation[2];
		    if(X == HeroLocation[1] && Y == HeroLocation[2]){
		      Map.DrawMessage("你正处于地图中心，无法使用","Tip");
		      return;
		    }
		    if(EventTrigger(X,Y,"Fly") == "Exist"){
		      Map.DrawMessage("与当前位置中心对称的位置不是空地","Tip");
		      Flag.RunOver = false;
		      return;
		    }
		    Flag.RunOver = false;
		    Map.ClearMap(Map.Fg,HeroLocation[1] * 32,HeroLocation[2] * 32,32,32);
		    HeroLocation[1] = X;
		    HeroLocation[2] = Y;
		    Map.Fg.drawImage(Map.Res["Hero"],HeroIconData[HeroLocation[0]][0][1],HeroIconData[HeroLocation[0]][0][2],32,32,X * 32,Y * 32,32,32);
		    ToolsData["Fly"][4]--;
		  }
		  
		  e.HolyWater = function(){
		    e.CloseToolsPanel();
		    e.AddHP(Hero["HP"]);
		    ToolsData["HolyWater"][4]--;
		    Map.DrawMessage("使用了圣水，生命值加倍","Tip");
		  }
		  
		  e.Boom = function(){
		    var Exist = false;
		    var X,Y,HeadData;
		    var _EnemyData = Map.Maps[Floor][2].Enemy;
		    e.CloseToolsPanel();
		    HeadData = getHeadXY(HeroLocation[0]);
		    X = HeadData[1];
		    Y = HeadData[2];
		    for(var m = 0;m < _EnemyData.length;m++){
		      if(X == _EnemyData[m][2] && Y == _EnemyData[m][3]){
		        Exist = true;
		        var _Gold = EnemyData.All[_EnemyData[m][1]][5];
		        //var _Exp = EnemyData.All[_EnemyData[m][1]][6];
		        Map.DrawMessage("怪物掉落了" + _Gold + "金币","Tip");
		        e.AddGold(_Gold);
		        //e.AddExp(_Exp);
		        e.RemoveEvent("Enemy",_EnemyData[m][0],_EnemyData[m][2],_EnemyData[m][3]);
		        ToolsData["Boom"][4]--;
		      }
		    }
		    if(!Exist){
		      Map.DrawMessage("此位置不能使用炸弹","Tip");
		    }
		  }
		  
		  e.ChangeHead = function(){
		    var Head;
		    switch(HeroLocation[0]){
		      case 0: Head = HeroLocation[0] = 3; break;
		      case 1: Head = HeroLocation[0] = 0; break;
		      case 2: Head = HeroLocation[0] = 1; break;
		      case 3: Head = HeroLocation[0] = 2; break;
		    }
		    var X = HeroLocation[1] * 32;
		    var Y = HeroLocation[2] * 32;
		    Map.ClearMap(Map.Fg,X,Y,32,32);
		    Map.Fg.drawImage(Map.Res["Hero"],HeroIconData[Head][0][1],HeroIconData[Head][0][2],32,32,X,Y,32,32);
		    return Head;
		  }
		  
		  e.Door = function(){
		    var HeadData = getHeadXY();
		    X = HeadData[1];
		    Y = HeadData[2];
		    var WallData = Map.Maps[Floor][1];
		    e.CloseToolsPanel();
		    if(e.RemoveWall(X,Y,"Door")){
		      Map.DoorClose(0,X,Y,0,null,true);
		      ToolsData["Door"][4]--;
		    }
		  }
		  
		  e.EnemyBook = function(){
       e.CloseToolsPanel();
       e.OpenEnemyBook();
		  }
		  
		  e.GoFloor1 = function(){
		    e.CloseToolsPanel();
		    e.OpenGoFloor();
		  }
		  
		  e.Ice = function(){
		    if(Flag.LockIceButton){
		      return;
		    }
		    e.CloseToolsPanel();
		    var HeadData,X,Y,Exist;
		    for(var i = 0;i < 4;i++){
		      HeadData = getHeadXY(i);
		      X = HeadData[1];
		      Y = HeadData[2];
		      if(e.RemoveAnimate("Lava",X,Y)){
		        Exist = true;
		      }
		    }
		    if(!Exist){
		      Map.DrawMessage("所在位置周围不存在岩浆","Tip");
		    }
		  }
		  
		  e.Crucifix = function(){
		  	  return;
		  }
		  
		  e.RemoveWall = function(X,Y,Type){
		    var TypeList = [0,5,6];
		    var Exist = false;
		    var Num = 0;
		    var WallData = Map.Maps[Floor][1];
		    if(Type == "All" || Type == "All&0"){
		      for(var w = 0;w < WallData.length;w++){
		        if((WallData[w][0] == 1 || WallData[w][0] == 2) && WallData[w][3] != 1 && WallData[w][3] != 3){
		          for(var n = 0;n < NoPassLocation.length;n++){
		            if(NoPassLocation[n][0] == WallData[w][1] && NoPassLocation[n][1] == WallData[w][2]){
		                      Map.WallOpen(TypeList[WallData[w][0]],WallData[w][1],WallData[w][2]);
		              NoPassLocation.splice(n,1);
		              break;
		            }
		          }
		          Num++;
		          Map.Maps[Floor][1].splice(w,1);
		          w--;
		        }
		      }
		      if(Num == 0){
		        Map.DrawMessage("这一层已经没有可破坏的墙了","Tip");
		        return;
		      }
		      Vibrate(300);
		      if(Type == "All&0"){
		        return;
		      }
		      ToolsData["EarthQuake"][4]--;
		      return;
		    }
		    for(var w = 0;w < WallData.length;w++){
		      if(WallData[w][1] == X && WallData[w][2] == Y && (WallData[w][0] == 1 || WallData[w][0] == 2)){
		        if(WallData[w][3] == 1 && Type == "Wall"){
		          Map.DrawMessage("这面墙非常坚固！","Tip");
		          return;
		        }
		        for(var n = 0;n < NoPassLocation.length;n++){
		          if(NoPassLocation[n][0] == X && NoPassLocation[n][1] == Y){
		            Exist = true;
		            if(Type == "Wall" && WallData[w][3] != 3){
		              Map.WallOpen(TypeList[WallData[w][0]],X,Y);
		            }
		            else if(Type == "Door" && (WallData[w][3] == 2 || WallData[w][3] == 3)){
		                Map.ClearMap(Map.Fg,X * 32,Y * 32,32,32);
		            }
		            else{
		              Exist = false;
		              break;
		            }
		            Map.Maps[Floor][1].splice(w,1);
		            NoPassLocation.splice(n,1);
		            if(Type == "Wall"){
		              ToolsData["Pickaxe"][4]--;
		            }
		          }
		        }
		      }
		    }
		    if(!Exist){
		      switch(Type){
		        case "Wall":
		          Map.DrawMessage("此处不能使用破墙镐","Tip");
		        break;
		        case "Door":
		          Map.DrawMessage("此处不能使用随意门","Tip");
		          return false;
		        break;
		      }
		    }
		    return true;
		  }
		  
		  e.OpenSettingPanel = function(){
		    Flag.ShowSettingPanel = true;
		    e.Disable("EnemyBook");
		    e.Disable("GoFloor");
		    e.Disable("ToolsPanel");
		    e.Disable("SL");
		    e.Disable("ChangeHead");
		    //Map.DrawSettingPanel();
		  }
		  
		  e.CloseSettingPanel = function(){
		    Flag.ShowSettingPanel = false;
		    e.Enable("EnemyBook");
		    e.Enable("GoFloor");
		    e.Enable("ToolsPanel");
		    e.Enable("ChangeHead");
		    e.Enable("SL");
		    alert("关闭设置(测试)");
		  }
		  
		  e.CloseGetItemPanel = function(){
		    Flag.ShowGetItemPanel = false;
		    e.Enable("SL");
      	e.Enable("EnemyBook");
		    e.Enable("Controller");
		    e.Enable("ChangeHead");
		    Map.ClearMap(Map.UI);
		  }
		  
		  e.SaveGame = function(Choose,callback){
		    if(Flag.SL || Flag.Battle){
		      return;
		    }
		    if(window.localStorage){
		      if(!Flag.GameSL){
		        Map.DrawMessage("当前不能存档","Tip");
		        if(TestNull(callback)){
		          callback();
		          return;
		        }
		      }
		      var NowDate = new Date();
		      var DateStr = NowDate.getFullYear()+"-"+((String(NowDate.getMonth()).length == 1)?("0"+NowDate.getMonth()):(NowDate.getMonth()))+"-"+((String(NowDate.getDate()).length == 1)?("0"+NowDate.getDate()):(NowDate.getDate()))+" "+((String(NowDate.getHours()).length == 1)?("0"+NowDate.getHours()):(NowDate.getHours()))+":"+((String(NowDate.getMinutes()).length == 1)?("0"+NowDate.getMinutes()):(NowDate.getMinutes()));
		      var SaveData = {"HeroName": Hero["Name"],"Floor":Floor,"HP":Hero["HP"],"ATK":Hero["ATK"],"DEF":Hero["DEF"],"Gold":Hero["Gold"],"Exp":Hero["Exp"],
		      "PayGold":Hero["PayGold"],"YellowKey":Hero["YellowKey"],"BlueKey":Hero["BlueKey"],"RedKey":Hero["RedKey"],"IronKey":Hero["IronKey"],"HeroLocation":HeroLocation,
		  "MapsData":Map.Maps,"Flag":Flag,"ToolPanelChoose":ToolPanelChoose,"ToolsData":ToolsData,"Zoom":Zoom,"Version":Version,"Date":DateStr};
		      var SaveDataJSON = JSON.stringify(SaveData);
		      localStorage.setItem("MotaData" + Choose,SaveDataJSON);
		      Map.DrawMessage("存档完毕","Tip");
		      if(TestNull(callback)){
		        callback(true);
		      }
		    }
		    else{
		      Map.DrawMessage("当前浏览器不支持存档","Tip");
		      if(TestNull(callback)){
		        callback(false);
		        return;
		      }
		    }
	  	}
		  
		  e.LoadGame = function(Choose,callback){
		    if(Flag.SL || Flag.Battle){
		      return;
		    }
		    if(window.localStorage){
		      if(!Flag.GameSL){
		        Map.DrawMessage("当前不能读档","Tip");
		        callback();
		        return;
		      }
			  if(localStorage.getItem("MotaData" + Choose)){
			  		var SaveData = JSON.parse(localStorage.getItem("MotaData" + Choose));		    
			  		    if(Version != SaveData.Version){
			  		      if(!confirm("此存档版本("+SaveData.Version+")与当前游戏版本("+Version+")不同，读取后可能引发未知的后果，是否读档？")) {  
                return;
              }
			  		    }
          		Hero["Name"] = SaveData.HeroName;
		       		Floor = SaveData.Floor; //当前楼层
		       		Hero["HP"] = SaveData.HP;
		       		Hero["ATK"] = SaveData.ATK;
		       		Hero["DEF"] = SaveData.DEF;
		       		Hero["Gold"] = SaveData.Gold;
		       		Hero["Exp"] = SaveData.Exp;
		       		Hero["YellowKey"] = SaveData.YellowKey;
		       		Hero["BlueKey"] = SaveData.BlueKey;
		       		Hero["RedKey"] = SaveData.RedKey;
		       		Hero["IronKey"] = SaveData.IronKey;
		       		Hero["PayGold"] = SaveData.PayGold;
		       		HeroLocation = SaveData.HeroLocation;
		       		    for(var i in Flag){
          	   		  if(TestNull(SaveData.Flag[i]) && i != "Event"){
          	   		    Flag[i] = SaveData.Flag[i];
          	   		  }
          	   		}
          	   		ToolPanelChoose = SaveData.ToolPanelChoose;
          	   		ToolsData = SaveData.ToolsData;
          	   		Zoom = SaveData.Zoom;
          	   		GameGroup.style.zoom = Zoom;
          	   		ZoomBox.value = Zoom;
          	   		MapsData = SaveData.MapsData;
          	   		Map.Maps = SaveData.MapsData;
		       		var FloorName = Map.Maps[Floor][2].Name;
		       		Event.JumpFloor(FloorName,Floor,HeroLocation[0],HeroLocation[1],HeroLocation[2]);
           	   		Map.DrawMessage("读档成功","Tip");
           	   		if(TestNull(callback)){
		       	    	callback(true);
		        		return;
		       		}
		      	}
		      	else{
		        	Map.DrawMessage("该存档为空","Tip");
		        	if(TestNull(callback)){
		        	  callback(false);
		        	  return;
		        	}
		      	}
		    }
		    else{
		    	Map.DrawMessage("当前浏览器不支持读档","Tip");
		    	if(TestNull(callback)){
		        	callback(false);
		        	return;
		      	}
		    }
		  }
		  
		  e.OpenSL = function(Type,callback){
		  	if(Flag.SL){
		      e.CloseSL();
		      return;
		    }
		    if(Flag.LockController || Flag.LockMove || Flag.JumpFloor || Flag.ShowMessage || Flag.ShowEnemyBook || Flag.ShowStorePanel || !Flag.GameSL || Flag.Battle || Flag.ShowHelpPanel){
		       return;
		    }
		    SLMode = Type;
		    SLPanelChoose = 1;
		    e.Enable("SLPanel");
		    e.Disable("ChangeHead");
		    Map.DrawSelectBox("SLBox","'"+ SLMode +"'");
		    if(TestNull(callback)){
		    	callback();
			}
		  }
		  
		  e.CloseSL = function(){
		    e.Disable("SLPanel");
		    Map.ClearMap(Map.UI);
		    Map.ClearMap(Map.Data);
		    e.UnlockMove();
		    e.Enable("Controller");
		    e.Enable("ChangeHead");
		  }
		  
		  e.LockMove = function(){
		    Flag.LockMove = true;
		  }
		  
		  e.UnlockMove = function(){
		    Flag.LockMove = false;
		  }
		  
		  e.RemoveAllSave = function(){
		  	localStorage.removeItem("MotaData1");
		    localStorage.removeItem("MotaData2");
		    localStorage.removeItem("MotaData3");
		    localStorage.removeItem("MotaData4");
		    e.CloseSL();
		    Map.DrawMessage("已清空存档","Tip");
		  }
		  
		  e.Enable = function(Obj){
		    switch(Obj){
		      case "EnemyBook":
		        Flag.LockEnemyBookButton = false;
		      break;
		      case "GoFloor":
		        Flag.LockGoFloorButton = false;
		      break;
		      case "ToolsPanel":
		        Flag.LockToolsButton = false;
		      break;
		      case "SettingPanel":
		        Flag.LockSettingButton = false;
		      break;
		      case "EnemyBookButton":
		        Flag.DisableEnemyBook = false;
		        EnemyBookButton.style.cssText = "filter:grayscale(0%);-webkit-filter:grayscale(0%);-moz-filter:grayscale(0%);-ms-filter:grayscale(0%);-o-filter:grayscale(0%);filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=0);-webkit-filter:grayscale(0);opacity: 0.5;";
		      break;
		      case "GoFloorButton":
		        Flag.DisableGoFloor = false;
		        GoFloorButton.style.cssText = "filter:grayscale(0%);-webkit-filter:grayscale(0%);-moz-filter:grayscale(0%);-ms-filter:grayscale(0%);-o-filter:grayscale(0%);filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=0);-webkit-filter:grayscale(0);opacity: 0.5;";
		      break;
		      case "SL":
		        Flag.GameSL = true;
		      break;
		      case "SLPanel":
		        Flag.SL = true;
		      break;
		      case "Controller":
		        Flag.LockController = false;
		      	e.UnlockMove();
		      break;
		      case "Store":
		        Flag.ShowStorePanel = true;
		      break;
		      case "Battle":
		      	Flag.Battle = true;
		      break;
		      case "EventRun":
		        Flag.EventRuning = true;
		      break;
		      case "ChangeHead":
		        Flag.ChangeHead = true;
		      break;
		      case "LockIceButton":
		        Flag.LockIceButton = false;
		      break;
		      case "HelpPanel":
		        Flag.ShowHelpPanel = true;
		      break;
		    }
		  }
		  
		  e.Disable = function(Obj){
		    switch(Obj){
		      case "EnemyBook":
		        Flag.LockEnemyBookButton = true;
		      break;
		      case "GoFloor":
		        Flag.LockGoFloorButton = true;
		      break;
		      case "ToolsPanel":
		        Flag.LockToolsButton = true;
		      break;
		      case "SettingPanel":
		        Flag.LockSettingButton = true;
		      break;
		      case "EnemyBookButton":
		        Flag.DisableEnemyBook = true;
		        EnemyBookButton.style.cssText = "filter:grayscale(100%);-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);-webkit-filter:grayscale(1);opacity: 0.5;";
		      break;
		      case "GoFloorButton":
		        Flag.DisableGoFloor = true;
		        GoFloorButton.style.cssText = "filter:grayscale(100%);-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);-webkit-filter:grayscale(1);opacity: 0.5;";
		      break;
		      case "SL":
		        Flag.GameSL = false;
		      break;
		      case "SLPanel":
		        Flag.SL = false;
		      break;
		      case "Controller":
		        Flag.LockController = true;
		      	e.LockMove();
		      break;
		      case "Store":
		        Flag.ShowStorePanel = false;
		      break;
		      case "Battle":
		      	Flag.Battle = false;
		      break;
		      case "EventRun":
		        Flag.EventRuning = false;
		      break;
		      case "ChangeHead":
		        Flag.ChangeHead = false;
		      break;
		      case "LockIceButton":
		        Flag.LockIceButton = true;
		      break;
		      case "HelpPanel":
		        Flag.ShowHelpPanel = false;
		      break;
		    }
		  }
		  
		  e.TestGE = function(GE){
		    var Data = GE.split("-");
		    if(Data[0] == "G" && Hero["Gold"] >= (parseInt(Data[1]) + Hero["PayGold"])){
		      return [Data[0],Data[1]];
		    }
		    else if(Data[0] == "E" && Hero["Exp"] >= Data[1]){
		      return [Data[0],Data[1]];
		    }
		    return false;
		  }
		  
		  e.ReduceGE = function(Type,Val){
		    if(Type == "G"){
		      e.ReduceGold(parseInt(Val) + Hero["PayGold"]);
		      Hero["PayGold"]++;
		    }
		    else if(Type == "E"){
		      e.ReduceExp(Val);
		    }
		  }
		  
		  e.Pay = function(Choose){
		    if(StoreOptionTemp != "" && StoreOptionNum > 0){
		      var OptionData = (((StoreOptionTemp.split("]"))[1].split("|"))[Choose].split("&"))[1].split(":");
		      if(OptionData == "CloseStore"){
		        e.CloseStore();
		        return false;
		      }
		      var OptionEvent = OptionData[0];
		      var OptionVal = OptionData[1].split("=");
		      e[OptionEvent](OptionVal[0],OptionVal[1]);
		    }
		    return true;
		  }
		  
		  e.PayLv = function(Val,GE){
		    var ReduceGE = e.TestGE(GE);
		    if(ReduceGE !== false){
		      var Data = Val.split("#");
		      e.AddHP(parseInt(Data[0]));
		      e.AddATK(parseInt(Data[1]));
		      e.AddDEF(parseInt(Data[2]));
		      e.ReduceGE(ReduceGE[0],ReduceGE[1]);
		      return true;
		    }
		    return false;
		  }
		  
		  e.PayHP = function(Val,GE){
		    var ReduceGE = e.TestGE(GE);
		    if(ReduceGE !== false){
		      e.AddHP(parseInt(Val));
		      e.ReduceGE(ReduceGE[0],ReduceGE[1]);
		      return true;
		    }
		    return false;
		  }
		  
		  e.PayATK = function(Val,GE){
		    var ReduceGE = e.TestGE(GE);
		    if(ReduceGE !== false){
		      e.AddATK(parseInt(Val));
		      e.ReduceGE(ReduceGE[0],ReduceGE[1]);
		      return true;
		    }
		    return false;
		  }
		  
		  e.PayDEF = function(Val,GE){
		    var ReduceGE = e.TestGE(GE);
		    if(ReduceGE !== false){
		      e.AddDEF(parseInt(Val));
		      e.ReduceGE(ReduceGE[0],ReduceGE[1]);
		      return true;
		    }
		    return false;
		  }
		  
		  e.OpenStore = function(Options){
		    if(Flag.SL || Flag.Battle || Flag.ShowToolsPanel || Flag.ShowSettingPanel || Flag.ShowEnemyBook || Flag.ShowGoFloor || Flag.ShowHelpPanel){
		      return;
		    }
		    e.Disable("ChangeHead");
		    e.Enable("EventRun");
		    clearInterval(MessageInTimer);
     		clearTimeout(WaitOut);
     		clearInterval(MessageOutTimer);
     		clearInterval(FloorTipTimer);
     		clearTimeout(FloorTipOut);
		    e.LockMove();
		    Map.DrawStorePanel(Options);
		  }
		  
		  e.CloseStore = function(){
		    e.Disable("Store");
		    e.Enable("ChangeHead");
		    e.Disable("EventRun");
		    e.UnlockMove();
		    StoreOptionTemp = "";
		    StoreChoose = 0;
		    Map.ClearMap(Map.UI);
		    Map.ClearMap(Map.Data);
		    clearInterval(MessageIconAnimate);
		  }
		  
		  e.OpenHelpPanel = function(Type){
		    if(Flag.ShowStorePanel || Flag.SL || Flag.Battle || Flag.ShowToolsPanel || Flag.ShowSettingPanel || Flag.ShowEnemyBook || Flag.ShowGoFloor){
		      return;
		    }
		    clearInterval(MessageInTimer);
      	clearTimeout(WaitOut);
     		clearInterval(MessageOutTimer);
     		clearInterval(FloorTipTimer);
     		clearTimeout(FloorTipOut);
     		e.Enable("HelpPanel");
			   e.Disable("ChangeHead");
		    Flag.Move = false;
		    e.LockMove();
		    if(Type == "Last" && HelpPanelPage > 1){
		      HelpPanelPage--;
		    }
		    else if(Type == "Next" && HelpPanelPage < 5){
		      HelpPanelPage++;
		    }
			   Map.DrawHelpPanel();
		  }
		  
		  e.CloseHelpPanel = function(){
		    e.Disable("HelpPanel");
		    e.Enable("ChangeHead");
		    e.UnlockMove();
		    Map.ClearMap(Map.UI);
		  }
		  
		  e.ShowMessageList = function(Message,callback){
		    var MessageIndex = 0;
		    var MessageDone = true;
		    var WaitDone = window.setInterval(function(){
		      if(!(MessageIndex < Message.length)){
		        clearInterval(WaitDone);
		        Event.UnlockMove();
		        Flag.ShowMessage = false;
		        Event.Enable("EnemyBook");
		        Event.Enable("GoFloor");
		        Event.Enable("ToolsPanel");
		        Event.Enable("SL");
		        e.Enable("ChangeHead");
		        if(TestNull(callback)){
		          
		          callback();
		        }
		        return;
		      }
		      if(MessageDone){
		        MessageDone = false;
		        Map.DrawMessage(Message[MessageIndex],"Message",null,null,function(){
		          MessageIndex++;
		          MessageDone = true;
		        });
		      }
		    },30);
		  }
		  
		  e.StatusTest = function(){
		    //检测状态
		    if(!Flag.DisableEnemyBook){
		      e.Enable("EnemyBookButton");
		    }
		    else{
		      e.Disable("EnemyBookButton");
		    }
		    if(!Flag.DisableGoFloor){
		      e.Enable("GoFloorButton");
		    }
		    else{
		      e.Disable("GoFloorButton");
		    }
		  }
		  
		  e.DisableStart = function(_Floor){
		    var FloorIndex = Event.FindFloor(_Floor);
		    Map.Maps[FloorIndex][2].Start = -1;
		  }
		  
		  e.JumpFloor = function(FloorName,FloorIndex,ToHead,ToX,ToY){
		  	var HeroLocationTemp = [HeroLocation[1] * 32,HeroLocation[2] * 32];
		    Flag.LockMove = true;
		    e.Disable("EnemyBook");
		    e.Disable("GoFloor");
		    e.Disable("ToolsPanel");
		    e.Disable("SettingPanel");
		    e.Disable("Controller");
		    e.Disable("SL");
		    Map.DrawPropertyGroup();
			  Floor = FloorIndex;
			  if(Map.Maps[Floor][2].Arrive != "No"){
			    Map.Maps[Floor][2].Arrive = true;
			  }
			  GameLoading.innerHTML = "";
		  	MapEvent.style.display = "none";
			  MapFg.style.display = "none";
			  Map.ClearFloor();
			  Map.DrawJumpAnimate();
			  HeroLocation = [ToHead,ToX,ToY];
			  Event.StatusTest();
			window.setTimeout(function(){
				Map.ClearMap(Map.UI);
				Map.ClearMap(Map.Fg,HeroLocationTemp[0],HeroLocationTemp[1],32,32);
				Map.DrawFloor(FloorIndex,function(){
					MapEvent.style.display = "block";
					MapFg.style.display = "block";
					if(Map.Maps[Floor][2].Start == -1){
					  Map.DrawMessage(FloorName,"Floor");
					}
				});
			},500)
		  }
		  callback(e);
		}

		//创建Map对象的工厂函数
		function CreateMapControl(MapBg,MapEvent,MapFg,SystemUI,DataUpdate,ResData,MapsData,IconsData,ItemsData){
		  WaitDraw.innerText = "";
			var m = new Object(); //建立一个Map对象
			//获得所有画布的上下文
			m.Property = Property.getContext("2d");
			m.Bg = MapBg.getContext("2d"); 
			m.Event = MapEvent.getContext("2d");
			m.Fg = MapFg.getContext("2d");
			m.UI = SystemUI.getContext("2d");
			m.Data = DataUpdate.getContext("2d");
			//定义一些用到的资源
			m.Res = ResData; 
			m.Maps = MapsData;
			m.Icons = IconsData;
			m.Items = ItemsData;
			HeroIconData = m.Icons.GetData("Hero");
			var BoxBackground = m.UI.createPattern(m.Res["Floor"],"repeat");
			m.DrawFloor = function(Floor,callback){
			  UpdateProperty();
			  m.DrawEvent(Floor,function(){
			    m.DrawFg(Floor,function(){
			      m.DrawBg(Floor,function(){
			        m.DrawMove("Now",function(){
			          Flag.JumpFloor = false;
			          Flag.LockMove = false;
			          Flag.RunOver = false;
			          Flag.Move = false;
		           HeroStop();
		           Event.Enable("Controller");
			          /*if((localStorage.getItem("MotaData1") && JSON.parse(localStorage.getItem("MotaData1")).Version != Version)||(localStorage.getItem("MotaData2")&&JSON.parse(localStorage.getItem("MotaData2")).Version != Version)||(localStorage.getItem("MotaData3")&&JSON.parse(localStorage.getItem("MotaData3")).Version != Version)||(localStorage.getItem("MotaData4")&&JSON.parse(localStorage.getItem("MotaData4")).Version != Version)){
			            Event.RemoveAllSave();
			            alert("为了适应新版本("+ Version +")，您以前的存档将被清空╮（╯＿╰）╭");
			          }*/
			          window.setTimeout(function(){
			            Event.Enable("GoFloor");
			            Event.Enable("EnemyBook");
			            Event.Enable("SL");
			            Event.Enable("ToolsPanel");
			            Event.Enable("SettingPanel");
			            if(Map.Maps[Floor][2].Start != -1){
					            Flag.Event(Map.Maps[Floor][2].Start,Map,Event,HeroLocation,Floor,function(){
					            Map.DrawMessage(Map.Maps[Floor][2].Name,"Floor");
					            });
					          }
			          },300);
			          if(TestNull(callback)){
			            callback();
			          }
			        }); 
			      }); //绘制背景    
			    }); //绘制前景
			  }); //绘制事件
			}
			
			m.DrawPropertyGroup = function(callback){
			  var PropertyBackground = m.Property.createPattern(m.Res["Floor"],"repeat");
			  if(WindowMode == 0){
			    m.ClearMap(m.Property,0,0,352,100);
			    m.Property.fillStyle = PropertyBackground;
			    m.Property.fillRect(0,0,352,100);
			    m.Property.fillRect(0,452,352,60);
			    //心形 HP
			    m.Property.drawImage(m.Res["Item3"],96,0,32,32,10,11,32,32);
			    //金币 Gold
			    m.Property.drawImage(m.Res["Item1"],96,64,32,32,10,57,32,32);
			    //神圣剑 ATK
			    m.Property.drawImage(m.Res["Weapon"],0,32,32,32,125,12,32,32);
			    //神圣盾 DEF
			    m.Property.drawImage(m.Res["Weapon"],0,96,32,32,240,12,32,32);
			    //经验 Exp
			    m.Property.drawImage(m.Res["Item1"],96,32,32,32,240,57,32,32);
			    //纪元魔塔标
			    m.Property.drawImage(m.Res["Name"],135,62);
			    m.Property.beginPath();
			    m.Property.strokeStyle = "#FFFFFF";
			    m.Property.lineWidth = 2;
			    m.Property.moveTo(0,99);
			    m.Property.lineTo(352,99);
			    m.Property.moveTo(0,453);
			    m.Property.lineTo(352,453);
			    m.Property.stroke();
			    //黄钥匙
			    m.Property.drawImage(m.Res["Item1"],0,0,32,32,15,467,32,32);
			    //蓝钥匙
			    m.Property.drawImage(m.Res["Item1"],32,0,32,32,100,467,32,32);
			    //红钥匙
			    m.Property.drawImage(m.Res["Item1"],64,0,32,32,185,467,32,32);
			    //铁钥匙
			    m.Property.drawImage(m.Res["Item1"],0,32,32,32,270,467,32,32);
			    m.Property.textAlign = "right";
			    m.Property.fillStyle = "#FFFFFF";
			    m.Property.font = "normal 18px Mota";
			    m.Property.fillText(Hero["HP"],110,40);
			    m.Property.fillText(Hero["Gold"],110,82);
			    m.Property.fillText(Hero["ATK"],220,40);
			    m.Property.fillText(Hero["DEF"],335,40);
			    m.Property.fillText(Hero["Exp"],335,82);
			    m.Property.fillStyle = "#FFCCAA";
			    m.Property.fillText(((String(Hero["YellowKey"]).length == 1)?("0" + Hero["YellowKey"]):(Hero["YellowKey"])),65,500);
			    m.Property.fillStyle = "#AAAADD";
			    m.Property.fillText(((String(Hero["BlueKey"]).length == 1)?("0" + Hero["BlueKey"]):(Hero["BlueKey"])),150,500);
			    m.Property.fillStyle = "#FF8888";
			    m.Property.fillText(((String(Hero["RedKey"]).length == 1)?("0" + Hero["RedKey"]):(Hero["RedKey"])),235,500);
			    m.Property.fillStyle = "#DEDEDE";
			    m.Property.fillText(((String(Hero["IronKey"]).length == 1)?("0" + Hero["IronKey"]):(Hero["IronKey"])),320,500);
			    m.Property.fillStyle = "#FFFFFF";
			    m.Property.textAlign = "left";
			  }
			  else{
			    m.ClearMap(m.Property,0,0,122,352);
			    m.Property.fillStyle = PropertyBackground;
			    m.Property.fillRect(0,0,122,352);
			    //心 HP
			    m.Property.drawImage(m.Res["Item3"],96,0,32,32,8,13,35,35);
			    //神圣剑 ATK
			    m.Property.drawImage(m.Res["Weapon"],0,32,32,32,10,70,32,32);
			    //神圣盾 DEF
			    m.Property.drawImage(m.Res["Weapon"],0,96,32,32,10,127,32,32);
			    //金币 Gold
			    m.Property.drawImage(m.Res["Item1"],96,64,32,32,10,185,32,32);
			    //经验 Exp
			    m.Property.drawImage(m.Res["Item1"],96,32,32,32,10,238,32,32);
			    m.Property.beginPath();
			    m.Property.strokeStyle = "#FFFFFF";
			    m.Property.lineWidth = 4;
			    m.Property.moveTo(120,0);
			    m.Property.lineTo(120,352);
			    m.Property.moveTo(0,285);
			    m.Property.lineTo(120,285);
			    m.Property.stroke();
			    //黄钥匙
			    m.Property.drawImage(m.Res["Item1"],0,0,32,32,10,290,28,28);
			    //蓝钥匙
			    m.Property.drawImage(m.Res["Item1"],32,0,32,32,62,290,28,28);
			    //红钥匙
			    m.Property.drawImage(m.Res["Item1"],64,0,32,32,10,320,28,28);
			    //铁钥匙
			    m.Property.drawImage(m.Res["Item1"],0,32,32,32,62,320,28,28);
			    m.Property.textAlign = "right";
			    m.Property.fillStyle = "#FFFFFF";
			    m.Property.font = "normal 18px Mota";
			    m.Property.fillText(Hero["HP"],105,48);
			    m.Property.fillText(Hero["ATK"],105,103);
			    m.Property.fillText(Hero["DEF"],105,158);
			    m.Property.fillText(Hero["Gold"],105,216);
			    m.Property.fillText(Hero["Exp"],105,268);
			    m.Property.fillStyle = "#FFCCAA";
			    m.Property.font = "normal 14px Mota";
			    m.Property.fillText(((String(Hero["YellowKey"]).length == 1)?("0" + Hero["YellowKey"]):(Hero["YellowKey"])),48,318);
			    m.Property.fillStyle = "#AAAADD";
			    m.Property.fillText(((String(Hero["BlueKey"]).length == 1)?("0" + Hero["BlueKey"]):(Hero["BlueKey"])),100,318);
			    m.Property.fillStyle = "#FF8888";
			    m.Property.fillText(((String(Hero["RedKey"]).length == 1)?("0" + Hero["RedKey"]):(Hero["RedKey"])),48,348);
			    m.Property.fillStyle = "#DEDEDE";
			    m.Property.fillText(((String(Hero["IronKey"]).length == 1)?("0" + Hero["IronKey"]):(Hero["IronKey"])),100,348);
			    m.Property.fillStyle = "#FFFFFF";
			    m.Property.textAlign = "left";
			  }
			  if(TestNull(callback)){
			    callback();
			  }
			}
			
			m.DrawJumpAnimate = function(Opacity,EventStr){
			  var Switch = false;
				 var OpacityVal = 0;
				 m.SetAlpha(Map.UI,1);
					m.SetAlpha(Map.Data,0);
					m.Data.fillStyle = "#000000";
					m.Data.fillRect(0,0,352,352);
			  var JumpFloorAnimate = window.setInterval(function(){
					  if(Switch){OpacityVal -= 0.1}else{OpacityVal += 0.1};
					  m.ClearMap(m.UI);
					  m.SetAlpha(m.UI,OpacityVal);
					  Map.UI.fillStyle = "#FFFFFF";
					  m.UI.textAlign = "left";
					  m.UI.font = "bold 70px Verdana";
					  m.UI.fillText("魔",90,150);
					  m.UI.fillText("塔",190,250);
				 	  m.UI.font = "bold 10px Verdana";
				 	  m.UI.textAlign = "center";
				 	  m.UI.fillText(Version,176,330);
				 	  m.UI.textAlign = "left";
					  m.UI.fillStyle = "#000000";
					  m.UI.fillRect(0,0,352,352);
					  if(OpacityVal > 0.9 && !Switch){
					    if(TestNull(Opacity) && Opacity >= Opacity - 0.2){
					      eval(EventStr);
					      clearInterval(JumpFloorAnimate);
					      return;
					    }
					    Switch = true;
					  }
					  else if(OpacityVal < 0.1 && Switch){
					    clearInterval(JumpFloorAnimate);
					  }
					},30);
			}
			
			m.DrawGameOver = function(callback){
				var OpacityVal = 0;
				m.ResetAlpha(m.UI);
				m.ClearMap(m.UI);
				m.UI.fillStyle = "#000000";
				var ShowGameOver = window.setInterval(function(){
					OpacityVal += 0.1;
					m.ClearMap(m.UI);
					m.SetAlpha(m.UI,OpacityVal);
					m.UI.fillRect(0,0,352,352);
					if(OpacityVal > 0.6){
						OpacityVal = 0.7;
						m.ClearMap(m.UI);
						m.SetAlpha(m.UI,OpacityVal);
						m.UI.fillRect(0,0,352,352);
					    clearInterval(ShowGameOver);
					    OpacityVal = 0;
					    m.Data.textAlign = "center";
					    m.Data.font = "bold 40px Verdana";
					    m.ResetAlpha(m.Data);
					    m.Data.fillStyle = "#00FFFF";
					    var Top = 352;
					    var ShowGameOverText = window.setInterval(function(){
					    	Top--;
					    	OpacityVal += 0.005;
					    	m.SetAlpha(m.Data,OpacityVal);
					    	m.ClearMap(m.Data);
					    	m.Data.fillText("GameOver",176,Top);
					    	if(Top <= 185){
					    	  clearInterval(ShowGameOverText);
					    		 m.ResetAlpha(m.Data);
					    		if(TestNull(callback)){
									  callback();
								  }
					    	}
						},10);
					}
				},50);
			}
			
			m.ClearFloor = function(){
			  //Flag.LockMove = true;
			  HeroStop();
			  GlobalAnimate = [];
			  GlobalAnimateResName = "";
			  NoPassLocation = [];
			  ItemLocation = [];
			  DoorLocation = [];
			  StairLocation = [];
			  EnemyLocation = [];
			  NpcLocation = [];
			  EventLocation = [];
			  clearInterval(WaitOut);
			  clearInterval(RunTimer);
			  UpdateProperty();
			  m.ClearMap();
			}
			
			m.DrawThumbnail = function(Canvas,MotaData,X,Y,Size,SetFloor,callback){
			  var BgData = MotaData.MapsData[((TestNull(SetFloor))?(SetFloor):(MotaData.Floor))][0];
			  var FgData = MotaData.MapsData[((TestNull(SetFloor))?(SetFloor):(MotaData.Floor))][1];
			  var EventData = MotaData.MapsData[((TestNull(SetFloor))?(SetFloor):(MotaData.Floor))][2];
			  var AnimateEventData = EventData.Animate;
			  var ItemEventData = EventData.Item;
			  var DoorEventData = EventData.Door;
			  var StairEventData = EventData.Stair;
			  var EnemyEventData = EventData.Enemy;
			  var NpcEventData = EventData.Npc;
			  var FloorEventData = EventData.Event;
			  var ResName;
			  var IconData;
			  //如果采用fill则用其指定的图标ID填充地图
				if(BgData[0] == "fill"){
					IconData = m.Icons.GetData("Terrain",BgData[1]); //获得该图标ID的图标数据
					//绘制y坐标
					for(var y = 0;y < 11;y++){
						var _y = y; //临时变量，提高效率
						//绘制x坐标
						for(var x = 0;x < 11;x++){
						//绘制图标
							Canvas.drawImage(m.Res[IconData[6]],IconData[1],IconData[2],IconData[3],IconData[4],X + x * Size,Y + _y * Size,Size,Size);
						}
					}
				}
				else{
					//如果不是填充则根据地图一个个绘制
					for(var i = 0;i < BgData.length;i++){
					  IconData = m.Icons.GetData("Terrain",BgData[i][0]);
					  Canvas.drawImage(m.Res[IconData[6]],IconData[1],IconData[2],IconData[3],IconData[4],X + BgData[i][1] * Size,Y + BgData[i][2] * Size,Size,Size);
					}
				}
			  for(var a = 0;a < AnimateEventData.length;a++){
			    if(typeof(AnimateEventData[a]) == "string"){
			      ResName = (AnimateEventData[a].split("-"))[0];
			    }
			    else{
			      IconData = m.Icons.GetData(ResName);
			      Canvas.drawImage(m.Res[ResName],0,0,32,32,X + AnimateEventData[a][0] * Size,Y + AnimateEventData[a][1] * Size,Size,Size);
			    }
			  }
			  //物品
			  for(var i = 0;i < ItemEventData.length;i++){
			    IconData = m.Icons.GetData("Item",ItemEventData[i][1]); Canvas.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],X + ItemEventData[i][2] * Size,Y + ItemEventData[i][3] * Size,Size,Size);
			  }
			  //楼梯
			  for(var s = 0;s < StairEventData.length;s++){
			    IconData = m.Icons.GetData("Stair",StairEventData[s][0]);
			    Canvas.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],X + StairEventData[s][1] * Size,Y + StairEventData[s][2] * Size,Size,Size);
			  }
			  //怪物
			  for(var e = 0;e < EnemyEventData.length;e++){
			    IconData = m.Icons.GetData("Enemy",EnemyEventData[e][1]);
			    Canvas.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],X + EnemyEventData[e][2] * Size,Y + EnemyEventData[e][3] * Size,Size,Size);
			  }
			  //NPC
			  for(var n = 0;n < NpcEventData.length;n++){
			    IconData = m.Icons.GetData("Npc",NpcEventData[n][1]);
			    Canvas.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],X +  NpcEventData[n][2] * Size,Y +NpcEventData[n][3] * Size,Size,Size);
			  }
			  //门
			  for(var d = 0;d < DoorEventData.length;d++){
			    IconData = m.Icons.GetData("Door",DoorEventData[d][0]);
			    Canvas.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],X + DoorEventData[d][1] * Size,Y + DoorEventData[d][2] * Size,Size,Size);
			  }
			  for(var i = 0;i < FgData.length;i++){
					  IconData = m.Icons.GetData("Terrain",FgData[i][0]);
					  Canvas.drawImage(m.Res[IconData[6]],IconData[1],IconData[2],IconData[3],IconData[4],X + FgData[i][1] * Size,Y + FgData[i][2] * Size,Size,Size);
				}
				//事件
				for(var v = 0;v < FloorEventData.length;v++){
			    var Temp = FloorEventData[v][3].split("&");
			    IconData = m.Icons.GetData(Temp[0],parseInt(Temp[1]));
			    Canvas.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,X + FloorEventData[v][1] * Size,Y + FloorEventData[v][2] * Size,Size,Size);
			  }
			  if(TestNull(MotaData.HeroLocation)){
			    var HeroData = MotaData.HeroLocation;
			    var NowHeadData = HeroIconData[HeroData[0]];
				  Canvas.drawImage(m.Res["Hero"],NowHeadData[0][1],NowHeadData[0][2],32,32,X + HeroData[1] * Size,Y + HeroData[2] * Size,Size,Size);
			  }
				if(TestNull(callback)){
				  callback();
				}
			}
			
			m.DrawMove = function(Head,callback){
			  var Step = [0,1,2,3];
			  switch(Head){
			    case "Now":
			      var NowHeadData = HeroIconData[HeroLocation[0]];
			      var X = HeroLocation[1] * 32;
			      var Y = HeroLocation[2] * 32;
			      m.ClearMap(m.Fg,X,Y,32,32);
			      m.Fg.drawImage(m.Res["Hero"],NowHeadData[0][1],NowHeadData[0][2],32,32,X,Y,32,32);
			      if(TestNull(callback)){
			      	callback();
			      }
			    break;
			    case 0:
			      UpTimer = window.setInterval(function(){
			        var NowHeadData = HeroIconData[0];
			        var X = HeroLocation[1] * 32;
			        var Y = HeroLocation[2] * 32;
			        if(!EventTrigger(HeroLocation[1],HeroLocation[2] - 1)){
			          HeroLocation[0] = 0;
			          HeroStop();
			          Flag.Move = false;
			          Flag.LockMove = false;
			          Flag.RunOver = false;
			          m.DrawMove("Now");
			          return;
			        }
			       	m.ClearMap(m.Fg,X,Y - HeroMove,32,32);
			        m.ClearMap(m.Fg,X,Y,32,32);
			        m.Fg.drawImage(m.Res["Hero"],NowHeadData[AnimateStep][1],NowHeadData[AnimateStep][2],32,32,X,Y - HeroMove,32,32);
			        HeroMove += 4;
			        if(MoveStepNum > 2){
			          MoveStepNum = 0;
			        }
			        AnimateStep = Step[MoveStepNum++];
			        if(HeroMove == 36){
			          HeroMove = 0;
			          AnimateStep = 3;
			          HeroLocation[2]--;
			          Flag.RunOver = false;
			          HeroStop();
			          callback();
			        }
			      },15);
			    break;
			    case 1:
			      LeftTimer =  window.setInterval(function(){
			        var NowHeadData = HeroIconData[1];
			        var X = HeroLocation[1] * 32;
			        var Y = HeroLocation[2] * 32;
			        if(!EventTrigger(HeroLocation[1] - 1,HeroLocation[2])){
			          HeroLocation[0] = 1;
			          HeroStop();
			          Flag.Move = false;
			          Flag.LockMove = false;
			          Flag.RunOver = false;
			          m.DrawMove("Now");
			          return;
			        }
			        m.ClearMap(m.Fg,X - HeroMove,Y,32,32);
			        m.ClearMap(m.Fg,X,Y,32,32);
			        m.Fg.drawImage(m.Res["Hero"],NowHeadData[AnimateStep][1],NowHeadData[AnimateStep][2],32,32,X - HeroMove,Y,32,32);
			        HeroMove += 4;
			        if(MoveStepNum > 2){
			          MoveStepNum = 0;
			        }
			        AnimateStep = Step[MoveStepNum++];
			        if(HeroMove == 36){
			          HeroMove = 0;
			          AnimateStep = 3;
			          HeroLocation[1]--;
			          Flag.RunOver = false;
			          HeroStop();
			          callback();
			        }
			      },15);
			    break;
			    case 2:
			      DownTimer = window.setInterval(function(){
			        var NowHeadData = HeroIconData[2];
			        var X = HeroLocation[1] * 32;
			        var Y = HeroLocation[2] * 32;
			        if(!EventTrigger(HeroLocation[1],HeroLocation[2] + 1)){
			          HeroLocation[0] = 2;
			          HeroStop();
			          Flag.Move = false;
			          Flag.LockMove = false;
			          Flag.RunOver = false;
			          m.DrawMove("Now");
			          return;
			        }
			        m.ClearMap(m.Fg,X,Y + HeroMove,32,32);
			        m.ClearMap(m.Fg,X,Y,32,32);
			        m.Fg.drawImage(m.Res["Hero"],NowHeadData[AnimateStep][1],NowHeadData[AnimateStep][2],32,32,X,Y + HeroMove,32,32);
			        HeroMove += 4;
			        if(MoveStepNum > 2){
			          MoveStepNum = 0;
			        }
			        AnimateStep = Step[MoveStepNum++];
			        if(HeroMove == 36){
			          HeroMove = 0;
			          AnimateStep = 3;
			          HeroLocation[2]++;
			          Flag.RunOver = false;
			          HeroStop();
			          callback();
			        }
			      },15);
			    break;
			    case 3:
			      LeftTimer = window.setInterval(function(){
			        var NowHeadData = HeroIconData[3];
			        var X = HeroLocation[1] * 32;
			        var Y = HeroLocation[2] * 32;
			        if(!EventTrigger(HeroLocation[1] + 1,HeroLocation[2])){
			          HeroLocation[0] = 3;
			          HeroStop();
			          Flag.Move = false;
			          Flag.LockMove = false;
			          Flag.RunOver = false;
			          m.DrawMove("Now");
			          return;
			        }
			        m.ClearMap(m.Fg,X + HeroMove,Y,32,32);
			        m.ClearMap(m.Fg,X,Y,32,32);
			        m.Fg.drawImage(m.Res["Hero"],NowHeadData[AnimateStep][1],NowHeadData[AnimateStep][2],32,32,X + HeroMove,Y,32,32);
			        HeroMove += 4;
			        if(MoveStepNum > 2){
			          MoveStepNum = 0;
			        }
			        AnimateStep = Step[MoveStepNum++];
			        if(HeroMove == 36){
			          HeroMove = 0;
			          AnimateStep = 3;
			          HeroLocation[1]++;
			          Flag.RunOver = false;
			          HeroStop();
			          callback();
			        }
			      },15);
			    break;
			  }
			}
			
			//绘制地图背景，根据楼层绘制
			m.DrawBg = function(Floor,callback){
				var MapData = m.Maps[Floor]; //获得该楼层的地图数据
				BgData = MapData[0]; //获得该地图数据的背景部分
				var IconData; //预定义图标数据变量
				//如果采用fill则用其指定的图标ID填充地图
				if(BgData[0] == "fill"){
					IconData = m.Icons.GetData("Terrain",BgData[1]); //获得该图标ID的图标数据
					//绘制y坐标
					for(var y = 0;y < 11;y++){
						var _y = y; //临时变量，提高效率
						//绘制x坐标
						for(var x = 0;x < 11;x++){
						//绘制图标
							m.Bg.drawImage(m.Res[IconData[6]],IconData[1],IconData[2],IconData[3],IconData[4],x * IconData[3],_y * IconData[4],32,32);
							if(IconData[5] == 1){
								NoPassLocation.push([x,_y]);
							}
						}
					}
					if(TestNull(callback)){
					  callback();
					}
				}
				else{
					//如果不是填充则根据地图一个个绘制
					for(var i = 0;i < BgData.length;i++){
					  IconData = m.Icons.GetData("Terrain",BgData[i][0]);
					  m.Bg.drawImage(m.Res[IconData[6]],IconData[1],IconData[2],IconData[3],IconData[4],BgData[i][1] * IconData[3],BgData[i][2] * IconData[4],32,32);
					  if(IconData[5] == 1){
						NoPassLocation.push([BgData[i][1],BgData[i][2]]);
					  }
					}
					if(TestNull(callback)){
					  callback();
					}
				}
			}
			
			m.DrawFg = function(Floor,callback){
			  var MapData = m.Maps[Floor]; //获得该楼层的地图数据
				FgData = MapData[1]; //获得该地图数据的背景部分
				var IconData; //预定义图标数据变量
				for(var i = 0;i < FgData.length;i++){
					  IconData = m.Icons.GetData("Terrain",FgData[i][0]);
					  m.Fg.drawImage(m.Res[IconData[6]],IconData[1],IconData[2],IconData[3],IconData[4],FgData[i][1] * IconData[3],FgData[i][2] * IconData[4],32,32);
					  if(IconData[5] == 1){
						NoPassLocation.push([FgData[i][1],FgData[i][2]]);
					  }
				}
				if(TestNull(callback)){
					callback();
				}
			}
			
			m.DrawEvent = function(Floor,callback){
			  var IconData; //预定义图标数据变量
			  var MapData = m.Maps[Floor][2];
			  var AnimateEventData = MapData.Animate;
			  var ItemEventData = MapData.Item;
			  var DoorEventData = MapData.Door;
			  var StairEventData = MapData.Stair;
			  var EnemyEventData = MapData.Enemy;
			  var NpcEventData = MapData.Npc;
			  var FloorEventData = MapData.Event;
			  for(var a = 0;a < AnimateEventData.length;a++){
			    m.Animate(AnimateEventData[a]);
			  }
			  //物品
			  for(var i = 0;i < ItemEventData.length;i++){
			    IconData = m.Icons.GetData("Item",ItemEventData[i][1]); m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],ItemEventData[i][2] * IconData[3],ItemEventData[i][3] * IconData[4],IconData[3],IconData[4]);
			    ItemLocation.push([ItemEventData[i][0],ItemEventData[i][1],ItemEventData[i][2],ItemEventData[i][3]]);
			  }
			  //门
			  for(var d = 0;d < DoorEventData.length;d++){
			    IconData = m.Icons.GetData("Door",DoorEventData[d][0]);
			    m.Fg.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],DoorEventData[d][1] * IconData[3],DoorEventData[d][2] * IconData[4],IconData[3],IconData[4]);
			    DoorLocation.push([DoorEventData[d][0],DoorEventData[d][1],DoorEventData[d][2]]);
			  }
			  //楼梯
			  for(var s = 0;s < StairEventData.length;s++){
			    IconData = m.Icons.GetData("Stair",StairEventData[s][0]);
			    m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],StairEventData[s][1] * IconData[3],StairEventData[s][2] * IconData[4],IconData[3],IconData[4]);
			    StairLocation.push([StairEventData[s][0],StairEventData[s][1],StairEventData[s][2],StairEventData[s][3],StairEventData[s][4],StairEventData[s][5],StairEventData[s][6]]);
			  }
			  //怪物
			  for(var e = 0;e < EnemyEventData.length;e++){
			    IconData = m.Icons.GetData("Enemy",EnemyEventData[e][1]);
			    m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],EnemyEventData[e][2] * IconData[3],EnemyEventData[e][3] * IconData[4],IconData[3],IconData[4]);
			    EnemyLocation.push([EnemyEventData[e][0],EnemyEventData[e][1],EnemyEventData[e][2],EnemyEventData[e][3]]);
			    m.Animate([EnemyEventData[e][0],EnemyEventData[e][1],"Enemy",IconData[5],EnemyEventData[e][2],EnemyEventData[e][3]]);
			  }
			  //NPC
			  for(var n = 0;n < NpcEventData.length;n++){
			    IconData = m.Icons.GetData("Npc",NpcEventData[n][1]);
			    m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],IconData[3],IconData[4],NpcEventData[n][2] * IconData[3],NpcEventData[n][3] * IconData[4],IconData[3],IconData[4]);
			    NpcLocation.push([NpcEventData[n][0],NpcEventData[n][1],NpcEventData[n][2],NpcEventData[n][3]]);
			    m.Animate([NpcEventData[n][0],NpcEventData[n][1],"Npc",IconData[5],NpcEventData[n][2],NpcEventData[n][3]]);
			  }
			  //事件
			  for(var v = 0;v < FloorEventData.length;v++){
			    var Temp = FloorEventData[v][3].split("&");
			    IconData = m.Icons.GetData(Temp[0],parseInt(Temp[1]));
			    m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,FloorEventData[v][1] * 32,FloorEventData[v][2] * 32,32,32);
			    EventLocation.push([FloorEventData[v][0],FloorEventData[v][1],FloorEventData[v][2],FloorEventData[v][3],FloorEventData[v][4]]);
			    m.Animate([FloorEventData[v][0],parseInt(Temp[1]),Temp[0],IconData[5],FloorEventData[v][1],FloorEventData[v][2]]);
			  }
			  if(TestNull(callback)){
					callback();
				}
			}
			
			//动画系统 EventData 要被动画的对象 XY 被动画对象绘制的坐标 WH 被动画对象绘制的宽高
			m.Animate = function(EventData){
			  var EventID;
			  var IconData;
			  if(typeof(EventData) == "string"){
			    DataTemp = EventData.split("-");
			    GlobalAnimateResName = DataTemp[0];
			    AnimateNoPass = DataTemp[1];
			  }
			  else if(EventData.length > 5){
			      var ID = [EventData[0],EventData[2]]; //ID和事件类型
			      EventID = EventData[1];
			      IconData = m.Icons.GetData(EventData[2],EventID);
			      GlobalAnimate.push([ID,EventID,EventData[3],EventData[4],EventData[5],IconData]);
			      
			  }
			  else{
			    EventID = null;
			    IconData = m.Icons.GetData(GlobalAnimateResName);
			    m.Event.drawImage(m.Res[GlobalAnimateResName],0,0,32,32,EventData[0] * 32,EventData[1] * 32,32,32);
			    GlobalAnimate.push([[null,"Animate"],EventID,GlobalAnimateResName,EventData[0],EventData[1],IconData]);
			    if(AnimateNoPass == 1){
			      NoPassLocation.push([EventData[0],EventData[1]]);
			    }
			  }
			}
			
			m.DrawBattleAnimate = function(ID,X,Y,callback){
			  var IconData = m.Icons.GetData("BattleAnimate",ID);
			  BattleAnimateStep = 0;
			  BattleAnimateTimer = window.setInterval(function(){
			    m.ClearMap(m.UI,X * 32,Y * 32,32,32);
			    m.UI.drawImage(m.Res[IconData[2]],IconData[1][BattleAnimateStep][0],IconData[1][BattleAnimateStep][1],32,32,X * 32,Y * 32,32,32);
			    BattleAnimateStep++;
			    if(BattleAnimateStep > IconData[1].length - 1){
			      clearInterval(BattleAnimateTimer);
			      m.ClearMap(m.UI,X * 32,Y * 32,32,32);
			      if(TestNull(callback)){
			        callback();
			      }
			    }
			  },80);
			}
			
			m.DrawEnemy = function(ID,EnemyID,X,Y,IconData){
			  var OpacityVal = 0;
			  var AddEnemyTimer = window.setInterval(function(){
			    m.SetAlpha(m.Event,OpacityVal += 0.1);
			    m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,X * 32,Y * 32,32,32);
			    m.SetAlpha(m.Event,1);
			    if(OpacityVal >= 1){
			      clearInterval(AddEnemyTimer);
			      Map.Animate([ID,EnemyID,"Enemy",IconData[5],X,Y]);
			    }
			  },100);
			}
			
			m.DrawToolPanel = function(ToolList,ToolChoose){
			  m.ResetAlpha(m.Data);
			  m.SetAlpha(m.Data,0.7);
			  m.Data.strokeStyle = "#FFFFFF";
			  m.Data.lineWidth = 2;
			  m.UI.textAlign = "left";
			  m.Data.textAlign = "left";
			  if(TestNull(ToolChoose)){
			  	var ToolPanelNum = 0;
			  	var ToolPanelLine = 0;
			  	if(ToolChoose == "Last" && ToolPanelChoose > 0 && ToolPanelChoose < 12){
			  		ToolPanelChoose--;
			  		if(ToolPanelChoose > 5){
			  			ToolPanelLine += 42;
			  			ToolPanelNum = ToolPanelChoose - 6;
			  		}
			  		else{
			  			ToolPanelLine = 0;
			  			ToolPanelNum = ToolPanelChoose;
			  		}
			  		m.ClearMap(m.Data);
			    	m.Data.strokeRect(11.5 + ToolPanelNum * 58,135 + ToolPanelLine,38,38);
			    }
			    else if(ToolChoose == "Next" && ToolPanelChoose < ToolList[0].length - 1){
			    	ToolPanelChoose++;
			    	if(ToolPanelChoose > 5){
			  			ToolPanelLine += 42;
			  			ToolPanelNum = ToolPanelChoose - 6;
			  		}
			  		else{
			  			ToolPanelLine = 0;
			  			ToolPanelNum = ToolPanelChoose;
			  		}
			    	m.ClearMap(m.Data);
			    	m.Data.strokeRect(11.5 + ToolPanelNum * 58,135 + ToolPanelLine,38,38);
			    }
			    else if(ToolChoose == "Last" && ToolPanelChoose - 1 > ToolList[0].length - 1 && ToolList[1].length > 0 && ToolPanelChoose - 12 < ToolList[1].length){
			      if(ToolPanelChoose > 12){
			        ToolPanelChoose--;
			      }
			      else{
			        ToolPanelChoose = ToolList[0].length - 1;
			      }
			      if(ToolPanelChoose < 6){
		   	      ToolPanelNum = ToolPanelChoose;
		   	      ToolPanelLine = 0;
		   	    }
		   	    else if(ToolPanelChoose > 5 && ToolPanelChoose < 12){
		   	      ToolPanelNum = ToolPanelChoose - 6;
		   	      ToolPanelLine = 42;
		   	    }
			       else if(ToolPanelChoose > 11 && ToolPanelChoose < 18){
		   	      ToolPanelNum = ToolPanelChoose - 12;
		   	      ToolPanelLine = 129;
		   	    }
		   	    else if(ToolPanelChoose > 17 && ToolPanelChoose < 24){
		   	      ToolPanelNum = ToolPanelChoose - 18;
		   	      ToolPanelLine = 171;
		   	    }
			  		  m.ClearMap(m.Data);
			      m.Data.strokeRect(11.5 + ToolPanelNum * 58,135 + ToolPanelLine,38,38);
			    }
			    else if(ToolChoose == "Next" && ToolPanelChoose + 1 > ToolList[0].length - 1 && ToolList[1].length > 0 && ToolPanelChoose - 12 < ToolList[1].length - 1){
			      if(ToolPanelChoose < 12){
			        ToolPanelChoose = 12;
			      }
			      else{
			        ToolPanelChoose++;
			      }
			      if(ToolPanelChoose > 11 && ToolPanelChoose < 18){
		   	      ToolPanelNum = ToolPanelChoose - 12;
		   	      ToolPanelLine = 129;
		   	    }
		   	    else if(ToolPanelChoose > 17 && ToolPanelChoose < 24){
		   	      ToolPanelNum = ToolPanelChoose - 18;
		   	      ToolPanelLine = 171;
		   	    }
			  		  m.ClearMap(m.Data);
			      m.Data.strokeRect(11.5 + ToolPanelNum * 58,135 + ToolPanelLine,38,38);
			  		}
			    else if(ToolChoose < 24 && ToolChoose >= 0){
			      if((ToolChoose > ToolList[0].length - 1 && ToolChoose < 12)|| ToolChoose - 12 > ToolList[1].length - 1){
		   	        return;
		   	      }
			      if(ToolChoose < 6){
		   	      ToolPanelNum = ToolChoose;
		   	      ToolPanelLine = 0;
		   	    }
		   	    else if(ToolChoose > 5 && ToolChoose < 12){
		   	      ToolPanelNum = ToolChoose - 6;
		   	      ToolPanelLine = 42;
		   	    }
		   	    else if(ToolChoose > 11 && ToolChoose < 18){
		   	      ToolPanelNum = ToolChoose - 12;
		   	      ToolPanelLine = 129;
		   	    }
		   	    else if(ToolChoose > 17 && ToolChoose < 24){
		   	      ToolPanelNum = ToolChoose - 18;
		   	      ToolPanelLine = 171;
		   	    }
			  		  ToolPanelChoose = ToolChoose;
			      m.ClearMap(m.Data,0,124,352,232);
			      m.Data.strokeRect(11.5 + ToolPanelNum * 58,135 + ToolPanelLine,38,38);
			    }
			    m.ClearMap(m.Data,0,0,352,124);
			    m.ClearMap(m.Data,250,227,102,24);
			    if(ToolList[0].length > 0 || ToolList[1].length > 0){
			      if(ToolPanelChoose < 12 && ToolList[0].length > 0){
			        Key = ToolList[0][ToolPanelChoose][1][3]; //获得快捷键
			        m.Data.font = "bold 16px Verdana";
			        m.Data.fillStyle = "#FFFF00";
			        m.Data.fillText(ToolList[0][ToolPanelChoose][1][1],15,25);
			        m.Data.font = "bold 14px Verdana";
			        m.Data.fillStyle = "#FFFFFF";
			        m.Data.fillText(ToolList[0][ToolPanelChoose][1][2],15,43);
			        m.Data.beginPath();
			        m.Data.moveTo(352,123);
			        m.Data.lineTo(352,99);
			        m.Data.lineTo(280,99);
			        m.Data.lineTo(250,123);
			        m.Data.closePath();
			        m.Data.fill();
			        m.Data.font = "bold 16px Verdana";
			        m.Data.fillStyle = "#000000";
			        if(Key != ""){
			          m.Data.fillText("快捷 <" + Key + ">",280,118);
			        }
			        else{
			          m.Data.fillText("快捷配置",280,118);
			        }
			      }
			      else if(ToolPanelChoose > 11 && ToolList[1].length > 0){
			        Key = ToolList[1][ToolPanelChoose - 12][1][3]; //获得快捷键
			        m.Data.font = "bold 16px Verdana";
			        m.Data.fillStyle = "#FFFF00";
			        m.Data.fillText(ToolList[1][ToolPanelChoose - 12][1][1],15,25);
			        m.Data.font = "bold 14px Verdana";
			        m.Data.fillStyle = "#FFFFFF";
			        m.Data.fillText(ToolList[1][ToolPanelChoose - 12][1][2],15,43);
			        m.Data.beginPath();
			        m.Data.moveTo(352,227);
			        m.Data.lineTo(352,251);
			        m.Data.lineTo(250,251);
			        m.Data.lineTo(280,227);
			        m.Data.closePath();
			        m.Data.fill();
			        m.Data.font = "bold 16px Verdana";
			        m.Data.fillStyle = "#000000";
			        if(Key == "auto"){
			          m.Data.fillText("自动使用",280,246);
			        }
			        else if(Key != ""){
			          m.Data.fillText("快捷 <" + Key + ">",280,246);
			        }
			        else{
			          m.Data.fillText("快捷配置",280,246);
			        }
			      }
			    }
			    return;
			  }
			  else if(ToolList[0].length > 0 || ToolList[1].length > 0){
			    var Key;
			    m.ClearMap(m.Data);
			    m.Data.font = "bold 14px Verdana";
			    m.Data.fillStyle = "#FFFFFF";
			    if(ToolPanelChoose < 12 && ToolList[0].length > 0){
			      if(ToolPanelChoose == ToolList[0].length){
			         ToolPanelChoose--;
			      }
			      Key = ToolList[0][ToolPanelChoose][1][3]; //获得快捷键
			   	  m.Data.strokeRect(11.5 + ((ToolPanelChoose > 5)?(ToolPanelChoose - 6):ToolPanelChoose) * 58,135 + ((ToolPanelChoose > 5)?42:0),38,38);
			   	  m.Data.font = "bold 16px Verdana";
			      m.Data.fillStyle = "#FFFF00";
			   	  m.Data.fillText(ToolList[0][ToolPanelChoose][1][1],15,25);
			   	  m.Data.font = "bold 14px Verdana";
			      m.Data.fillStyle = "#FFFFFF";
			      m.Data.fillText(ToolList[0][ToolPanelChoose][1][2],15,43);
			      m.Data.beginPath();
			      m.Data.moveTo(352,123);
			      m.Data.lineTo(352,99);
			      m.Data.lineTo(280,99);
			      m.Data.lineTo(250,123);
			      m.Data.closePath();
			      m.Data.fill();
			      m.Data.font = "bold 16px Verdana";
			      m.Data.fillStyle = "#000000";
			      if(Key != ""){
			        m.Data.fillText("快捷 <" + Key + ">",280,118);
			      }
			      else{
			        m.Data.fillText("快捷配置",280,118);
			      }
			   	}
			   	else if(ToolPanelChoose > 11 && ToolList[1].length > 0){
			   	  if(ToolPanelChoose == ToolList[1].length){
			         ToolPanelChoose--;
			      }
			   	  Key = ToolList[1][ToolPanelChoose - 12][1][3]; //获得快捷键
			   	  m.Data.strokeRect(11.5 + (ToolPanelChoose - 12) * 58,135 + 129,38,38);
			   	  m.Data.font = "bold 16px Verdana";
			      m.Data.fillStyle = "#FFFF00";
			   	  m.Data.fillText(ToolList[1][ToolPanelChoose - 12][1][1],15,25);
			   	  m.Data.font = "bold 14px Verdana";
			      m.Data.fillStyle = "#FFFFFF";
			   	  m.Data.fillText(ToolList[1][ToolPanelChoose - 12][1][2],15,43);
			   	  m.Data.beginPath();
			      m.Data.moveTo(352,227);
			      m.Data.lineTo(352,251);
			      m.Data.lineTo(250,251);
			      m.Data.lineTo(280,227);
			      m.Data.closePath();
			      m.Data.fill();
			   	  m.Data.font = "bold 16px Verdana";
			      m.Data.fillStyle = "#000000";
			      if(Key == "auto"){
			        m.Data.fillText("自动使用",280,246);
			      }
			      else if(Key != ""){
			        m.Data.fillText("快捷 <" + Key + ">",280,246);
			      }
			      else{
			        m.Data.fillText("快捷配置",280,246);
			      }
			   	}
			  }
			  m.ClearMap(m.UI);
			  m.SetAlpha(m.UI,0.7);
			  m.UI.fillStyle = "#000000";
			  m.UI.fillRect(0,0,352,352);
			  m.UI.fillStyle = "#FFFFFF";
			  m.UI.strokeStyle = "#FFFFFF";
			  m.UI.lineWidth = 2;
			  m.UI.beginPath();
			  m.UI.moveTo(0,124);
			  m.UI.lineTo(352,124);
			  m.UI.stroke();
			  m.UI.beginPath();
			  m.UI.moveTo(102,123);
			  m.UI.lineTo(72,99);
			  m.UI.lineTo(0,99);
			  m.UI.lineTo(0,123);
			  m.UI.closePath();
			  m.UI.fill();
			  m.UI.fillStyle = "#000000";
			  m.UI.font = "bold 16px Verdana";
			  m.UI.fillText("消耗道具",5,118);
			  m.UI.fillStyle = "#FFFFFF";
			  m.UI.beginPath();
			  m.UI.moveTo(0,252);
			  m.UI.lineTo(352,252);
			  m.UI.stroke();
			  m.UI.beginPath();
			  m.UI.moveTo(102,251);
			  m.UI.lineTo(72,227);
			  m.UI.lineTo(0,227);
			  m.UI.lineTo(0,251);
			  m.UI.closePath();
			  m.UI.fill();
			  m.UI.fillStyle = "#000000";
			  m.UI.fillText("永久道具",5,246);
			  m.UI.font = "bold 14px Verdana";
			  m.UI.fillStyle = "#FFFF00";
			  var IconData,IconID,ToolNum;
			  var ToolIn = 0;
			  var ToolLine = 0;
			  for(var t = 0;t < ToolList[0].length;t++){
			    IconID = ToolList[0][t][1][0];
			    IconData = m.Icons.GetData("Tool",IconID);
			    ToolNum = ToolList[0][t][1][4];
			      //消耗道具
			      m.UI.drawImage(m.Res[IconData[3]],IconData[1],IconData[2],32,32,15 + ToolIn * 58,139 + ToolLine,32,32);
			      m.UI.fillText(ToolNum,39 + ToolIn * 58,169 + ToolLine);
			      if(ToolIn > 4){
			        ToolLine += 42;
			        ToolIn = 0;
			      }
			      else{
			        ToolIn++;
			      }
			    }
			    ToolIn = 0;
			    ToolLine = 0;
			    for(var t = 0;t < ToolList[1].length;t++){
			    IconID = ToolList[1][t][1][0];
			    IconData = m.Icons.GetData("Tool",IconID);
			    ToolNum = ToolList[1][t][1][3];
			    //永久道具
			    m.UI.drawImage(m.Res[IconData[3]],IconData[1],IconData[2],32,32,15 + ToolIn * 58,268 + ToolLine,32,32);
			     m.UI.fillText(ToolNum,39 + ToolIn * 58,300 + ToolLine);
			    if(ToolIn > 5){
			      ToolLine2 += 42;
			      ToolIn2 = 0;
			    }
			    else{
			      ToolIn++;
			    }
			    }
			}
			
			m.DrawHelpPanel = function(){
			  clearInterval(MessageInTimer);
			  clearTimeout(WaitOut);     
			  clearInterval(MessageOutTimer);
      clearInterval(FloorTipTimer);
			  m.ClearMap(m.Data);
      m.ClearMap(m.UI);
      m.ResetAlpha(m.UI);
      m.ResetAlpha(m.Data);
			  m.SetAlpha(m.UI,0.7);
			  m.UI.fillStyle = "#000000";
      m.UI.fillRect(0,0,352,352);
			  m.UI.fillStyle = "#FFFFFF";
			  m.UI.font = "bold 32px Verdana";
		   m.UI.textAlign = "center";
		   m.SetAlpha(m.UI,0.9);
      m.UI.fillText("帮助说明",176,45);
			  switch(HelpPanelPage){
			    case 1:
			      m.SetAlpha(m.UI,0.9);
			      var HelpPcContent = ("电脑：\n↑ ↓ ← → 键移动\nH 键打开帮助面板\nC 键勇士原地转向\nT 键打开道具栏\nE 键打开怪物图鉴\nF 键打开楼层传送器\nZ 键存档\nX 键读档\nL 键放大画面\nK 键缩小画面").split("\n");
			      var HelpMobileContent = ("手机：\n虚拟方向键移动\n问号按钮打开帮助面板\n点击勇士原地转向\n道具按钮打开道具栏\n图鉴图标打开怪物图鉴\n权杖图标打开楼传器\n存档按钮存档\n读档按钮读档\n缩放按钮选择缩放倍率\n ").split("\n");
			      m.UI.fillStyle = "#FFFFFF";
			      m.UI.font = "bold 16px Verdana";
			      m.UI.textAlign = "left";
			      for(var w = 0;w < HelpPcContent.length;w++){
			        m.UI.fillText(HelpPcContent[w],20,(w * 25) + 75);
			        m.UI.fillText(HelpMobileContent[w],176,(w * 25) + 75);
			      }
			      m.UI.beginPath();
			      m.UI.moveTo(170,336);
			      m.UI.lineTo(182,336);
			      m.UI.lineTo(176,342);
			      m.UI.closePath();
			      m.UI.fill();
			    break;
			    case 2:
			      var HelpLeftContent = ("打开黄色门\n打开蓝色门\n打开红色门\n打开铁门\n增加攻/防值\n增加生命值").split("\n");
			      var HelpRightContent = ("大幅提升攻击\n大幅提升防御\n查看怪物数据\n进行楼层跳跃\n增加定量金币\n增加定量经验").split("\n");
			      m.SetAlpha(m.UI,0.9);
			      m.UI.fillStyle = "#FFFFFF";
			      m.UI.font = "bold 16px Verdana";
			      m.UI.textAlign = "left";
			      for(var w = 0;w < HelpLeftContent.length;w++){
			        m.UI.fillText(HelpLeftContent[w],70,(w * 43) + 100);
			        m.UI.fillText(HelpRightContent[w],230,(w * 43) + 100);
			      }
			      m.UI.drawImage(m.Res["Item1"],0,0,32,32,20,75,38,38);
			      m.UI.drawImage(m.Res["Item1"],32,0,32,32,20,120,38,38);
			      m.UI.drawImage(m.Res["Item1"],64,0,32,32,20,160,38,38);
			      m.UI.drawImage(m.Res["Item1"],0,32,32,32,20,202,38,38);
			      m.UI.drawImage(m.Res["Gem"],0,0,32,32,18,245,32,32);
			      m.UI.drawImage(m.Res["Gem"],32,0,32,32,28,255,32,32);
			      m.UI.drawImage(m.Res["Gem"],0,32,32,32,18,290,32,32);
			      m.UI.drawImage(m.Res["Gem"],32,32,32,32,28,300,32,32);
			      m.UI.drawImage(m.Res["Weapon"],0,0,32,32,178,75,38,38);
			      m.UI.drawImage(m.Res["Weapon"],0,64,32,32,178,120,38,38);
			      m.UI.drawImage(m.Res["Item1"],32,64,32,32,178,160,38,38);
			      m.UI.drawImage(m.Res["Item1"],64,64,32,32,178,202,38,38);
			      m.UI.drawImage(m.Res["Item1"],96,64,32,32,178,245,38,38);
			      m.UI.drawImage(m.Res["Gem"],96,32,32,32,178,291,38,38);
			      m.UI.beginPath();
			      m.UI.moveTo(170,70);
			      m.UI.lineTo(182,70);
			      m.UI.lineTo(176,64);
			      m.UI.closePath();
			      m.UI.fill();
			      m.UI.beginPath();
			      m.UI.moveTo(170,336);
			      m.UI.lineTo(182,336);
			      m.UI.lineTo(176,342);
			      m.UI.closePath();
			      m.UI.fill();
			    break;
			    case 3:
			      var HelpLeftContent = ("破坏面前的墙\n破坏一层的墙\n中心对称飞行\n直接下楼\n直接上楼\n生命值翻倍").split("\n");
			      var HelpRightContent = ("将墙变为黄门\n毁灭非boss怪\n免疫无敌属性\n对魔龙伤害加倍\n消除周围岩浆\n黄蓝红钥匙各一").split("\n");
			      m.SetAlpha(m.UI,0.9);
			      m.UI.fillStyle = "#FFFFFF";
			      m.UI.font = "bold 16px Verdana";
			      m.UI.textAlign = "left";
			      for(var w = 0;w < HelpLeftContent.length;w++){
			        m.UI.fillText(HelpLeftContent[w],70,(w * 43) + 100);
			        m.UI.fillText(HelpRightContent[w],230,(w * 43) + 100);
			      }
			      m.UI.drawImage(m.Res["Item2"],96,96,32,32,20,75,38,38);
			      m.UI.drawImage(m.Res["Item1"],0,64,32,32,20,120,38,38);
			      m.UI.drawImage(m.Res["Item1"],32,96,32,32,20,160,38,38);
			      m.UI.drawImage(m.Res["Item1"],64,96,32,32,20,202,38,38);
			      m.UI.drawImage(m.Res["Item1"],96,96,32,32,20,245,38,38);
			      m.UI.drawImage(m.Res["Gem"],96,96,32,32,20,290,38,38);
			      m.UI.drawImage(m.Res["Item3"],64,0,32,32,178,75,38,38);
			      m.UI.drawImage(m.Res["Item2"],32,96,32,32,178,120,38,38);
			      m.UI.drawImage(m.Res["Item2"],64,64,32,32,178,160,38,38);
			      m.UI.drawImage(m.Res["Item2"],0,96,32,32,178,202,38,38);
			      m.UI.drawImage(m.Res["Item2"],96,64,32,32,178,245,38,38);
			      m.UI.drawImage(m.Res["Item1"],64,32,32,32,178,291,38,38);
			      m.UI.beginPath();
			      m.UI.moveTo(170,70);
			      m.UI.lineTo(182,70);
			      m.UI.lineTo(176,64);
			      m.UI.closePath();
			      m.UI.fill();
			      m.UI.beginPath();
			      m.UI.moveTo(170,336);
			      m.UI.lineTo(182,336);
			      m.UI.lineTo(176,342);
			      m.UI.closePath();
			      m.UI.fill();
			    break;
			    case 4:
			      var HelpContent = ("经过两个多月的努力，纪元魔塔前传终于完结\n了，当然，有前传肯定有正式版，游戏是使用\nHTML5 Canvas + JavaScript 制作的，选择这两样\n东西制作是因为其跨平台能力强， 几乎所有的\n主流浏览器都能运行它，电脑和手机都能运行，\n不过这个版本的内核做的并不好，这在第三版\n本的纪元魔塔内核中将会得到极大的升级改进\n敬请期待纪元的新版本噢\n作者：Vinlic科技                    QQ：912121616\n网址：http://www.vinlic.com/\n").split("\n");
			      m.SetAlpha(m.UI,0.9);
			      m.UI.fillStyle = "#FFFFFF";
			      m.UI.font = "bold 16px Verdana";
			      m.UI.textAlign = "left";
			      for(var w = 0;w < HelpContent.length;w++){
			        m.UI.fillText(HelpContent[w],17,(w * 25) + 95);
			      }
			      m.UI.beginPath();
			      m.UI.moveTo(170,70);
			      m.UI.lineTo(182,70);
			      m.UI.lineTo(176,64);
			      m.UI.closePath();
			      m.UI.fill();
			      m.UI.beginPath();
			      m.UI.moveTo(170,336);
			      m.UI.lineTo(182,336);
			      m.UI.lineTo(176,342);
			      m.UI.closePath();
			      m.UI.fill();
			    break;
			    case 5:
			      var HelpContent = ("开发的过程中少不了很多人的帮助，在这里需\n要感谢他们的支持与帮助！没有他们也许纪元\n根本不能走到发布的那一天\n•感谢魔塔吧与安塔吧大触们的支持与建议\n•感谢纪元魔塔内测组全体人员的积极测试\n•感谢司令死灵法师的地图布局思路\n•感谢魔命棋妙提供的剧情与方方面面的建议\n•感谢 俺要啊啊 为此塔编写的攻略和Max数据\n•感谢 641 为此塔编写的攻略和Max数据\n(他们都是无敌神触！！！！)").split("\n");
			      m.SetAlpha(m.UI,0.9);
			      m.UI.fillStyle = "#FFFFFF";
			      m.UI.font = "bold 16px Verdana";
			      m.UI.textAlign = "left";
			      for(var w = 0;w < HelpContent.length;w++){
			        m.UI.fillText(HelpContent[w],17,(w * 25) + 95);
			      }
			      m.UI.beginPath();
			      m.UI.moveTo(170,70);
			      m.UI.lineTo(182,70);
			      m.UI.lineTo(176,64);
			      m.UI.closePath();
			      m.UI.fill();
			    break;
			  }
			}
			
			m.DrawGoFloorPanel = function(Type){
			  var ShowFloor;
			  if(!TestNull(Type)){
			    ShowFloor = Floor;
			  }
			  else{
			    if(Type == "Last"){
			      ShowFloor = Event.FindFloor(NowFloor + 1);
			      if((m.Maps[ShowFloor][2].Arrive == "No" || !m.Maps[ShowFloor][2].Arrive) || NowFloor == -1){
			        return;
			      }
			      NowFloor++;
			    }
			    else if(Type == "Next"){
			      ShowFloor = Event.FindFloor(NowFloor - 1);
			      if((m.Maps[ShowFloor][2].Arrive == "No" || !m.Maps[ShowFloor][2].Arrive) || NowFloor < -2){
			        return;
			      }
			      NowFloor--;
			    }
			  }
			  if(!Flag.ShowGoFloor){
			    Flag.ShowGoFloor = true;
			    clearInterval(MessageInTimer);
			    clearTimeout(WaitOut);
			    clearInterval(MessageOutTimer);
		  	    clearInterval(FloorTipTimer);
		  	    m.ClearMap(m.UI);
		  	    m.ClearMap(m.Data);
		  	    m.SetAlpha(m.UI,0.7);
			    m.UI.fillStyle = "#000000";
		  	    m.UI.fillRect(0,0,352,352);
			    m.ResetAlpha(m.UI);
			    m.ResetAlpha(m.Data);
	  		    m.Data.fillStyle = "#FFFFFF";
			    m.Data.font = "bold 25px Verdana";
			    m.Data.textAlign = "center";
	  		    m.Data.fillText("↑ 楼层跳跃 ↓",176,38);
		  	    m.Data.font = "bold 16px Verdana";
		  	    m.Data.fillText("“当权杖被举起，能量将被传送到所及之处”",176,68);
			    m.Data.font = "bold 13px Verdana";
			    m.Data.fillText(((ControllerMode == 0)?("点击虚拟按键的上或下选择要跳跃到的楼层后，"):("按 ↑ 或 ↓ 键选择要跳跃到的楼层后，")),176,325);
			    m.Data.fillText(((ControllerMode == 0)?("点击地图预览图即可进行传送"):("按空格键即可进行传送")),176,343);
			    m.UI.lineWidth = 2;
			    m.UI.strokeStyle = "#FFFFFF";
			    m.UI.strokeRect(20,93,200,200);
			  }
			  m.ClearMap(m.Data,222,100,150,180);
			  m.Data.textAlign = "center";
			  m.Data.fillStyle = "#FFFFFF";
			  m.Data.font = "bold 40px Verdana";
			  m.Data.fillText(m.Maps[ShowFloor][2].Floor + " F",286,205);
			  m.ClearMap(m.Data,22,95,198,198);
			  m.DrawThumbnail(m.Data,{"MapsData":m.Maps},22,95,17.9,ShowFloor);
			  var StairsData = m.Maps[ShowFloor][2].Stair;
			  var StairData;
			  var NowF = Map.Maps[Floor][2].Floor;
			  var StairType = (m.Maps[ShowFloor][2].Floor > NowF)?("Up"):("Down");
			  if(StairsData.length == 1){
		      StairData = StairsData[0];
		    }
		    else{
		      for(var s = 0;s < StairsData.length;s++){
		        if(StairType == "Up" && StairsData[s][7] == 0){
		          StairData = StairsData[s];
		        }
		        else if(StairType == "Down" && StairsData[s][7] == 1){
		          StairData = StairsData[s];
		        }
		      }
		    }
		    var ToX = StairData[1];
		    var ToY = StairData[2];
		    m.Data.fillStyle = "#FFFFFF";
		    m.Data.fillRect(ToX * 18 + 25,ToY * 18 + 98,10,10);
			  m.Data.textAlign = "left";
			}
			
			m.DrawItem = function(ID,ItemID,X,Y){
			  (m.Maps[Floor][2].Item).push([ID,ItemID,X,Y]);
			  ItemLocation.push([ID,ItemID,X,Y]);
			  X = X * 32;
			  Y = Y * 32;
			  var IconData = m.Icons.GetData("Item",ItemID);
			  m.ClearMap(m.Event,X,Y,32,32);
			    m.Event.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,X,Y,32,32);
			}
			//商店指令：Event.OpenStore("[Npc=6,贪婪之神,勇士，如你拥有 20 金币我将能为你提供一些能力]生命 +800&PayHP:800=20|攻击 +3&PayATK:3=20|防御 +3&PayDEF:3=20|离开商店&CloseStore");
			m.DrawStorePanel = function(Options){
			  var StoreChooseTemp = StoreChoose;
			  var First = false;
			  if(!isNaN(Options) && Options >= 0 && Options < StoreOptionNum && StoreOptionTemp != "" && Flag.ShowStorePanel){
			    StoreChoose = Options;
			    Options = StoreOptionTemp;
			  }
				else if(Options == "Last" && StoreChoose > 0 && StoreOptionTemp != "" && Flag.ShowStorePanel){
					StoreChoose--;
					Options = StoreOptionTemp.replace(/\<Gold\>/,20 + Hero["PayGold"]);
				}
				else if(Options == "Next" && StoreChoose < StoreOptionNum - 1 && StoreOptionTemp != "" && Flag.ShowStorePanel){
					StoreChoose++;
					Options = StoreOptionTemp.replace(/\<Gold\>/,20 + Hero["PayGold"]);
				}
				else if(Options == "Now" && StoreOptionTemp != "" && Flag.ShowStorePanel && Hero["Gold"] > Hero["PayGold"] + 20){
					Options = StoreOptionTemp.replace(/\<Gold\>/,Hero["PayGold"] + 21);
				}
				else{
				  First = true;
				  if(StoreOptionTemp != ""){
				    Options = StoreOptionTemp;
				  }
				  StoreOptionTemp = Options;
				}
				var BoxX = 65;
				var BoxY = 32;
				var WordNum = 0;
				var WordLine = 0;
				var LineTemp = "";
				var OptionName;
				var MessageLength = 0;
				var StoreData = (Options.match(/\[(.*)\]/)[0]).replace(/(^\[*)|(\]*$)/g,"");
				var Temp = StoreData.split(",");
				var StoreIcon = Temp[0].split("=");
				var StoreName = Temp[1];
				var StoreMessage = Temp[2];
				var IconData = m.Icons.GetData(StoreIcon[0],parseInt(StoreIcon[1]));
			 Options = (Options.replace(/\[(.*)\]/,"")).split("|");
			 StoreOptionNum = Options.length;
			 if(!Flag.ShowStorePanel){
			   First = true;
			   Event.Enable("Store");
			   m.ClearMap(m.UI);
				m.ClearMap(m.Data);
				m.ResetAlpha(m.UI);
				m.ResetAlpha(m.Data);
				m.UI.fillStyle = BoxBackground;
				m.UI.fillRect(BoxX + 1,BoxY + 1,220,279);
				m.UI.strokeStyle = "#FFFFFF";
				m.UI.lineWidth = 2.5;
				m.UI.strokeRect(BoxX,BoxY,221,280);
				m.UI.strokeRect(BoxX + 18,BoxY + 25,36,36);
				m.ClearMap(m.Data,BoxX + 20,BoxY + 28,32,32);
				m.Data.drawImage(m.Res[IconData[5]],GlobalAnimateStep * 32,IconData[2],32,32,BoxX + 20,BoxY + 28,32,32);
				clearInterval(MessageIconAnimate);
				MessageIconAnimate = window.setInterval(function(){
				  m.ClearMap(m.Data,BoxX + 20,BoxY + 28,32,32);
				  m.Data.drawImage(m.Res[IconData[5]],GlobalAnimateStep * 32,IconData[2],32,32,BoxX + 20,BoxY + 28,32,32);
				},200);
				//绘制商店名称
				m.Data.fillStyle = "#FFFFFF";
				m.Data.font = "bold 18px Verdana";
				m.Data.textAlign = "center";
				m.Data.fillText(StoreName,BoxX + 135,BoxY + 25);
				//绘制选项
				m.UI.fillStyle = "#FFFFFF";
				m.Data.fillStyle = "#FFFFFF";
				m.UI.textAlign = "center";
				m.UI.font = "bold 17px Verdana";
				m.Data.lineWidth = 2;
				for(var i = 0;i < Options.length;i++){
				  OptionName = Options[i].split("&");
				  m.UI.fillText(OptionName[0],BoxX + 112,(BoxY + 120) + (i * 40));
				}
			 }
			 m.ClearMap(m.Data,BoxX + 20,BoxY + 100,20,300);
			 m.ClearMap(m.Data,BoxX + 60,BoxY + 30,180,300);
			 if(ControllerMode == 0 && StoreChooseTemp == StoreChoose && !First){
			   if(!Event.Pay(StoreChoose)){
			     return;
			   }
			   StoreMessage = StoreMessage.replace(/\<Gold\>/,Hero["PayGold"] + 20);
			 }
			 //绘制商店说的话
				m.Data.textAlign = "left";
				m.Data.font = "bold 14px Verdana";
				StoreMessage = StoreMessage.replace(/\<Gold\>/,Hero["PayGold"] + 20);
				MessageLength = StoreMessage.length;
				for(var w = 0;w < MessageLength;w++){
				  if(WordNum < 9){
				    WordNum++;
				    LineTemp = LineTemp + StoreMessage[w];
				    if(w == MessageLength - 1){
				      m.Data.fillText(LineTemp,BoxX + 65,(BoxY + 45) + (WordLine * 18));
				      break;
				    }
				  }
				  else if(WordNum > 8){
				    WordNum = 0;
				    m.Data.fillText(LineTemp,BoxX + 65,(BoxY + 45) + (WordLine * 18));
				    LineTemp = "";
				    LineTemp = LineTemp + StoreMessage[w];
				    WordLine++;
				  }
				}
				m.Data.beginPath();
			 m.Data.moveTo(BoxX + 25,(BoxY + 121) + (StoreChoose * 40));
			 m.Data.lineTo(BoxX + 35,(BoxY + 113) + (StoreChoose * 40));
			 m.Data.lineTo(BoxX + 25,(BoxY + 106) + (StoreChoose * 40));
		  m.Data.closePath();
			 m.Data.fill();
			}
			
			m.DrawSelectBox = function(Type,MessageData,Option){
				clearInterval(MessageInTimer);
				clearTimeout(WaitOut);
      			clearInterval(MessageOutTimer);
      			clearInterval(FloorTipTimer);
      			clearTimeout(FloorTipOut);
      			var BoxType = Type.split(":");
      			var AnimateStep = 1;
      			var WordNum = 0;
      			var WordLine = 1;
      			var TextTemp = "";
      			Event.LockMove();
      			switch(BoxType[0]){
        		case "SLBox":
        			var Rect = [[],[27,27],[187,27],[27,187],[187,187]];
        			if(Flag.SL && TestNull(Option)){
        				m.ClearMap(m.Data);
        				for(var s = 1;s < 5;s++){
        					m.Data.strokeStyle = "#FFFFFF";
        					m.Data.strokeRect(Rect[s][0] - 2,Rect[s][1] - 2,140,140);
        				}
        				var Choose = Option;
        				m.Data.strokeStyle = "#CC6600";
        				m.Data.strokeRect(Rect[Choose][0] - 2,Rect[Choose][1] - 2,140,140);
        				return;
        			}
        			m.ResetAlpha(m.Data);
      				m.ClearMap(m.UI);
      				m.ClearMap(m.Data);
          			SLType = MessageData;
          			m.SetAlpha(m.UI,0.7);
          			var SaveData = [];
          			m.UI.fillStyle = "#000000";
          			m.UI.fillRect(0,0,352,352);
          			m.ResetAlpha(m.UI,function(){
            			m.UI.textAlign = "left";
            			m.Data.textAlign = "left";
            			m.Data.strokeStyle = "#FFFFFF";
            			m.Data.lineWidth = 3;
            			m.UI.font = "bold 14px Verdana";
            			m.UI.fillStyle = "#FFFFFF";
            			m.UI.textAlign = "center";
            			for(var s = 1;s < 5;s++){
              				if(localStorage.getItem("MotaData" + s)){
              					var DataTemp = JSON.parse(localStorage.getItem("MotaData" + s));
              					var SaveVersion = DataTemp.Version;
              					var SaveDate = DataTemp.Date;
              					SaveData.push(DataTemp);
                				m.DrawThumbnail(m.UI,DataTemp,Rect[s][0],Rect[s][1],12.4,null,function(){
                					m.ResetAlpha(m.Data);
                					if(ControllerMode == 1 && s == 1){
                						m.Data.strokeStyle = "#CC6600";
                					}
                					else{
                						m.Data.strokeStyle = "#FFFFFF";
                					}
                 		 			m.Data.strokeRect(Rect[s][0] - 2,Rect[s][1] - 2,140,140);
                 					m.UI.font = "bold 10px Verdana";
                 					m.UI.textAlign = "left";
                  					m.UI.fillStyle = "#FFFF00";
                  					m.UI.fillText(SaveDate,Rect[s][0] + 5,Rect[s][1] + 130);
                  					if(SaveVersion != Version){
                  						//版本对不上时
                  						m.UI.fillStyle = "#FF0000";
                  						m.UI.fillText(SaveVersion,Rect[s][0] + 5,Rect[s][1] + 15);
                  					}
                  					else{
                  						m.UI.fillStyle = "#00FF00";
                  						m.UI.fillText(SaveVersion,Rect[s][0] + 5,Rect[s][1] + 15);
                  					}
                				});
              				}
              				else{
                				m.UI.fillStyle = "#000000";
                				m.UI.fillRect(Rect[s][0],Rect[s][1],137,137);
                				m.UI.font = "bold 25px Verdana";
                				m.UI.fillStyle = "#FFFFFF";
                				m.UI.textAlign = "center";
                				m.UI.fillText("空",Rect[s][0] + 67,Rect[s][1] + 73);
                				m.ResetAlpha(m.Data);
                				if(ControllerMode == 1 && s == 1){
                					m.Data.strokeStyle = "#CC6600";
                				}
                				else{
                					m.Data.strokeStyle = "#FFFFFF";
                				}
                 		 		m.Data.strokeRect(Rect[s][0] - 2,Rect[s][1] - 2,140,140);
                				SaveData.push(null);
                				m.Data.textAlign = "left";
                				m.UI.textAlign = "left";
                			}
            			}
            			m.UI.font = "bold 12px Verdana";
            			m.UI.fillStyle = "#FFFFFF";
                		m.UI.textAlign = "center";
            			m.UI.fillText(((ControllerMode == 0)?("找到要"+((SLMode == "S")?"存入":"读取")+"的栏位，点击进行"+((SLMode == "S")?"存档":"读档")):("方向键"+((SLMode == "S")?"存入":"读取")+"的栏位,按 space 进行"+((SLMode == "S")?"存档":"读档")+",R键清空存档")),176,343);
          			});
        			break;
      			}
      			m.UI.textAlign = "left";
      		}
			
			m.DrawEnemyBox = function(EnemyList,EnemyPage){
			  	m.ClearMap(m.Data);
			  	m.ResetAlpha(m.Data);
			  	m.ResetAlpha(m.UI,function(){
		  	  m.UI.fillStyle = BoxBackground;
			  	 m.UI.fillRect(0,0,352,352);
			  	 m.SetAlpha(m.UI,0.4);
			    m.UI.fillStyle = "#000000";
			    m.UI.fillRect(0,0,352,352);
			    m.ResetAlpha(m.UI);
			    m.UI.textAlign = "left";
			    if(!TestNull(EnemyList[0][0])){
			      m.UI.fillStyle = "#999999";
			      m.UI.font = "bold 50px Verdana";
			      m.UI.fillText("本层无怪物",51,190);
			    }
			    else{
			      m.UI.strokeStyle = "#FFFFFF";
			      m.UI.lineWidth = 2;
			      var IconData;
			      var PageIndex = EnemyPage;
			      var EnemyAnimateList = [];
			      var AnimateStep = 1;
			      var SkillData;
			      EnemyBookAnimate = window.setInterval(function(){
			        if(EnemyAnimateList.length > 0){
			          for(var a = 0;a < EnemyAnimateList.length;a++){
			            m.ClearMap(m.Data,14,EnemyAnimateList[a][2],39,39);
			          m.Data.drawImage(m.Res["Terrain"],64,32,32,32,14,EnemyAnimateList[a][2],39,39);
			            m.Data.drawImage(m.Res[EnemyAnimateList[a][0]],AnimateStep * 32,EnemyAnimateList[a][1],32,32,17,EnemyAnimateList[a][3] + 1,33,33);
			            if(TestNull(EnemyAnimateList[a][4][1]) && EnemyAnimateList[a][4][0] != 0){
			              m.SetAlpha(m.Data,0.4);
			              m.Data.fillStyle = "#000000";
			              m.Data.fillRect(25,EnemyAnimateList[a][3] + 22,28,14);
			              m.ResetAlpha(m.Data);
			              m.Data.fillStyle = EnemyAnimateList[a][4][2];
			              m.Data.textAlign = "center";
			              m.Data.font = "bold 12px Verdana";
			            m.Data.fillText(EnemyAnimateList[a][4][1],40,EnemyAnimateList[a][3] + 34);
			              m.Data.font = "bold 15px Verdana";
			            }
			          }
			          AnimateStep++;
			          if(AnimateStep == 4){
			            AnimateStep = 0;
			          }
			        }
			      },200);
			      for(var i = 0;i < EnemyList[PageIndex].length;i++){
			        IconData = m.Icons.GetData("Enemy",EnemyList[PageIndex][i][0]);
			        if(i == 0){
			          m.UI.strokeRect(12,12,42,42);
			          m.Data.drawImage(m.Res["Terrain"],64,32,32,32,14,14,39,39);
			          m.Data.fillStyle = "#DDDDDD";
			          m.Data.font = "bold 15px Verdana";
			          m.Data.textAlign = "left";
			          m.Data.fillText("生命",62,50);
			          m.Data.fillText("攻击",160,28);
			          m.Data.fillText("防御",160,50);
			          m.Data.textAlign = "center";
			          SkillData = EnemyList[PageIndex][i][9];
			          m.Data.fillStyle = "#DDDDDD";
			          m.Data.font = "bold 15px Verdana";
			          m.Data.fillText(EnemyList[PageIndex][i][1],100,28);
			          m.Data.fillText(EnemyList[PageIndex][i][2],120,50);
			          m.Data.fillText(EnemyList[PageIndex][i][3],220,28);
			          m.Data.fillText(EnemyList[PageIndex][i][4],220,50);
			          var StrTemp = EnemyList[PageIndex][i][5] + "金 • " + EnemyList[PageIndex][i][6] + "经";
			          m.Data.fillText(StrTemp,(StrTemp.length > 9)?310:300,28);
			          if(EnemyList[PageIndex][i][8] == 0){
			            m.Data.fillStyle = "#00FF00";
			            m.Data.fillText("无损失",300,50);
			          }
			          else{
			            var Damage = EnemyList[PageIndex][i][8];
			            if(Damage > 9999998){
			              m.Data.fillStyle = "#FF0000";
			              m.Data.fillText("无法打败",300,50);
			            }
			            else{
			              m.Data.fillStyle = "#FFFF00";
			              m.Data.fillText(Damage,300,50);
			            }
			          }
			          m.Data.drawImage(m.Res[IconData[5]],0,IconData[2],32,32,17,17,33,33);
			        if(TestNull(SkillData[1]) && SkillData[0] != 0){
			            m.SetAlpha(m.Data,0.4);
			            m.Data.fillStyle = "#000000";
			            m.Data.fillRect(25,38,28,14);
			            m.ResetAlpha(m.Data);
			            m.Data.fillStyle = SkillData[2];
			            m.Data.font = "bold 12px Verdana";
			          m.Data.fillText(SkillData[1],40,50);
			            m.Data.font = "bold 15px Verdana";
			          }
			          EnemyAnimateList.push([IconData[5],IconData[2],14,16,SkillData]);
			        }
			        else{
			          m.Data.textAlign = "left";
			          m.Data.fillStyle = "#DDDDDD";
			          m.UI.strokeRect(12,(53 * (i + 1)) - 41,42,42);
			          m.Data.drawImage(m.Res["Terrain"],64,32,32,32,14,((53 * (i + 1)) - 39),39,39);
			          m.Data.fillText("生命",62,((53 * (i + 1)) - 3));
			          m.Data.fillText("攻击",160,(53 * (i + 1)) - 25);
			          m.Data.fillText("防御",160,(53 * (i + 1)) - 3);
			          m.Data.textAlign = "center";
			          SkillData = EnemyList[PageIndex][i][9];
			          m.Data.fillText(EnemyList[PageIndex][i][1],100,((53 * (i + 1)) - 25));
			          m.Data.fillText(EnemyList[PageIndex][i][2],120,(53 * (i + 1)) - 3);
			          m.Data.fillText(EnemyList[PageIndex][i][3],220,(53 * (i + 1)) - 25);
			          m.Data.fillText(EnemyList[PageIndex][i][4],220,(53 * (i + 1)) - 3);
			          var StrTemp = EnemyList[PageIndex][i][5] + "金 • " + EnemyList[PageIndex][i][6] + "经";
			          m.Data.fillText(StrTemp,(StrTemp.length > 9)?310:300,(53 * (i + 1)) - 25);
			          if(EnemyList[PageIndex][i][8] == 0){
			            m.Data.fillStyle = "#00FF00";
			            m.Data.fillText("无损失",300,(53 * (i + 1)) - 3);
			          }
			          else{
			            var Damage = EnemyList[PageIndex][i][8];
			            if(Damage > 9999998){
			              m.Data.fillStyle = "#FF0000";
			              m.Data.fillText("无法打败",300,(53 * (i + 1)) - 3);
			            }
			            else{
			              m.Data.fillStyle = "#FFFF00";
			              m.Data.fillText(Damage,300,(53 * (i + 1)) - 3);
			            }
			          }
			          m.Data.drawImage(m.Res[IconData[5]],0,IconData[2],32,32,17,((53 * (i+1)) - 36),33,33);
			          if(TestNull(SkillData[1]) && SkillData[0] != 0){
			            m.SetAlpha(m.Data,0.4);
			            m.Data.fillStyle = "#000000";
			            m.Data.fillRect(25,((53 * (i+1)) - 37) + 22,28,14);
			            m.ResetAlpha(m.Data);
			            m.Data.fillStyle = SkillData[2];
			            m.Data.font = "bold 12px Verdana";
			            m.Data.fillText(SkillData[1],40,((53 * (i+1)) - 37) + 34);
			            m.Data.font = "bold 15px Verdana";
			          } EnemyAnimateList.push([IconData[5],IconData[2],((53 * (i + 1)) - 39),((53 * (i+1)) - 37),SkillData]);
			        }
			      }
			      m.Data.fillStyle = "#DDDDDD";
			      m.Data.fillText("▲ " + (PageIndex+1) + "/" + ((TestNull(EnemyList[EnemyList.length - 1][0]))?EnemyList.length:EnemyList.length - 1) + " ▼",176,340);
			      m.Data.textAlign = "left";
			    }
			  });
			}
			
			m.WallOpen = function(Type,X,Y,callback){
			  var AnimateStep = 1;
			  X = X * 32;
			  Y = Y * 32;
			  var IconData = m.Icons.GetData("Door",Type);
			  var DoorOpenTimer = window.setInterval(function(){
			    m.ClearMap(m.Fg,X,Y,32,32);
			    m.Fg.drawImage(m.Res[IconData[5]],IconData[1],AnimateStep * 32,32,32,X,Y,32,32);
			    AnimateStep++;
			    if(AnimateStep > 4){
           m.ClearMap(m.Fg,X,Y,32,32);
			      clearInterval(DoorOpenTimer);
			      if(TestNull(callback)){
					      callback();
				     }
			    }
			  },40);
			}
			
			m.DoorOpen = function(X,Y,callback){
			  var DoorType = Event.RemoveDoor(X,Y);
			  var AnimateStep = 1;
			  X = X * 32;
			  Y = Y * 32;
			  var IconData = m.Icons.GetData("Door",DoorType);
			  var DoorOpenTimer = window.setInterval(function(){
			    m.ClearMap(m.Fg,X,Y,32,32);
			    m.Fg.drawImage(m.Res[IconData[5]],IconData[1],AnimateStep * 32,32,32,X,Y,32,32);
			    AnimateStep++;
			    if(AnimateStep > 4){
           m.ClearMap(m.Fg,X,Y,32,32);
			      clearInterval(DoorOpenTimer);
			      if(TestNull(callback)){
					      callback();
				     }
			    }
			  },40);
			}
			
			m.DoorClose = function(DoorType,X,Y,Pass,callback,NoAnimate){
			  Event.AddDoor(DoorType,X,Y,Pass);
			  var AnimateStep = 3;
			  var X = X * 32;
			  var Y = Y * 32;
			  var IconData = m.Icons.GetData("Door",DoorType);
			  if(NoAnimate){
			    m.ClearMap(m.Fg,X,Y,32,32);
			    m.Fg.drawImage(m.Res[IconData[5]],IconData[1],0,32,32,X,Y,32,32);
			    return;
			  }
			  var DoorCloseTimer = window.setInterval(function(){
			    m.ClearMap(m.Fg,X,Y,32,32);
			    m.Fg.drawImage(m.Res[IconData[5]],IconData[1],AnimateStep * 32,32,32,X,Y,32,32);
			    AnimateStep--;
			    if(AnimateStep < 0){
			        clearInterval(DoorCloseTimer);
			        if(TestNull(callback)){
					        callback();
				       }
			    }
			  },40);
			}

			m.DrawMessage = function(Content,Type,Icon,Time,callback){
			  if(!TestNull(Time)){
			    Time = 1000;
			  }
      	switch(Type){
        		case "Tip":
          			clearInterval(MessageInTimer);
          			clearTimeout(WaitOut);
          			clearInterval(MessageOutTimer);
          		  	clearInterval(FloorTipTimer);
          			var IconData;
          			var OpacityVal = 0.1;
          			m.Data.textAlign = "left";
          			m.SetAlpha(m.Data,OpacityVal);
          			m.ClearMap(m.Data,8,0,402,46);
          			if(TestNull(Icon)){
            			IconData = m.Icons.GetData(Icon[0],Icon[1]);
            			m.Data.font = "normal 16px Verdana";
            			m.Data.fillStyle = "#000000";
            			m.Data.fillRect(8,4,m.Data.measureText(Content).width + 55,42);
            			m.Data.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,12,9,32,32);
            			m.Data.fillStyle = "#FFFFFF";
            			m.Data.fillText(Content,50,32);
          			}
          			else{
            			m.Data.font = "normal 14px Verdana";
            			m.Data.fillStyle = "#000000";
            			m.Data.fillRect(8,4,m.Data.measureText(Content).width + 10,25);
            			m.Data.fillStyle = "#FFFFFF";
            			m.Data.fillText(Content,13,22);
          			}
          			MessageInTimer = setInterval(function(){
            			OpacityVal += 0.1;
            			m.SetAlpha(m.Data,OpacityVal);
            			m.ClearMap(m.Data,8,4,402,42);
            			if(TestNull(Icon)){
            				m.Data.font = "normal 16px Verdana";
              				m.Data.fillStyle = "#000000";
              				m.Data.fillRect(8,4,m.Data.measureText(Content).width + 55,42);
              				m.Data.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,12,9,32,32);
              				m.Data.fillStyle = "#FFFFFF";
              				m.Data.fillText(Content,50,32);
            			}
            			else{
              				m.Data.font = "normal 14px Verdana";
              				m.Data.fillStyle = "#000000";
              				m.Data.fillRect(8,4,m.Data.measureText(Content).width + 10,25);
              				m.Data.fillStyle = "#FFFFFF";
              				m.Data.fillText(Content,13,22);
            			}
            			if(OpacityVal >= 0.6){
            				clearInterval(MessageInTimer);
             				WaitOut = window.setTimeout(function(){
                				MessageOutTimer = window.setInterval(function(){
                		    		OpacityVal -= 0.1;
                  					m.SetAlpha(m.Data,OpacityVal);
                  					m.ClearMap(m.Data,8,4,402,42);
                  					if(TestNull(Icon)){
                    					m.Data.font = "normal 16px Verdana";
                    					m.Data.fillStyle = "#000000";
                    					m.Data.fillRect(8,4,m.Data.measureText(Content).width + 55,42);
                    					m.Data.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,12,9,32,32);
                    					m.Data.fillStyle = "#FFFFFF";
                    					m.Data.fillText(Content,50,32);
                  					}
                  					else{
                    					m.Data.fillStyle = "#FFFFFF";
                    					m.Data.fillText(Content,13,22);
                  					}
                  					if(OpacityVal <= 0){
                    					clearInterval(MessageOutTimer);
                    					m.SetAlpha(m.Data,1);
                    					m.ClearMap(m.Data,8,4,402,42);
                    					if(TestNull(callback)){
									  		callback();
				    					}
                  					}
                				},40);
              				},Time);
            			}
          			},40);
        		break;
        		case "Floor":
        		  clearInterval(MessageInTimer);
          		  clearTimeout(WaitOut);
          		  clearInterval(MessageOutTimer);
          		  clearInterval(FloorTipTimer);
        		  var OpacityVal = 0;
        		  var FadeOut = false;
        		  m.ClearMap(m.Data);
        		  m.SetAlpha(m.Data,OpacityVal);
        		  m.Data.textAlign = "left";
        		  m.Data.font = "bold 18px Verdana";
        		  m.Data.fillStyle = "#CCCCCC";
        		  FloorTipTimer = window.setInterval(function(){
        		    if(Flag.LockFloorTip){
        		      clearInterval(MessageInTimer);
          		  clearTimeout(WaitOut);
          		  clearInterval(MessageOutTimer);
          		  clearInterval(FloorTipTimer);
          		  Flag.LockFloorTip = false;
        		      return;
        		    }
        		    if(FadeOut){OpacityVal -= 0.1}else{OpacityVal += 0.1}
        		    m.ClearMap(m.Data,0,0,352,30);
        		    m.SetAlpha(m.Data,OpacityVal);
        		    m.Data.fillStyle = "#000000";
            		m.Data.fillRect(171 - (Content.length * 18)/2,0,m.Data.measureText(Content).width + 10,30);
            		m.Data.fillStyle = "#CCCCCC";
            		m.Data.fillText(Content,175 - (Content.length * 18)/2,23);
        		    if(OpacityVal > 0.5 && !FadeOut){
        		      OpacityVal = 0.5;
        		      FloorTipOut = window.setTimeout(function(){
        		        FadeOut = true;
        		      },800);
        		    }
        		    else if(OpacityVal < 0.1 && FadeOut){
        		      clearInterval(FloorTipTimer);
        		    }
        		  },30);
        		break;
        		case "Item":
          	var BoxY = 97;
          	var BoxH = 170;
          	var ItemData = Content;
          	if(!isNaN(ItemData[0])){
          	  m.DrawMessage("获得 " + ItemData[1] + " " + ItemData[2],"Tip",["Item",ItemData[0]]);
          	}
          	else{
          	  var IconData = m.Icons.GetData("Item",ItemData[0]);
          	  Flag.ShowGetItemPanel = true;
          	  Event.Disable("SL");
        		   Event.Disable("EnemyBook");
        		   Event.Disable("Controller");
        		   Event.Disable("ChangeHead");
        		   Flag.Move = false;
        		   clearTimeout(MoveTimeout);
		          clearInterval(MoveTimer);
          	  var WordLine = 1;
          	  var WordNum = 0;
          	  m.ResetAlpha(m.UI);
          	  m.UI.strokeStyle = "#FFFFFF";
          	  m.UI.lineWidth = 3;
          	  m.UI.strokeRect(0,BoxY,352,BoxH);
          	  m.UI.fillStyle = BoxBackground;
          	  m.UI.fillRect(2,BoxY + 2,348,166);
          	  m.UI.beginPath();
          	  m.UI.arc(176,BoxY - 20,40,0,Math.PI * 2);
          	  m.UI.closePath();
          	  m.UI.fill();
          	  m.UI.stroke();
          	  m.UI.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,154,BoxY - 42,45,45);
          	  m.UI.font = "bold 24px Verdana";
          	  m.UI.textAlign = "center";
          	  m.UI.fillStyle = "#FFFFFF";
          	  m.UI.fillText(ItemData[1],174,BoxY + 47);
          	  m.UI.font = "bold 18px Verdana";
          	  m.UI.textAlign = "left";
          	  for(var t = 0;t < ItemData[2].length;t++){
          	    if(WordNum > 17){
          	      m.UI.fillText(ItemData[2].substr((t - 18),18),15,(BoxY + 52) + 22 * WordLine);
                 WordNum = 0;
                 WordLine++;
          	    }
          	    else if(t == ItemData[2].length - 1){
          	    var Num = ItemData[2].length - ((WordLine - 1) * 18);
          	        m.UI.fillText(ItemData[2].substr(t - Num + 1,Num + 1),15,(BoxY + 52) + 22 * WordLine);
          	    }
          	    WordNum++;
          	 }
          	}
        		break;
        		case "Message":
        		  Event.Disable("SL");
        		  Event.Disable("EnemyBook");
        		  Event.Disable("ToolsPanel");
        		  Event.Disable("GoFloor");
        		  Event.Disable("ChangeHead");
        		 Flag.ShowMessage = false;
        			Flag.NextMessage = false;
        			Event.LockMove();
        			clearInterval(ShowWordTimer);
        			m.ClearMap(m.UI);
          			var HeroHead = HeroLocation[0];
          			var HeroX = HeroLocation[1] * 32;
          			var HeroY = HeroLocation[2] * 32;
          			var TalkName = (Content.match(/\[(.*)\]/)[0]).replace(/(^\[*)|(\]*$)/g,"");//正则匹配得到说话的对象名称
          			var Message = Content.replace(/\[(.*)\]/,"");
          			var BoxX,BoxY,TextX,TextY;
          			var WordNum = 0;
          			var WordWidth = 0;
          			var WordLine = 1;
          			if(Flag.MessageBoxStep == 0){
          				if(LastTalk != TalkName){
          					Flag.MessageBoxStep = 1;
          				}
          				LastTalk = TalkName;
          				BoxX = 45;
          				BoxY = 32;
          				TextX = BoxX + 70;
          				TextY = BoxY + 25;
          		 		m.ResetAlpha(m.UI);
          	 			m.UI.strokeStyle = "#FFFFFF";
          	 			m.UI.lineWidth = 6;
          	 			m.UI.strokeRect(BoxX - 1,BoxY - 1,266,130);
               			m.UI.fillStyle = BoxBackground;
               			m.UI.fillRect(BoxX,BoxY,265,129);
               			m.UI.fillStyle = "#FFFFFF";
          	 			m.UI.lineWidth = 2;
          	 			m.UI.strokeRect(BoxX + 15,BoxY +15,38,38);
          	 			if(TalkName == "Hero"){
          					m.UI.drawImage(m.Res["Hero"],0,0,32,32,BoxX + 18,BoxY + 18,32,32);
          					m.UI.fillStyle = "#FFFFFF";
          					m.UI.textAlign = "center";
          					m.UI.font = "bold 20px Verdana";
          					m.UI.fillText(Hero["Name"],200,TextY);
          					m.UI.textAlign = "left";
          					m.UI.font = "bold 16px Verdana";
          					ShowWordTimer = window.setInterval(function(){
          						if(WordNum >= Message.length){
          							clearInterval(ShowWordTimer);
          							m.UI.font = "bold 12px Verdana";
          	 			    		m.UI.fillStyle = "#FFFFFF";
          	 			    		m.UI.textAlign = "right";
          				    		m.UI.fillText("-" +((ControllerMode == 0)?"轻触屏幕继续":"按任意键继续")+ "-",BoxX + 255,BoxY + 117);
          				    		m.UI.textAlign = "left";
          							Flag.ShowMessage = true;
          							return;
          						}
          						if(WordNum == (11 * WordLine)){
          							WordWidth = 0;
          							WordLine++;
          						}
          						m.UI.fillText(Message[WordNum],TextX + (16 * WordWidth),TextY + (WordLine * 25));
          						WordWidth++;
          						WordNum++;
	          				},30);
          				}
          				else{
          					var Data = TalkName.split(",");
          					var Temp = Data[0].split("=");
          					var TalkType = Temp[0];
          					var TalkID = Temp[1];
          					var Name = Data[1];
          					var IconData = m.Icons.GetData(TalkType,TalkID);
          					m.UI.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,BoxX + 18,BoxY + 18,32,32);
          					m.UI.fillStyle = "#FFFFFF";
          					m.UI.font = "bold 20px Verdana";
          					m.UI.textAlign = "center";
          					m.UI.fillText(Name,200,TextY);
          					m.UI.textAlign = "left";
          					m.UI.font = "bold 16px Verdana";
          					ShowWordTimer = window.setInterval(function(){
          						if(WordNum >= Message.length){
          							clearInterval(ShowWordTimer);
          							m.UI.font = "bold 12px Verdana";
          	 			    m.UI.fillStyle = "#FFFFFF";
          	 			    m.UI.textAlign = "right";
          				    m.UI.fillText("-" +((ControllerMode == 0)?"轻触屏幕继续":"按任意键继续")+ "-",BoxX + 255,BoxY + 117);
          				    m.UI.textAlign = "left";
          							Flag.ShowMessage = true;
          							return;
          						}
          						if(WordNum == (11 * WordLine)){
          							WordWidth = 0;
          							WordLine++;
          						}
          						m.UI.fillText(Message[WordNum],TextX + (16 * WordWidth),TextY + (WordLine * 25));
          						WordWidth++;
          						WordNum++;
	          				},30);
          				}
            		}
            		else if(Flag.MessageBoxStep == 1){
            			if(LastTalk != TalkName){
          					Flag.MessageBoxStep = 0;
          				}
          				LastTalk = TalkName;
            			BoxX = 45;
          				BoxY = 190;
          				TextX = BoxX + 70;
          				TextY = BoxY + 25;
          	 			m.ResetAlpha(m.UI);
          	 			m.UI.strokeStyle = "#FFFFFF";
          	 			m.UI.lineWidth = 6;
          	 			m.UI.strokeRect(BoxX - 1,BoxY - 1,266,130);
               			m.UI.fillStyle = BoxBackground;
               			m.UI.fillRect(BoxX,BoxY,265,129);
               			m.UI.fillStyle = "#FFFFFF";
          	 			m.UI.lineWidth = 2;
          	 			m.UI.strokeRect(BoxX + 15,BoxY +15,38,38);
          	 			if(TalkName == "Hero"){
          					m.UI.drawImage(m.Res["Hero"],0,0,32,32,BoxX + 18,BoxY + 18,32,32);
          					m.UI.font = "bold 20px Verdana";
          					m.UI.textAlign = "center";
          					m.UI.fillText(Hero["Name"],200,TextY);
          				 m.UI.textAlign = "left";
          					m.UI.font = "bold 16px Verdana";
                    		m.UI.fillStyle = "#FFFFFF";
          					ShowWordTimer = window.setInterval(function(){
          						if(WordNum >= Message.length){
          							clearInterval(ShowWordTimer);
          							m.UI.font = "bold 12px Verdana";
          	 			    m.UI.fillStyle = "#FFFFFF";
          	 			    m.UI.textAlign = "right";
          				    m.UI.fillText("-" +((ControllerMode == 0)?"轻触屏幕继续":"按任意键继续")+ "-",BoxX + 255,BoxY + 117);
          				    m.UI.textAlign = "left";
          							Flag.ShowMessage = true;
          							return;
          						}
          						if(WordNum == (11 * WordLine)){
          							WordWidth = 0;
          							WordLine++;
          						}
          						m.UI.fillText(Message[WordNum],TextX + (16 * WordWidth),TextY + (WordLine * 25));
          						WordWidth++;
          						WordNum++;
	          				},30);
          				}
          				else{
          					var Data = TalkName.split(",");
          					var Temp = Data[0].split("=");
          					var TalkType = Temp[0];
          					var TalkID = Temp[1];
          					var Name = Data[1];
          					var IconData = m.Icons.GetData(TalkType,TalkID);
          					m.UI.drawImage(m.Res[IconData[5]],IconData[1],IconData[2],32,32,BoxX + 18,BoxY + 18,32,32);
          					m.UI.textAlign = "center";
          					m.UI.font = "bold 20px Verdana";
          					m.UI.fillText(Name,200,TextY);
          					m.UI.textAlign = "left";
          					m.UI.font = "bold 16px Verdana";
                    		m.UI.fillStyle = "#FFFFFF";
          					ShowWordTimer = window.setInterval(function(){
          						if(WordNum >= Message.length){
          							clearInterval(ShowWordTimer);
          							m.UI.font = "bold 12px Verdana";
          	 			    m.UI.fillStyle = "#FFFFFF";
          	 			    m.UI.textAlign = "right";
          				    m.UI.fillText("-" +((ControllerMode == 0)?"轻触屏幕继续":"按任意键继续")+ "-",BoxX + 255,BoxY + 117);
          				    m.UI.textAlign = "left";
          							Flag.ShowMessage = true;
          							return;
          						}
          						if(WordNum == (11 * WordLine)){
          							WordWidth = 0;
          							WordLine++;
          						}
          						m.UI.fillText(Message[WordNum],TextX + (16 * WordWidth),TextY + (WordLine * 25));
          						WordWidth++;
          						WordNum++;
	          				},30);
          				}
            		}
            		WaitNextMessageTimer = window.setInterval(function(){
            			if(Flag.NextMessage){
            				Flag.NextMessage = false;
            				clearInterval(WaitNextMessageTimer);
            				m.ClearMap(m.UI);
            				callback();
            				return;
            			}
	        		},10);
        		break;
      		  }
    		}

			//清除地图或地图某部分
			m.ClearMap = function(Canvas,X,Y,W,H,callback){
			  //如果有指定了Canvas就擦除该画布上的东西
				if(TestNull(Canvas)){
				  //如果指定了X,Y,W,H就根据这些参数来清除
					if(TestNull(X) && TestNull(Y) && TestNull(W) && TestNull(H)){
						Canvas.clearRect(X,Y,W,H);
					}
					else{
					  //如果未指定X,Y,W,H则擦除整张画布
						Canvas.clearRect(0,0,MapBg.offsetWidth,MapBg.offsetHeight);
					}
				}
				else{
				  //如果未指定是擦除哪张画布，则擦除所有画布的东西
					var Width = 402;
					var Height = 402;
					m.Bg.clearRect(0,0,Width,Height);
					m.Event.clearRect(0,0,Width,Height);
					m.Fg.clearRect(0,0,Width,Height);
					m.UI.clearRect(0,0,Width,Height);
					m.Data.clearRect(0,0,Width,Height);
				}
				if(TestNull(callback)){
				  callback();
				}
			}
			
			//设置透明度的方法
			m.SetAlpha = function(Canvas,Val,callback){
				if(TestNull(Canvas)){
					Canvas.globalAlpha = Val; //设置指定画布的透明度
				}
				else{
				  //设置所有画布的透明度
					m.Bg.globalAlpha = Val;
					m.Event.globalAlpha = Val;
					m.Fg.globalAlpha = Val;
					m.UI.globalAlpha = Val;
					m.Data.globalAlpha = Val;
				}
				if(TestNull(callback)){
					 callback();
				}
			}
			
			//重置透明度
			m.ResetAlpha = function(Canvas,callback){
				if(TestNull(Canvas)){
					Canvas.globalAlpha = 1; //设置指定画布透明度为150%
				}
				else{
				  //设置所有画布透明度为150%
					m.Bg.globalAlpha = 1;
					m.Event.globalAlpha = 1;
					m.Fg.globalAlpha = 1;
					m.UI.globalAlpha = 1;
					m.Data.globalAlpha = 1;
				}
				if(TestNull(callback)){
					 callback();
				}
			}
			return m; //返回Map对象
		}
		
		function SetRotate(Deg){
		  Controller2.style.WebkitTransform = "rotate(" +Deg+ "deg)";
		  Controller2.style.msTransform = "rotate(" +Deg+ "deg)";
		  Controller2.style.transform = "rotate(" +Deg+ "deg)";
		}
		
		function Move(X,Y,callback){
		  Controller2.style.display = "block";
		  //上
		  if(XYMod(X,Y,ControlGroup.offsetLeft,ControlGroup.offsetTop,15,0,130,50)){
		    SetRotate(-90);
		    callback(0);
		    return;
		  }
		  //左
		  if(XYMod(X,Y,ControlGroup.offsetLeft,ControlGroup.offsetTop,0,15,50,130)){
		    SetRotate(-180);
		    callback(1);
		    return;
		  }
		  //下
		  if(XYMod(X,Y,ControlGroup.offsetLeft,ControlGroup.offsetTop,15,110,130,50)){
		    SetRotate(90);
		    callback(2);
		    return;
		  }
		  //右
		  if(XYMod(X,Y,ControlGroup.offsetLeft,ControlGroup.offsetTop,110,15,50,130)){
		    SetRotate(0);
		    callback(3);
		    return;
		  }
		}
		
		function MoveTrigger(){
			if(Flag.EventRuning){
				Flag.LockMove = true;
			}
			if(Flag.Move && !Flag.LockMove){
		    	Flag.LockMove = true;
		    	var Head = HeroLocation[0];
		    	Map.DrawMove(Head,function(){
		    	  Flag.LockMove = false;
		    	});
		  	}
		}
		
		window.ontouchstart = function(event){
		   ControllerMode = 0;
		   if(Flag.ShowMessage){
		     Flag.NextMessage = true;
		   }
		   if(Flag.ShowGetItemPanel){
		     Event.CloseGetItemPanel();
		   }
		 }
		
		CanvasGroup.ontouchstart = function(event){
		  var ChooseTemp = ToolPanelChoose;
			var ClientX = event.touches[0].clientX;
		   	var ClientY = event.touches[0].clientY;
		   	var X = ClientX - (CanvasGroup.offsetLeft * Zoom);
		   	var Y = ClientY - (CanvasGroup.offsetTop * Zoom);
		   	var Top = CanvasGroup.offsetTop;
		   	var Left = CanvasGroup.offsetLeft;
		   	if(WindowMode == 0){
		   	  Top += 100;
		   	}
		   	else if(WindowMode == 1){
		   	  Left += 122;
		   	}
			if(Flag.SL){
		   		if(XYMod(ClientX,ClientY,Left,Top,25,25,140,140)){
		   			Event.CloseSL();
		   			if(SLMode == "S"){
						Event.SaveGame(1);
					}
					else if(SLMode == "L"){
						Event.LoadGame(1);
					}
		   		}
		   		else if(XYMod(ClientX,ClientY,Left,Top,190,25,140,140)){
		   			Event.CloseSL();
		   			if(SLMode == "S"){
						Event.SaveGame(2);
					}
					else if(SLMode == "L"){
						Event.LoadGame(2);
					}
		   		}
		   		else if(XYMod(ClientX,ClientY,Left,Top,25,190,140,140)){
		   			Event.CloseSL();
		   			if(SLMode == "S"){
						Event.SaveGame(3);
					}
					else if(SLMode == "L"){
						Event.LoadGame(3);
					}
		   		}
		   		else if(XYMod(ClientX,ClientY,Left,Top,190,190,140,140)){
		   			Event.CloseSL();
		   			if(SLMode == "S"){
						Event.SaveGame(4);
					}
					else if(SLMode == "L"){
						Event.LoadGame(4);
					}
		   		}
		   		SLPanelChoose = 1;
		   		return;
		   	}
		   	if(Flag.ShowEnemyBook){
		      EnemyPage = 0;
		      Event.CloseEnemyBook();
		    }
		    if(Flag.ShowHelpPanel){
		    	  Event.CloseHelpPanel();
		    	  return;
		    }
		   	if(Flag.ShowGoFloor && XYMod(ClientX,ClientY,Left,Top,22,95,198,198)){
		   	  Event.GoToFloor(NowFloor);
		   	}
		   	if(Flag.ShowToolsPanel){
		   	  var ChooseTemp = ToolPanelChoose;
		   	  var X,Y;
		   	  for(var t = 0;t < 24;t++){
		   	    if(t < 6){
		   	      X = t;
		   	      Y = 0;
		   	    }
		   	    else if(t > 5 && t < 12){
		   	      X = t - 6;
		   	      Y = 42;
		   	    }
		   	    else if(t > 11 && t < 18){
		   	      X = t - 12;
		   	      Y = 129;
		   	    }
		   	    else if(t > 17 && t < 24){
		   	      X = t - 18;
		   	      Y = 171;
		   	    }
		   	    if(XYMod(ClientX,ClientY,Left,Top,11.5 + X * 58,135 + Y,40,40)){
		   	      var Data = Event.OpenToolsPanel(t);
		   	      if(Data && ChooseTemp == ToolPanelChoose){
		   	        Event.UseTool(Data[0]);
		   	      }
		   	      return;
		   	    }
		   	  }
		   	  return;
		   	}
		   	if(Flag.ChangeHead && XYMod(ClientX,ClientY,Left,Top,11.5 + HeroLocation[1] * 32,HeroLocation[2] * 32,32,32)){
		   	  Map.DrawMessage("原地转向","Tip");
		   	  Event.ChangeHead();
		   	}
		   	if(Flag.ShowStorePanel && StoreOptionTemp != "" && StoreOptionNum > 0){
		   	  for(var i = 0;i < 4;i++){
		   	    Map.Data.fillStyle = "#FFFFFF";
		   	    if(XYMod(ClientX,ClientY,Left,Top,105,132 + (i * 40),150,25)){
		   	      Event.OpenStore(i);
		   	    }
		   	  }
		   	}
		}
		
		CanvasGroup.ontouchmove = function(event){
			   var ClientX = event.touches[0].clientX;
		   	var ClientY = event.touches[0].clientY;
		   	var X = ClientX - (CanvasGroup.offsetLeft * Zoom);
		   	var Y = ClientY - (CanvasGroup.offsetTop * Zoom);
		   	var Top = CanvasGroup.offsetTop;
		   	var Left = CanvasGroup.offsetLeft;
		   	if(WindowMode == 0){
		   	  Top += 100;
		   	}
		   	else if(WindowMode == 1){
		   	  Left += 122;
		   	}
		}
		
	 CanvasGroup.onmousedown = function(event){
	   if(ControllerMode == 0){
	     return;
	   }
	   var ClientX = event.clientX;
	   var ClientY = event.clientY;
	   var X = ClientX - (CanvasGroup.offsetLeft * Zoom);
		   	var Y = ClientY - (CanvasGroup.offsetTop * Zoom);
		   	var Top = CanvasGroup.offsetTop;
		   	var Left = CanvasGroup.offsetLeft;
		   	if(WindowMode == 0){
		   	  Top += 100;
		   	}
		   	else if(WindowMode == 1){
		   	  Left += 122;
		   	}
		   	if(Flag.ShowToolsPanel){
		   	  var ChooseTemp = ToolPanelChoose;
		   	  var X,Y;
		   	  for(var t = 0;t < 24;t++){
		   	    if(t < 6){
		   	      X = t;
		   	      Y = 0;
		   	    }
		   	    else if(t > 5 && t < 12){
		   	      X = t - 6;
		   	      Y = 42;
		   	    }
		   	    else if(t > 11 && t < 18){
		   	      X = t - 12;
		   	      Y = 129;
		   	    }
		   	    else if(t > 17 && t < 24){
		   	      X = t - 18;
		   	      Y = 171;
		   	    }
		   	    if(XYMod(ClientX,ClientY,Left,Top,11.5 + X * 58,135 + Y,40,40)){
		   	      var Data = Event.OpenToolsPanel(t);
		   	      if(Data && ChooseTemp == ToolPanelChoose){
		   	        Event.UseTool(Data[0]);
		   	      }
		   	      return;
		   	    }
		   	  }
		   	}
		}

		ControlGroup.ontouchstart = function(event){
		  event.preventDefault();
		  if(Flag.LockController){
		    Controller2.style.display = "none";
		    Flag.Move = false;
		    return;
		  }
		  StartX = ControlGroup.offsetLeft + 80;
		  StartY = ControlGroup.offsetTop + 80;
		  var X = event.touches[0].clientX;
		  var Y = event.touches[0].clientY;
		  Move(X,Y,function(Head){
		  	switch(Head){
		  		case 0:
		  			if(Flag.ShowEnemyBook){
		      			Event.CloseEnemyBook();
		      			Event.OpenEnemyBook("Last");
		      			return;
		    		}
		    		if(Flag.ShowGoFloor){
		    		    Event.OpenGoFloor("Last");
		    		    return;
		    		}
		    		if(Flag.ShowStorePanel){
		    	  	  Event.OpenStore("Last");
		    	  	  return;
		    	  }
		    	  if(Flag.ShowHelpPanel){
		    	    Event.OpenHelpPanel("Last");
		    	    return;
		    	  }
		    		if(Flag.ShowToolsPanel){
		     	  return;
		      }
		  		break;
		  		case 1:
		  		  if(Flag.ShowToolsPanel){
		    	    Event.OpenToolsPanel("Last");
		    	    return;
		    	  }
		  		break;
		  		case 2:
		  			if(Flag.ShowEnemyBook){
		      			Event.CloseEnemyBook();
		      			Event.OpenEnemyBook("Next");
		      			return;
		    		}
		    		if(Flag.ShowGoFloor){
		    		    Event.OpenGoFloor("Next");
		    		    return;
		    		}
		    		if(Flag.ShowStorePanel){
		    	  	  Event.OpenStore("Next");
		    	  	  return;
		    	  }
		    	  if(Flag.ShowHelpPanel){
		    	    Event.OpenHelpPanel("Next");
		    	    return;
		    	  }
		    		if(Flag.ShowToolsPanel){
		     	  return;
		      }
		  		break;
		  		case 3:
		  		  if(Flag.ShowToolsPanel){
		    	  	  Event.OpenToolsPanel("Next");
		    	  	  return;
		    	  }
		  		break;
		  	}
		    HeroLocation[0] = Head;
		    if(!Flag.LockMove){
		      Flag.LockMove = true;
		      Map.DrawMove(Head,function(){
		        Flag.LockMove = false;
		      });
		      MoveTimer = window.setInterval(MoveTrigger,10);
		      MoveTimeout = window.setTimeout(function(){
		        Flag.Move = true;
		        clearTimeout(MoveTimeout);
		      },140);
		    }
		  });
		}

		ControlGroup.ontouchmove = function(event){
		  event.preventDefault();
		  if(Flag.LockController){
		    Controller2.style.display = "none";
		    Flag.Move = false;
		    return;
		  }
		  if(Flag.ShowToolsPanel || Flag.ShowGoFloor || Flag.ShowEnemyBook || Flag.SL){
		    return;
	   }
		  ControllerMode = 0;
		  var X = event.touches[0].clientX;
		  var Y = event.touches[0].clientY;
		  clearInterval(MoveTimer);
		  MoveTimer = window.setInterval(MoveTrigger,10);
		  Move(X,Y,function(Head){
		    HeroLocation[0] = Head;
		    Flag.Move = true;
		  });
		}
		
		 ControlGroup.ontouchend = function(){
		   if(Flag.LockController){
		     Controller2.style.display = "none";
		     Flag.Move = false;
		     return;
		   }
		   Controller2.style.display = "none";
		   clearTimeout(MoveTimeout);
		   clearInterval(MoveTimer);
		   Flag.Move = false;
		 }
		 
		 TestButton.ontouchstart = function(){
		   Map.DrawSelectBox("SLBox","S",1);
		 } 
		 
		 HelpButton.ontouchstart = function(){
		  ControllerMode = 0;
		  if(Flag.ShowHelpPanel){
		     Event.CloseHelpPanel();
		  }
		  else{
		    Event.OpenHelpPanel();
		  }
		 }
		 
		 GoFloorButton.ontouchstart = function(){
		  ControllerMode = 0;
		  if(Flag.LockGoFloorButton){
		    return;
		  }
		  if(Flag.ShowToolsPanel){
		    Event.CloseToolsPanel();
		  }
		  if(Flag.ShowGoFloor){
		     Event.CloseGoFloor();
		  }
		  else{
		    Event.OpenGoFloor();
		  }
		 }
		 
		 GoFloorButton.onclick = function(){
		   if(ControllerMode == 0 || Flag.LockGoFloorButton){
		     	return;
		   }
		   if(Flag.ShowToolsPanel){
		    e.CloseToolsPanel();
		  }
		  ControllerMode = 1;
		  if(Flag.ShowGoFloor){
		     Event.CloseGoFloor();
		  }
		  else{
		    Event.OpenGoFloor();
		  }
		 }
		 
		 EnemyBookButton.ontouchstart = function(){
		  ControllerMode = 0;
		  if(Flag.ShowToolsPanel){
		    e.CloseToolsPanel();
		  }
		  if(Flag.LockEnemyBookButton){
		    return;
		  }
		  EnemyPage = 0;
		  if(Flag.ShowEnemyBook){
		     Event.CloseEnemyBook();
		  }
		  else{
		    Event.OpenEnemyBook();
		  }
		}
		
		ToolsButton.ontouchstart = function(){
		  ControllerMode = 0;
		  if(Flag.LockToolsButton){
		    return;
		  }
		  if(Flag.ShowToolsPanel){
		     Event.CloseToolsPanel();
		  }
		  else{
		    Event.OpenToolsPanel();
		  }
		}
		
		SettingButton.ontouchstart = function(){
		  ControllerMode = 0;
		  if(Flag.LockSettingButton){
		    return;
		  }
		  if(Flag.ShowSettingPanel){
		     Event.CloseSettingPanel();
		  }
		  else{
		     Event.OpenSettingPanel();
		  }
		}
		
		EnemyBookButton.onclick = function(){
		  if(ControllerMode == 0 || Flag.LockEnemyBookButton){
		  	return;
		  }
		  if(Flag.ShowToolsPanel){
		    e.CloseToolsPanel();
		  }
		  ControllerMode = 1;
		  EnemyPage = 0;
		  if(Flag.ShowEnemyBook){
		     Event.CloseEnemyBook();
		  }
		  else{
		    Event.OpenEnemyBook();
		  }
		}

		//用户按下键盘某按键时触发
		window.document.onkeydown = function (event) {
		  //判断键码来确定用户按的是哪个键
			switch (event.keyCode) {
				case 32:
					if(Flag.SL && SLMode == "S"){
						Event.CloseSL();
						Event.SaveGame(SLPanelChoose);
						SLPanelChoose = 1;
					}
					else if(Flag.SL && SLMode == "L"){
						Event.CloseSL();
						Event.LoadGame(SLPanelChoose);
						SLPanelChoose = 1;
					}
					if(Flag.ShowGoFloor){
					  Event.CloseGoFloor();
		    		 Event.GoToFloor(NowFloor);
		    	}
		    	if(Flag.ShowToolsPanel){
		   	      	var Data = Event.OpenToolsPanel(ToolPanelChoose);
		   	      	if(Data){
		   	          Event.UseTool(Data[0]);
		   	          return;
		   	        }
		   		}
		   		if(Flag.ShowStorePanel){
		   			Event.OpenStore("Now");
		   		  	Event.Pay(StoreChoose);
		   		}
		   		if(Flag.ShowHelpPanel){
		    	    Event.CloseHelpPanel();
		    	    return;
		    	  }
				break; //Space
				case 82:
					if(Flag.SL){
						Event.RemoveAllSave();
					}
				break; //R
				case 70:
				  if(Flag.LockGoFloorButton){
		      		return;
		    	  }
		    	  if(Flag.ShowGoFloor){
		       	  	Event.CloseGoFloor();
		    	  }
		    	  else{
		      	  	Event.OpenGoFloor();
		      	  }
				break; //F
				case 72:
				  if(Flag.ShowHelpPanel){
		       Event.CloseHelpPanel();
		     }
		     else{
		       Event.OpenHelpPanel();
		     }
				break; //H
				case 84:
		  	  		if(Flag.LockToolsButton){
		    			return;
		  			}
		  			if(Flag.ShowToolsPanel){
		   				Event.CloseToolsPanel();
		  			}
		  			else{
		  				Event.OpenToolsPanel();
		  			}
				break; //T
				case 67:
				  Event.ChangeHead();
				break; //C
				case 73:
				  Event.Ice();
				break; //I
				case 38:
				case 87: 
				  if(Flag.SL && SLPanelChoose == 3){
				  	SLPanelChoose = 1;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  else if(Flag.SL && SLPanelChoose == 4){
				  	SLPanelChoose = 2;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  if(Flag.ShowEnemyBook){
		      		Event.CloseEnemyBook();
		      		Event.OpenEnemyBook("Last");
		      		return;
		     	  }
		     	  if(Flag.ShowGoFloor){
		    		    Event.OpenGoFloor("Last");
		    		    return;
		    	  }
		    	  if(Flag.ShowStorePanel){
		    	  	  Event.OpenStore("Last");
		    	  	  return;
		    	  }
		    	  if(Flag.ShowHelpPanel){
		    	    Event.OpenHelpPanel("Last");
		    	    return;
		    	  }
		     	  if(Flag.LockController){
		       		return;
		     	  }
		     	  if(Flag.ShowToolsPanel){
		     	    return;
		     	  }
		     	  clearInterval(MoveTimer);
		     	  MoveTimer = window.setInterval(MoveTrigger,1);
				  HeroLocation[0] = 0;
				  Flag.Move = true;
		     	break;
				 //W
				case 37:
				case 65:
		     	  if(Flag.SL && SLPanelChoose == 2){
				  	SLPanelChoose = 1;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  else if(Flag.SL && SLPanelChoose == 4){
				  	SLPanelChoose = 3;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  if(Flag.ShowToolsPanel){
		    	  	  Event.OpenToolsPanel("Last");
		    	  	  return;
		    	  }
				  if(Flag.LockController){
		       		return;
		     	  }
		     	  clearInterval(MoveTimer);
		     	  MoveTimer = window.setInterval(MoveTrigger,1);
				  HeroLocation[0] = 1;
				  Flag.Move = true;
				  break; //A
				case 40:
				case 83: 
		     	  if(Flag.SL && SLPanelChoose == 1){
				  	SLPanelChoose = 3;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  else if(Flag.SL && SLPanelChoose == 2){
				  	SLPanelChoose = 4;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  if(Flag.ShowEnemyBook){
		      		Event.CloseEnemyBook();
		      		Event.OpenEnemyBook("Next");
		      		break;
		     	  }
		     	  if(Flag.ShowGoFloor){
		    		    Event.OpenGoFloor("Next");
		    		    return;
		    		}
		    	  if(Flag.ShowStorePanel){
		    	  	  Event.OpenStore("Next");
		    	  	  return;
		    	  }
		    	  if(Flag.ShowHelpPanel){
		    	    Event.OpenHelpPanel("Next");
		    	    return;
		    	  }
		    	  if(Flag.LockController){
		       		return;
		     	  }
		     	  if(Flag.ShowToolsPanel){
		     	    return;
		     	  }
		     	  clearInterval(MoveTimer);
		     	  MoveTimer = window.setInterval(MoveTrigger,1);
				  HeroLocation[0] = 2;
				  Flag.Move = true;
				  break; //S
				case 39:
				case 68: 
				  if(Flag.SL && SLPanelChoose == 1){
				  	SLPanelChoose = 2;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  else if(Flag.SL && SLPanelChoose == 3){
				  	SLPanelChoose = 4;
				  	Map.DrawSelectBox("SLBox",SLMode,SLPanelChoose);
				  	return;
				  }
				  if(Flag.ShowToolsPanel){
		    	  	  Event.OpenToolsPanel("Next");
		    	  	  return;
		    	  }
				  if(Flag.LockController){
		       		return;
		     	  }
		     	  clearInterval(MoveTimer);
		     	  MoveTimer = window.setInterval(MoveTrigger,1);
				  HeroLocation[0] = 3;
				  Flag.Move = true;
				  break; //D
				case 69:
				  if(Flag.LockController){
		       		return;
		     }
		     if(Flag.ShowToolsPanel){
		       e.CloseToolsPanel();
		     }
				  if(Flag.ShowEnemyBook){
		       		Event.CloseEnemyBook();
		     	  }
		     	  else{
		       		Event.OpenEnemyBook();
		          }
				break;
				case 90:
				  if(Flag.LockController){
		       		return;
		     	  }
				  Event.OpenSL("S");
				break;
				case 88:
				  if(Flag.LockController){
		       		return;
		     	  }
				  Event.OpenSL("L");
				break;
				case 76:
				 if(Zoom > 1.5){
				    Map.DrawMessage("无法再放大了","Tip");
				    return;
				  }
				  Zoom += 0.1;
				  GameGroup.style.zoom = Zoom;
				break; //+ 放大
				case 75:
			      if(Zoom < 0.5){
				    Map.DrawMessage("无法再缩小了","Tip");
				    return;
				  }
				  Zoom -= 0.1;
				  GameGroup.style.zoom = Zoom;
				break; //- 缩小
				case 80:
				  Event.UseTool("Pickaxe");
				break; //P
				case 81:
				  Event.UseTool("EarthQuake");
				break; //Q
				case 78:
				  Event.UseTool("UpFloor")
				break; //U
				case 79:
				  Event.UseTool("DownFloor");
				break; //O
				case 89:
				  Event.UseTool("Fly")
				break; //Y
				case 77:
				  Event.UseTool("HolyWater")
				break; //V
				case 66:
				  Event.UseTool("Boom");
				break; //B
				case 71:
				  Event.UseTool("Door");
				break; //G
			}
			if(Flag.ShowMessage){
			   ControllerMode = 1;
		    Flag.NextMessage = true;
		  }
		  if(Flag.ShowGetItemPanel){
		     Event.CloseGetItemPanel();
		   }
		}
		
		window.document.onkeyup = function (event) {
			clearInterval(MoveTimer);
			Flag.Move = false;
		}
		
		ZoomBox.onchange = function(){
		  Zoom = ZoomBox.value;
		  GameGroup.style.zoom = Zoom;
		}
		
		SaveGameButton.ontouchstart = function(){
		  if(Flag.ShowEnemyBook){
		     Event.CloseEnemyBook();
		  }
		  ControllerMode = 0;
		  Event.OpenSL("S");
		}
		
		LoadGameButton.ontouchstart = function(){
		  if(Flag.ShowEnemyBook){
		     Event.CloseEnemyBook();
		  }
		  ControllerMode = 0;
		  Event.OpenSL("L");
		}

		Resize();
		LoadResource(ResPath,ResNameList,function(){
		   CreateEventControl(EnemyData,function(e){Event = e});
		   Map = CreateMapControl(MapBg,MapEvent,MapFg,SystemUI,DataUpdate,ResData,MapsData,IconsData);
		   var FloorIndex = Event.FindFloor(StartFloor);
				Event.JumpFloor(Map.Maps[FloorIndex][2].Name,FloorIndex,HeroLocation[0],HeroLocation[1],HeroLocation[2]);
				//alert(StartTip);
		});
		
		//当用户调整浏览器窗口大小时重设高宽
		window.onresize = function(){
			Resize(Map);
		}
		/* 初始化 */
		}
		StartGame();
	}
	catch(e){
		alert("出错了！ " + e.name + ": " +e.message);
	}
}