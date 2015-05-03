var debug;
jQuery(function() {
    if(typeof game_callback === "undefined") game_callback = {};
    var window_height_top = $("#game").height() * -0.4;
    var window_height_bot = $("#game").height() * 0.8;
    function scroll(){
        var control_dis = $(document).scrollTop() - $("#game").position().top;
        if(control_dis > window_height_top && control_dis < window_height_bot)
            $("#control").addClass("menued");
        else
            $("#control").removeClass("menued");
    }
    $(window).scroll(scroll);

    function game_init(){
        var gamepad = jQuery("#gamepad");
        var bacteria = false;
        var objs, nexts, doc_tar, playing;

        function show_doc(){
            jQuery('.presented').removeClass('presented');
            var doc = jQuery(doc_tar);
            doc.addClass("presented");
            playing = doc.find('.audio_player');
            if(playing.is('audio')){
                playing = playing.get()[0];
                playing.play();
            }
            else playing = false;
            jQuery("#giveup_container").slideUp();
            setTimeout(function() {
                jQuery.scrollTo.window().queue([]).stop();
                $('body').scrollTo($("#doc"),800);
            }, 750);
            // jQuery(doc_tar).find('')
        }

        function remove(target, destroy) {
            target = jQuery(target);
            var callback_name = target.attr('data-callback');
            var callback_val;
            if(callback_name)
                if(game_callback[callback_name]) callback_val = game_callback[callback_name](target);
            if(callback_val !== false)
                target.addClass('bounceOut').addClass("animated");
            if (destroy){
                setTimeout(function() {
                    target.remove();
                }, 1000);
            }
        }

        function jump(target) {
            var next = jQuery(target);
            bacteria.attr("style", next.attr('style'));
            var complete_obj = objs.indexOf(target);
            if (complete_obj != -1) {
                remove(target);
                objs.splice(complete_obj, 1);
            }
            if (!objs.length){ // game ok
                jQuery("#game_man").text(jQuery("#game_man").attr('data-done'));
                jQuery("#success_msg").show();
                remove(bacteria, true);
                bacteria = false;
                console.log("Complete!");
                show_doc();

                return;
            }
            if (next.attr('data-pass-to')) jump(next.attr('data-pass-to'));
            nexts = [next.attr('data-u'), next.attr('data-d'), next.attr('data-l'), next.attr('data-r')];
            jQuery.scrollTo.window().queue([]).stop();
            $('body').scrollTo($(target),800,{offset: -$(window).height() * 0.4});
        }
        jQuery("#bacterias .option").click(function() {
            var self = jQuery(this);
            if (bacteria){
                remove(bacteria, true);
                bacteria = false;
            }
            var bounceOuted = gamepad.find(".bounceOut.animated:not(#bacteria)");
            bounceOuted.removeClass("bounceOut").addClass("bounceIn").removeClass("animated").addClass("animated");
            setTimeout(function() {
                bounceOuted.removeClass("animated").removeClass("bounceIn");
            }, 1000);
            bacteria = self.find('img').clone().attr('id', 'bacteria').addClass("obj").addClass("bounceIn").addClass("animated");
            gamepad.append(bacteria);
            objs = self.attr('data-objs').split(",");
            doc_tar = self.attr('data-doc');
            jQuery('.presented').removeClass('presented');
            jQuery("#giveup_container").slideDown();
            jQuery("#game_man").text(jQuery("#game_man").attr('data-man'));
            jQuery("#success_msg").hide();
            if(playing){
                playing.load();
            }
            jump(objs[0]);
            return false;
        });
        jQuery("#giveup").click(show_doc);
        function keydown(e){
            // console.log(e.which);
            if (bacteria) {
                switch (e.which) {
                    case 37: // left
                        if (nexts[2]) jump(nexts[2]);
                        break;
                    case 39: // right
                        if (nexts[3]) jump(nexts[3]);
                        break;
                    case 38: // up
                        if (nexts[0]) jump(nexts[0]);
                        e.preventDefault();
                        return false;
                    case 40: // down
                        if (nexts[1]) jump(nexts[1]);
                        e.preventDefault();
                        return false;
                }
            }
        }
        jQuery('body').keydown(keydown);
        jQuery('#control .key').click(function(e){
            e.which = parseInt(jQuery(this).attr('data-key'));
            keydown(e);
        });

        gamepad.find(".dimmer").removeClass('active');
    }

    var completed = 0;

    JT2html({
     body:'@{}',
     "":'<div class="option column" data-objs="@{objs}" data-doc="@{doc}"><div class="ui card"><a class="image" href="#"><img src="@{img}"></a><div class="content"><a class="header">@{name}</a><div class="meta"><a>點我開始遊戲</a></div></div></div></div>'
    }).fromGS('https://spreadsheets.google.com/feeds/list/1OMg92dDapfNY1GyipvbMdIhHvja0pZRySkl3u3XBO-I/1/public/values?alt=json',function(html){
        jQuery("#bacterias").append(html);
        completed++
        if(completed == 3) game_init();
    });

    JT2html({
     body:'@{node}@{img}',
     node:'<div data-u="@{upto}" data-d="@{downto}" data-l="@{leftto}" data-r="@{rightto}" id="@{id}" class="obj" style="top:@{top}%; left:@{left}%;" data-callback="@{callback}"></div>',
     img:'<img data-u="@{upto}" data-d="@{downto}" data-l="@{leftto}" data-r="@{rightto}" id="@{id}" class="obj" style="top:@{top}%; left:@{left}%;" src="@{src}" data-callback="@{callback}">'
    }).fromGS('https://spreadsheets.google.com/feeds/list/1OMg92dDapfNY1GyipvbMdIhHvja0pZRySkl3u3XBO-I/2/public/values?alt=json',function(html){
        jQuery("#gamepad").append(html);
        completed++
        if(completed == 3) game_init();
    });

    JT2html({
     body:'@{}',
     "":'<div id="@{id}" class="ui @{color} doc document segment"><div class="ui header">@{text}</div>@{p}@{audio}</div>',
     p:"<p>@{text}</p>",
     audio:'<audio class="audio_player" style="display:none;"><source src="@{src}.ogg" type="audio/ogg"><source src="@{src}.mp3" type="audio/mpeg"></audio>'
    }).fromGS('https://spreadsheets.google.com/feeds/list/1OMg92dDapfNY1GyipvbMdIhHvja0pZRySkl3u3XBO-I/3/public/values?alt=json',function(html){
        jQuery("#doc_list").append(html);
        completed++
        if(completed == 3) game_init();
    });

});
