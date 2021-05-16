//1850668 李俊杰
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
for (var i = 0; i < elevatorNum; i++) {
    serveQueue[i] = new Array(floor_Num); //初始为空
    elevatorDirection[i] = 0; //初始停止
    elevatorStatus[i] = 0; //初始在1楼
    for (var j = 0; j < floor_Num; j++) {
        serveQueue[i][j] = new Array(3);
        serveQueue[i][j][0] = 0;
        serveQueue[i][j][1] = 0;
        serveQueue[i][j][2] = 0;
    }
    mergency[i] = false;
}

var timer = new Array(elevatorNum); //计时器，异步调用每部电梯
for (var i = 0; i < elevatorNum; i++) {
    timer[i] = setInterval("vm.ElevatorRun(" + i + ")", 1000)
}

var vm = new Vue({
    el: '#App',
    data: {
        FloorList: floor,
        FloorNumber: floor_Num,
        ElevatorNumber: elevatorNum,
        ServeQueue: serveQueue,
        ElevatorDirection: elevatorDirection,
        ElevatorStatus: elevatorStatus,
        Timer: timer,
        Mergency: mergency,
        movetime: 1,
        stoptime: 5,
    },
    methods: {
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
        Enqueue: function(eNo, floor, dir) {
            this.ServeQueue[eNo][floor][Math.max(0, dir)] = 1; //加入队列
            if (this.ElevatorDirection[eNo] == 0) {
                this.UpdateDirection(eNo); //更新方向，开始运行
            }
        },
        Dequeue: function(eNo, floor, dir) {
            this.ServeQueue[eNo][floor][Math.max(0, dir)] = 0; //移出队列
        },
        GetMinFloor: function(eNo) {
            var min = this.FloorNumber;
            for (var i = 0; i < this.FloorNumber; i++) {
                if ((this.ServeQueue[eNo][i][0] == 1 || this.ServeQueue[eNo][i][1] == 1 || this.ServeQueue[eNo][i][2] == 1) && i < min) {
                    min = i;
                }
            }
            if (min == this.FloorNumber) {
                return this.ElevatorStatus[eNo];
            }
            return min;
        },
        GetMaxFloor: function(eNo) {
            var max = -1;
            for (var i = 0; i < this.FloorNumber; i++) {
                if ((this.ServeQueue[eNo][i][0] == 1 || this.ServeQueue[eNo][i][1] == 1 || this.ServeQueue[eNo][i][2] == 1) && i > max) {
                    max = i;
                }
            }
            if (max == -1) {
                return this.ElevatorStatus[eNo];
            }
            return max;
        },
        GetStopTimesBetWeenFloor: function(eNo, downfloor, upfloor, dir) {
            var cnt = 0;
            for (var i = downfloor; i <= upfloor; i++) {
                if (this.ServeQueue[eNo][i][Math.max(0, dir)] == 1 || this.ServeQueue[eNo][i][2] == 1) {
                    cnt += 1;
                }
            }
            return cnt;
        },
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
        isStop: function(eNo) {
            var isEnd = true;
            for (var i = 0; i < this.FloorNumber; i++) {
                if (this.ServeQueue[eNo][i][0] == 1 || this.ServeQueue[eNo][i][1] == 1 || this.ServeQueue[eNo][i][2] == 1) {
                    isEnd = false;
                    break;
                }
            }
            return isEnd;
        },
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
        //显示屏更新，不修改任何属性
        DisplayScreen: function(eNo) { //eNo第几个电梯1，2，3
            var ENo = eNo + 1;
            var up = 'screenUp' + ENo;
            var down = 'screenDown' + ENo;
            var floor = 'floor' + ENo;
            if (this.ElevatorDirection[eNo] == 1) {
                document.getElementById(up).style.visibility = 'visible';
                document.getElementById(down).style.visibility = 'hidden';
            } else
            if (this.ElevatorDirection[eNo] == -1) {
                document.getElementById(up).style.visibility = 'hidden';
                document.getElementById(down).style.visibility = 'visible';
            } else {
                document.getElementById(up).style.visibility = 'hidden';
                document.getElementById(down).style.visibility = 'hidden';
            }
            document.getElementById(floor).innerHTML = this.ElevatorStatus[eNo] + 1;
        },
        //移动，修改楼层数
        Move: function(eNo) {
            this.ElevatorStatus[eNo - 1] += this.ElevatorDirection[eNo - 1];
            var idl = 'ldoor' + eNo;
            var idr = 'rdoor' + eNo;
            document.getElementById(idl).style.bottom = this.ElevatorStatus[eNo - 1] * 30 + 'px';
            document.getElementById(idr).style.bottom = this.ElevatorStatus[eNo - 1] * 30 + 'px';
        },
        Dialog: function(eNo, msg) {
            alert(eNo + msg);
        },
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
        OpenDoor: function(eNo, stop) {
            if (stop == 1 || (stop == -1 && this.ElevatorDirection[eNo - 1] == 0)) {
                var idl = 'ldoor' + eNo;
                var idr = 'rdoor' + eNo;
                document.getElementById(idl).style.left = 23 + 'px';
                document.getElementById(idr).style.left = 96 + 'px';
                return;
            }
            alert(eNo + '号电梯正在运行，不允许开门！');
            return;
        },
        CloseDoor: function(eNo) {
            var idl = 'ldoor' + eNo;
            var idr = 'rdoor' + eNo;
            document.getElementById(idl).style.left = 33 + 'px';
            document.getElementById(idr).style.left = 86 + 'px';
        },
        InbuttonLightOn: function(eNo, floor) {
            var id = 'in' + eNo + 'button' + floor;
            document.getElementById(id).style.color = 'red';
        },
        InbuttonLightOff: function(eNo, floor) {
            var id = 'in' + eNo + 'button' + floor;
            document.getElementById(id).style.color = '';
        },
        OutbuttonLightOn: function(floor, dir) {
            var id;
            if (dir == 1) {
                id = 'outup' + floor;
            } else {
                id = 'outdown' + floor;
            }
            document.getElementById(id).style.color = 'red';
        },
        OutbuttonLightOff: function(floor, dir) {
            var id;
            if (dir == 1) {
                id = 'outup' + floor;
            } else {
                id = 'outdown' + floor;
            }
            document.getElementById(id).style.color = '';
        },
    }
});