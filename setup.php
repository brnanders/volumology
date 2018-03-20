<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 05 Dec 2011 00:00:00 GMT');
header('Last-Modified: Mon, 05 Dec 2011 00:00:00 GMT');

if (!isset($session)) {
    define('INCLUDE_CHECK',true);
    require 'init.php';
    require 'ytfunc.php';
    
    session_start();
    $session = isset($_SESSION['id']);
    if (!$session) {
        if (isset($_COOKIE['autologin'])) {
            parse_str(mysql_real_escape_string($_COOKIE['autologin']));
            $result = mysql_query('select userid from user where username="'.$user.'" and password="'.$hash.'"');
            if (mysql_num_rows($result)) {
                $user = mysql_fetch_array($result);
                $_SESSION['id'] = $user[0];
                $session = true;
            }
        }
    }
}

$music = musicOl(true);
$share = shareOl(true);
foreach(array('sc', 'pr', 'rn', 'as', 'rs', 'fs', 'fl', 'il') as $s) $set[$s] = null;
if ($session) {
    $user = mysql_fetch_array(mysql_query('select start from user where userid="'.$_SESSION['id'].'"'));
    if ($user[0]) foreach(explode('|', urldecode($user[0])) as $val) {
        $set[substr($val, 0, 2)] = strlen($val) > 2 ? substr($val, 2) : 1;
    }
}
if (isset($_GET['radio'])) $set['pr'] = urldecode($_GET['radio']);
if (isset($_GET['search'])) $set['sc'] = urldecode($_GET['search']);
if (isset($set['al'])) $set['al'] = intval($set['al']); else $set['al'] = 1;
if (isset($set['sl'])) $set['sl'] = intval($set['sl']); else $set['sl'] = 1;
define('SETUP', true);
?>