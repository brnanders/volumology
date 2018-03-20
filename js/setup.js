var IE = (navigator.userAgent.indexOf('MSIE') > -1), PH = 'placeholder' in document.createElement('input'),
logIn, player, srcInt, slpInt, autoXhr, autoKey = '',

sng = { cur: null, nxt: null, prv: null, shw: null,
text: function(s, t) { var e = s.children('.s_t').eq(t); return e.data('e') ? e.data('e') : e.text(); },
info: function(s) {
    return [s.attr('i'), this.text(s, 0), this.text(s, 1), s.attr('s'), s.attr('e')];
}, main: function(t, n) {
    var l = $('#' + (n ? 'next' : 'status') + 'label').html((n ? 'Next' : 'Playing') + ': <span>' + t + '</span>').parent(),
        s = $('p span', l.attr('title', 'Show: ' + t));
    autoEllipsis(s, l.width() + l.offset().left - s.offset().left);
}, attr: function(s, p, t) {
    var o, n, v;
    if (p) { o = 'p'; n = 's'; v = 'Pause'}
    else { o = 's'; n = 'p'; v = 'Play'; }
    s.children('.s_' + o).removeClass('s_' + o).addClass('s_' + n).attr('title', v);
    if (t) $('#playbtn').removeClass('main_' + o).addClass('main_' + n).attr('title', v);
    return s;
}, set: function(s, t) {
    var p = s.hasClass('s_o'), b = '', o = .3;
    if (!t) {
        if (p) s.find('.extras').remove();
        else { this.extra(s.removeClass('s_n').css('background-color', b));  o = 1; }
        this.title(s, !p).toggleClass('s_o').children('.s_p,.s_a').css('opacity', o);
    } else if (!p) {
        if (t == 1) { this.extra(s); b = '#666'; o = 1; } else s.find('.extras').remove();
        if (!s.hasClass('song_album')) this.title(s, b).css('background-color', b).children('.s_p,.s_a').css('opacity', o);
    } return s;
}, extra: function(s) {
    if (!$('.extras', s).length && s.html() != 'Loading...') {
        var e = $('<span class="extras"><span class="s_i" title="Info"/></span>');
        if (s.parent().hasClass('userol')) e.append('<span class="s_r" title="Remove Song"/>');
        if (s.attr('i')) e.prepend('<span class="s_u" title="Play Next"/>');
        if (s.hasClass('song_album')) $('div', s).append(e.prepend('<span class="s_a"/>')); else s.append(e);
    } return s;
}, title: function(s, t) {
    if (t) {
        var a = this.text(s, 0);
        s.children('.s_p').attr('title', 'Play'); s.children('.s_a').attr('title', 'Add to Playlist');
        s.children('.s_t').first().attr('title', 'Search: ' + a).next().attr('title', 'Search: ' + a + ' - ' + this.text(s, 1));
    } else s.children().removeAttr('title');
    return s;
}, show: function(s, t) { //TO DO: no scroll when focused, improve visual effect?
    if (s && s.parent().length && !s.hasClass('hide')) {
        var l = s.parent(), p = l, v = l.is(':visible');
        if (this.shw) this.shw.stop(false, true).stop(true, true);
        this.shw = s;
        if (t && !v) {
            while (!p.parent().hasClass('oltab')) p = p.parent();
            tabChange(p.parent().parent().children('.listtab').children('a').eq(p.index()));
            v = true;
        }
        if (v) {
            t = s.position().top;
            if (t < 0 || t > l.height() + l.position().top) l.scrollTop(l.scrollTop() + t - l.position().top);
            s.fadeTo(500, 0.1, function() { $(this).fadeTo(500, 1); });
        } else l.data('s', s.index());
    } return s;
}, play: function() {
    if (player && player.getPlayerState) {
        if (this.cur) {
            if (player.getPlayerState() == 1) player.pauseVideo(); else player.playVideo();
        } else onPlayerStateChange(0);
    }
}, next: function(s, n) {
    if (this.nxt) this.nxt.removeClass('s_n');
    if (this.cur && this.cur.parent().length) {
        if (s) $('#nextlabel').data('n', 1); else {
            var o = this.cur.siblings('[i]:not(.hide)');
            if (this.cur.parent().data('d') == 'Artist Radio') s = this.cur.next();
            else if ($('#repeatcheck').is(':checked') || !o.length) s = this.cur;
            else if ($('#randomcheck').is(':checked')) s = o.eq(o.length.rnd());
            else { s = n && this.nxt ? this.nxt : this.cur; s = s.nextAll('[i]:not(.hide)').first(); if (!s.length) s = o.first(); }
            $('#nextlabel').removeData('n');
        }
    }
    if (s && s.length) {
        s.addClass('s_n');
        this.main(s.html() == 'Loading...' ? 'Loading...' : (this.text(s, 0) + ' - ' + this.text(s, 1)), true);
    } else { s = null; this.main('No Song', true); }
    this.nxt = s;
}, load: function(s) {
    if (this.cur) {
        this.prv = this.cur; this.set(this.attr(this.cur));
        if (this.cur.parent().data('d') == 'Artist Radio') { $('#radiool li').first().remove(); radio.resume(); }
    }
    if (s.parent().data('d') == 'Artist Radio') $('#radiool').prepend(s.detach());
    var t = this.info(s);
    document.title = t[1] + ' - ' + t[2]; //TO DO: keep document title?
    this.main(t[1] + ' - ' + t[2]);
    this.cur = this.show(this.attr(this.set(s), true, true));
    this.next();
    loadById(t);
}, add: function(s, b) {
    var t = this.info(s), d = s.parent().data('d');
    if ($('#musicol li[i=' + t[0] + ']').length) {
        s.children('.s_a').removeClass('s_a').addClass('s__').attr('title', 'Cannot Add Song'); return;
    }
    if (d == 'Artist Radio' || d == 'Artist Top Albums') {
        var n = s; s = s.clone();
        n.children('.s_a').removeClass('s_a').addClass('s__').attr('title', 'Cannot Add Song');
        this.attr(s.removeClass('s_o'), false);
    }
    if (!s.detach().hasClass('s_o')) this.set(s, 2);
    if (!s.parent().hasClass('userol')) {
        if ($('#searchlabel').text() == 'Trashed Songs') srcTrash.html($('#searchol').html());
        if (s.hasClass('s_o')) s.find('.s_i').after('<span class="s_r" title="Remove Song"/>');
        tabDefault();
    }
    if (d == 'Your Shared Music') musicShare(t[0]);
    s.children('.s_a').remove();
    if ($('#sortselect').val()=='2') { $('#musicol').prepend(s); this.show(s); } else this.insert(s);
    if (!b) { if (logIn) dbCall('add&song=' + escape(t[0]+'|'+t[1]+'|'+t[2])); else cookieAdd(); this.next(); }
}, insert: function(s) {
    var l = $('#musicol li'), t = this.info(s); 
    if (l.length) {
        t[1] = t[1].trim(); t[2] = t[2].trim();
        var c, i, j = Number($('#sortselect').val()) + 1, k = j == 1 ? 2 : 1;
        for (i = 0; i < l.length; i++) {
            c = this.info(l.eq(i)); c[1] = c[1].trim(); c[2] = c[2].trim();
            if (t[j] < c[j]) break; else if (t[j] == c[j] && t[k] < c[k]) break;
        }
        if (i == l.length) $('#musicol').append(s); else l.eq(i).before(s);
        this.show(s);
    } else $('#musicol').html(s);
}, remove: function(s) {
    var l = s.parent(), n = s.next();
    if (l.data('d') != 'Artist Radio' && s.hasClass('s_o')) onPlayerStateChange(0); else this.set(s, 2);
    if (l.data('d') == 'Artist Radio') {
        if (s.hasClass('s_o') && n.html() != 'Loading...') this.load(n);
        s.detach(); radio.resume();
    } else if (l.data('d') == 'Your Shared Music') musicShare(s.attr('i'));
    else {
        s.children('.s_t').first().before('<span class="s_a"/>');
        if (!$('li', l).length) l.html('<p>' + l.data('d') + '</p>');
        if (s.hasClass('s_o')) s.children('.s_a').css('opacity', 1);
        if (logIn) dbCall('remove&song=' + s.attr('i')); else cookieAdd();
    }
    if (srcTrash.prepend(s.detach()).children().length > 25) srcTrash.children().last().remove();
    if ($('#searchlabel').text() == 'Trashed Songs') $('#searchol').html(srcTrash.html());
    if (s.hasClass('s_n')) this.next();
}};

function init() {
    initMusic();
    $('.trigger').click(function() {
        if (logIn) dbLogout(); else {
            if ($('.panel').toggle().is(':visible')) $('#loginForm .email').focus().select();
            $('#top_tab').toggleClass('big').children('span').toggleClass('active');
        }
    });

    //TO DO: close panel on blur (make this better)
    $('.panel').mouseleave(function() { if ($(this).is(':visible')) $('.trigger').click(); });

    //TO DO: keep email confirmation?
    $('#forgot').click(function() {
        if ($('#loginForm .email').val().email()) {
            var a = $(this);
            if (a.text()=='forgot/reset?') {
                a.text('click again to send');
                srcInt = setTimeout(function() { a.text('forgot/reset?'); }, 5000);
            } else {
                clearTimeout(srcInt); a.text('forgot/reset?');
                $('#loginForm .message').text('Sending email...');
                dbCall('forgot&user=' + escape($('#loginForm .email').val()), function(data) {
                    $('#loginForm .message').text(data);
                }, null, function() { $('#loginForm .message').text('Email error'); });
            }
        } else $('#loginForm .email').focus().select();
    });
    
    $('#applink').click(function() { window.location = 'Volumology.apk'; })

    $('#cookiecheck').change(function() {
        if ($(this).is(':checked')) cookieAdd(); else cookieRemove('storedmusic');
    });
    
    $('#searchtext').focus(function() { if (!$('#searchcheck').is(':checked')) $(this).keyup(); })
    .keyup(function(event) {
        var time = $('#searchcheck').is(':checked') ? 300 : 200;
        autoSet($(this), event, function() { searchMusic(); }, function() {
            if (time == 300) searchMusic(); else artistSearch($('#searchtext'));
        }, null, time);
    }).next().delegate('a', 'click', function() {
        autoClick($('#searchtext'), $(this), function() { searchMusic(); });
    });
    
    $('#search_btns li').hover(
        function() { $('ul', this).fadeIn(); }, 
        function() { $('ul', this).stop(true, true).fadeOut(); }
    );
    
    $('#searchbtn').click(function() { searchMusic(); });
    $('#albumbtn').click(function() { artistAlbums(); if (srcVal) tabChange($('#search .listtab a').eq(1)); });
    $('#songbtn').click(function() { artistSongs(); if (srcVal) tabChange($('#search .listtab a').eq(2)); });
    $('#similarbtn').click(function() { artistSimilar(); if (srcVal) tabChange($('#search .listtab a').eq(3)); });
    $('#lfmbtn').click(function() { searchLfm(); });
    
    $('#switchbtn').click(function(){
        $('#searchol li').each(function(){
            var t = $(this).children('.s_t').eq(0), s = t.next().text();
            t.next().text(t.text()); t.text(s);
        });
    });
    $('#requestbtn').click(function(){
        var t = $(this).attr('title');
        if (t) dbCall('request&song=' + escape(t));
    });
    $('#requestsbtn').click(function(){
        autoStop(autoXhr); autoStop(srcXhr);
        searchStart('requests', 'song ');
        $('#requestbtn').attr('title', '');
        dbCall('request&song=', function(data){
            $('#searchol').html(data ? data : 'No Results Found');
            tabChange();
        }, function(){ searchEnd(); });
    });
    
    $('#prev').click(function() {
        if (srcPrev) {
            autoStop(srcXhr); searchPrev(srcPrev, srcVal ? 'Search Results: <span>' + srcVal + '</span>' : $('#searchlabel').html());
        }
    }).next().click(function() {
        if (srcTrash.children().length && $('#searchlabel').text() != 'Trashed Songs') {
            searchPrev(); $('#searchol').html(srcTrash.html()).siblings().html(null);
            tabChange($('#search .listtab a').first()); tabDefault();
            $('#searchlabel').data('o', $('#searchlabel').html()).html('Trashed Songs');
        }
    });
    
    $('#searchcancel').click(function() { autoStop(srcXhr); });
    
    $('#searchol').data('d', 1).scroll(function(){
        if (!$(this).data('d') && $(this).scrollTop() + $(this).height() >= $(this)[0].scrollHeight)
        {
            if (!srcVal)
            {
                var t=$('#searchlabel').text();
                if (t.length<17 || t.substr(0, 15) != 'Search Results:') return;
                srcVal = t.substr(16);
            }
            searchMusic(srcVal, parseInt($('#limitselect').val()));
        }
    });

    //TO DO: make get next song better
    $('#playbtn').click(function() { sng.play(); }).next().click(function() { sng.show(sng.cur, true); });
    $('#nextbtn').click(function() { onPlayerStateChange(0); }).mouseup(function(event) {
        if (event.button == 2) sng.next(null, true);
    }).next().click(function() { sng.show(sng.nxt, true); });
    $('#randomcheck').change(function() {
        if (!$('#nextlabel').data('n')) sng.next();
        //dbSet();
    });
    $('#repeatcheck').change(function() {
        if (!$('#nextlabel').data('n')) sng.next();
    });
}

function initMusic(data) {
    if (data) {
        $('#music').html(data);
        if ($('#top_tab').hasClass('big')) $('.trigger').click();
        $('.trigger p').text('Log-Out');
        $(window).removeData('w').removeData('h');
    }
    $(window).resize();
    //autoTrivia();
    if ($('#setting input[type=hidden]').length) { $('#setting input[type=hidden]').remove(); $('#randomcheck').attr('checked', true); }
    if ($('#radiotext').val()) radio = new radioObj();
    else if ($('#startcheck').is(':checked') && $('#musicol li').length) sng.load($('#musicol').rnd());
    if ($('#searchtext').val()) searchMusic();
    //FORMALIZE.go(); TO DO: is FORMALIZE needed? otherwise make this better (possibly doubles events)
    if (!PH) $('input[placeholder]').each(function() {
        var t = $(this), p = t.attr('placeholder');
        t.val(p).focus(function() { if (t.val() == p) t.val(''); }).blur(function() { if (!t.val()) t.val(p); });
    });

    logIn = ($('.trigger p').text() == 'Log-Out');
    tabDefault(true);
    $('.listtab a').click(function() { tabChange($(this)); });
    $('.autotext').blur(function() { $(this).next().fadeOut('fast').find('.auto_on').removeClass('auto_on'); autoStop(autoXhr); });

    $('#listbtn').click(function() {
        var l = $(this).next();
        l.focus();
        var s = prompt('What is the name of the new playlist?');
        if (s) dbList(l, s);

    }).next().change(function() {
        dbFilter($(this));
    
    //TO DO: fix artist sort: artist, song
    }).next().change(function() {
        if (i < 2) {
            var l = new Array(), i = Number($(this).val()), o = $('#musicol');
            $('li', o).each(function() { l.push([$('.s_t', this).eq(i).text(), $(this).detach()]); });
            l.sort(function(a, b) { a = a[0].trim(); b = b[0].trim(); return a < b ? -1 : (a > b ? 1 : 0); });
            $.each(l, function() { o.append(this[1]); });
        } else dbFilter($(this));
    });

    $('#filtertext').keyup(function(event) {
        var s = $('#musicol li').not('.hide').first();
        if (event.which == 27) $(this).val('');
        autoSet($(this), event, function() {
            tabChange($('#music .listtab a').first());
            if (s.length) sng.load(s);
        }, function() { musicFilter($('#filtertext').val(), false).addClass('hide'); });
        if ($(this).val()) $('#filtercancel').show();
        else {
            $('#filtercancel').hide(); $('#musicol li.hide').removeClass('hide');
            if (s.length && s.index() > 0) sng.show(s);
        }
    }).focus(function() { $(this).after('<i style="float: right">Press enter to play, escape to remove filter</i>') })
    .blur(function() { var e = $(this).next(); if (e.is('i')) e.remove(); });

    $('#filtercancel').click(function() { $('#filtertext').val('').keyup(); });

    $('#radiotext').focus(function() { $(this).keyup(); }).change(function() {
        if ($(this).val() && (PH || $(this).val() != 'Artist Radio'))
            $('#radiolink').show().attr('href', './?radio=' + escape($(this).val())); else $('#radiolink').hide();
    }).keyup(function(event) {
        autoSet($(this).change(), event, function() { $('#radiobtn').click(); }, function() { artistSearch($('#radiotext')); });
    }).next().delegate('a', 'click', function() { autoClick($('#radiotext'), $(this), function() { $('#radiobtn').click(); }); });

    $('#radiobtn').click(function() {
        radio = new radioObj();
        if ($('#radiocheck').is(':checked')) dbSet();
    }).next().next().change(function() { if (radio) radio.percent(true); });
    
    $('#radiocheck').change(function() {
        var r = radio ? radio.artist() : $('#radiotext').val();
        if ($(this).is(':checked')) {
            $('#startcheck').removeAttr('checked');
            $(this).next().text('Play Radio' + r ? ' (' + r + ')' : '');
        }
    });
    
    $('#startcheck').change(function() { if ($(this).is(':checked')) $('#radiocheck').removeAttr('checked'); });
    
    $('#sendtext').focus(function() { $(this).keyup(); }).keyup(function(event) {
        var t = $(this), u = t.next(), e = t.val().toLowerCase();
        autoSet(t, event, function() {
            if (u.is(':visible')) t.val(u.children(':visible').first().text()).next().hide();
        }, function() {
            var c = e?0:1; u.stop(true, true).children().show();
            if (e) u.children().each(function() {
                if ($(this).text().toLowerCase().indexOf(e) == -1) $(this).hide(); else c++;
            });
            if (!c) u.fadeOut('fast'); else if (!u.is(':visible')) u.fadeIn('fast');
        }, true);
    }).change(function() {
        dbCall('find&user=' + $(this).val(), function(data) {
            if (data != 'User not found') {
                $('#sendbtn').removeAttr('disabled');
                $('#sendtext').css('background-color', 'white');
            }
        });
    }).next().delegate('a', 'click', function() { autoClick($('#sendtext'), $(this), function() { $('#sendtext').change(); }); });
    $('#sendbtn').click(function() { dbSend(); });
    $('#sharebtn').click(function() { dbShare(); });
    
    //TO DO: pick method to save settings
    //$('#setting input,select').not('#qualityselect').change(function() { dbSet(); });
    $('#setting input[type=button]').click(function() { dbSet(); });
    
    $('#sleepcheck').change(function(){
        if ($(this).is(':checked'))
            slpInt = setTimeout(function(){
                if (player && player.getPlayerState && player.getPlayerState() == 1) player.pauseVideo();
                $('#sleepcheck').removeAttr('checked');
            }, parseFloat($('#sleeptext').val()) * 60000);
        else if (slpInt) { clearTimeout(slpInt); slpInt = null; }
    });
    
    $('#sleeptext').data('o', 20).change(function(){
        var i = parseFloat($(this).val());
        if (isNaN(i) || i <= 0 || i > 240) $(this).val($(this).data('o'));
        else { $(this).data('o', i); if (slpInt) { clearTimeout(slpInt); $('#sleepcheck').change(); } }
    });
    
    $('#moviecheck').change(function(){
        if ($(this).is(':checked'))
        {
            yturl = yturl.replace('category=Music', 'duration=long');
            dbList($('#listselect'), 'Movie');
            searchMusic('full movie');
        }
        else
        {
            dbList($('#listselect'), 'Main');
            yturl = yturl.replace('duration=long', 'category=Music');
        }
    });
}

$(document).ready(function() {
    loadYtPlayer(3, $('#songstart').val());
    $.ajaxSetup({ timeout: 10000 });
    if ($('#music').length) init();
    else {
        var r = $('#radiostart').val(), s = $('#searchstart').val();
        $.ajax({
            url: 'loader.php' + (r ? '?radio=' + escape(r) + (s ? '&search=' + escape(s) : '') : (s ? '?search=' + escape(s) : '')),
            dataType: 'html', timeout: null, success: function(data) { $('#loader').html(data); init(); },
            error: function() { $('#logo').html('<h1>Volumology - Error</h1>'); }
        });
    }

    $('#trivia select').change(function() {
        $(this).attr('disabled', true).next().text($(this).val() == 'c' ? 'Correct!' : ('Incorrect:  ' + $('option[value=c]', this).text()));
        setTimeout('autoTrivia()', 3000);
    }).next().click(function() { searchMusic($(this).data('src')); });    

    $('#gamebtn').click(function() { gameShow(); });
    $('#game .cancelbtn').click(function() { $(this).parent().hide().prev().hide(); })
    .next().click(function() {
        var g = $(this).parent(), e = g.children('embed'), u = g.children('ul');
        if (u.is(':visible')) { if (e.length) { u.hide(); g.height(e.height() + 60); } } else { u.show(); g.height(300); }
    }).next().keyup(function(event) {
        var l = $('ul li', $(this).parent());
        if (event.which == 13) {
            if (l.filter(':visible').length) gamePlay(l.filter(':visible').first());
        } else {
            if (event.which == 27) $(this).val('');
            var t = $(this).val().toLowerCase(); l.show();
            if (t) l.filter(function() { return $('i', this).text().toLowerCase().indexOf(t) == -1; }).hide();
        }
    });

//Special events when keys are pressed, 32 = space, 37 = left, 38 = up, 39 = right, 40 = down, 77 = m
}).keyup(function(event) {
    var k = event.which;
    if (k == 77 && event.ctrlKey) {
        $('#filtertext').focus().select();
        tabChange($('#music .listtab a').first());
    } else if (k == 13) { if (sng.shw && !$(document.activeElement).is('input')) {
        if (event.ctrlKey) sng.next(sng.shw); else sng.load(sng.shw);
    } } else if ((k == 32 || (k > 36 && k < 41) || (k > 64 && k < 91)) && !$(document.activeElement).is('input' + (k == 32 ? '' : '[type=text]') + ',select')) {
        if (k == 32)
        {
            if (autoKey) autoSrc(' ');
            else { sng.play(); event.preventDefault(); }
        }
        else if (k == 37) { if (sng.prv) sng.load(sng.prv); }
        else if (k == 39) { if (event.ctrlKey) sng.next(); else onPlayerStateChange(0); }
        else if (k == 38) sng.show(sng.shw.index() ? sng.shw.prev() : $('#musicol li').last());
        else if (k == 40) sng.show(sng.shw.next().length ? sng.shw.next() : $('#musicol li').first())
        else autoSrc(String.fromCharCode(k).toLowerCase());
    }

}).on('click', '.s_p', function() {
    if (($(this).parent().hasClass('s_o'))) sng.play(); else sng.load($(this).parent());

}).on('click', '.s_s', function() { sng.play();

}).on('click', '.s_t', function() {
    var s = $(this).parent(), i = $(this).prev().hasClass('s_t') ? 1 : 0;
    searchMusic((i == 1 ? sng.text(s, 0) + ' - ' : '') + sng.text(s, i));
}).on('mouseup', '.s_t', function(event) {
    if (event.button == 2) { autoFix($(this)); event.preventDefault(); }
}).on('click', '.s_r', function() {
    var song = $(this).parent().parent();
    if (song.is('li')) sng.remove(song);

}).on('click', '.s_a', function() {
    var l = $(this).closest('li');
    if (l.hasClass('song_album')) {
        var s = '';
        l.nextUntil('.song_album').each(function() {
            if ($(this).attr('i')) { t = sng.info($(this)); s += t[0]+'|'+t[1]+'|'+t[2]+'|'; sng.add($(this), true); }
        });
        if (logIn) dbCall('add&song=' + escape(s)); else cookieAdd();
        sng.next();
    } else sng.add(l);

}).on('click', '.s_u', function() {
    if (sng.cur) sng.next($(this).parent().parent()); else sng.load($(this).parent().parent());

//TO DO: add more, fix replacing restricted songs, on replace just update songid?
}).on('click', '.s_i', function() {
    var song = $(this).parent().parent(), list = song.parent().parent(), t = sng.info(song),
        i = $('<div class="info_popup"><h3>Album Info</h3><ul class="info_btns"></ul><div class="popup_album"></div></div>').mouseleave(function() {
            i.fadeOut('fast', function() { i.remove(); });
        });
    if (t[0]) {
        i.children('h3').after('<img alt="" src="http://img.youtube.com/vi/' + t[0] + '/1.jpg"/>');
        $.ajax({
            url: 'http://gdata.youtube.com/feeds/api/videos/' + t[0] + '?v=2&alt=jsonc', dataType: 'jsonp',
            success: function(response) {
                var data = response.data; // && data.status.value != 'restricted'
                if (data && data.title) {
                    if (!song.children('.s_a').length)
                    {
                        if (!t[3]) t[3] = '';
                        if (!t[4]) t[4] = '';
                        var v = false;
                        i.children('ul').append('<li><input type="text" placeholder="Start time" value="' + t[3] + '"/><br /><input type="text" placeholder="End time" value="' + t[4] + '"/></li>').children().change(function(){
                            $(this).children('input').each(function(i){
                                var n = parseFloat($(this).val());
                                if (isFinite(n)) { if (n == 0) n = ''; } else n = '';
                                if (t[i + 3] != n) { t[i + 3] = n; v = true; }
                            });
                            if (v) { dbCall('update&song=' + escape(t.join('|'))); song.attr('s', t[3]); song.attr('e', t[4]); }
                        });
                    }
                    if (!$('#sendbtn').attr('disabled'))
                        i.children('ul').append('<li></li>').children().last().append($('<input type="button" value="Send Song" title="Send to ' + $('#sendtext').val() + '"/>')
                            .click(function() { dbSend(song); }));
                    i.children('h3').after('<p><a href="http://youtube.com/watch?v=' + t[0] + '" target="blank">' +
                        data.title + ' (' + String(data.rating/5*100).substr(0, 5) + '%)</a></p>');
                    //i.append('<textarea style="width: 100%">' + data.description + '</textarea>');
                } else if (!song.children('.s_a').length) i.children('h3').after('<p>Video no longer available</p>')
                    .next().next().next().prepend('<li></li>').children().first().append($('<input type="button" value="Attempt to Replace"/>').click(function() {
                        $.ajax({
                            url: yturl + srcFinal(t[1] + ' - ' + t[2]) + '&max-results=1', dataType: 'jsonp',
                            success: function(response) {
                                if (response.data.items) {
                                    sng.remove(song); sng.add($(srcJSON(response.data.items[0], t[2], t[1])));
                                } i.mouseleave();
                            }, error: function() { i.children('p').text('Replace attempt failed'); }
                        });
                    }));
            }
        });
    }
    if (t[1]) {
        i.children('ul').append('<li></li>').children().last().append($('<input type="button" value="Start Radio" title="' + t[1] + '"/>').click(function() {
            tabChange($('#music .listtab a').eq(1)); $('#radiotext').val(t[1]); radio = new radioObj();
        }));
        if (!t[0]) i.children('h3').text(t[2]?'Song Info':'Artist Info');
    }
    if (t[2] || song.hasClass('song_album')) {
        if (t[0]) i.children('h3').attr('title', 'Click here or right click artist/song to edit info').text('Song Info - Edit').click(function() {
            if (song.children('.s_t').length) { autoFix(song.children('.s_t').first()); i.remove(); }
        }); $.ajax({
            url: lfmurl + 'track.getinfo&autocorrect=1&artist=' + escape(t[1]) + (t[2]?('&track=' + escape(t[2])):'&album='),
            dataType: 'jsonp',
            success: function(response) {
                if (response.track && response.track.album) {
                    var data = response.track.album;
                    i.children('div').html('<a href="' + data.url + '" target="blank"><h4 title="Album info on Last.fm">Album - ' + data.title +
                        '</h4></a>' + (data.image ? ('<img alt="" src="' + data.image[0]['#text'] + '"/>') : ''));
                }
            }
        });
    }
    var pos = $(this).offset(), h = list.height() + list.offset().top - i.outerHeight() - 38;
    if (pos.top < h) h = pos.top - 5;
    list.append(i); i.prepend($('<input type="button" class="cancelbtn" title="Close"/>')
        .click(function() { i.mouseleave(); })).fadeIn('fast').offset({ top: h, left: pos.left - i.width() + 15 });

}).on('dblclick', 'ol li', function() { if ($(this).attr('i')) sng.load($(this)); }
).on('mouseenter', 'ol li', function() { sng.set($(this), 1); }
).on('mouseleave', 'ol li', function() { sng.set($(this), 2); });

//TO DO: fix page refresh or back stopping video
$(window).resize(function() {
    var w = $(this).width() != $(this).data('w'), h = $(this).height() != $(this).data('h');
    if (w || h) {
        var d = $('#music'), t = d.offset().top + 5, m = $('#main_controls').offset().top - 10, s = m + $('#main_controls').height() - 280;
        if (w) {
            $(this).data('w', $(this).width());
            clearTimeout(srcInt); srcInt = setTimeout(function() { $('ol').removeData('e'); autoEllipsis('ol:visible'); }, 200);
        }
        if (h != $(this).data('h')) {
            $(this).data('h', $(this).height());
            tabHeight($('#search').height(s - t), $('#search').find('ol:visible'));
        }
        if (d.offset().left + d.outerWidth() > $('#player').offset().left) m = s;
        tabHeight(d.height(m - t), d.find('ol:visible'));
    }
}).unload(function() {
    if (player && player.getPlayerState) $('#refcheck').val(srcLink(player.getVideoUrl()) + '|' + player.getPlayerState() + '|' + player.getCurrentTime());
});

function tabDefault(first) {
    var a = ['Your Music', 'Artist Radio', 'Your Shared Music', 'Search Results',
        'Artist Top Albums', 'Artist Top Songs', 'Similar Artists'];
    if (first) $('ol').each(function(i) {
        $(this).data('d', a[i]);
        if (!$('li', this).length) $(this).html('<p>' + a[i] + '</p>');
    }); else $('#search ol').each(function(i) {
        if (!$('li', this).length && $(this).html() != 'No Results Found')
            $(this).html('<p>' + a[i + 3] + '</p>');
    });
}

function tabChange(a) {
    if (a) {
        if (a.hasClass('tab_on')) return;
    } else a = $('#search a.tab_on');
    a.parent().children('.tab_on').toggleClass('tab_on');
    var d = a.toggleClass('tab_on').parent().parent();
    d.children('.oltab').children().each(function(i) {
        if (i == a.index()) tabHeight(d, $(this).show()); else $(this).hide();
    });
}

function tabHeight(div, ol) {
    if (ol.length) {
        if (!ol.data('e')) {
            autoEllipsis(ol.data('e', 1).find('.s_t'));
            if (IE) { ol.children(':even').addClass('song_odd'); ol.find('.s_p,.s_a').css('opacity', 0.3); }
        }
        if (ol.height(div.height() + div.offset().top + 3 - ol.offset().top).data('s')) {
            sng.show(ol.children().eq(ol.data('s'))); ol.removeData('s');
        }
    }
}

function autoSet(text, event, enter, auto, empty, time) {
    if (event.which == 38 || event.which == 40) {
        var u = text.next().children(':visible'), i = $('.auto_on', text.next());
        if (i.length) {
            i.toggleClass('auto_on');
            i = event.which == 38 ? (i.prev().length ? i.prev() : u.last()) : (i.next().length ? i.next() : u.first());
        } else i = u.first();
        if (i.length) text.val(i.toggleClass('auto_on').text());
    } else {
        if (srcInt) clearTimeout(srcInt);
        if (event.which == 27) text.next().hide();
        else if (event.which == 13) { enter(); text.next().fadeOut('fast'); }
        else {
            if (text.val()) srcInt = setTimeout(function() { auto(); srcInt = null; }, time ? time : 200);
            else if (empty) auto(); else text.next().fadeOut('fast');
        }
    }
}

function autoClick(t, a, auto) { t.val(a.text()).next().fadeOut('fast'); auto(); }

function autoStop(XHR) { if (XHR) { XHR.abort(); XHR = null; } }

function autoSrc(e)
{
    clearTimeout(srcInt); autoKey += e;
    var s;
    $('#musicol li').each(function() {
        if (sng.text($(this), 0).trim().substr(0, autoKey.length) == autoKey) { s = this; return false; }
        return true;
    });
    if (s) sng.show($(s));
    else $('#musicol li').each(function() {
        if (sng.text($(this), 1).trim().substr(0, autoKey.length) == autoKey) { sng.show($(this)); return false; }
        return true;
    }); srcInt = setTimeout(function() { autoKey = ''; }, 1000);
}

function autoFix(t) {
    var song = t.parent();
    if (song.attr('i')) {
        var n = t.data('e') ? t.data('e') : t.text();
        t.hide().before('<input type="text" class="song_edit" value="' + n + '"/>').prev().focus().select().blur(function() {
	    if ($(this).val() && n != $(this).val()) {
                autoEllipsis(t.text($(this).val()));
                var i = sng.info(song);
                if (song.hasClass('s_o')) sng.main(i[1] + ' - '  + i[2]);
                else if (song.hasClass('s_n')) sng.main(i[1] + ' - '  + i[2], true);
                if (!song.children('.s_a').length) {
                    if ($('#sortselect').val() < 2) sng.insert(song.detach());
                    if (!$('#randomcheck').is(':checked')) sng.next();
                    if (logIn) dbCall('update&song=' + escape(i.join('|'))); else cookieAdd();
                }
            } t.show().prev().remove();
        }).keydown(function(event) {
            if (event.which == 9) {
                autoFix(t.next().hasClass('s_t') ? t.next() : $(this).prev());
                $(this).blur(); event.preventDefault();
            }
        }).keyup(function(event) {
            if (event.which == 13) { $(this).blur(); event.stopPropagation(); }
            else if (event.which == 27) t.show().prev().remove();
        }).dblclick(function(event) { event.stopPropagation(); });
    }
}

//TO DO: split large lists using setTimeout; too slow for IE
function autoEllipsis(list, w) {
    return;
    if (typeof(list)=='string') { list=$(list).data('e', 1).find('.s_t'); }
    var e = $('#ellipsis a'); if (!w) w = list.first().width() * 1.1;
    if (list.length > 200) {
        var p = 0, i = setInterval(function(){
	    var l = p+50>list.length ? list.length : p+50;
	    for (var x = p; x < l; x++)
	    {
		var t = list.eq(x), o = t.data('e'), n;
        	if (o) {
            	    if (e.text(o).width() > w) {
                	n = o; while (e.width() > w) { n = n.substr(0, n.length - 2); e.text(n + '...'); }
                	t.text(n + '...').data('e', o);
            	    } else t.text(o).removeData('e');
        	} else {
            	    o = t.text();
            	    if (e.text(o).width() > w) {
                	n = o; while (e.width() > w) { n = n.substr(0, n.length - 2); e.text(n + '...'); }
                	t.text(n + '...').data('e', o);
            	    }
        	}
	    } if (l == list.length) clearInterval(i); else p=l;
        }, 200);
    } else list.each(function() {
        var t = $(this), o = t.data('e'), n;
        if (o) {
            if (e.text(o).width() > w) {
                n = o; while (e.width() > w) { n = n.substr(0, n.length - 2); e.text(n + '...'); }
                t.text(n + '...').data('e', o);
            } else t.text(o).removeData('e');
        } else {
            o = t.text();
            if (e.text(o).width() > w) {
                n = o; while (e.width() > w) { n = n.substr(0, n.length - 2); e.text(n + '...'); }
                t.text(n + '...').data('e', o);
            }
        }
    });
}

function autoTrivia() {
    if ($('#musicol li').length) {
        var a = sng.info($('#musicol').rnd())[1], o = '<option>Select Artist...</option>', data, i;
        $.ajax({
            url: lfmurl + 'artist.getsimilar&limit=3&artist=' + escape(a), dataType: 'jsonp',
            success: function(response) {
                data = lfmData(response, 4); if (data.length>1) data.push({ name: a });
                i = data.rnd(); a = data[i].name;
                $.each(data, function(j) { o += '<option' + (i == j ? ' value="c"' : '') + '>' + this.name + '</option>'});
                $.ajax({
                    url: lfmurl + 'artist.gettoptracks&limit=1&page=' + (Number(4).rnd() + 1) + '&artist=' + escape(a), dataType: 'jsonp',
                    success: function(response) {
                        data = lfmData(response, 3); if (!data.length) data.push({ name: a });
                        $('#trivia').show().children('select').html(o).removeAttr('disabled').next()
                            .text('Who sings:  ' + data[0].name).data('src', a + ' - ' + data[0].name);
                    }
                });
            }
        })
    }
}

function gameShow() {
    var g = $('#game').fadeIn('fast'), u = g.children('ul'); //($(window).height() - g.height()) / 2
    g.offset({ top: 40, left: ($(window).width() - g.width()) / 2 }).prev().css('opacity', 0.3).show();
    if (!g.children('ul').length) {
        g.append('<ul><li>Loading...</li></ul>');
        $.ajax({
            url: 'game.php', dataType: 'html', success: function(data) {
                g.children('ul').html(data).children().click(function() { gamePlay($(this)); });
            }
        });
    }
}

function gamePlay(game) {
    var g = $('#game'), i = $('input', game).val().split('|'), b = 'http://external.kongregate-games.com/gamez/',
        b0 = i[0].substr(0, i[0].length - 4), b1 = i[0].substr(b0.length), w = i[1], h = Number(i[2]), l = ($(window).width() - w) / 2;
    while (b0.length < 4) b0 = '0' + b0; while (b1.length < 4) b1 = '0' + b1; b += b0 + '/' + b1 + '/live/';
    g.children('embed').remove(); //($(window).height() - h - 80) / 2
    g.width(w).height(h + 60).offset({ left: l }) //+ w > $('#player').offset().left ? (l - $('#player').offset().left) : l })
        .append('<embed width="' + w + '" height="' + h + '" base="' + b + '" src="' + b + 'embeddable_' + i[0] +
        '.swf" type="application/x-shockwave-flash"></embed>')
        .children('#gametext').val(game.children('i').text()).next().next().hide();
}

function dbRegister() {
    var user = $('#newForm .email').val(), pass = $('#newForm .pass').val(), msg = $('#newForm .message'), url;
    if (dbCheck(user, pass)) {
        if (pass == $('#newForm .confirm').val()) {
            msg.text('Registering...').show(); url = 'new&user=' + escape(user) + '&pass=' + escape(pass) + '&songs=';
            $('#musicol li').each(function() { url += sng.info($(this)).join('|') + '|'; });
            dbCall(url, function(data) { msg.hide(); initMusic(data); }, null, function() { msg.text('Error'); });
        } else $('#newForm .confirm').focus().select();
    }
}

function dbLogin() {
    var user = $('#loginForm .email').val(), msg = $('#loginForm .message');
    if (dbCheck(user, $('#loginForm .pass').val())) {
        msg.text('Logging in...').show();
        if (!$('#musicol li').length) $('#musicol').html('<p>Loading Your Music...</p>');
        dbCall('login&user=' + escape(user) + '&pass=' + escape($('#loginForm .pass').val()) + ($('#logincheck').is(':checked') ? '&auto=1' : ''),
            function(data) { msg.hide(); initMusic(data); }, null, function() { msg.text('Error'); });
    }
}

function dbFilter(t) {
    if (logIn && t.attr('disabled', true))
    {
        var c, n, o = $('#musicol');
        dbCall('login'+($('#listselect').val()=='Main'?'':'&list='+escape($('#listselect').val()))+($('#sortselect').val()==2?'&date=1':''), function(data) {
            if (sng.cur) c = sng.cur.attr('i');
            if (sng.nxt) n = sng.nxt.attr('i');
            if (o.html(data).is(':visible')) autoEllipsis('#musicol');
            if (c) {
                var f=o.children('[i=' + c + ']');
                if (f.length)
                {
                    sng.cur = sng.set(f);
                    if ($('#playbtn').hasClass('main_s')) sng.attr(sng.cur, true);
                }
                else sng.prv = null;
            }
            //TODO fix for filter
            if (n) {
                var f=o.children('[i=' + n + ']');
                if (f.length) sng.nxt = f.addClass('s_n');
                else if (!$('#repeatcheck').is(':checked')) {
                    var v = o.children('[i]:not(.hide)');
                    if (v.length)
                    {
                        f=$('#randomcheck').is(':checked')?v.eq(v.length.rnd()):v.first();
                        sng.nxt = f.addClass('s_n');
                        sng.main(sng.text(f, 0) + ' - ' + sng.text(f, 1), true);
                    } else sng.next();
                }
            }
            if ($('#filtertext').val()) musicFilter($('#filtertext').val(), false).hide();
        }, function() { t.removeAttr('disabled'); });
    }
}

function dbList(l, s)
{
    var o = l.children();
    for (var i=0; i<o.length; i++)
        if (o.eq(i).val().toLowerCase()==s.toLowerCase())
        {
            if (l.val().toLowerCase()!=s.toLowerCase())
                dbFilter(l.val(o.eq(i).val()));
            return;
        }
    dbFilter(l.append($('<option></option>').val(s).text(s)).val(s));
}


function dbLogout() {
    logIn = false;
    $('#forms .pass').val(null);
    $('.trigger p').text('Log-In').click();
    if ($('#friendtab').hasClass('tab_on')) tabChange($('#music .listtab a').first());
    $('#friendtab,#share,#setting .setBtn').remove();
    $('#cookiecheck').parent().show().prev().hide();
    if (sng.nxt && sng.nxt.parent().is('#musicol,#shareol')) { sng.nxt = null; sng.main('No Song', true); }
    $('#musicol').html('<p>Your Music</p>');
    dbCall('logout', function(data) {
        if (data) { $('#musicol').html(data); $('#cookiecheck').attr('checked', true); }
    }, null, function() { $('#loginForm .message').text('Error'); });
}

function dbSend(song) {
    var t=$('#sendtext').val();
    if (!song) song = sng.cur;
    if (song) dbCall('send&to=' + t + '&song=' + escape(sng.info(song).join('|')), function(data) {
        if (data) alert(data); else if (!$('#friendul li:contains('+t+')').length) $('#friendul').prepend('<li>'+t+'</li>');
    });
}

//TO DO: add interval to update share by date>last update or add refresh button
//  add filter by instead of update button (give li attribute "e")
function dbShare() {
    if (!$('#shareol li').length) $('#shareol').html('<p>Loading Shared Music...</p>');
    dbCall('share' + ($('#sendbtn').attr('disabled') ? '' : '&from=' + $('#sendtext').val()), function(data) {
        var l = $(data).children('ol');
        musicShare(null, l.length && $('li', l).length ? l.html() : 'No Results Found');
    }, null, function() { musicShare(null, 'Error'); } );
}

function dbSet() {
    if (logIn) {
        var v = new Array(), s = ['ps', 'pr', 'as', 'rs', 'fs', 'fl', 'il'], i = $('#limitselect option:selected').index(),
            f = function(m) {
                var s = $('#setting .setBtn'); if (s.next().length) s.next().remove();
                s.after('<span>' + (m ? m : 'Settings saved') + '</span>').next().fadeOut(3000, function() { $(this).remove(); });
            };
        $('#setting input:checkbox').not('#cookiecheck').each(function(j) { if ($(this).is(':checked')) v.push(s[j]+(j == 1 ? $('#radiotext').val() : '')); });
        if ($('#randomcheck').is(':checked')) v.push('rn');
        if (i != 1) v.push('sl' + i);
        i = $('#radioselect option:selected').index();
        if (i != 1) v.push('al' + i);
        dbCall('set' + (v.length ? '&set=' + escape(v.join('|')) : ''), f, null, function() { f('Error: settings not saved'); });
    }
}

function dbCall(method, success, complete, error) {
    $.ajax({
        type: 'POST', url: 'login.php', dataType: 'html', data: 'method=' + method,
        success: success ? success : function(data) { if (data) alert(data); },
        error: error ? error : function() { alert('Error'); }, complete: complete
    });
}

function dbCheck(user, pass) {
    if (!user || !pass || pass.length < 6) return false;
    return user.email();
}

if (!window['YT']) {var YT = {};}
if (!YT.Player) $('script').first().before('<script src="https://www.youtube.com/iframe_api"></script>');
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      //height: '223', width: '352',
      height: '270', width: '480',
      events: { 'onReady': onReady, 'onStateChange': onStateChange, 'onError': onError }
    });
}
//if (!window['YT']) {var YT = {};}
//if (!YT.Player) {
//    $('script').first().before('<script src=http://s.ytimg.com/yt/jsbin/www-playerapi-vflL0kItM.js></script>');
//    YT.embed_template = '\u003ciframe width="425" height="344" src="" frameborder="0" allowfullscreen\u003e\u003c\/iframe\u003e';
//}
//function onYouTubePlayerAPIReady() {
//    player = new YT.Player('player', {
//        height: '223', width: '352', //videoId: 'VIDEO_ID', playerVars: { 'autoplay': 1, 'controls': 0 },
//        events: { 'onReady': onReady, 'onError': onError, 'onStateChange': onStateChange }
//    });
//}

function onReady() { if (sng.cur) loadById(sng.info(sng.cur)); }
function onError(event) { onPlayerError(event.data); }
function onStateChange(event) { onPlayerStateChange(event.data); }

//TO DO: fix songstart
function loadYtPlayer(v, song) {
    //if (song) sng.cur = $('<li i="' + song + '"><a class="s_t">artist</a><a class="s_t">song</a></li>');
    //swfobject.embedSWF('http://www.youtube.com/v/EvfsUX4Np0c?&enablejsapi=1&version=' + v,
    //    'player', '352', '223', '8', null, null, { allowScriptAccess: 'always', allowFullScreen: 'true' }, { id: 'ytPlayer' });

    //$('#player').html('<iframe class="youtube-player" type="text/html" width="352" height="223" src="http://www.youtube.com/embed/BKdspWe-KdQ?html5=1" frameborder="0"></iframe>');

    //Chromeless: http://www.youtube.com/apiplayer?&enablejsapi=1&playerapiid=player1
}

function onYouTubePlayerReady() {
    player = document.getElementById('ytPlayer');
    if (player.addEventListener) {
        player.addEventListener('onStateChange', 'onPlayerStateChange');
        player.addEventListener('onError', 'onPlayerError');
    }
    if (sng.cur) sng.load(sng.cur);
}

function onPlayerError(errorCode) {
    $.ajax({
        url: 'http://gdata.youtube.com/feeds/api/videos/' + sng.cur.attr('i') + '?v=2&alt=jsonc', dataType: 'jsonp',
        success: function(response) {
            sng.cur.css('background-color', 'red');
            onPlayerStateChange(0);
        }
    });
}

function onPlayerStateChange(newState) {
    if (!newState && sng.nxt) sng.load(sng.nxt);
    else if (newState == 1 && $('#playbtn').hasClass('main_p')) sng.attr(sng.cur, true, true);
    else if (newState == 2 && $('#playbtn').hasClass('main_s')) sng.attr(sng.cur, false, true);
}

function loadById(info) {
    if (player && player.loadVideoById) {
        if ($('#hourcheck').is(':checked')) info[4] = (info[3] ? info[3] : 0) + 60;
        player.loadVideoById({'videoId': info[0], 'startSeconds': info[3], 'endSeconds': info[4], 'suggestedQuality': $('#qualityselect').val()});
        sng.attr(sng.cur, true, true);
    }
}