[[<?php
// page images and links
$pi = array(
	'bathroom' => '<li class="bathroom"><a href="' . $page['bathroom'] . '">beautiful bathrooms</a></li>',
	'kitchen' => '<li class="kitchen"><a href="' . $page['kitchen'] . '">superior kitchens</a></li>',
	'interior' => '<li class="interior"><a href="' . $page['interior'] . '">impressive interiors</a></li>',
	'exterior' => '<li class="exterior"><a href="' . $page['exterior'] . '">exceptional exteriors</a></li>',
	'commercial' => '<li class="commercial"><a href="' . $page['commercial'] . '">commercial projects</a></li>'
);

$pout = '';
if (isset($PAGEIMAGE)) {
	$plist = explode(',', $PAGEIMAGE);
	for ($p = 0, $pl = count($plist); $p < $pl; $p++) $pout .= $pi[$plist[$p]];

	if ($pout) echo '<ul id="pageimage">', $pout ,'</ul>';
}
?>]]