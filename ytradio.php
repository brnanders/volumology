<?php
$lfmurl = 'http://ws.audioscrobbler.com/2.0/?format=json&api_key=65e3ea215a7f49fa22cb69a3dd56b2ec&limit=20&artist='.urlencode($_GET['artist']).'&method=artist.get';
$data = json_decode(file_get_contents($lfmurl.'toptracks'));
$tracks = $data->toptracks->track;
if (!count($tracks)) die('Artist Not Found');
if (isset($_GET['main'])) {
    $data = json_decode(file_get_contents($lfmurl.'similar'));
    if (!count($data->similarartists->artist)) die('Artist Not Found');
    foreach($data->similarartists->artist as $artist) { echo '<p>'.$artist->name.'</p>'; }
    foreach($tracks as $track) { echo '<i>'.$track->name.'</i>'; }
} else {
    $_GET['search'] = $_GET['artist'].' - '.$tracks[rand(0, count($tracks))]->name;
    $_GET['limit'] = 1;
    require 'ytsearch.php';
}
?>