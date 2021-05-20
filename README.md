# 操作系统电梯调度项目文档

```latex
李俊杰 1850668
```



[TOC]



## 1 项目简介

某大楼内有20层楼，有5部互相并联的电梯（本项目实现了任意部电梯），用户可以通过楼层间按钮或电梯内按钮对电梯发出请求，由调度程序经过一定计算将请求分配到合适的电梯让其完成服务请求。本项目基于线程调度思想，结合电梯调度LOOK算法、优先级队列算法、先来先服务算法等对多部电梯进行调度，以期通过对电梯的调度体会操作系统对于线程的调度思想。

可以点击这里进行在线访问测试[电梯调度程序](https://www.lijunjie.xin/LJJElevatorDispatch/)。

## 2 项目功能描述



本项目实现的功能主要有：

1. 本项目实现了可以设置任意电梯数目，即5部或更多部，只需要修改程序中变量$elevatorNum$的值即可。同时本项目也可以通过同样的方法修改楼层数，但限于$Html$中布局问题，不建议对楼层数作修改。
2. 每个电梯内有必要的功能按键，包括：
   1. 数字按键$1-20$：用户在电梯内时使用该按键选择要到达的楼层，电梯调度程序会完成该部电梯的调度。
   2. 关门键、开门键：用户在电梯静止时，可以通过开门、关门按键使电梯进行开门和关门。当电梯运行时，用户打开电梯门将会遭到拒绝（安全）。
   3. 故障按键：当电梯偶然出现故障时，用户可以通过按压故障按键，电梯调度程序将会对该部电梯进行重置，取消其所服务的所有楼层请求并将该电梯门打开。
   4. 报警键：用户可以通过报警键进行求助。
3. 每层楼包括：
   1. 每层楼的每部电梯门口都有上行和下行按钮，以供用户发出使用电梯的请求，由调度程序完成调度。
   2. 每部电梯都有数码显示器，若电梯正在向上运行，则会有电梯向上运行的标志以及电梯当前所处楼层，向下运行时同理，在电梯静止时，仅显示该电梯处于当前楼层。

4. 5部电梯门口按钮是相互连接的，用户只需点击在每层楼的一个上行、下行按钮就可以对多部电梯发出使用请求，由其中一台电梯进行服务（调度算法），同时每台电梯在初始模式下处于第一层，在没有请求的情况下在原地保持静止。



## 3 电梯调度算法

本项目结合力电梯调度LOOK算法、先来先服务算法、优先级调度算法对电梯进行调度。LOOK电梯调度算法：即在完成服务队列当前方向所有请求后，如果服务队列中还有未完成对象，则立刻向相反方向运行以完成服务队列中的的请求，同时电梯运行时顺路接上或放下请求队列中的请求。对于电梯外调度，结合LOOK算法思想，使用优先级调度算法对电梯进行调度使用户等待时间尽可能小。对于电梯内调度，结合LOOK算法，使用先到先服务算法进行电梯内调度，对先发出请求的用户进行服务，同时在运行过程，如果服务队列中有对应楼层，则停下让用户离开电梯。

### 3.1 电梯外调度算法描述

电梯外调度算法结合LOOK算法和优先级调度算法，**LOOK算法**在到达服务队列最高位置后如果服务队列中还有待服务对象，则立刻向反方向运行完成服务队列，同时顺路接收同向用户；特殊情况下，如果二者方向相反，但此时电梯已经到达服务队列最高层（电梯方向向上）或最底层（电梯方向向下），则同样停下响应该请求。**优先级算法**尽量使用户等待时间最小，即在考虑用户目标方向、电梯运行方向、电梯当前位置、用户位置以及电梯停顿时间和运行时间因素下，计算电梯从当前状态到达向用户提供服务的状态需要的时间（下称代价），调度代价最小的电梯为用户提供服务。

代价计算主要可分为如下几种情况:

1. 当用户目标方向和电梯运行方向都向上时：
   1. 如果用户位置在电梯位置的上方，则电梯可以在向上运行的途中顺带接上用户。
   2. 如果用户位置在电梯位置的下方，则电梯需要继续向上运行直至接到完成其服务队列中向上的所有请求，然后往下运行：
      1. 如果电梯服务队列中向下请求的最低位置比用户高，则电梯在完成服务队列侯继续向下接收用户。
      2. 如果电梯服务队列中向下请求的最低位置比用户低，则电梯继续向下运行经过用户直至完成服务队列向下的所有请求，然后向上运行接收用户。
2. 当用户目标方向和电梯运行方向都向下时：
   1. 如果用户位置在电梯位置的下方，则电梯可以在向下运行的途中顺带接上用户。
   2. 如果用户位置在电梯位置的上方，则电梯需要继续向下运行直至接到完成其服务队列中向下的所有请求，然后往上运行：
      1. 如果电梯服务队列中向上请求的最低位置比用户低，则电梯在完成服务队列侯继续向上接收用户。
      2. 如果电梯服务队列中向上请求的最低位置比用户高，则电梯继续向上运行经过用户直至完成服务队列向上的所有请求，然后向下运行接收用户。
3. 当用户目标方向向下且电梯运行方向向上时：
   1. 如果电梯位置在用户位置下方：
      1. 如果电梯服务队列中最高位置比用户位置高，则电梯向上运行经过用户直到完成其服务队列中所有向上的请求，然后在向下的过程中接用户。
      2. 如果电梯服务队列中最高位置比用户位置低，则电梯在向上完成服务队列中所有向上请求后，继续向上接用户。
   2. 如果电梯位置在用户位置上方，则电梯向上完成服务队列中的向上请求，然后向下的途中接用户。
4. 当用户目标方向向上且电梯运行方向向下时：
   1. 如果电梯位置在用户位置上方：
      1. 如果电梯服务队列中最低位置比用户位置高，则电梯向下运行经过用户直到完成其服务队列中所有向下的请求，然后继续向下接用户。
      2. 如果电梯服务队列中最低位置比用户位置低，则电梯在向下过程中经过用户，完成服务队列中所有向下请求后，在向上过程中接用户。
   2. 如果电梯位置在用户位置下方，则电梯向下完成服务队列中的向下请求，然后向上的途中接用户。
5. 最后一种情况是，电梯静止时，无论用户目标方向为何，电梯直接到达用户。



以上5种情况计算代价的公式为：$cost=电梯运行时间\times经过层数+电梯在这期间停顿次数\times停顿时间$，程序选取代价最小的一部电梯来接收用户服务。

### 3.2 电梯内调度算法



电梯内调度算法主要采用先来先服务算法，即对首先发出请求的用户进行服务，同时结合LOOK算法，在经过的楼层中如果楼层位于服务队列中，则停下让用户出去。

##  4 程序运行流程



![未命名文件](https://tva1.sinaimg.cn/large/008i3skNly1gqo44e86btj30l60kzt9w.jpg)

## 5 开发平台&开发语言&开发框架

**开发语言**：

1. $Html、CSS、Javascript$

**开发框架**：

1. 前端开发框架$Vue$，引用了$vue.min.js$文件

**开发平台**：

1. $Visual Studio Code  Version: 1.56.2 $
2. $Safari$浏览器  $Version 14.1 (16611.1.21.161.6) $用于$debug$

## 6 核心代码

### 6.1 数据结构

**关键参数：**

| 参数         | 变量名                 |                             作用                             |
| ------------ | ---------------------- | :----------------------------------------------------------: |
| 服务队列     | $serveQueue[i][j][k]$  | 记录i号电梯对于j楼的服务请求，$serveQueue[i][j][0]==1$表示电梯对楼层向下请求提供服务，$serveQueue[i][j][1]==1$，表示电梯对楼层向上请求提供服务，$serveQueue[i][j][2]==1$表示电梯对电梯内请求提供服务 |
| 电梯运行方向 | $elevatorDirection[i]$ | $elevatorDirection[i]$表示i号运行时方向，-1向下，1向上，0静止 |
| 电梯状态     | $elevatorStatus[i]$    |          $elevatorStatus[i]$表示电梯当前位于哪一层           |
| 紧急事件     | $mergency[i]$          |  $mergency[i]=true$表示i号电梯处于紧急事件，此时不会被调度   |
| 计时器       | $timer[i]$             |      表示i号电梯的运行，是异步调用的，每间隔1s进行调用       |
|              |                        |                                                              |

```javascript
var floor_Num = 20; //楼层数
var elevatorNum = 5; //电梯数
var floor = new Array(floor_Num); //电梯列表
for (var i = 0; i < floor_Num; i++) {
    floor[i] = floor_Num - i
}

var serveQueue = new Array(elevatorNum); //每个电梯的服务队列,serveQueue[i][j][0]=1表示i号电梯服务j楼向下请求serveQueue[i][j][1]=1向上,serveQueue[i][j][2]=1内调度
var elevatorDirection = new Array(elevatorNum); //-1下,0停止,1上
var elevatorStatus = new Array(elevatorNum); //当前电梯在哪一层
var mergency = new Array(elevatorNum) //检测电梯是否处于紧急状态

var timer = new Array(elevatorNum);//计时器，异步调用每部电梯
for (var i = 0; i < elevatorNum; i++) {
    timer[i] = setInterval("vm.ElevatorRun(" + i + ")", 1000)
}
```

### 6.2 电梯外调度代码

```javascript
 OutElevatorDispatch: function(Floor, dir) { //层数、方向
            //检测是否有可调度电梯
            var isOk = false;
            for (var i = 0; i < this.ElevatorNumber; i++) {
                if (this.Mergency[i] == false) { //如果有一个电梯不处于紧急状态
                    isOk = true;
                    break;
                }
            }
            if (isOk == false) {
                alert("所有电梯都出故障了，请等待修复。");
                return;
            }

            var floor = Floor - 1;
            //调度之前检测是否已经在队列中，避免重复调度
            for (var i = 0; i < this.ElevatorNumber; i++) {
                if (this.ServeQueue[i][floor][Math.max(0, dir)] == 1) { //已经存在于队列中
                    return;
                }
            }

            //外部调度算法 
            var minCost = Infinity;
            var dispatchElevator = -1; //将要调度电梯

            for (var i = 0; i < this.ElevatorNumber; i++) {
                if (this.Mergency[i] == true) {
                    //紧急状态不进行调度
                    continue;
                }

                var minfloor = this.GetMinFloor(i);
                var maxfloor = this.GetMaxFloor(i);
                var currentfloor = this.ElevatorStatus[i];
                var currentdir = this.ElevatorDirection[i];
                var cost = 0;
                if (currentdir == 1 && dir == 1) { //同时向上
                    if (currentfloor <= floor) {
                        cost = (floor - currentfloor) * this.movetime +
                            this.stoptime * this.GetStopTimesBetWeenFloor(i, currentfloor, floor, 1);
                    } else {
                        if (minfloor >= floor) {
                            cost = (maxfloor - currentfloor + maxfloor - floor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, currentfloor, maxfloor, 1) +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, maxfloor, -1);
                        } else {
                            cost = (maxfloor - currentfloor + maxfloor - minfloor + floor - minfloor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, currentfloor, maxfloor, 1) +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, maxfloor, -1);
                        }
                    }
                } else if (currentdir == -1 && dir == -1) { //同时向下
                    if (currentfloor >= floor) {
                        cost = (currentfloor - floor) * this.movetime +
                            this.stoptime * this.GetStopTimesBetWeenFloor(i, floor, currentfloor, -1);
                    } else {
                        if (maxfloor <= floor) {
                            cost = (currentfloor - minfloor + floor - minfloor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, currentfloor, -1) +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, maxfloor, 1);
                        } else {
                            cost = (currentfloor - minfloor + maxfloor - minfloor + maxfloor - floor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, currentfloor, -1) +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, maxfloor, 1);
                        }
                    }
                } else if (currentdir == 1 && dir == -1) {
                    if (currentfloor <= floor) {
                        if (maxfloor <= floor) {
                            cost = (floor - currentfloor) * this.stoptime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, currentfloor, maxfloor, 1);
                        } else {
                            cost = (maxfloor - currentfloor + maxfloor - floor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, currentfloor, maxfloor, 1) +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, floor, maxfloor, -1);
                        }
                    } else {
                        cost = (maxfloor - currentfloor + maxfloor - floor) * this.movetime +
                            this.stoptime * this.GetStopTimesBetWeenFloor(i, currentfloor, maxfloor, 1) +
                            this.stoptime * this.GetStopTimesBetWeenFloor(i, floor, maxfloor, -1);
                    }
                } else if (currentdir == -1 && dir == 1) {
                    if (currentfloor <= floor) {
                        cost = (currentfloor - minfloor + floor - minfloor) * this.movetime +
                            this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, currentfloor, -1) +
                            this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, floor, 1);
                    } else {
                        if (minfloor >= floor) {
                            cost = (currentfloor - floor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, currentfloor, -1);
                        } else {
                            cost = (currentfloor - minfloor + floor - minfloor) * this.movetime +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, currentfloor, -1) +
                                this.stoptime * this.GetStopTimesBetWeenFloor(i, minfloor, floor, 1);
                        }
                    }
                } else { //电梯静止
                    cost = Math.abs((currentfloor - floor)) * this.movetime;
                }

                if (cost < minCost) {
                    minCost = cost;
                    dispatchElevator = i;
                }
            }

            this.OutbuttonLightOn(Floor, dir); //亮灯
            this.Enqueue(dispatchElevator, floor, dir);
        },
```

### 6.3 电梯内调度算法

```javascript
 InElevatorDispatch: function(ENo, Floor) { //电梯、哪一层
            if (this.Mergency[ENo - 1] == true) {
                alert("此电梯处于故障状态，无法使用！");
                return;
            }
            var floor = Floor - 1;
            var eNo = ENo - 1;
            //调度之前检测是否已经在队列中，避免重复调度
            if (this.ServeQueue[eNo][floor][2] == 1) {
                return;
            }
            this.InbuttonLightOn(ENo, Floor);
            this.Enqueue(eNo, floor, 2);
        },
```

### 6.4 电梯运行代码

```javascript
 ElevatorRun: function(eNo) {
            if (this.ElevatorDirection[eNo] != 0 && this.Mergency[eNo] == false) { //可以移动、或是到达呼叫层,且不是紧急状态
                this.CloseDoor(eNo + 1); //关门,以防万一
                var minfloor = this.GetMinFloor(eNo);
                var maxfloor = this.GetMaxFloor(eNo);
                var currentdir = this.ElevatorDirection[eNo];
                var currentfloor = this.ElevatorStatus[eNo];
                var stop = false;

                if (this.ServeQueue[eNo][currentfloor][2] == 1) { //内部电梯到达
                    this.InbuttonLightOff(eNo + 1, currentfloor + 1); //灯灭
                    this.Dequeue(eNo, currentfloor, 2); //出队
                    stop = true;
                }
                if (currentdir == -1 && this.ServeQueue[eNo][currentfloor][0] == 1) { //外部电梯同方向，顺路 
                    this.OutbuttonLightOff(currentfloor + 1, currentdir); //熄灭灯 
                    this.Dequeue(eNo, currentfloor, currentdir);
                    stop = true;
                }
                if (currentdir == 1 && this.ServeQueue[eNo][currentfloor][1] == 1) { //外部电梯同方向，顺路 
                    this.OutbuttonLightOff(currentfloor + 1, currentdir); //熄灭灯 
                    this.Dequeue(eNo, currentfloor, currentdir);
                    stop = true;
                }
                if (currentdir == 1 && this.ServeQueue[eNo][currentfloor][0] == 1 && maxfloor == currentfloor) {
                    this.OutbuttonLightOff(currentfloor + 1, -1);
                    this.Dequeue(eNo, currentfloor, -1);
                    stop = true;
                }
                if (currentdir == -1 && this.ServeQueue[eNo][currentfloor][1] == 1 && minfloor == currentfloor) {
                    this.OutbuttonLightOff(currentfloor + 1, 1);
                    this.Dequeue(eNo, currentfloor, 1);
                    stop = true;
                }

                if (stop) {
                    if (vm.Timer[eNo]) {
                        clearInterval(vm.Timer[eNo]);
                    }
                    setTimeout(function() {
                        vm.OpenDoor(eNo + 1, 1);
                        setTimeout(function() {
                                vm.CloseDoor(eNo + 1);
                                setTimeout(function() {
                                        vm.Timer[eNo] = setInterval("vm.ElevatorRun(" + eNo + ")", 1000);
                                    }, 2000) //关门 2s
                            }, 2000) //开门 2s
                    }, 1000); // 每1s执行一次
                    this.UpdateDirection(eNo); //只有停的楼层才更新方向
                } else { //不需要停顿，继续移动
                    this.Move(eNo + 1);
                }
                this.DisplayScreen(eNo);
            }
        },
```

### 6.5 电梯运行方向更新代码

```javascript
  UpdateDirection: function(eNo) {
            if (this.isStop(eNo) == true) { //停止   
                this.ElevatorDirection[eNo] = 0;
            } else if (this.ElevatorDirection[eNo] == 1) {
                if (this.ElevatorStatus[eNo] < this.GetMaxFloor(eNo)) { //保持
                    this.ElevatorDirection[eNo] = 1;
                } else if (this.ElevatorStatus[eNo] > this.GetMaxFloor(eNo)) { //已经到达最大层，转向
                    this.ElevatorDirection[eNo] = -1;
                }
            } else if (this.ElevatorDirection[eNo] == -1) {
                if (this.ElevatorStatus[eNo] > this.GetMinFloor(eNo)) { //保持
                    this.ElevatorDirection[eNo] = -1;
                } else if (this.ElevatorStatus[eNo] < this.GetMinFloor(eNo)) { //转向
                    this.ElevatorDirection[eNo] = 1;
                }
            } else { //静止,此时队列中至多一个
                if (this.ElevatorStatus[eNo] < this.GetMaxFloor(eNo)) {
                    this.ElevatorDirection[eNo] = 1;
                } else if (this.ElevatorStatus[eNo] > this.GetMaxFloor(eNo)) {
                    this.ElevatorDirection[eNo] = -1;
                } //随便设置一个方向
                else {
                    this.ElevatorDirection[eNo] = 1; //与内调度那里要保持一致
                }
            }
        },
```

### 6.6 电梯紧急事件的处理

```javascript
 Emergency: function(eNo, msg) {
            if (this.Mergency[eNo - 1] == false) {
                this.Mergency[eNo - 1] = true;
                alert(eNo + msg);
                //停止运行
                var ENo = eNo - 1;
                this.ElevatorDirection[ENo] = 0;
                //让电梯停止工作,清除该电梯所有请求，并让该电梯静止
                for (var i = 0; i < this.FloorNumber; i++) {
                    this.InbuttonLightOff(eNo, i + 1); //关闭该电梯内所有层的按钮灯
                    this.ServeQueue[ENo][i][2] = 0;
                    if (this.ServeQueue[ENo][i][0] == 1) {
                        this.OutbuttonLightOff(i + 1, -1); //关闭该电梯外层相应按钮
                        this.ServeQueue[ENo][i][0] = 0;
                    } else if (this.ServeQueue[ENo][i][1] == 1) {
                        this.OutbuttonLightOff(i + 1, 1);
                        this.ServeQueue[ENo][i][1] = 0;
                    }
                }
                this.OpenDoor(eNo, 1);
            } else {
                alert(eNo + "号电梯已修复，可以使用");
                this.Mergency[eNo - 1] = false;
                this.CloseDoor(eNo);
            }
        },
```



## 7 项目功能截图

### 7.1单部电梯调度

#### 7.1.1 电梯运行时

![image-20210519222954641](https://tva1.sinaimg.cn/large/008i3skNly1gqo43gfv5pj31ll0u0tgi.jpg)

#### 7.1.2 电梯到达目标层时开门

![image-20210519223234096](https://tva1.sinaimg.cn/large/008i3skNly1gqo43l6vw5j31c00u0gts.jpg)

#### 7.1.3 没有请求时停止运行

![image-20210519223054579](https://tva1.sinaimg.cn/large/008i3skNly1gqo43myeumj31c00u0n75.jpg)

### 7.2 多部电梯调度

![image-20210519223436998](https://tva1.sinaimg.cn/large/008i3skNly1gqo43rnlucj31c00u0ak5.jpg)

### 7.3 故障按钮功能

#### 7.3.1 故障前

![image-20210519223541657](https://tva1.sinaimg.cn/large/008i3skNly1gqo43vi4a5j31c00u0k1r.jpg)



#### 7.3.2点击故障按钮后，清楚所有服务队列，并开门

![image-20210519223616625](https://tva1.sinaimg.cn/large/008i3skNly1gqo43y65vij31c00u0k1e.jpg)

#### 7.3.4 修复故障

![image-20210519223829063](https://tva1.sinaimg.cn/large/008i3skNly1gqo45hzgchj31c00u0qd6.jpg)

![image-20210519223843999](https://tva1.sinaimg.cn/large/008i3skNly1gqo45rkkyyj31c00u0dpu.jpg)

### 7.4呼救功能

![image-20210519223915604](https://tva1.sinaimg.cn/large/008i3skNly1gqo46bi7boj31c00u0dq1.jpg)

### 7.5开门、关门

#### 7.5.1 运行时禁止开门

![image-20210519224012029](https://tva1.sinaimg.cn/large/008i3skNly1gqo47bf6wgj31c00u048s.jpg)

#### 7.5.2 开门

![image-20210519224000344](https://tva1.sinaimg.cn/large/008i3skNly1gqo472nt4uj31c00u0k1e.jpg)



## 8 项目总结

通过本次对电梯调度算法的学习与程序设计体会了操作系统线程调度思想，即尽可能的让线程少等待，提高CPU利用率，然而每种调度算法都有一定的局限性，正因为如此才有了很多调度算法。根据资料，电梯调度算法还有基于专家系统的调度、基于神经网络的预测调度等很多算法，也值得一探究竟。

同时通过本次项目，学习了前端开发的部分语言$Html、Css、Javascript$，以及前端开发框架$Vue$。

最后是关于电梯调度算法，真实世界中还有很多要素要考虑，如电梯停顿时间，这是取决于人的，以及电梯在运行过程中需要加速、匀速、减速等，这是本项目没有考虑的因素，因此本项目还有很多改进之处。











