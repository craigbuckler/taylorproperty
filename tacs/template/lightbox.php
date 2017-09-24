[[<?php
// show lightbox images
if (isset($LIGHTBOX)) {

	// image location
	$img = '../../images/';
	$desc = $LIGHTBOX . ' photograph';
	
	$lb = '';
	$i = 0;
	do {
		$i++;
		$fn = $LIGHTBOX . str_pad($i, 2, '0', STR_PAD_LEFT) . '.jpg';
		
		// image found
		$exists = file_exists($img . 'thumbs/' . $fn);
		if ($exists) {
			$lb .= "<li><a href=\"${root}images/photos/$fn\"><img src=\"${root}images/thumbs/$fn\" width=\"160\" height=\"120\" alt=\"$desc\"><strong>$desc</strong><span>image $i of #</span></a></li>\n";
		}
		
	} while ($exists);

	// output
	if ($lb != '') {
		$i--;
		echo
			"<ol class=\"lightbox\">\n",
			str_replace('#', $i, $lb),
			"</ol>\n";
	}
	
}
?>]]