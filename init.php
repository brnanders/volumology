<?php
if (!defined('INCLUDE_CHECK')) die('You are not allowed to execute this file directly');
//mysql_connect('davidbryan.db.4252713.hostedresource.com', 'davidbryan', 'TlDl617905') or die('Could not connect to the database.');
//mysql_selectdb('davidbryan') or die('Could not select database.');
if ($_SERVER['SERVER_NAME'] == 'localhost')
{
    mysql_connect('localhost', 'root', null) or die('Could not connect to the database.');
    mysql_selectdb('davidbryan') or die('Could not select database.');
}
else
{
    mysql_connect('fdb3.biz.nf', '1525674_bryan', 'Soccer1!') or die('Could not connect to the database.');
    mysql_selectdb('1525674_bryan') or die('Could not select database.');
}
?>