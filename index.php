<?php
// view loader
$host = $_SERVER['HTTP_HOST'];
$page = str_replace('?' . $_SERVER['QUERY_STRING'], '', $_SERVER['REQUEST_URI']);
$cached = $page;
$local = (strpos($_SERVER['HTTP_HOST'] , '.co') === false);
if ($local) $page = str_replace('/taylorproperty', '', $page);
$page = str_replace('/', '_', preg_replace('/^\/+|\/+$/', '', $page));
if ($page == '') $page = 'home';

$page = "content/$page.html";

if (file_exists($page)) {

	// delete cached file
	if ($local && count($_GET) == 0 && count($_POST) == 0) {
		clearstatcache();
		$cachefile = 'tacs/cache/c' . preg_replace(array('/\?.*$/', '/[\/]+/', '/[\.]+/'), array('', '-', '-'), $cached) . '.php';
		if (file_exists($cachefile) && time() > filemtime($cachefile)+3) unlink($cachefile);
	}

	// content found
	include('tacs/tacs.php');
	echo
		'[', "[\"content/default.ini\"]", ']',
		'[', "[\"$page.ini\"]", ']',
		'[', "[\"pagebegin.php\"]", ']',
		'[', "[\"$page\"]", ']',
		'[', "[\"pageend.php\"]", ']';

}
else {

	// page not found
	include('error.php');

}
?>