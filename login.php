<?php

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Sun, 4 Dec 2011 00:00:00 GMT');
header('Last-Modified: Mon, 05 Dec 2011 00:00:00 GMT');

require 'ytfunc.php';
session_start();

if ($_POST['method'] == 'logout') {
    if (isset($_COOKIE['autologin'])) setcookie('autologin', '', time() - 3600);
    session_unset();
    session_destroy();
    echo musicOl();
}

define('INCLUDE_CHECK',true);
require 'init.php';

if (isset($_SESSION['id'])) {
    switch ($_POST['method']) {
        case 'login': echo musicOl(); break;
        case 'set': user_setting(); break;
        case 'find': user_find($_POST['user']); break;
        case 'friend': user_friend(); break;
        case 'add': music_add($_POST['song']); break;
        case 'remove': music_remove($_POST['song']); break;
        case 'update': music_update($_POST['song']); break;
        case 'send': music_send($_POST['to'], $_POST['song']); break;
        case 'share': echo '<div><ol>'.shareOl().'</ol></div>'; break;
        case 'trash': music_trash($_POST['song']); break;
        case 'request': music_request($_POST['song']); break;
    }
} elseif ($_POST['method'] == 'new') { user_register($_POST['user'], $_POST['pass']); }
elseif ($_POST['method'] == 'login') {
    if (!$_POST['pass']) die('No user');
    user_login($_POST['user'], $_POST['pass']);
} elseif ($_POST['method'] == 'forgot') { user_email($_POST['user']); }
elseif ($_POST['method'] == 'reset') { user_reset($_POST['user'], $_POST['pass']); }

function generate_salt() {
    $salt = '';
    for ($i = 0; $i < 3; $i++) { $salt .= chr(rand(35, 126)); }
    return $salt;
}

function query_run($query, $msg) {
    //mysql_query($query) or die('Could not '.$msg);    
    mysql_query($query) or die('Could not '.$msg.'! '.mysql_errno().': '.mysql_error());
}

function user_register($username, $password) {
    $salt = generate_salt();
    $encrypted = md5(md5($password).$salt);
    $username = urldecode($username);
    $query = 'insert into user (username, password, salt) values ("'.$username.'", "'.$encrypted.'", "'.$salt.'")';
    mysql_query($query) or die(mysql_errno() == 1062 ? 'User already exists!' : 'Could not create user: '.mysql_errno().': '.mysql_error());
    user_login($username, $password);
}

function user_login($username, $password)
{
    $username = urldecode($username);
    $result = mysql_query('select salt from user where username="'.$username.'" limit 1');
    $user = mysql_fetch_array($result);
    $encrypted_pass = md5(md5($password).$user['salt']);

    $result = mysql_query('select userid from user where username="'.$username.'" and password="'.$encrypted_pass.'"');
    if (!mysql_num_rows($result)) die('Incorrect username/password');
    $user = mysql_fetch_array($result);
    if (isset($_POST['auto'])) setcookie('autologin', 'user='.$username.'&hash='.$encrypted_pass, time() + 2592000);
    $_SESSION['id'] = $user[0];
    if (isset($_POST['songs']) && $_POST['songs']) music_add($_POST['songs']);
    if (isset($_POST['m'])) {
        $result = mysql_query('select start from user where userid="'.$_SESSION['id'].'"');
        $user = mysql_fetch_array($result);
        die('<ol>'.musicOl().'</ol>'.($user[0]?'<p>'.$user[0].'</p>':''));
    }
    $session = true; require 'music.php';
}

function user_setting() {
    query_run('update user set start='.(isset($_POST['set']) ? '"'.$_POST['set'].'"' : 'NULL').' where userid="'.$_SESSION['id'].'"', 'update setting');
}

function user_find($search) {
    session_unregister('share');
    if (!$search) die ('User not found');
    $result = mysql_query('select userid from user where username="'.$search.'"');
    if (!mysql_num_rows($result)) die('User not found');
    $user = mysql_fetch_array($result);
    $_SESSION['share'] = $user[0];
}

function user_friend() {
    $result = mysql_query('select friend from friend where userid="'.$_SESSION['id'].'" and block="0"');
    while ($user = mysql_fetch_row($result)) {
        $query = mysql_query('select username from user where userid="'.$user[0].'" limit 1');
        while ($user = mysql_fetch_row($query)) echo '<li>'.$user[0].'</li>';
    }
}

function user_email($username) {
    $username = urldecode($username);
    $result = mysql_query('select password from user where username="'.$username.'" limit 1');
    if (!mysql_num_rows($result)) die('User not found');
    $user = mysql_fetch_array($result);
    $message = 'Please follow the link below to reset your password:'."\r\n\r\n";
    $message .= 'http://www.webnougat.com/musicplayer/reset.php?id='.urlencode($username).'&q='.$user[0];
    echo (mail($username, 'Volumology - Forgot Password', wordwrap($message, 70), 'From: webmaster@webnougat.com'))
        ? 'Email sent!' : 'Email failed, try again.';
}

function user_reset($username, $password)
{
    $salt = generate_salt();
    $encrypted = md5(md5($password).$salt);
    query_run('update user set password="'.$encrypted.'", salt="'.$salt.'" where username="'.$username.'"', 'reset password');
    $result = mysql_query('select userid from user where username="'.$username.'"');
    if (!mysql_num_rows($result)) die('User not found');
    $user = mysql_fetch_array($result);
    $_SESSION['id'] = $user[0];
}

function music_add($song) {
    if ($song) {
        $id = $_SESSION['id']; $data = explode('|', urldecode($song));
        if (count($data) < 4) {
            $result = mysql_query('select * from music where userid="'.$id.'" and songid="'.$data[0].'"');
            if (mysql_num_rows($result)) die('User already has this song');
        }
        $list = isset($_SESSION['list'])?$_SESSION['list']:null;
        $query = 'insert into music (userid, songid, artist, song'.($list?', list':'').') values ("';
        $end = $list?'", "'.$list.'")':'")';
        for ($i = 0; $i < count($data) - 1; $i += 3) {
            query_run($query.$id.'", "'.$data[$i].'", "'.$data[$i + 1].'", "'.$data[$i + 2].$end, 'add song');
            query_run('delete from trash where userid="'.$id.'" and songid="'.$song.'"', 'remove trash');
        }
    }
}

function music_remove($song) {
    $id = $_SESSION['id'];
    if (isset($_POST['trash'])) query_run('delete from music where userid="'.$id.'" and songid="'.$song.'"', 'remove song');
    else {
        $result = mysql_query('select artist, song from music where userid="'.$id.'" and songid="'.$song.'"');
        if (mysql_num_rows($result))
        {
            $data = mysql_fetch_array($result);
            query_run('delete from music where userid="'.$id.'" and songid="'.$song.'"', 'remove song');
            query_run('insert into trash (userid, songid, artist, song) values ("'.$id.'", "'.$song.'", "'.$data[0].'", "'.$data[1].'")', 'trash song');
        }
    }
}

function music_update($song) {
    $data = explode('|', urldecode($song));
    $extra = ', start='.($data[3] ? '"'.$data[3].'"' : 'NULL').', end='.($data[4] ? '"'.$data[4].'"' : 'NULL');
    query_run('update music set artist="'.$data[1].'", song="'.$data[2].'"'.$extra.' where userid="'.$_SESSION['id'].'" and songid="'.$data[0].'"', 'update song');
}

function music_send($userto, $song) {
    if (!isset($userto)) die('No recipient given');
    $result = mysql_query('select userid from user where username="'.$userto.'"');
    if (mysql_num_rows($result) != 1) die('User not found');
    $user = mysql_fetch_array($result);
    $data = explode('|', urldecode($song));
    $result = mysql_query('select * from music where userid="'.$user[0].'" and songid="'.$data[0].'"');
    if (mysql_num_rows($result)) die($userto.' already has this song');
    $result = mysql_query('select * from mail where userid="'.$user[0].'" and fromuser="'.$_SESSION['id'].'" and songid="'.$data[0].'"');
    if (mysql_num_rows($result)) die('You already sent this song to '.$userto);
    $result = mysql_query('select * from friend where (userid="'.$_SESSION['id'].'" and friend="'.$user[0].'") or (userid="'.$user[0].'" and friend="'.$_SESSION['id'].'")');
    if (!mysql_num_rows($result)) query_run('insert into friend (userid, friend) values ("'.$_SESSION['id'].'", "'.$user[0].'")', 'add friend and send song');
    query_run('insert into mail (userid, fromuser, songid, artist, song) values ("'.
        $user[0].'", "'.$_SESSION['id'].'", "'.$data[0].'", "'.$data[1].'", "'.$data[2].'")', 'send song');
}

function music_trash($song) {
    query_run('delete from mail where userid="'.$_SESSION['id'].'" and songid="'.$song.'"', 'remove song');
}

function music_request($song)
{
    //TO DO: add check for spacing, the, a, an...
    $id = $_SESSION['id'];
    if ($song)
    {
        $song = urldecode($song);
        $result = mysql_query('select * from request where userid="'.$id.'" and song="'.$song.'"');
        if (mysql_num_rows($result)) query_run('update request set date=now() where userid="'.$id.'" and song="'.$song.'"', 'update request');
        else query_run('insert into request (userid, song) values ("'.$id.'", "'.$song.'")', 'add request');
    }
    else
    {
        $url = 'http://gdata.youtube.com/feeds/api/videos?category=Music&orderby=published&start-index=1&max-results=5&format=5&v=2';
        $url .= '&key=AI39si5y_2MbShZ8gpG8Jvz65ahuPQg7M_ieh8YpOXL0xnHJWs6IHnf9YEPjkNS8TyoxZdVS_9RaGl0FETuUlhBxnFxDyAPy9A&alt=jsonc&q=';
        $result = mysql_query('select * from request where userid="'.$id.'"');
        while ($data = mysql_fetch_row($result))
        {
            $json = json_decode(file_get_contents($url.urlencode($data[1])));
            $date = strtotime($data[2]);
            foreach($json->data->items as $entry) {
                if ($date > strtotime($entry->uploaded)) break;
                $title = srcTitle($data[1], $entry->title);
                echo srcLi($entry->id, $title[0], $title[1], $entry->duration);
            }
        }
    }
}
?>