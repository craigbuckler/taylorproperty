</article>

<aside>

[[<?php
// aside content
if (isset($ASIDE)) echo '[', "[\"content/$ASIDE\"]", ']';

// Buy With Confidence
if (!isset($NOBWC)) {
?>]]
<h2>Buy With Confidence</h2>

<p>[[COMPANY]] has a &#8220;<a href="https://www.buywithconfidence.gov.uk/profile/mike-taylor-ltd-t-a-taylor-property-maintenance/7172/">Buy With Confidence</a>&#8221; <span class="rating">&#9733;&#9733;&#9733;&#9733;&#9733;</span> rating. The scheme is operated by Devon County Council Trading Standards and helps you find good, honest, local businesses without the risk of using a rogue trader.</p>

<p class="member"><a href="https://www.buywithconfidence.gov.uk/profile/mike-taylor-ltd-t-a-taylor-property-maintenance/7172/"><img src="[[root]]images/devon-buy-with-confidence.png" width="227" height="174" alt="Buy With Confidence" title="Devon County Council Trading Standards Buy With Confidence Scheme" />Approved Membership Number 0398</a></p>

<p class="member"><a href="http://www.devonbuildingcontrol.gov.uk/"><img src="[[root]]images/devon-building-control-partnership.png" width="227" height="173" alt="Devon Building Control" title="Devon Building Control Certificate of Excellence award" />Devon Building Control Partnership<br />Certificate of Excellence award winner</a></p>

<p class="member"><a href="http://www.wedi.co.uk/"><img src="[[root]]images/wedi.png" width="227" height="51" alt="wedi" title="Approved wedi Installer" />wetroom and steam room<br />approved installer</a></p>

<p class="member"><a href="https://www.facebook.com/taylorpropertymaintenancedevon/"><img src="[[root]]images/icons/facebook-logo.png" width="40" height="40" alt="Facebook" />find us on Facebook</a></p>
[[<?php
}
?>]]

</aside>

</div>
<!-- /page -->

<footer>

<a href="https://www.buywithconfidence.gov.uk/profile/mike-taylor-ltd-t-a-taylor-property-maintenance/7172/"><img src="[[root]]images/buy-with-confidence.png" width="62" height="61" alt="Buy With Confidence" title="Devon County Council Buy With Confidence" /></a>

<p><strong>&#169; <?php echo date('Y'); ?> Taylor Construction Management Ltd, Exeter, Devon. Registered in England and Wales No. 6981426</strong></p>
<p>telephone: <a href="tel:+44-7917-203398"><strong>07917 203 398</strong></a> email: <strong><a href="[[<?php echo $page['contact']; ?>]]" class="email">taylorcmltd {at} gmail dot com</a></strong></p>
<p><a href="http://www.optimalworks.net/">an OptimalWorks website</a></p>

</footer>

<!-- script -->
[[<?php
// include JavaScript
$js = '';

if ($local) {
	$script = array('owl', 'owl_css', 'owl_dom', 'owl_xml', 'owl_innerhtml', 'owl_event', 'owl_timer', 'owl_image', 'owl_screen', 'owl_overlay', 'owl_lightbox', 'main');
	foreach ($script as $file) $js .= "<script src=\"${root}script/$file.js\"></script>\n";
}
else {
	$js .= '<script src="http://www.google-analytics.com/ga.js"></script>'."\n<script src=\"${root}script/taylor.js\"></script>";
}
echo $js;
?>]]

</body>
</html>
