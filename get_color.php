<?php

// loads image, and gathers color and position data
$imgfile='palette.png';
$img=imagecreatefrompng($imgfile);

// determines the color where the user clicks
$xOffset=$_GET['xOffset'];
$yOffset=$_GET['yOffset'];
$rgb = ImageColorAt($img, $xOffset, $yOffset);

// returns the red, green, and blue components of the color
$r = ($rgb >> 16) & 0xFF;
$g = ($rgb >> 8) & 0xFF;
$b = $rgb & 0xFF;

printf('#%02s%02s%02s', dechex($r), dechex($g), dechex($b));
?>
