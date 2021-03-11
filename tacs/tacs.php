<?php
/*
	TACS: Templating and Caching System, v1.3.5
	(C) Optimalworks Ltd, https://www.optimalworks.net/
	Creative Commons Attribution 3.0 License: https://creativecommons.org/licenses/by/3.0/
*/
define('TACSFILENAME', 'tacs.php');	// the name of the TACS script file: do not use this name for any other files
define('TACSPATH', 'tacs/');		// the relative path to TACS, e.g. 'tacs/' - only set if every page can use the same path
define('TACSCACHE', 'cache');		// name of the TACS cache folder
define('TACSTEMPLATE', 'template');	// name of the TACS global template folder
define('TACSINCLUDELIMIT', 50);		// limit the number of includes (prevents cyclical includes)
define('TACSRENDERLIMIT', 10);		// limit the number of PHP renders (prevents PHP generating more PHP)
define('TACSBUFFER', true);		// buffers the output page
define('TACSCOMPRESS', true);		// remove whitespace in HTML
define('TACSRENDERTIMEOUT', 30);	// number of seconds before a timeout is assumed
define('TACSDEBUG', false);		// set to true to view debugging information

@ini_set('output_buffering', 'On');
@ini_set('implicit_flush', '0');
@ini_set('allow_url_fopen', '1');

// TACS class
class TACS {

	// properties
	var $self;					// script location (path and filename)
	var $url;						// actual URL (if URL rewrite used)
	var $selfname;			// script filename
	var $absloc;				// absolute location of script
	var $tacspath;			// relative location of TACS folder
	var $cachepath;			// location of cache
	var $cachehttp;			// HTTP location of cache
	var $cachefile;			// name of cached file
	var $templatepath;	// global templates path
	var $includes;			// included files count
	var $renders;				// render count
	var $debug;					// debug string
	var $recache;				// recache flag (pass ?recache to force recaching)
	var $timestart;			// script start time

	// constructor
	function __construct() {

		// start buffer
		if (TACSBUFFER) ob_start();

		// initialise
		$this->timestart = $this->GetTime();
		$this->self = $_SERVER['PHP_SELF'];
		$this->url = preg_replace('/\?.*$/', '', $_SERVER['REQUEST_URI']);
		$this->selfname = preg_replace('/.*\//', '', $this->self);
		$this->absloc = str_replace($this->selfname, '', str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'].$this->self));
		$this->tacspath = (TACSPATH ? TACSPATH : $this->TacsRelativePath());
		$this->cachepath = $this->tacspath . TACSCACHE . '/';
		$this->cachehttp = $this->CacheHTTPlocation();
		$this->cachefile = $this->CacheFilename();
		$this->templatepath = $this->tacspath . TACSTEMPLATE . '/';
		$this->includes = 0;
		$this->renders = 0;
		$this->debug = "\n\nTACS debugging trace\n";
		$this->recache = isset($_GET['recache']);

		if (TACSDEBUG) {
			$this->debug .= 'self: '.$this->self."\n";
			$this->debug .= 'url: '.$this->url."\n";
			$this->debug .= 'selfname: '.$this->selfname."\n";
			$this->debug .= 'absloc: '.$this->absloc."\n";
			$this->debug .= 'tacspath: '.$this->tacspath."\n";
			$this->debug .= 'cachepath: '.$this->cachepath."\n";
			$this->debug .= 'cachehttp: '.$this->cachehttp."\n";
			$this->debug .= 'cachefile: '.$this->cachefile."\n";
			$this->debug .= 'templatepath: '.$this->templatepath."\n";
			$this->debug .= 'recache: '.$this->recache."\n";
		}

		// fetch content from cache
		$cached = ($this->recache ? false : $this->CacheGet());

		if ($cached !== false) {
			// cached content included
			if (TACSDEBUG) {
				$this->debug .= 'content retrieved from cache ('.($this->GetTime()-$this->timestart)." seconds)\n";
				echo '<p>'.preg_replace('/\n/', '<br />', $this->debug).'</p>';
			}
			if (TACSBUFFER) ob_flush();
			exit;
		}
		else {
			// generate cached content
			if (TACSBUFFER) ob_end_clean();
			ob_start(array($this, 'CacheSet'));
		}

	}

	// returns a filename that can be used for caching
	function CacheFilename() {
		return 'c'.$this->RegExReplace($this->url,
			array( '/[\/]+/', '/[\.]+/' ),
			array( '-', '-' )
		).'.php';
	}

	// fetch cached file (if available)
	function CacheGet() {
		$cached = false;

		// last modified time of self and cache
		clearstatcache();
		$selftime = @filemtime($this->selfname);
		if ($selftime === false) $selftime = @filemtime($this->absloc . $this->selfname);
		if ($selftime === false) $selftime = 0;
		$cfiletime = @filemtime($this->cachepath . $this->cachefile);
		if ($cfiletime === false) $cfiletime = @filemtime($this->absloc . $this->cachepath . $this->cachefile);
		if ($cfiletime === false) $cfiletime = 0;

		// include cached file
		if ($selftime < $cfiletime) {
			@include($this->cachepath . $this->cachefile);
			$cached = true;
		}

		// remove hung pre-cache file
		$pcfile = $this->cachepath.'p'.$this->cachefile;
		if (file_exists($pcfile) || file_exists($this->absloc . $pcfile)) {
			$pctime = @filemtime($pcfile);
			if ($pctime === false) $pctime = @filemtime($this->absloc . $pcfile);
			if ($pctime === false) $pctime = 0;
			if (TACSDEBUG) $this->debug .= "pre-cache file found: $pcfile ($pctime)\n";
			if (time()-$pctime > TACSRENDERTIMEOUT) {
				if (!(@unlink($pcfile) || @unlink($this->absloc . $pcfile)) && TACSDEBUG) $this->debug .= "TACS ERROR: could not delete pre-cache file: $pcfile\n";
			}
		}

		if (TACSDEBUG) {
			$this->debug .= 'selftime: '.$selftime."\n";
			$this->debug .= 'cfiletime: '.$cfiletime."\n";
		}

		return $cached;
	}

	// create cache (ob_start callback)
	function CacheSet($content) {

		// iterative content rendering
		do {
			$oldcontent = $content;
			$content = $this->IncludesHandler($content); // parse includes
			$content = $this->PhpHandler($content); // parse PHP directives
			$content = $this->PreCacheHandler($content); // run render-time PHP
			$this->renders++;
		} while ($content != $oldcontent && $this->renders <= TACSRENDERLIMIT);

		// clean content
		$content = $this->CleanContent($content);

		// store cache
		if (!$this->WriteFile($this->cachepath.$this->cachefile, $content) && TACSDEBUG) $this->debug .= "TACS ERROR: could not write cached content: {$this->cachepath}{$this->cachefile}\n";

		// delete pre-cache file
		$pcfile = $this->cachepath.'p'.$this->cachefile;
		if (!(@unlink($pcfile) || @unlink($this->absloc . $pcfile)) && TACSDEBUG) $this->debug .= "TACS ERROR: could not delete pre-cache file: $pcfile\n";

		// fetch cached content
		if ($this->CacheGet()) {
			$content = '';
			if (TACSDEBUG) {
				$this->debug .= 'included files: '.$this->includes."\n";
				$this->debug .= 'render iterations: '.$this->renders."\n";
				$this->debug .= 'content regenerated ('.($this->GetTime()-$this->timestart)." seconds)\n";
				$this->debug .= '<a href="'.$this->url."\">load cached file...</a>\n";
			}
			else {
				header('Location: '.$this->url);
				exit();
			}
		}

		if (TACSDEBUG) $content .= '<p>'.preg_replace('/\n/', '<br />', $this->debug).'</p>';
		return $content;
	}

	// add all include files
	function IncludesHandler(&$content) {

		do {
			$content = $this->CleanTacsTags($content); // clean tags
			$ips = strpos($content, '[[\'');
			if ($ips !== false) {
				$ipe = strpos($content, '\']]', $ips);
				if ($ipe === false) $ipe = strlen($content)-1;

				// add replacement
				$template = substr($content, $ips+3, $ipe-$ips-3);
				$content = substr($content, 0, $ips) . $this->IncludeContent($template) . substr($content, $ipe+3);
				$this->includes++;
			}
		} while ($ips !== false && $this->includes < TACSINCLUDELIMIT);

		return $content;
	}

	// clean all TACS tags
	function CleanTacsTags(&$content) {
		return $this->RegExReplace( $content,
			array( '/\[\[\s+/', '/\s+\]\]/', '/\[\[[\'|"]([^\[\[|\]\]]*)[\'|"]\]\]/' ),
			array( '[[', ']]', '[[\'$1\']]' )
		);
	}

	// fetch the content of an include file - checks location relative to page or TACS template folder
	function IncludeContent($file) {
		$content = '';

		// check file locations
		$flc[] = $file; // relative location
		$flc[] = $this->templatepath . $file; // relative TACS template
		$flc[] = $this->absloc . $file; // absolute location
		$flc[] = $this->absloc . $this->templatepath . $file; // absolute TACS template

		$exists = false;
		$f = 0;
		while (!$exists && $f < count($flc)) {
			$exists = file_exists($flc[$f]);
			if ($exists) $file = $flc[$f]; else $f++;
		}

		// include contents
		if ($exists) {
			$content = @file_get_contents($file);
			if ($content === false) $content = '';
			if (TACSDEBUG) $this->debug .= "included file '$file'" . ($content == '' ? ' (file empty or could not be read)' : '') . "\n";
		}
		else if (TACSDEBUG) $this->debug .= "included file '$file' does not exist\n";
		return $content;
	}

	// parse PHP tags (for execution at cache time and runtime)
	function PhpHandler(&$content) {

		// replace PHP delimiters
		$content = $this->RegExReplace($content,
			array( '/<\?/', '/\?>/', '/\[\[<!-- TACSPHP/', '/TACSPHP -->\]\]/' ),
			array( '<!-- TACSPHP', 'TACSPHP -->', '<?', '?>' )
		);

		// replace variables and other directives
		do {
			// find variables
			$tps = strpos($content, '[[');
			if ($tps !== false) {
				$tpe = strpos($content, ']]', $tps);
				if ($tpe === false) $tpe = strlen($content) - 1;

				// analyse directive
				$directive = '$'.trim(substr($content, $tps+2, $tpe-$tps-2));
				if (preg_replace('/\$[a-zA-Z_][\w]*/', '', $directive) == '') $directive = 'echo '.$directive;
				$directive = '<'.'?php '.$directive.'; ?'.'>';

				$content = substr($content, 0, $tps) . $directive . substr($content, $tpe+2);
			}
		} while ($tps !== false);

		return $content;
	}

	// saves temporary cache file and retrieves rendered content
	function PreCacheHandler(&$content) {
		$pcfile = $this->cachepath.'p'.$this->cachefile;
		if ($this->WriteFile($pcfile,
				'<' . '?php ob_start(); set_include_path(\'../../\'); ?' . '>' .
				$content .
				'<' . '?php ob_end_flush(); ?' . '>'
			)) {
			$content = @file_get_contents($this->cachehttp.'p'.$this->cachefile);
			if (TACSDEBUG && $content === false) $this->debug .= "TACS ERROR: could not read pre-cache file: $pcfile\n";
		}
		else if (TACSDEBUG) $this->debug .= "TACS ERROR: could not write pre-cache file: $pcfile\n";
		return $content;
	}

	// clean final rendered content
	function CleanContent(&$content) {

		// replace PHP delimiters
		$content = $this->RegExReplace($content,
			array( '/<!-- TACSPHP/', '/TACSPHP -->/' ),
			array( '<?', '?>' )
		);

		// compress content
		if (TACSCOMPRESS) {
			$content = $this->RegExReplace($content,
				array( '/<!--[^\-\->]*-->/', '/[\f\r\t]/', '/[ ]*\n+[ ]*/'),
				array( '', '', "\n")
			);
		}

		$content = trim($content);
		return $content;
	}

	// create a file with content
	function WriteFile($filename='', $text='') {
		$ret = false;
		if ($filename != '') {
			$fp = @fopen($filename, 'w');
			if (!$fp) $fp = @fopen($this->absloc . $filename, 'w');
			if ($fp) {
				fwrite($fp, $text);
				fclose($fp);
				$ret=true;
			}
		}
		return $ret;
	}

	// find HTTP location of cache
	function CacheHTTPlocation() {
		$hc = 'http';
		// if ($_SERVER['SERVER_PORT'] == 443) $hc .= 's';
		$hc .= '://' . $_SERVER['SERVER_NAME'] . $this->self;
		$hc = preg_replace('/\/[^\/]+$/', '/', $hc);
		$hc .= $this->cachepath;
		return $hc;
	}

	// multiple regex search and replace
	function RegExReplace($content, $pat, $rep) {
		ksort($pat);
		ksort($rep);
		return preg_replace($pat, $rep, $content);
	}

	// fetch microtime (used for script timing)
	function GetTime() {
		$time = microtime();
		$time = explode(' ', $time);
		$time = $time[1] + $time[0];
		return $time;
	}

}

// initialise TACS
$tacs = new TACS;
?>
