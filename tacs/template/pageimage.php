[[<?php
// page images and links
$pi = array(
	'bathroom' => '<li class="bathroom2"><a href="' . $page['bathroom'] . '">beautiful bathrooms</a></li>',
	'kitchen' => '<li class="kitchen2"><a href="' . $page['kitchen'] . '">superior kitchens</a></li>',
	'interior' => '<li class="extension"><a href="' . $page['extensions'] . '">impressive interiors</a></li>',
	'extensions' => '<li class="extension2"><a href="' . $page['extensions'] . '">exceptional extensions</a></li>',
	'commercial' => '<li class="commercial"><a href="' . $page['projects'] . '">project management</a></li>'
);

$pout = '';
if (isset($PAGEIMAGE)) {
	$plist = explode(',', $PAGEIMAGE);
	for ($p = 0, $pl = count($plist); $p < $pl; $p++) $pout .= $pi[$plist[$p]];

	if ($pout) echo '<ul id="pageimage">', $pout ,'</ul>';
}
?>]]
