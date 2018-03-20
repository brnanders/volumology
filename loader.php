<?php require 'setup.php'; ?>
<div id="top_tab" class="trigger">
    <?php if ($session): ?><p>Log-Out</p>
    <?php else: ?><p>Log-In</p><?php endif; ?>
    <span id="top_button"></span>
</div>

<div id="header" class="group">

    <div class="wrap">

        <div id="logo">
            <h1>Volumology</h1>
        </div>

        <div id="searcher">
            <div class="autodiv">
                <input type="text" id="searchtext" class="autotext" placeholder="Search for Music"
                    <?php if ($set['sc']) echo ' value="'.$set['sc'].'"'; ?>/>
                <ul></ul>
            </div>

            <ul id="search_btns">
                <li><input type="button" id="searchbtn" class="btnstyle" value="Quick Search"/><b> V</b>
                    <ul id="inner_btns">
                        <li><input type="button" id="albumbtn" class="btnstyle" value="Search Albums"/></li>
                        <li><input type="button" id="songbtn" class="btnstyle" value="Search Songs"/></li>
                        <li><input type="button" id="similarbtn" class="btnstyle" value="Similar Artists"/></li>
                        <li><input type="button" id="lfmbtn" class="btnstyle" value="Last.fm User"/></li>
                        <li><input type="button" id="switchbtn" class="btnstyle" value="Switch Artist/Song"/></li>
                        <li><input type="button" id="requestbtn" class="btnstyle" value="Add Request"/></li>
                        <li><input type="button" id="requestsbtn" class="btnstyle" value="Search Requests"/></li>
                    </ul>
                </li>
            </ul>
            <div class="clear"></div>

        </div>

    </div>

</div>

<div class="wrap">

    <div id="music"><?php require 'music.php'; ?></div>
    <div id="search">
        <div class="listtab">
            <a href="#" class="tab_on">Search</a>
            <a href="#">Albums</a>
            <a href="#">Top Songs</a>
            <a href="#">Similar</a>
            <ul>
                <li id="prev" title="Previous Search">Previous</li>
                <li id="trash" title="View Removed Songs">Trash</li>
            </ul>
        </div>
        <div id="searchstatus">
            <input type="button" id="searchcancel" class="cancelbtn" title="Cancel"/>
            <span id="searchlabel"><?php if (!$set['sc']) echo 'Volumology\'s Top Results'; ?></span>
        </div>
        <div class="oltab">
            <ol id="searchol">
                <?php
                    if (!$set['sc']) {
                        $result = mysql_query('select songid, artist, song, count(*) from music group by songid order by count(*) desc, artist, song limit '.$a[$set['sl']]);
                        while ($song = mysql_fetch_row($result)) echo srcTopLi($song[0], $song[1], $song[2], $song[3]);
                        mysql_free_result($result);
                    }
                ?>
            </ol>
            <ol id="albumol" class="hide"></ol>
            <ol id="songol" class="hide"></ol>
            <ol id="similarol" class="hide">
                <?php
                    if (!$set['sc']) {
                        $result = mysql_query('select artist, count(*) from music group by artist order by count(*) desc, artist limit '.$a[$set['sl']]);
                        while ($song = mysql_fetch_row($result)) echo artistLi($song[0], $song[1]);
                        mysql_free_result($result);
                    }
                ?>
            </ol>
        </div>
    </div>
    
    <div class="clear"></div>
</div>