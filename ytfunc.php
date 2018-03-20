<?php
function musicOl($all = false) {
    $data = ''; $num = 0;
    if (isset($_SESSION['id'])) {
        $list = isset($_POST['list'])?urldecode($_POST['list']):null;
        $_SESSION['list'] = $list;
        $result = mysql_query('select songid, artist, song, start, end from music where userid="'.
            $_SESSION['id'].'" and list'.($list?'="'.urldecode($list).'"':' is null').
            ' order by '.(isset($_POST['date'])?'date desc':'trim(leading "the " from lower(artist)), song'));
        $num = mysql_num_rows($result);
        while ($song = mysql_fetch_row($result)) $data .= musicLi2($song[0], $song[1], $song[2], $song[3], $song[4]);
        mysql_free_result($result);
    } elseif (isset($_COOKIE['storedmusic'])) {
        $song = explode('|', urldecode($_COOKIE['storedmusic']));
        for ($i = 0; $i < count($song) - 1; $i += 3) {
            $data .= musicLi($song[$i], $song[$i + 1], $song[$i + 2]);
            $num++;
        }
    }
    return $all ? array($num, $data) : $data;
}

function shareOl($all = false) {
    $data = ''; $num = 0;
    if (isset($_SESSION['id'])) {
        $query = 'select songid, artist, song from mail where userid="'.$_SESSION['id'].'"';
        if (isset($_SESSION['share'])) {
            $query .= ' and fromuser="'.$_SESSION['share'].'"';
            $result = mysql_query('select username from user where userid="'.$_SESSION['share'].'"');
            while ($user = mysql_fetch_row($result)) $share = $user[0];
        }
        $result = mysql_query($query.' order by date desc');
        $num = mysql_num_rows($result);
        while ($song = mysql_fetch_row($result)) $data .= shareLi($song[0], $song[1], $song[2]);
        mysql_free_result($result);
    }
    return $all ? array($num, $data, isset($share) ? $share : null) : $data;
}

function musicLi($id, $artist, $song) {
    return '<li i="'.$id.'"><span class="s_p"/><a class="s_t" href="#">'.$artist.'</a><a class="s_t" href="#">'.$song.'</a></li>';
}

function musicLi2($id, $artist, $song, $start, $end) {
    if ($start) $id .= '" s="'.$start;
    if ($end) $id .= '" e="'.$end;
    return musicLi($id, $artist, $song);
}

function shareLi($id, $artist, $song) {
    return '<li i="'.$id.'"><span class="s_p"/><span class="s_a"/><a class="s_t" href="#">'.$artist.'</a><a class="s_t" href="#">'.$song.'</a></li>';
}

function artistLi($artist, $num, $per = false) {
    $e = '<li><span class="s__"/><span class="s__" title="Cannot Add Song"/>';
    $e .= '<a class="s_t" href="#">'.$artist.'</a><a class="s_t" href="#"></a>';
    if ($num) {
        if ($per) $num = ($num*100).'%';
        $e .= '<a class="s_d" href="#">'.$num.'</a>';
    }
    return $e.'</li>';
}

function srcLi($id, $artist, $song, $time) {
    return srcTopLi($id, $artist, $song, songTime($time));
}

function srcTopLi($id, $artist, $song, $num) {
    return '<li i="'.$id.'"><span class="s_p"/><span class="s_a"/>'.
        '<a class="s_t" href="#">'.$artist.'</a><a class="s_t" href="#">'.$song.
        '</a><a class="s_d" href="#">'.$num.'</a></li>';
}

function srcNoLi($artist, $song) {
    return '<li><span class="s__"/><span class="s__" title="Cannot Add Song"/>'.
        '<a class="s_t" href="#">'.$artist.'</a><a class="s_t" href="#">'.$song.'</a></li>';
}

function srcTitle($src, $title) {
    $t = str_replace('|', '', str_replace(';', ',', str_replace('"', '', $title)));
    $i = strpos($src, '-');
    $a = $i === false ? $a = $src : trim(substr($src, 0, $i));
    $i = strpos($t, '-');
    if ($i === false) $s = str_ireplace($a, '', $t);
    else {
        if ($i > stripos($t, $a)) { $a = substr($t, 0, $i); $s = substr($t, $i + 1); }
        else { $a = substr($t, $i + 1); $s = substr($t, 0, $i); }
    }
    return array(trim($a), trim($s));
}

function songTime($sec) {
    $min = floor($sec/60); $sec = $sec - $min*60;
    return $min.($sec > 9 ? ':' : ':0').$sec;
}
?>