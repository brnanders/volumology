<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <title>Volumology</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <link rel="stylesheet" type="text/css" media="screen, projection" href="css/screen.css" />
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
    <script type="text/javascript" src="js/setup.js"></script>
    <script type="text/javascript" src="js/search.js"></script>
    <!--<script type="text/javascript" src="js/jquery.formalize.js"></script>
    <script type="text/javascript" src="swfobject/swfobject.js"></script>
	<script type="text/javascript" src="http://www.youtube.com/player_api"></script>-->
</head>

<body>
    <div class="panel">

        <div id="forms">

            <form id="loginForm" action="javascript:dbLogin();">

                <fieldset>

                    <h2>Already Joined? Log-in</h2>

                    <label for="email">email</label>
                    <input type="email" class="email" name="email" tabindex="1" autocomplete="on" maxlength="50"/>

                    <label for="pass">password<a href="#" id="forgot" title="Send password to email">forgot/reset?</a></label>
                    <input type="password" class="pass" name="pass" tabindex="2" autocomplete="on" />														    

                    <div id="logCheck">			
                        <input type="checkbox" id="logincheck" tabindex="3"/>
                        <label for="logincheck">Remember Me</label>																				
                    </div>

		    <div id="formBottom">
			<input type="submit" class="formBtn" tabindex="4" value="Log-In"/>     
			<a id="applink" href="#">Download Android App</a>																								
		    </div>

		    <div class="formMsg">																				
			<p class="message"></p>
		    </div>

                </fieldset>
    
            </form>

            <form id="newForm" action="javascript:dbRegister();">
    
                <fieldset>

                    <h2>New User? Create an Account</h2>

                    <label for="email">email</label>
                    <input type="email" class="email" name="email" autocomplete="off" maxlength="50"/>

                    <label for="pass">password</label>
                    <input type="password" class="pass" name="pass" autocomplete="off"/>

                    <label for="confirm">confirm password</label>
                    <input type="password" class="confirm" name="confirm" autocomplete="off"/>

                    <input type="submit" class="formBtn" value="Create Account"/>

                    <div class="formMsg">																				
			<p class="message"></p>
		    </div>

                </fieldset>
    
            </form>
        
            <div class="clear"></div>
        
        </div>

    </div>

    <div id="loader">
	<?php
	    if (isset($_GET['id']) && $_GET['id']) $_GET['song'] = $_GET['id'];
	    foreach(array('song', 'radio', 'search') as $i) {
		if (isset($_GET[$i]) && $_GET[$i]) echo '<input type="hidden" id="'.$i.'start" value="'.urldecode($_GET[$i]).'"/>';
	    }
	?>

        <div id="header" class="group">

            <div class="wrap">   

                <div id="logo">

                    <h1>Volumology - Loading...</h1>

                </div>

            </div>

        </div>

    </div>

    <div id="logos">
        <a href="http://www.youtube.com/" target="blank"><img src="img/youtube.png" alt="Powered by Youtube" /></a>
        <a href="http://www.last.fm/" target="blank"><img src="img/lastfm_grey_small.gif" alt="Last.fm" /></a>
    </div>

	<div id="trivia">
	    <input type="button" id="gamebtn" class="btnstyle" value="Games"/>
	    <select></select><p></p>
	</div>

    <div id="player"></div>

    <div id="main_controls">
        <ul id="main_labels">
            <li><input type="button" id="playbtn" class="main_play" title="Play"/>
            <p id="statuslabel">Ready</p></li>
            <li><input type="button" id="nextbtn" title="Play Next, Right Click to Skip"/>
            <p id="nextlabel">Next Song</p></li>
        </ul>
        <ul id="main_opt">
            <li><input type="checkbox" id="randomcheck" title="Randomize"/><label for="randomcheck">Randomize</label></li>
            <li><input type="checkbox" id="repeatcheck" title="Repeat"/><label for="repeatcheck">Repeat</label></li>
        </ul>
	<input type="hidden" id="refcheck" value=""/>
    </div>

    <div id="footer"></div>

    <div id="ellipsis"><a href="#"></a></div>

    <div id="blocker"></div>
    <div id="game">
	<input type="button" class="cancelbtn" title="Close"/>
	<span id="gameprev" title="Previous"></span>
	<input type="text" id="gametext" placeholder="Filter games"/>
	<h3><a href="http://kongregate.com" target="blank">Popular Flash Games - Kongregate</a></h3>
    </div>
</body>
</html>