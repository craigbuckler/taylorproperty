<?php
// requested URL
$addr=strtolower($_SERVER['REQUEST_URI']);
$url = '';

$host = $_SERVER['HTTP_HOST'];
$root = (strpos($host , '.co') === false ? '/taylorproperty/' : '/');

// redirects
$redir = array(

	'index' => $root,
	'service' => $root . 'devon-building-services',
	'price' => $root . 'devon-building-services',
	'kitchen' => $root . 'building-services/kitchens',
	'bathroom' => $root . 'building-services/bathrooms',
	'interior' => $root . 'building-services/interior-rooms',
	'inside' => $root . 'building-services/interior-rooms',
	'exterior' => $root . 'building-services/exterior-gardens-garages',
	'outside' => $root . 'building-services/exterior-gardens-garages',
	'garden' => $root . 'building-services/exterior-gardens-garages',
	'garage' => $root . 'building-services/exterior-gardens-garages',
	'commercial' => $root . 'building-services/commercial',
	'other' => $root . 'building-services/commercial',
	'build' => $root . 'building-services/commercial',
	'about' => $root . 'about-us',
	'testimonial' => $root . 'about-us/customer-testimonials',
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