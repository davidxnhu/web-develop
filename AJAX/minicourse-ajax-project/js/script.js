
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview

	var streetStr=$('#street').val();
	var cityStr=$('#city').val();
	var address=streetStr+", "+cityStr;
	
	$greeting.text('So, you want to live at '+address+'?');
	var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location='+address+'';
	
		
	var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
	url += '?q='+cityStr+'&sort=newest&api-key=a6e54af050ff4ccf8814026260e7a85b'
	
	var wikiurl="https://en.wikipedia.org/w/api.php?action=opensearch&search="+cityStr+"&format=json&callback=wikiCallback"
	
	$.getJSON(url,function(data){
		$nytHeaderElem.text('New York Times articles about '+cityStr);
		var articles=data.response.docs;
		
		for (var i=0; i<articles.length;i++){
			var article=articles[i];
			$nytElem.append('<li class="article">'+
				'<a href="'+article.web_url+'">'+
				article.headline.main+
				'</a>'+
				'<p>'+article.snippet+"</p>"+
				'</li>');
		}
	}).fail(function(e){
		$nytHeaderElem.text('New Your Times could not be loaded');
	})
	
	var wikiRequestTimeout=setTimeout(function(){
		$wikiElem.text("failed to get wikipedia resourses");
	}, 8000);
	
	$.ajax({
		url:wikiurl,
		dataType:"jsonp",
		success: function(data){
			var wikis=data[1];
			var links=data[3];
			for (var i=0;i<wikis.length;i++){
				$wikiElem.append('<li class="wiki">'+
				'<a href="'+links[i]+'">'+
				wikis[i]+'</a></li>');
			}
			
			clearTimeout(wikiRequestTimeout);
		}
	})
	
    $body.append('<img class="bgimg" src="'+streetViewUrl+'">');
	
	return false;
};

$('#form-container').submit(loadData);
