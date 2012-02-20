//MovieFinder:Search.js

//Rotten Tomatoes API Key
var apikey = "8xqmw9tqaxj2bzvgm7xvm7hb";
//API URL Base of Rotten Tomatoes
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";	
//URI by Apikey
var moviesSearchUrl = baseUrl + '/movies.json?apikey=' + apikey;
//Stores the JSON response for the main search
var movies;


$(document).ready(function() {		
	
		//Disables JQM default transitions
		$.mobile.defaultPageTransition = 'none';
		
		//Hides initial warnings.
		//JQM applies CSS properties in the initial state, so jQ inyected elements don't have the same look & feel
		$("#notfound").hide();
		$("#showAll").hide();
		$("#loader").hide();
		
		//Clear search input
		$("#search-basic").click(function() {
			$(this).val('');
		});
		
		//showMore function is called when user clicks the 'show all' button
		$("#showAll").click(function() {
			showMore();
		});
		
	});

//movieSearch(): Main search function
//Triggered by search form submit.
function movieSearch() {
	
	//Clears results container
	$("#results").empty();
	
	//Hides initial warnings and buttons
	$("#showAll").hide();
	$("#notfound").hide();
	
	//Ajax loader is showed
	$("#loader").show();
	
	//Stores user query
	var query = $("input:first").val();
	
	//API query is sent, response size is limited to 10 elements by 'page_limit' property.
	//searchCallback function manages the JSON response object.
	$.ajax({
	    url: moviesSearchUrl + '&q=' + encodeURI(query) + '&page_limit=10',
	    dataType: "jsonp",
	    success: searchCallback
	});
	
}

//movieDetailSearch(id): Search movie data by id
//Triggered by detail page load event.
function movieDetailSearch(id) {
	
	//Hides warnings and buttons
	$("#postercell").empty();
	$("#infocell").empty();
	$("#back-button").hide();
	$("#detailpanel").hide();
	
	//Ajax loader is showed
	$("#detail-loader").show();
	
	//API query is sent with the id of the desired movie.
	//detailCallback function manages the JSON response object.
	$.ajax({
	    url: baseUrl + '/movies/' + id + '.json?apikey=' + apikey,
	    dataType: "jsonp",
	    success: detailCallback
	});
	
}

//searchCallback(data): manage JSON response object of main search
function searchCallback(data) {
	
	//Checks if search have results
	if (data.total == 0){
		$("#loader").hide();
		$("#notfound").show();
	}else{	
		
		//Ajax loader is hided
		$("#loader").hide();
		
		//Iterates through results to build the results list
		movies = data.movies;
		$.each(movies, function(index, movie) {
			
			//Stores element id
			var detailid = movie.id;
			
			//Change the default 'not found' poster
 			var posterimg = movie.posters.thumbnail;
			if(movie.posters.thumbnail.indexOf("poster_default.gif") != -1){
				posterimg = "img/notfound.png";
			}
			
			//Void year property check
			var year = movie.year;
			if (year != ""){year = '(' + movie.year + ')';}
			
			//Append item to results list
			$("#results").append('<li><a onclick="javascript:setItem('+ detailid +');" href="#">'+
					'<img src="' + posterimg + '"/>' + 
					'<h3>' + movie.title + '</h3><p><strong>' + year + '</strong></p></a></li>');
			
			//By default, the app only shows the first 3 elements
			return (index != 2);
			
		});
		
		//Listwiew refresh to update new elements CSS styles
		$("#results").listview("refresh");
		
		//If the response object contains more than 3 elements, shows the 'show all' button
		if (data.total > 3){ 
			$("#showAll").show();
		}	
	}

}

//detailCallback: manage JSON response object of detail search
function detailCallback(data) {
			
	//Change the default 'not found' poster
	var posterimg = data.posters.profile;
	if(data.posters.profile.indexOf("poster_default.gif") != -1){
		posterimg = "img/notfound.png";
	}
	
	var ipadposterimg = data.posters.detailed;
	if(data.posters.detailed.indexOf("poster_default.gif") != -1){
		ipadposterimg = "img/notfound.png";
	}
	
	//Void year property check
	var year = data.year;
	if (year != ""){year = '(' + data.year + ')';}		
	
	//Ajax loader is hided
	$("#detail-loader").hide();
	
	//Shows detail container and back button
	$("#detailpanel").show();
	$("#back-button").show();
	
	//Appends detailed info to container
	$("#postercell").append('<img id="ipad" src="' + ipadposterimg + '"/>');
	$("#postercell").append('<img id= "mob" src="' + posterimg + '"/>');
	$("#infocell").append('<h2>'+ data.title +' ' + year + '</h2><p id="genre">'+ data.genres[0] + '</p>');
	$("#infocell").append('<p id="cast">Dir.: '+ data.abridged_directors[0].name +'</br>Cast: '+ data.abridged_cast[0].name + ', ' + data.abridged_cast[1].name+ '...<p></>');
	
	//Manage font colour by score
	if(data.ratings.audience_score < 50){
		
		$("#infocell").append('<h1 class="failed">'+ data.ratings.audience_score +'%</h1><p id="rating-subtitle">(audience score)</p>');
		
	}else{
		
		$("#infocell").append('<h1 class="passed">'+ data.ratings.audience_score +'%</h1><p id="rating-subtitle">(audience score)</p>');
		
	}
}

//showMore: show all results of a main search
//Triggered by 'show all' button
function showMore() {
	
	//Hides 'show all' button
	$("#showAll").hide();
	
	//Same as initial iteration with the other results
	$.each(movies, function(index, movie) {
		if(index < 3){return true;}
		
		var detailid = movie.id;
		
		var posterimg = movie.posters.thumbnail;
		if(movie.posters.thumbnail.indexOf("poster_default.gif") != -1){
			posterimg = "img/notfound.png";
		}
		
		var year = movie.year;
		if (year != ""){year = '(' + movie.year + ')';}
		
		$("#results").append('<li><a onclick="javascript:setItem('+ detailid +');" href="#">'+
				'<img src="' + posterimg + '"/>' + 
				'<h3>' + movie.title + '</h3><p><strong>' + year + '</strong></p></a></li>');
	});
	
	$("#results").listview("refresh");
	
}

//setItem(id): stores selected item id in results list.
//Triggered by onclick event on results items.
//This HTML5 property allow to pass parameters between JQM pages.
//At now, JQM doesn't support any native solution for that.
//sessionStorage compatibility:
//Android 2.1+, iPhone 3.1+, iPad 4.2+, Opera Mobile 11.00+, Palm WebOS 1.4+, BlackBerry 6.0+, Crome 4.0+, Firefox 3.5+, IE 8.0+, Opera 10.5+ y Safari 4.0+ 
function setItem(id) {
	
	//Stores selected item id
	sessionStorage.setItem('id',id);
	//Continue the redirection
	document.location.href='#detail'; 
	
}

//Hook for detail page loading state
$('div:jqmData(role="page"):last').live('pagebeforeshow',function(){
    
	//Gets sessionStorage id property and triggers the API query.
	movieDetailSearch(sessionStorage.getItem('id'));

});