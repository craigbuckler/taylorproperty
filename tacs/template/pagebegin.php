<?php
// Taylor Construction
// (C) Optimalworks Ltd - http://www.optimalworks.net/

// runtime variables
header('Content-Type: text/html; charset=UTF-8');
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
date_default_timezone_set('UTC');
$host = $_SERVER['HTTP_HOST'];
$thispage = 'http://'.$host.$_SERVER['REQUEST_URI'];
$encpage = urlencode($thispage);
$local = (strpos($host , '.co') === false);

// redirect .php files
$newpage = str_replace('.php', '', $thispage);
if ($newpage != $thispage) {
	header('HTTP/1.1 301 Moved Permanently');
	header("Location: $newpage");
}

?>[[<?php

// render variables
header('Content-Type: text/html; charset=UTF-8');
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
date_default_timezone_set('UTC');
$host = $_SERVER['HTTP_HOST'];
$pageuri = $_SERVER['REQUEST_URI'];
$thispage = "http://$host$pageuri";
$local = (strpos($host , '.co') === false);
$root = '/';

$COMPANY = 'Taylor Construction Management Ltd';

?>]]<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">

<title>[[PAGETITLE]] | [[<?php echo ($PAGETITLE != $COMPANY ? $COMPANY : 'building and renovation in the Exeter area including Kenton, Exminster and Topsham'); ?>]]</title>

<meta name="description" content="[[PAGEDESC]]" />
<meta name="keywords" content="[[PAGEKEYS]], building, maintenance, construction, refurbishment, renovation, contractor, painting, electrical, plumbing, decorating, tiling, home improvement, handyman, handiman, carpentry, repair, gardening, project, home, business, industrial, sustainable, green, ethical" />
<meta name="page-topic" content="[[PAGETOPIC]]" />
<meta name="audience" content="all" />
<meta name="distribution" content="global" />
<meta name="author" content="[[COMPANY]]" />
<meta name="publisher" content="Optimalworks Ltd, http://www.optimalworks.net/" />
<meta name="owner" content="[[COMPANY]]" />
<meta name="copyright" content="[[COMPANY]]" />
<meta name="robots" content="index,follow" />
<meta name="revisit-after" content="7 days" />
<meta name="WebsiteSpark" content="1E2asj2Nm3V" />

<!--[if lt IE 9]>
<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->

<!-- stylesheets -->
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link type="text/css" rel="stylesheet" media="all" href="[[root]]styles/styles.css" />

<!-- favicon -->
<link rel="shortcut icon" href="[[root]]favicon.ico" />

<!-- menu functions -->
[["menu.php"]]

</head>
<body class="[[<?php echo ($inSub ? 'sub' : 'main'); ?>]]">

<!-- outer page -->
<div id="page">

<!-- header -->
<header>

<p id="logo"><a href="[[root]]"><img src="[[root]]images/taylor-property-maintenance.png" width="191" height="100" alt="[[COMPANY]]" /></a></p>

<p id="tag"><a href="[[<?php echo $page['contact']; ?>]]">Property Construction &#8211; 07917 203 398</a></p>

<!-- main page image -->
[[<?php if (!$inSub) { ?>]]
[["pageimage.php"]]
[[<?php } ?>]]

<nav>
[[<?php
// menu links
echo "<ul>\n";
foreach($menuMain as $m) {
	echo '<li', ($m->Open || $m->Active ? ' class="open"' : '') ,'>', $m->CreateLink();
	if (count($m->Sub) > 0) {
		echo "\n<ul>\n";
		foreach ($m->Sub as $ms) {
			echo '<li>', $ms->CreateLink(), "</li>\n";
		}
		echo "</ul>\n";
	}
	echo "</li>\n";
}
echo "</ul>\n";
?>]]
</nav>

<h1>[[PAGETITLE]]</h1>

</header>

<!-- main content -->
<article>
