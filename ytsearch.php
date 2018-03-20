<?php
require 'ytfunc.php';
$src = $_GET['search'];
$start = isset($_GET['start']) ? $_GET['start'] : 1;
$limit = isset($_GET['limit']) ? $_GET['limit'] : 20;
$url = 'http://gdata.youtube.com/feeds/api/videos?category=Music&q=';
$url .= urlencode($src).'&start-index='.$start.'&max-results='.$limit.'&format=5&v=2';
$url .= '&key=AI39si5y_2MbShZ8gpG8Jvz65ahuPQg7M_ieh8YpOXL0xnHJWs6IHnf9YEPjkNS8TyoxZdVS_9RaGl0FETuUlhBxnFxDyAPy9A';

if (true) {
    $json = json_decode(file_get_contents($url.'&alt=jsonc'));
    if (count($json->data->items)) {
        foreach($json->data->items as $entry) {
            $title = srcTitle($src, $entry->title);
            echo srcLi($entry->id, $title[0], $title[1], $entry->duration);
        }
    } else echo 'No Results Found';

} else {
    $xml = simplexml_load_file($url);
    if (count($xml->entry)) {
        foreach($xml->entry as $entry) {
            $media = $entry->children('media', true);
            $yt = $media->group->children('yt', true);
            $dur = $yt->duration->attributes();
            $title = srcTitle($src, $entry->title);
            echo srcLi($yt->videoid, $title[0], $title[1], $dur['seconds']);
        }
    } else echo 'No Results Found';
}
?>