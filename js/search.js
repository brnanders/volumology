var yturl = 'http://gdata.youtube.com/feeds/api/videos?category=Music&format=5&v=2&alt=jsonc&key=AI39si5y_2MbShZ8gpG8Jvz65ahuPQg7M_ieh8YpOXL0xnHJWs6IHnf9YEPjkNS8TyoxZdVS_9RaGl0FETuUlhBxnFxDyAPy9A&q=',
    lfmurl = 'http://ws.audioscrobbler.com/2.0/?format=json&api_key=1662d8af02bd253aae1e06c9682a0a54&method=',
    srcVal, srcXhr, srcPrev, srcTrash = $('<ol></ol>'), srcMore = 1, radio;

//TO DO: fix IE even/odd and opacity by properties instead of browser type

String.prototype.trim = function() { var t = this.toLowerCase(); return t.substr(0, 4) == 'the ' ? t.substr(4) : t; };
String.prototype.email = function() { return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(this); };
Number.prototype.rnd = function() { return Math.floor(Math.random() * this); };
Array.prototype.rnd = function() { return this.length.rnd(); };
$.fn.rnd = function() { return this.children().eq(this.children().length.rnd()); };

function cookieAdd() {
    if (!logIn && $('#cookiecheck').is(':checked') && $('#musicol li').length < 26) {
        var c = '', t, d = new Date(); d.setFullYear(d.getFullYear() + 1);
        $('#musicol li').each(function() { c += sng.info($(this)).join('|') + '|'; });
        document.cookie = 'storedmusic=' + c + ';expires=' + d;
    }
}

function cookieRemove(id) { document.cookie = id + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'; }

function musicShare(id, h) {
    if (h) $('#shareol').html(h);
    var t = 'Share', l = $('#shareol li').length;
    if (l) t += ' (' + l + ')'; else if (id) $('#shareol').html('<p>Your Shared Music</p>');
    $('#friendtab').text(t);
    if (id && logIn) dbCall('trash&song=' + id);
}

function musicFilter(src, flt) {
    src = src.toLowerCase(); $('#musicol li.hide').removeClass('hide');
    var m = $('#musicol li'), l = m.filter(src.indexOf(' ') < 0 ? function() {
        var w = sng.text($(this), 0).toLowerCase().split(' ');
        for (var i = 0; i < w.length; i++) {
            if (w[i].substr(0, src.length) == src) return flt;
        }
        return !flt;
    } : function() { return sng.text($(this), 0).toLowerCase().indexOf(src) > -1 ? flt : !flt; });
    if (l.length == m.length) l = m.filter(src.indexOf(' ') < 0 ? function() {
        var w = sng.text($(this), 1).toLowerCase().split(' ');
        for (var i = 0; i < w.length; i++) {
            if (w[i].substr(0, src.length) == src) return flt;
        }
        return !flt;
    } : function() { return sng.text($(this), 1).toLowerCase().indexOf(src) > -1 ? flt : !flt; });
    return l;
}

function songTime(sec) {
    var min = Math.floor(sec/60); sec -= min*60;
    return min + (sec > 9 ? ':' : ':0') + sec;
}

function srcJSON(data, src, artist) {
    if (artist) return srcLi(data.id, artist, src, songTime(data.duration));
    else {
        var title = srcTitle(data.title, src ? src : srcVal);
        return srcLi(data.id, title[0], title[1], songTime(data.duration));
    }
}

function srcLi(id, artist, song, time) {
    return '<li' + (id ? ' i="' + id + '"><span class="s_p"/><span class="s_a"/>' :
        '><span class="s__"/><span class="s__" title="Cannot Add Song"/>') +
        '<a class="s_t" href="#">' + artist + '</a><a class="s_t" href="#">' + song + '</a>' +
        (time ? '<a class="s_d" href="#">' + time + '</a></li>' : '</li>');
}

function srcAlbum(album, artist, num) {
    var l = $('<li class="song_album"><div class="inner_album"><span class="album_title">' + album +
        '</span><i>(' + (num ? (num + ' Songs') : 'Click to expand') + ')</i></div></li>');
    if (!num) l.click(function() { albumSongs(album, artist, l); }).children().css('cursor', 'pointer');
    if ($('#albumol li').length) $('#albumol').append(l); else $('#albumol').html(l);
}

function srcTitle(title, src) {
    var t = title.replace(/|/g, '').replace(/;/g, ',').replace(/"/g, '');
    var i = t.indexOf('-'), a = $.trim(src.split('-')[0]), s, p = t.toLowerCase().indexOf(a.toLowerCase());
    if (i > 0) {
        if (i > p) { a = t.substr(0, i); s = t.substr(i + 1); }
        else { a = t.substr(i + 1); s = t.substr(0, i); }
    } else s = p > -1 ? t.substr(0, p) + t.substr(p + a.length) : t.replace(a, '');
    return [$.trim(a), $.trim(s)];
}

function srcFinal(src) {
    if (!src) src = srcVal;
    if ($('#livecheck').is(':checked')) {
        var s = src.toLowerCase();
        if (s.substr(0, 4) != 'live' && s.indexOf(' live') == -1) src += ' -live';
    }
    if ($('#lyriccheck').is(':checked')) src += ' lyrics';
    return escape(src);
}

function searchStart(src, msg, ol) {
    if (msg) {
        if (!srcVal) srcVal = src ? src : $('#searchtext').val();
        if (srcVal && srcVal.indexOf('youtube.com') > -1 && srcVal.indexOf('v=') > -1)
        {
            $.ajax({
                url: 'http://gdata.youtube.com/feeds/api/videos/' + srcVal.substr(srcVal.indexOf('v=') + 2, 11) + '?v=2&alt=jsonc', dataType: 'jsonp',
                success: function(response) {
                    var data = response.data;
                    if (data && data.title) {
                        $('#searchol').html(srcJSON(data, ''))
                        tabChange($('#search .listtab a').first()); autoEllipsis('#searchol');
                    }
                }
            });
            srcVal = '';
            return '';
        }
        if ($('#moviecheck').is(':checked'))
        {
            msg = ' ';
            if (!srcVal) srcVal = 'full movie';
            else if (!srcVal.match('full movie$')) srcVal += ' - full movie';
        }
        if (srcVal) {
            if (!PH && srcVal == 'Search for Music') { srcVal = ''; return ''; }
            $('#requestbtn').attr('title', $.trim(srcVal));
            if (!ol) { ol = $('#searchol'); $('#searchlabel').data('o', $('#searchlabel').html()); }
            if (!ol.removeData('e').children().length) ol.html('Loading...');
            $('#searchcancel').show().next().html('Searching: <span>' + msg + srcVal + '</span>');
        }
    } return srcVal;
}

function searchEnd() {
    srcXhr = null; $('#searchcancel').hide();
    if (srcVal) { $('#searchlabel').text('Search Results: ' + srcVal); srcVal = ''; tabDefault(); }
    autoEllipsis('#search ol:visible');
}

function searchPrev(h, t) {
    var o = $('#search .oltab'), s = o.find('.s_o'), n = o.find('.s_n');
    if (s.length) { sng.set(sng.attr(s)); sng.cur = null; }
    if (n.length) { if (s.length) { sng.nxt = null; sng.main('No Song', true); } else sng.next(); }
    o.find('.s_t').each(function() { var e=$(this); if (e.data('e')) e.val(e.data('e')); });
    srcPrev = o.html();
    if (h) {
        var l = $('#searchlabel').data('o');
        $('#requestbtn').attr('title', l == 'Volumology\'s Top Results' || l == 'Trashed Songs' || l == 'Search Results: requests' ? '' : l);
        o.html(h); $('#searchlabel').html(l).data('o', t);
        tabChange(); o.find('ol').removeData('e'); autoEllipsis('#search ol:visible');
    }
}

function searchMusic(src, n) {
    autoStop(autoXhr); autoStop(srcXhr);
    if (n) srcMore += n; else srcMore = 1;
    var movie = $('#moviecheck').is(':checked');
    if (searchStart(src, 'music by ')) {
        var data = '', complete = function(jqXHR, textStatus) {
            if (textStatus == 'abort') searchEnd();
            else {
                searchPrev();
                var s=$('#searchol');
                if (data) s.data('d', null);
                else { s.data('d', 1); data = 'No Results Found'; }
                if (srcMore == 1) s.html(data).scrollTop(0); else s.append(data);
                tabChange($('#search .listtab a').first()); autoEllipsis('#searchol');
                if (srcMore == 1 && !movie) artistSimilar(); else searchEnd();
            }
        };
        if ($('#servercheck').is(':checked')) $.ajax({
            url: 'ytsearch.php?search=' + srcFinal() + '&start=' + srcMore + '&limit=' + $('#limitselect').val(), dataType: 'html',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; }, success: function(response) { data = response; }, complete: complete
        }); else $.ajax({
            url: yturl + srcFinal() + '&start-index=' + srcMore + '&max-results=' + $('#limitselect').val(), dataType: 'jsonp',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; }, success: function(response) {
                if (response.data && response.data.items) $.each(response.data.items, function() { data += srcJSON(this); });
            }, complete: complete
        });
    }
}

function searchSingle(song, index, album, index2) {
    if (index < song.length) {
        var data, artist = song[index].artist.name, track = song[index].name,
            src = artist + ' - ' + track, ol = album ? $('#albumol') : $('#songol');
        $.ajax({
            url: yturl + srcFinal(src) + '&max-results=1', dataType: 'jsonp',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; },
            success: function(response) {
                if (response.data.items) data = !$('#fixcheck').is(':checked') ? srcJSON(response.data.items[0])
                    : srcJSON(response.data.items[0], track, artist);
                else data = srcLi(null, artist, track, songTime(song[index].duration));
                if ($('li', ol).length) ol.append(data); else ol.html(data);
            }, complete: function(jqXHR, textStatus) {
                if (textStatus == 'abort') searchEnd();
                else if (data) searchSingle(song, index + 1, album, index2);
                else if (album) artistSongs();
                else searchEnd();
            }
        });
    } else if (album) albumSongs(album, album[index2].artist.name, index2 + 1);
    else searchEnd();
}

function searchYt(data, success, complete) {
    var songs = escape(data[0].name.replace('|', '')), times = data[0].duration;
    for (i = 1; i < data.length; i++) {
        songs += '|' + escape(data[i].name.replace('|', '')); times += '|' + data[i].duration;
    }
    $.ajax({
        url: 'yt.php?artist=' + escape(data[0].artist.name) + '&songs=' + songs + '&times=' + times + ($('#fixcheck').is(':checked') ? '&fix=1' : ''),
        dataType: 'html', beforeSend: function(jqXHR) { srcXhr = jqXHR; },
        success: success, complete: complete ? complete : complete = function(jqXHR, textStatus) { if (textStatus == 'abort') searchEnd(); }
    });
}

function lfmData(r, index) {
    var data;
    switch (index) {
        case 0: if (r.lovedtracks) data = r.lovedtracks.track; break;
        case 1: if (r.topalbums) data = r.topalbums.album; break;
        case 2: if (r.album && r.album.tracks) data = r.album.tracks.track; break;
        case 3: if (r.toptracks) data = r.toptracks.track; break;
        case 4: if (r.similarartists) data = r.similarartists.artist; break;
        case 5: if (r.topartists) data = r.topartists.artist; break;
        case 6: if (r.results && r.results.artistmatches) data = r.results.artistmatches.artist; break;
    }
    if (data) return $.isArray(data) ? data : (data.name ? [data] : [{ name: data }]);
    return new Array();
}

function searchLfm(src, index) {
    if (!index) index = 0
    var ol = $('#search ol').eq(index);
    if (searchStart(src, 'Last.fm user data for ', ol)) {
        var data = '', a = ['lovedtracks', 'topalbums', 'toptracks', 'topartists']; ol.html('Loading...');
        $.ajax({
            url: lfmurl + 'user.get' + a[index] + '&user=' + escape(srcVal) + '&limit=' + $('#limitselect').val(), dataType: 'jsonp',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; }, success: function(response) {
                switch (index) {
                    case 0: case 2: $.each(lfmData(response, index / 2 * 3), function() {
                            data += srcLi(null, this.artist.name, this.name);
                        }); break;
                    case 1: $.each(lfmData(response, 1), function() {
                            srcAlbum(this.name, this.artist.name);
                        }); return;
                    case 3:  $.each(lfmData(response, 5), function() {
                            data += srcLi(null, this.name, '');
                        }); break;
                }
                ol.html(data ? data : 'No Results Found');
            }, complete: function(jqXHR, textStatus) {
                if (textStatus == 'abort' || index == 3) searchEnd(); else searchLfm(src, index + 1);
            }
        });
    }
}

function artistSearch(text) {
    var u = text.next().html(null), a = '', c = 0, t; autoStop(autoXhr);
    if (text.val()) a = text.val();
    musicFilter(a, true).each(function() {
        t = sng.text($(this), 0);
        if (!u.children().filter(function() {
            return $(this).text().toLowerCase() == t.toLowerCase();
        }).length) { u.append('<li><a href="#">' + t + '</a></li>'); c++; return c < 5; }
        return true;
    });
    if (u.stop(true, true).children().length) u.fadeIn('fast'); else u.fadeOut('fast');
    if (a.length > 2 && c < 5) $.ajax({
        url: lfmurl + 'artist.search&limit=' + (5 - c) + '&artist=' + escape(a), dataType: 'jsonp',
        beforeSend: function(jqXHR) { autoXhr = jqXHR; },
        success: function(response) {
            $.each(lfmData(response, 6), function() {
                t = this.name.toLowerCase();
                if (t && !u.children().filter(function() {
                    return $(this).text().toLowerCase() == t;
                }).length) u.append('<li><a href="#">' + this.name + '</a></li>')
            });
        }, complete: function() {
            if (u.children().length && !u.is(':visible')) u.fadeIn('fast');
            autoXhr = null;
        }
    });
}

function artistSimilar(artist, mbid) {
    if (searchStart(artist, 'artists similar to ', $('#similarol'))) {
        $.ajax({
            url: lfmurl + 'artist.getsimilar&' + (mbid ? 'mbid=' + mbid : 'artist=' + escape(srcVal)) + '&limit=' + $('#limitselect').val(),
            dataType: 'jsonp',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; },
            success: function(response) {
                var data = '';
                $.each(lfmData(response, 4), function() {
                    if (this.name) data += srcLi(null, this.name, '', '%' + Math.floor(this.match*100));
                });
                $('#similarol').html(data ? data : 'No Results Found').scrollTop(0);
            }, complete: function(jqXHR, textStatus) {
                if (textStatus == 'abort') searchEnd(); else { if ($('#similarol').is(':visible')) autoEllipsis('#similarol'); artistAlbums(null, mbid); }
            }
        });
    }
}

function artistAlbums(artist, mbid, method) {
    if (searchStart(artist, method ? '' : 'albums by ', $('#albumol'))) {
        var data;
        $.ajax({
            url: lfmurl + 'artist.gettopalbums&autocorrect=1&limit=10&' + (mbid ? 'mbid=' + mbid : 'artist=' + escape(srcVal)),
            dataType: 'jsonp',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; },
            success: function(response) {
                data = lfmData(response, 1);
                if (data.length) {
                    if (!method) {
                        $('#albumol').html('Loading...').scrollTop(0);
                        albumSongs(data, null, 0);
                    } else if (method == 1) {
                        
                    }
                    return;
                } else data = null;
            }, complete: function(jqXHR, textStatus) {
                if (textStatus == 'abort') searchEnd();
                else if (!data) { $('#albumol').html('No Results Found'); artistSongs(null, mbid); }
            }
        });
    }
}

function artistSongs(artist, mbid, method) {
    if (searchStart(artist, method ? '' : 'top songs by ', $('#songol'))) {
        var data;
        $.ajax({
            url: lfmurl + 'artist.gettoptracks&' + (mbid ? 'mbid=' + mbid : 'artist=' + escape(srcVal)) + '&limit=' + $('#limitselect').val(),
            dataType: 'jsonp',
            beforeSend: function(jqXHR) { srcXhr = jqXHR; },
            success: function(response) {
                data = lfmData(response, 3);
                if (data.length) {
                    $('#songol').html('Loading...').scrollTop(0);
                    if ($('#servercheck').is(':checked'))
                        searchYt(data, function(response) { $('#songol').html(response); searchEnd(); });
                    else searchSingle(data, 0);
                } else data = null;
            }, complete: function() {
                if (!data) { $('#songol').html('No Results Found'); searchEnd(); }
            }
        });
    }
}

//TO DO: fix previous search click event (possibly delegate)
//  add option to cancel searches or warn?
//  fix music search during album load problem (searchEnd clears srcVal)
function albumSongs(album, artist, index) {
    var data, url = lfmurl + 'album.getinfo&';
    if (typeof(album) == 'string') {
        var i = $('div i', index), complete = function(jqXHR, textStatus) {
                if (textStatus == 'abort') { i.text('(Click to expand)'); searchEnd(); }
                else if (!data || !data.length) { i.text('(No songs found)').parent().css('cursor', 'auto'); searchEnd(); }
            };
        if (i.text() == '(Click to expand)') {
            autoStop(srcXhr); i.text('(Loading...)'); $('#searchcancel').show();
            url += artist ? 'artist=' + escape(artist) + '&album=' + escape(album) : 'mbid=' + album;
            $.ajax({
                url: url, dataType: 'jsonp',
                beforeSend: function(jqXHR) { srcXhr = jqXHR; },
                success: function(response) {
                    data = lfmData(response, 2);
                    if (data.length) {
                        //if ($('#servercheck').is(':checked'))
                        searchYt(data, function(response) {
                            i.text('(' + data.length + ' Songs)').parent().css('cursor', 'auto');
                            index.after(response); searchEnd();
                        }, complete);
                        //else searchSingle(data, 0, album, index);
                    }
                }, complete: complete
            });
        }
    } else {
        if (index < album.length && album[index].artist.name != 'Various Artists') {
            if (!artist) artist = album[index].artist.name;
            if ($('#albumol li').length < Number($('#limitselect').val()) + index) {
                url += album[index].mbid ? 'mbid=' + album[index].mbid :
                    'album=' + escape(album[index].name) + '&artist=' + escape(artist);
                $.ajax({
                    url: url, dataType: 'jsonp',
                    beforeSend: function(jqXHR) { srcXhr = jqXHR; },
                    success: function(response) {
                        data = lfmData(response, 2);
                        if (data.length) {
                            srcAlbum(album[index].name, null, data.length);
                            if ($('#servercheck').is(':checked')) searchYt(data, function(response) {
                                    $('#albumol').append(response);
                                    if ($('#albumol li').length > $('#limitselect').val() + index) artistSongs();
                                    else albumSongs(album, artist, index + 1);
                                });
                            else searchSingle(data, 0, album, index);
                        } else albumSongs(album, artist, index + 1);
                    }, complete: function(jqXHR, textStatus) {
                        if (textStatus == 'abort') searchEnd();
                        else if (!data) albumSongs(album, artist, index + 1);
                    }
                }); return;
            } else for (i = index; i < album.length; i++) srcAlbum(album[i].name, artist);
        } artistSongs();
    }
}

function radioObj() {
    var songs = new Array(), sim = new Array(), top = new Array(), c = 0, t = 0,
        a = $('#radiotext').val(), p = Number($('#radioselect').val());
    this.resume = function() { start(); };
    this.artist = function() { return a; };
    this.percent = function(set) {
        if (set) { p = Number($('#radioselect').val()); c = 0; t = 0; }
        return p;
    };
    if (!a) {
        a = sng.info($('#musicol').rnd())[1];
        if (!a) return;
        $('#radiotext').val(a);
    } else if (!PH && a == 'Radio Artist') return;
    $('#radiocheck').next().text('Play Radio (' + a + ')');
    $('#radiool').html('<li>Loading...</li>');
    $.ajax({
        url: lfmurl + 'artist.getsimilar&limit=30&artist=' + escape(a), dataType: 'jsonp',
        success: function(response) {
            $.each(lfmData(response, 4), function() { sim.push(this.name); });
        },
        complete: function() {
            if (sim.length) start(true); else $('#radiool').html('Artist Not Found');
        }
    });

    function start(first) {
        var r = $('#radiool li').last();
        if (first) getTop(a); else if ($('#radiool li').length < 5 && r.html() != 'Loading...') {
            if (songs.length > 50) songs.splice(0, 25);
            $('#radiool').append('<li>Loading...</li>');
            getTop(c / t < p ? a : sim[sim.rnd()]);
        }
    }
    
    function getTop(art) {
        if (art) { 
            var song = '', i;
            if (art == a && top.length) {
                i = top.rnd(); song = top[i].name;
                top.splice(i, 1); t++; c++; getSong(art, song);
            } else {
                $.ajax({
                    url: lfmurl + 'artist.gettoptracks&limit=20&artist=' + escape(art), dataType: 'jsonp',
                    success: function(response) {
                        var data = lfmData(response, 3); t++;
                        if (data.length) {
                            if (art == a) {
                                i = data.rnd(); song = data[i].name;
                                data.splice(i, 1); top = data; c++;
                            } else {
                                while (data.length) {
                                    i = data.rnd(); song = data[i].name;
                                    if ($.inArray(art + song, songs) > -1) data.splice(i, 1);
                                    else { songs.push(art + song); break; }
                                }
                            }
                        }
                    },
                    complete: function() { getSong(art, song); }
                });
            }
        } else $('#radiool li').last().html('Artist Not Found');
    }

    function getSong(art, song) {
        var r = $('#radiool li').last(), src = art, max = 1, next;
        if (song) src += ' - ' + song; else max = 20;
        if (src) {
            $.ajax({
                url: yturl + srcFinal(src) + '&max-results=' + max, dataType: 'jsonp',
                success: function(response) {
                    if (response.data && response.data.items) {
                        var data = response.data.items; data = data[data.rnd()];
                        next = $($('#fixcheck').is(':checked') && song ? srcJSON(data, song, art) : srcJSON(data, src));
                    }
                }, complete: function() {
                    if (next) {
                        if (!song) { t++; if (art == a) c++; }
                        if (!r.html(next.html()).attr('i', next.attr('i')).index()) { sng.load(r); sng.nxt = null; sng.main('Loading...', true); }
                        else if (r.index() == 1) sng.next();
                        if (r.is(':visible')) autoEllipsis(r.children('.s_t'));
                    } else r.remove();
                    start();
                }
            });
        } else if (!r.index) $('#radiool').html('Artist Not Found');
        else { r.remove(); start(); }
    }
}