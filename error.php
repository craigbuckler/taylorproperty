<?php
// requested URL
$addr=strtolower($_SERVER['REQUEST_URI']);
$url = '';

$host = $_SERVER['HTTP_HOST'];
$root = '/';

// redirects
$redir = array(

	'index' => $root,
	'build' => $root . 'building-services/projects',
	'service' => $root . 'devon-building-services',
	'price' => $root . 'devon-building-services',
	'kitchen' => $root . 'building-services/kitchens',
	'bath' => $root . 'building-services/bathrooms-wetrooms',
	'wet' => $root . 'building-services/bathrooms-wetrooms',
	'exten' => $root . 'building-services/extensions-refurbishments',
	'exter' => $root . 'building-services/extensions-refurbishments',
	'outside' => $root . 'building-services/extensions-refurbishments',
	'garden' => $root . 'building-services/extensions-refurbishments',
	'garage' => $root . 'building-services/extensions-refurbishments',
	'inter' => $root . 'building-services/extensions-refurbishments',
	'inside' => $root . 'building-services/extensions-refurbishments',
	'wood' => $root . 'building-services/extensions-refurbishments',
	'carpent' => $root . 'building-services/extensions-refurbishments',
	'commer' => $root . 'building-services/projects',
	'project' => $root . 'building-services/projects',
	'other' => $root . 'building-services/projects',
	'about' => $root . 'about-us',
	'test' => $root . 'about-us/customer-testimonials',
	'contact' => $root . 'contact-us',
	'quote' => $root . 'contact-us',
	'tel' => $root . 'contact-us',
	'mail' => $root . 'contact-us',
	'term' => $root . 'contact-us/terms-and-conditions',
	'cond' => $root . 'contact-us/terms-and-conditions'

);
foreach ($redir as $pold => $pnew) if (strpos($addr, $pold) !== false) $url = $pnew;

if ($url !== '') {

	// redirect found
	header('HTTP/1.1 301 Moved Permanently');
	header('Location: ' . $url);

}
else {

	// show error page
	$eurl = 'http://' . $host . $root . 'error404';

	$fcont = file_get_contents($eurl);
	if ($fcont !== false) {
		header('HTTP/1.0 404 Not Found');
		echo $fcont;
	}
	else header('Location: ' . $eurl);

}
?>
