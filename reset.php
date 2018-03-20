<?php
define('INCLUDE_CHECK',true);
require 'init.php';
if (isset($_GET['id']) && isset($_GET['q'])) {
    $username = urldecode($_GET['id']);
    $result = mysql_query('select * from user where username="'.$username.'" and password="'.$_GET['q'].'"');
    if (!mysql_num_rows($result)) $username = null;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <title>Volumology</title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
        <link rel="stylesheet" type="text/css" media="screen, projection" href="css/screen.css" />
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
        <script type="text/javascript">
            function dbReset() {
                if ($('.pass').val().length > 5 && $('.pass').val() == $('.confirm').val()) {
                    $('.message').text('Resetting password...');
                    $.ajax({
                        type: 'POST', url: 'login.php', dataType: 'html',
                        data: 'method=reset&user=' + escape($('.name').val()) + '&pass=' + escape($('.pass').val()),
                        success: function() { window.location = '/musicplayer'; },
                        error: function() { $('.message').text('Error - Please try again'); }
                    });
                }
            }
        </script>
    </head>

    <body>
        <a href="/musicplayer"><h1>Volumology</h1></a>

        <?php if ($username): ?>

        <form id="resetForm" action="javascript:dbReset();">

            <fieldset>
  
                <h2>Reset Password - <?php echo $username ?></h2>

                <input type="hidden" class="name" name="name" value="<?php echo $username; ?>"/>

                <label for="pass">password</label>
                <input type="password" class="pass" name="pass" autocomplete="off"/>

                <label for="confirm">confirm password</label>
                <input type="password" class="confirm" name="confirm" autocomplete="off"/>

                <input type="submit" class="formBtn" value="Reset"/>
                <p class="message"></p>

            </fieldset>

        </form>
        
        <?php else: ?>
        
        <h2>Invalid Address</h2>
        
        <?php endif; ?>
    </body>
</html>