<?php
require 'ytfunc.php';
require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_YouTube');
$yt = new Zend_Gdata_YouTube();
$yt->setMajorProtocolVersion(2);

if (isset($_GET['id'])) {
    foreach(explode('|', $_GET('id')) as $song) {
        $video = $yt->getVideoEntry($song);
        echo songTime($video->getVideoDuration());
    }

} else if (isset($_GET['artist'])) {
    $query = $yt->newVideoQuery();
    $query->setFormat(5);
    if (isset($_GET['times'])) {
        $times = explode('|', $_GET['times']);
        $query->setMaxResults(5);
    } else $query->setMaxResults(1);
    $artist = $_GET['artist'];
    $songs = explode('|', $_GET['songs']);
    $fix = isset($_GET['fix']);
    
    for ($i = 0; $i < count($songs); $i++) {
        $search = $artist.' - '.$songs[$i];
        $query->setVideoQuery($search);
        $videoFeed = $yt->getVideoFeed($query->getQueryUrl(2));
        if (count($videoFeed)) {
            $video = $videoFeed[0];
            for ($j = 1; $j < count($videoFeed); $j++) {
                if (abs($video->getVideoDuration() - $times[$i]) > abs($videoFeed[$j]->getVideoDuration() - $times[$i]))
                    $video = $videoFeed[$j];
            }
            if ($fix) echo stripslashes(srcLi($video->getVideoId(), $artist, $songs[$i], $video->getVideoDuration()));
            else {
                $title = srcTitle($search, $video->getVideoTitle());
                echo stripslashes(srcLi($video->getVideoId(), $title[0], $title[1], $video->getVideoDuration()));
            }
        } else echo stripslashes(srcNoLi($artist, $songs[$i]));
    }
}
?>