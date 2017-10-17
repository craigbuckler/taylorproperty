<?php
// contact form
$website = 'Taylor Construction website';
$salesemail = 'info@miketaylorltd.co.uk';
if ($local) $salesemail = 'craig@optimalworks.net';

// ________________________________________________________
// fetches a GET variable
function get($var, $default='', $maxlength=9999) {
	$v = (isset($_GET[$var]) ? $_GET[$var] : '');
	return cleanvar(strlen($v) > 0 && strlen($v) <= $maxlength ? $v : $default);
}


// fetches a POST variable
function post($var, $default='', $maxlength=9999) {
	$v = (isset($_POST[$var]) ? $_POST[$var] : '');
	return cleanvar(strlen($v) > 0 && strlen($v) <= $maxlength ? $v : $default);
}


// clean a form variable
function cleanvar($v) {
	$v = (string) $v;
	if (get_magic_quotes_gpc()) $v = stripslashes($v);
	$v = trim($v);
	$v = str_replace("\r", '', $v);
	$v = preg_replace('/[ \t\f]+/', ' ', $v);
	$v = htmlentities($v);
	do {
		$ov = $v;
		$v = str_replace("\n\n", "\n", $v);
	} while ($v != $ov);
	return $v;
}


// returns valid email address (checks for spam attempt)
function emailcheck($e) {
	$e = strtolower($e);
	if ($e != '' && (preg_match('/^.+@[a-z0-9]+([_\.\-]{0,1}[a-z0-9]+)*([\.]{1}[a-z0-9]+)+$/', $e) != 1 || strpos($e, '\n') !== false || strpos($e, 'cc:') !== false)) $e = '';
	return $e;
}


// get microtime (seconds integer)
function microtime_int() {
   list($usec, $sec) = explode(' ', microtime());
   return ((int) $sec);
}


// encode
function encode($value) {
	$value = html_entity_decode(strval($value));
	$ip = $_SERVER['REMOTE_ADDR'];
	$ip = preg_replace('/\D/', '', $ip);
	if ($ip == '') $ip = '139999205';
	$ret = '';
	for ($i = 0; $i < strlen($value); $i++) {
		$c = ord(substr($value, $i, 1));
		$ic = substr($ip, $i % strlen($ip), 1) + $i;
		$ret .= chr($c ^ $ic);
	}
	return htmlentities($ret);
}
?>
