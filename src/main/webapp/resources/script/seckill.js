var seckill = {
    // 封装秒杀相关的ajax的url
    URL: {
        now: function () {
            return "/seckill/time/now";
        },
        exposer: function (seckillId) {
            return "/seckill/" + seckillId + "/exposer";
        },
        execution: function (seckillId, md5) {
            return "/seckill/" + seckillId + "/" + md5 + "/execution";
        }
    },
    // 验证手机号码
    validatePhone: function (phone) {
        return (phone && phone.length == 11 && !isNaN(phone));
    },
    // 详情页秒杀业务逻辑
    detail: {
        // 详情页开始初始化
        init: function (params) {
            console.log("获取手机号码");
            // 手机号验证登录
            var userPhone = $.cookie('userPhone');
            // 验证手机号
            if (!seckill.validatePhone(userPhone)) {
                console.log("未填写手机号码");
                // 验证手机控制输出
                var killPhoneModal = $("#killPhoneModal");
                killPhoneModal.modal({
                    show: true,  // 显示弹出层
                    backdrop: 'static',  // 静止位置关闭
                    keyboard: false    // 关闭键盘事件
                });

                $("#killPhoneBtn").click(function () {
                    console.log("提交手机号码按钮被点击");
                    var inputPhone = $("#killPhoneKey").val();
                    console.log("inputPhone" + inputPhone);
                    if (seckill.validatePhone(inputPhone)) {
                        // 把电话写入cookie
                        $.cookie('userPhone', inputPhone, {expires: 7, path: '/seckill'});
                        // 验证通过 刷新页面
                        window.location.reload();
                    } else {
                        // todo 错误文案信息写到前端
                        $("#killPhoneMessage").hide().html("<label class='label label-danger'>手机号码错误</label>").show(300);
                    }
                });
            }
            // 已经登录了就开始计时交互
            var startTime = params['startTime'];
            var endTime = params['endTime'];
            var seckillId = params['seckillId'];
            $.get(seckill.URL.now(), {}, function (result) {
                if (result && result['success']) {
                    var nowTime = result['data'];
                    seckill.countDown(seckillId, nowTime, startTime, endTime);
                } else {
                    console.log("result:" + result);
                }
            });
        }
    },
    handleSeckill: function (seckillId, node) {
        // 获取秒杀地址
        node.hide().html('<button class="btn btn-primary btn-lg" id="killBtn">开始秒杀</button>');
        console.debug("开始进行秒杀地址获取");
        $.post(seckill.URL.exposer(seckillId), {}, function (result) {
            if (result && result['success']) {
                var exposer = result['data'];
                if (exposer['exposed']) {
                    // 开启秒杀,获取秒杀地址
                    var md5 = exposer['md5'];
                    var killUrl = seckill.URL.execution(seckillId, md5);
                    // 绑定一次点击事件
                    $("#killBtn").one('click', function () {
                        // 执行秒杀请求,先禁用按钮
                        $(this).addClass("disabled");
                        // 发送秒杀请求
                        $.post(killUrl, {}, function (result) {
                            var killResult = result['data'];
                            var state = killResult['state'];
                            var stateInfo = killResult['stateInfo'];
                            console.log("秒杀状态" + stateInfo);
                            // 显示秒杀结果
                            node.html('<span class="label label-success">' + stateInfo + '</span>');
                        });

                    });
                    node.show();
                } else {
                    console.warn("还没有暴露秒杀地址接口,无法进行秒杀");
                    // 未开启秒杀
                    var now = exposer['now'];
                    var start =exposer['start'];
                    var end =exposer['end'];
                    //点击秒杀按钮后发现并未暴露接口，回到倒计时函数
                    seckill.countDown(seckillId, now, start, end);
                }
            } else {
                console.error("获取秒杀地址失败");
                console.log('result' + result.valueOf());
            }
        });
    },
    countDown: function (seckillId, nowTime, startTime, endTime) {
        console.log(nowTime+" "+startTime+" "+endTime);
        //  获取显示倒计时的文本域
        var seckillBox = $("#seckill-box");
        if (nowTime > endTime) {
            seckillBox.html('秒杀结束！');
        }
        //秒杀还没开始，设置倒计时
        else if (nowTime < startTime) {
            var killTime = new Date(startTime + 1000);
            seckillBox.countdown(killTime, function (event) {
                var format = event.strftime('秒杀倒计时：%D天 %H时 %M分 %S秒 ');
                seckillBox.html(format);
                //时间倒计时结束后，执行以下函数
            }).on('finish.countdown', function () {
                //获取秒杀地址，控制显示逻辑，执行秒杀
                seckill.handleSeckill(seckillId,seckillBox);
            });
        }else {
            //秒杀开始
            seckill.handleSeckill(seckillId, seckillBox);
        }
    },
    // cloneZero: function (time) {
    //     var cloneZero = ":00";
    //     if (time.length < 6) {
    //         console.warn("需要拼接时间");
    //         time = time + cloneZero;
    //         return time;
    //     } else {
    //         console.log("时间是完整的");
    //         return time;
    //     }
    // },
    // convertTime: function (localDateTime) {
    //     var year = localDateTime.year;
    //     var monthValue = localDateTime.monthValue;
    //     var dayOfMonth = localDateTime.dayOfMonth;
    //     var hour = localDateTime.hour;
    //     var minute = localDateTime.minute;
    //     var second = localDateTime.second;
    //     return year + "-" + monthValue + "-" + dayOfMonth + " " + hour + ":" + minute + ":" + second;
    // }
};