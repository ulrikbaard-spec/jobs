<?php get_header();  ?>
<?php
global $post;
$apartment_banner_image = get_field('apartment_banner_image');
$full_image = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'full' );
$lan = get_field('lan');
$kommun = get_field('kommun');
$antal_rum = get_field('antal_rum');
$boyta = get_field('boyta');
$ledig_fran_den = get_field('ledig_fran_den');
$beskrivning = get_field('beskrivning');
$gatuadress = get_field('gatuadress');
$postnummer = get_field('postnummer');
$postadress = get_field('postadress');
$om_fastigheten = get_field('om_fastigheten');
$om_orten = get_field('om_orten');
$hyra_per_manad = get_field('hyra_per_manad');
$vaningsplan = get_field('vaningsplan');
$lagenhetskod = get_field('lagenhetskod');
$ledig_fran_den = get_field('ledig_fran_den', get_the_ID());    
$mystartdate = str_replace('/', '-', $ledig_fran_den); 
$date = date('Y-m-d');
$mydate = strtotime($date);
$date_start = strtotime($mystartdate); 
if(!empty($full_image))
{
    $full_image = $full_image[0];
}
?>

<style>
/* ==========================================================================
   1. INTRESSEANMÄLAN LIGHT (SNABBINTRESSE)
   ========================================================================== */
.ab-light-form {
    background: #edf3ee !important;
    border: 1.5px solid #d4e2d8 !important;
    border-radius: 18px !important;
    padding: 24px 28px !important;
    margin: 25px 0 30px 0 !important;
    box-shadow: 0 4px 18px rgba(23, 60, 54, 0.06) !important;
    box-sizing: border-box !important;
    clear: both !important;
    display: block !important;
    width: 100% !important;
}

.ab-light-form *,
.ab-light-form *::before,
.ab-light-form *::after {
    box-sizing: border-box !important;
}

.ab-light-header {
    margin-bottom: 16px !important;
    text-align: left !important;
}

.ab-light-badge {
    display: inline-block !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    color: #315847 !important;
    background: rgba(49, 88, 71, 0.12) !important;
    padding: 4px 10px !important;
    border-radius: 999px !important;
    margin-bottom: 8px !important;
}

.ab-light-title {
    font-size: clamp(20px, 2.5vw, 24px) !important;
    font-weight: 800 !important;
    color: #173c36 !important;
    margin: 0 0 6px 0 !important;
    line-height: 1.25 !important;
    letter-spacing: -0.015em !important;
}

.ab-light-desc {
    font-size: 14.5px !important;
    color: #5f7069 !important;
    margin: 0 !important;
    line-height: 1.5 !important;
}

.ab-light-fields {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 14px !important;
    align-items: flex-end !important;
    width: 100% !important;
}

.ab-light-form br,
.ab-light-fields br,
.ab-light-field br,
.ab-light-btn-wrap br {
    display: none !important;
}

.ab-light-form p,
.ab-light-fields p,
.ab-light-field p,
.ab-light-btn-wrap p {
    margin: 0 !important;
    padding: 0 !important;
    display: contents !important;
}

.ab-light-field {
    flex: 1 1 180px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
    min-width: 160px !important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    padding: 0 !important;
    padding-bottom: 0 !important;
    align-self: flex-end !important;
}

.ab-light-field .wpcf7-form-control-wrap {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
}

.ab-light-field label {
    font-size: 12px !important;
    font-weight: 700 !important;
    color: #173c36 !important;
    margin: 0 0 2px 0 !important;
    padding: 0 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.04em !important;
    line-height: 1.2 !important;
    display: block !important;
}

.ab-light-field label .req {
    color: #c53030 !important;
}

.ab-light-field input[type="text"],
.ab-light-field input[type="tel"],
.ab-light-field input[type="email"] {
    width: 100% !important;
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    background: #ffffff !important;
    border: 1.5px solid #c9d8ce !important;
    border-radius: 10px !important;
    padding: 10px 14px !important;
    font-size: 14px !important;
    color: #24312b !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
    line-height: normal !important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    box-sizing: border-box !important;
    vertical-align: bottom !important;
}

.ab-light-field input:focus {
    border-color: #315847 !important;
    box-shadow: 0 0 0 3px rgba(49, 88, 71, 0.16) !important;
    outline: none !important;
    background: #ffffff !important;
}

/* ==========================================================================
   KNAPPJUSTERING: EXAKT I LINJE OCH SAMMA NIVÅ SOM FÄLTEN
   ========================================================================== */
.ab-light-btn-wrap {
    flex: 0 0 auto !important;
    display: flex !important;
    align-items: flex-end !important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    padding: 0 !important;
    padding-bottom: 0 !important;
    align-self: flex-end !important;
}

.ab-light-btn-wrap .ajax-loader {
    display: none !important;
}

#top .ab-light-form .ab-light-submit,
#top .ab-light-form input[type="submit"],
#top .ab-light-submit,
#top input[type="submit"].ab-light-submit,
.ab-light-form .ab-light-submit,
.ab-light-form input[type="submit"].ab-light-submit {
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    padding: 0 28px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    background: #315847 !important;
    background-color: #315847 !important;
    background-image: none !important;
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
    border: 1.5px solid #315847 !important;
    border-radius: 10px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    white-space: nowrap !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    box-shadow: 0 3px 10px rgba(49, 88, 71, 0.3) !important;
    text-shadow: none !important;
    display: inline-block !important;
    line-height: 45px !important;
    vertical-align: bottom !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    position: static !important;
    transform: none !important;
}

#top .ab-light-form .ab-light-submit:hover,
#top .ab-light-form input[type="submit"]:hover,
#top .ab-light-submit:hover,
.ab-light-form .ab-light-submit:hover,
.ab-light-form input[type="submit"].ab-light-submit:hover {
    background: #1e3c2f !important;
    background-color: #1e3c2f !important;
    border-color: #1e3c2f !important;
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(49, 88, 71, 0.4) !important;
}

/* ==========================================================================
   2. HÖGERFORMULÄRET (SAMMA FEELING SOM SNABBINTRESSE)
   ========================================================================== */
.housing-detail-sidebar .custom-sidebar {
    background: #edf3ee !important;
    border: 1.5px solid #d4e2d8 !important;
    border-radius: 18px !important;
    padding: 24px 22px !important;
    box-shadow: 0 4px 18px rgba(23, 60, 54, 0.06) !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

/* Header för högerformuläret */
.custom-sidebar-head {
    background: transparent !important;
    padding: 0 0 14px 0 !important;
    margin-bottom: 18px !important;
    border-bottom: 1px solid #d4e2d8 !important;
    text-align: left !important;
}

.custom-sidebar-head h4 {
    font-size: 21px !important;
    font-weight: 800 !important;
    color: #173c36 !important;
    margin: 4px 0 4px 0 !important;
    line-height: 1.25 !important;
    letter-spacing: -0.015em !important;
    text-transform: none !important;
}

/* Formulärfält i högerspalten */
#top .housing-detail-sidebar br {
    display: none !important;
}

#top .housing-detail-sidebar p {
    margin: 0 0 12px 0 !important;
    padding: 0 !important;
    line-height: normal !important;
}

#top .housing-detail-sidebar label,
.housing-detail-sidebar .wpcf7 label {
    display: block !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    color: #173c36 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.04em !important;
    line-height: 1.2 !important;
    margin: 0 0 4px 0 !important;
    padding: 0 !important;
}

#top .housing-detail-sidebar input[type="text"],
#top .housing-detail-sidebar input[type="email"],
#top .housing-detail-sidebar input[type="tel"],
#top .housing-detail-sidebar input[type="number"],
#top .housing-detail-sidebar select,
#top .housing-detail-sidebar textarea {
    width: 100% !important;
    height: 46px !important;
    background: #ffffff !important;
    border: 1.5px solid #c9d8ce !important;
    border-radius: 10px !important;
    padding: 8px 14px !important;
    font-size: 14px !important;
    color: #24312b !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
    box-sizing: border-box !important;
    margin: 0 !important;
}

#top .housing-detail-sidebar textarea {
    height: 90px !important;
    min-height: 90px !important;
    line-height: 1.5 !important;
    resize: vertical !important;
    padding: 10px 14px !important;
}

#top .housing-detail-sidebar input:focus,
#top .housing-detail-sidebar select:focus,
#top .housing-detail-sidebar textarea:focus {
    border-color: #315847 !important;
    box-shadow: 0 0 0 3px rgba(49, 88, 71, 0.16) !important;
    outline: none !important;
    background: #ffffff !important;
}

#top .housing-detail-sidebar select {
    appearance: none !important;
    -webkit-appearance: none !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23315847' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 14px center !important;
    background-size: 12px !important;
    padding-right: 36px !important;
    cursor: pointer !important;
}

/* Skicka-knappen för högerformuläret */
#top .housing-detail-sidebar input[type="submit"],
#top .housing-detail-sidebar .wpcf7-submit,
.housing-detail-sidebar input[type="submit"] {
    width: 100% !important;
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    padding: 0 20px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 45px !important;
    box-sizing: border-box !important;
    display: block !important;
    text-align: center !important;
    vertical-align: middle !important;
    background: #315847 !important;
    background-color: #315847 !important;
    background-image: none !important;
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
    border: 1.5px solid #315847 !important;
    border-radius: 10px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    box-shadow: 0 3px 10px rgba(49, 88, 71, 0.3) !important;
    margin: 14px 0 0 0 !important;
    text-shadow: none !important;
}

#top .housing-detail-sidebar input[type="submit"]:hover,
#top .housing-detail-sidebar .wpcf7-submit:hover {
    background: #1e3c2f !important;
    background-color: #1e3c2f !important;
    border-color: #1e3c2f !important;
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(49, 88, 71, 0.4) !important;
}

#top .housing-detail-sidebar .wpcf7-response-output {
    border-radius: 10px !important;
    padding: 10px 14px !important;
    font-size: 13.5px !important;
    margin: 12px 0 0 0 !important;
}
</style>

<div class="housing-detail-page-main">
	<div class="housing-detail-banner">
	</div>
	<div class="container">
		<div class="housing-detail-information">

			<div class="housing-detail-data">
                <div class="featured-image">
                    <div class="housing-detail-heading-wrap">
                        <div class="container">
                            <div class="housing-detail-heading">
                                <h2><?php echo get_the_title(); ?></h2>
                            </div>
                        </div>
                    </div>
                    <?php
                    /* if($full_image != '')
                    {
                    ?>
                    <img src="<?php echo $full_image ?>" class="test"/>
                    <?php
                    } */
                    ?>
                    <?php 
                        $images = get_field('apartment_gallery');
                    ?>
                    <div class="owl-carousel owl-theme housing-detail-slider">
                    <?php foreach( $images as $image ){
                        $image_url = '';

                        if (is_array($image) && isset($image['url'])) {
                            $image_url = $image['url'];
                        } elseif (is_string($image)) {
                            // Assuming it's a direct URL or image ID
                            $image_url = wp_get_attachment_url($image); // or just $image if it's a URL
                        }

                        $gImg = aq_resize($image['url'], 1185, 789, true);
                        if ($gImg == '') {
                            $gImg = $image_url;
                        }
						?>
                        <div class="item">
                            <div class="housing-detail-slider-img">
                                <img src="<?php echo $gImg;?>" />
                            </div>
                        </div>
                    <?php } ?>
                    </div>

                </div>

                <!-- INTRESSEANMÄLAN LIGHT -->
                <?php echo do_shortcode('[contact-form-7 id="59d5a68" title="Intresseanmälan Light"]'); ?>
                
				<div class="housing-detail-text">
					<p><?php echo $beskrivning; ?></p>
					<p><?php echo $om_fastigheten; ?></p>
					<p><?php echo $om_orten; ?></p>
				</div>
                <div class="apartment-more-information">
                    <p><strong>Lägenhetskod: </strong><span><?php echo $lagenhetskod; ?></span></p>
                    <?php
                    if($vaningsplan != '')
                    {
                    ?>
                        <p><strong>Våningsplan: </strong><span><?php echo $vaningsplan; ?></span></p>
                    <?php
                    }
                    ?>
                    <p><strong>Boyta: </strong><span><?php echo $boyta; ?> m<sup>2</sup></span></p>
                    <p><strong>Ledig från den: </strong><span><?php if($date_start >= $mydate || $date_start == '' )
{  echo $ledig_fran_den; } else { echo "Efter överenskommelse";} ?></span></p>
                    <p><strong>Antal rum: </strong><span><?php echo $antal_rum; ?> rum</span></p>
                    <p><strong>Hyra per månad: </strong><span><?php echo $hyra_per_manad; ?> kr/mån</span></p>
                    <p><strong>Län: </strong><span><?php echo $lan; ?></span></p>
                    <p><strong>Kommun: </strong><span><?php echo $kommun; ?></span></p>
                    <p><strong>Gatuadress: </strong><span><?php echo $gatuadress; ?></span></p>
                    <p><strong>Postnummer: </strong><span><?php echo $postnummer; ?></span></p>
                </div>
                <div class="housing-detail-gallery">
					<?php $images = get_field('apartment_gallery');
					if( $images ){ ?>
					<div class="housing-detail-gallery-inner">
						<?php foreach( $images as $image ){ 
                            $image_url = '';

                            if (is_array($image) && isset($image['url'])) {
                                $image_url = $image['url'];
                            } elseif (is_string($image)) {
                                // Assuming it's a direct URL or image ID
                                $image_url = wp_get_attachment_url($image); // or just $image if it's a URL
                            }

                            $gImg = aq_resize($image_url, 400, 350, true);
                            if ($gImg == '') {
                                $gImg = $image_url;
                            }
						?>
						<a rel="gallery" class="fancybox item-box" href="<?php echo $image['url'];?>">
							<span>
								<img src="<?php echo $gImg;?>">
							</span>
						</a>
						<?php } ?>
					</div>
					<?php } ?>
				</div>
               <?php $google_map_address = get_field('google_map_address');
                /*$map_lat = $google_map_address['lat'];
                $map_lang = $google_map_address['lng'];*/ 
                ?>
                <?php if(!empty($gatuadress) || !empty($postnummer)){?>
                <div class="google_map_section">
                    <h4>Karta</h4>
                 <iframe width='100%' height='500' id='mapcanvas' src='https://maps.google.com/maps?q=<?php echo $gatuadress; ?>,<?php echo $postadress;?>,<?php echo $postnummer; ?>&zoom=12&Roadmap&z=10&ie=UTF8&iwloc=&output=embed' frameborder='0' scrolling='no' marginheight='0' marginwidth='0'><div class='zxos8_gm'><a href='https://www.codeguesser.co.uk/hobbycraft.co.uk'>codeguesser</a></div><div style='overflow:hidden;'><div id='gmap_canvas' style='height:100%;width:700px;'></div><div><small>Powered by <a href='https://www.embedgooglemap.co.uk'>Embed Google Map</a></small></div></iframe>

                </div>

                <?php } ?>
				<?php /* <div class="housing-detail-form">
					<h4>Intresseanmälan för denna lägenhet</h4>
					<?php echo do_shortcode('[contact-form-7 id="251" title="Apartment Form"]');?>
				</div>
                */ ?>
			</div>
			<div class="housing-detail-sidebar">
				<div class="custom-sidebar">
					<div class="custom-sidebar-head">
						<span class="ab-light-badge">Bostadsansökan</span>
						<h4>Fullständig ansökan</h4> 
						<p class="ab-light-desc">Ansök om hyresavtal för denna lägenhet.</p>
					</div>
                     
                    <?php echo do_shortcode('[contact-form-7 id="3179" title="Lägenhetsansökan"]');?>
				</div>
			</div>
		</div>
	</div>
</div>

<script type="text/javascript">
 jQuery( document ).ready(function() {
    jQuery('input[name="object_post_id"]').val(<?php echo $lagenhetskod; ?>);
 });
 jQuery( window ).load(function() {
    jQuery('input[name="object_post_id"]').val(<?php echo $lagenhetskod; ?>);
 });

// Omdirigering till tacksida när snabbformuläret skickas
document.addEventListener('wpcf7mailsent', function(event) {
    if (event.detail && (event.detail.contactFormId == '59d5a68' || event.target.querySelector('.ab-light-form'))) {
        window.location.href = '/tack-snabbansokan/';
    }
}, false);
</script>

<style type="text/css">
    .google_map_section #map{
        height: 450px;
        margin-bottom: 25px; 
    }
</style>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDLtE0oa3Fk39718WMtBKxYxdhu3y1p4jU" async defer></script>

<?php get_footer(); ?>
