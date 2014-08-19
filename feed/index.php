<html lang="en" class="no-js">
    <head>

        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" href="../favicon.ico">
        <link href='http://fonts.googleapis.com/css?family=Raleway:200,400,600' rel='stylesheet' type='text/css'>
        <title>Venture RSS Feed</title>
        <link rel="stylesheet" type="text/css" href="css/stylesheet.css" />
    </head>
    <body>
        <div class = "page-header">
            <h1> Venture Captial | Health Care </h1>
        </div>
        <?php date_default_timezone_set('America/New_York'); ?>
        <?php
        //Feed URLs
        $feeds = array(
            "http://www.nytimes.com/services/xml/rss/nyt/HealthCarePolicy.xml",
            "http://www.npr.org/rss/rss.php?id=1027",
            "http://blogs.wsj.com/venturecapital/feed/",
            "http://feeds.feedburner.com/TechCrunch/startups",
            "http://www.modernhealthcare.com/section/rss01&mime=xml",
            "http://www.modernhealthcare.com/section/feed?feed=blog&mime=xml",
            "http://www.modernhealthcare.com/section/rss08&mime=xml",
            "http://www.forbes.com/feeds/popstories.xml",
            "http://www.forbes.com/healthcare/index.xml",
            "http://www.forbes.com/entrepreneurs/index.xml",
        );
        
        //Read each feed's items
        $entries = array();
        foreach($feeds as $feed) {
            $xml = simplexml_load_file($feed);
            $entries = array_merge($entries, $xml->xpath("//item"));
        }
        
        //Sort feed entries by pubDate
        usort($entries, function ($feed1, $feed2) {
            return strtotime($feed2->pubDate) - strtotime($feed1->pubDate);
        });
        
        ?>
        
        <?php
        //Print all the entries
        foreach($entries as $entry){
            ?>
            <div class = "entry">
                <div class = "source">
                    <?= parse_url($entry->link)['host'] ?>
                </div>
                <a href="<?= $entry->link ?>">
                    <div class = "title">
                        <h3><?= $entry->title ?></h3>
                    </div>
                </a>
                <div class = "description">
                    <?= $entry->description ?>
                </div>
                <div class = "date">
                    <?= strftime('%m/%d/%Y', strtotime($entry->pubDate)) ?>
                </div>
            </div>
            <?php
        }
        ?>
        <p><a href = "http://www.brianayers.me"> Brian Ayers </a></p>
    </body>
</html>
