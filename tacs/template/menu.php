[[<?php
// define menu in XML
$menuXML = <<<XML
<?xml version='1.0' standalone='yes'?>
<menu>

	<item id="home" text="Home" link="" title="" key="h" />

	<item id="services" text="Services" link="devon-building-services" title="" key="s">

		<item id="extensions" text="Extensions" link="building-services/extensions-refurbishments" title="" key="e" />

		<item id="kitchen" text="Kitchens" link="building-services/kitchens" title="" key="k" />

		<item id="bathroom" text="Bathrooms" link="building-services/bathrooms-wetrooms" title="" key="b" />

		<item id="projects" text="Projects" link="building-services/projects" title="" key="p" />

	</item>

	<item id="about" text="About" link="about-us" title="" key="a">

		<item id="testimonials" text="Testimonials" link="about-us/customer-testimonials" title="" key="t" />

		<item id="casestudy1" text="Case Study 1" link="about-us/case-study-1" title="" key="" />

	</item>

	<item id="contact" text="Contact" link="contact-us" title="" key="c">

		<item id="terms" text="Terms" link="contact-us/terms-and-conditions" title="" key="" />

	</item>

</menu>
XML;

$menu = new SimpleXMLElement($menuXML);

// define the menus
$page = array();
$menuMain = array();
$inSub = false;

// main menu items
foreach ($menu->item as $item) {

	// main page active
	$mActive = (strpos($pageuri, 'pc' . str_replace('/', '-', $root . $item['link']) . '.php') !== false);
	$ms = array();

	// sub-menu items
	foreach($item->item as $subitem) {

		$sActive = (strpos($pageuri, 'pc' . str_replace('/', '-', $root . $subitem['link']) . '.php') !== false);
		$mActive = ($mActive || $sActive);
		$inSub = ($inSub || $sActive);

		$ms[] = new Menu($subitem['id'], $subitem['text'], $root . $subitem['link'], $subitem['title'], $subitem['key'], 2, $sActive);

		// page list
		$page[(string) $subitem['id']] = (string) $root . $subitem['link'];

	}

	// main menu
	$menuMain[] = new Menu($item['id'], $item['text'], ($root . $item['link']), $item['title'], $item['key'], 1, ($mActive && !$inSub), $mActive, $ms);
	$page[(string) $item['id']] = (string) $root . $item['link'];

}


// menu item
class Menu
{
	public $ID, $Text, $Link, $Title, $Key, $Level, $Active, $Open, $Sub;

	// define a menu
	public function __construct($id, $text, $link, $title = '', $key = '', $level = 1, $active = false, $open = false, $sub = array()) {
		$this->ID = (string) $id;
		$this->Text = str_replace('|', '<br />', $text);
		$this->Link = (string) $link;
		$this->Title = (string) $title;
		$this->Key = (string) $key;
		$this->Active = (bool) $active;
		$this->Open = (bool) $open;
		$this->Sub = $sub;
	}

	// return an HTML link
	public function CreateLink() {
		if ($this->Active) $m = "<strong>$this->Text</strong>";
		else {
			$m = "<a href=\"$this->Link\"";
			if ($this->Title != '') $m .= " title=\"$this->Title\"";
			if ($this->Key != '') $m .= " accesskey=\"$this->Key\"";
			$m .= ">$this->Text</a>";
		}
		return $m;
	}
}
?>]]
