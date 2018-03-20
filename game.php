<?php
header('Expires: '.date(' D, d M Y H:i:s', time() + 2592000).' GMT');
header('Last-Modified: Mon, 05 Dec 2011 00:00:00 GMT');

if ($_SERVER['HTTP_IF_MODIFIED_SINCE'] != 'Mon, 05 Dec 2011 00:00:00 GMT') {
    $xml = simplexml_load_file('http://www.kongregate.com/games_for_your_site.xml');
    foreach($xml->game as $game) echo '<li><i>'.$game->title.'</i><input type="hidden" value="'.game($game->flash_file)
        .'|'.$game->width.'|'.$game->height.'"/></li>';
}

function game($p) {
    $b = strrpos($p, '_') + 1; return substr($p, $b, strrpos($p, '.') - $b);
}
?>