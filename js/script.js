'use strict';

// Working in https://www.systembolaget.se/
function systembolakt(beername, overall, style, url) {
  $('div.carousel-container').first().prepend(
    '<div class="row"><div class="col-xs-5 col-sm-4 col-md-12"><a href="'+ url +'" target="_blank"> <div style="background-color: #00346A; color:white; border-radius: 40px;' +
          'padding:15px;margin-bottom: 10px ">' +
      '<img src="'+chrome.extension.getURL('images/rblogo.png') +'" alt="" style="width:65%; height:10%;">' +
      '<h1 style="font-size:19px">' + beername + '</h1>' +
      '<h2 style="font-size:18px"> Overall: ' + overall + ' Style: ' + style +'</h2>' +
    '</div></a></div></div>');

}
// Working in https://www.alko.fi/
function postBeerInfo(beername, overall, style, url) {
  $('div.hard-facts').find('ul.flexible-block-grid.small-up-1').first().prepend(
    '<li class="column">' +
    '<div class="small-b1 h8 fact-label">RATEBEER ARVIO</div>' +
      '<div class="small-h6 h6 fact-data">' + overall + '</div>' +
      '</li>');

}



//Get specific data about a beer (webscraped)
function getBeerInfo(beername, beerlink) {
  var url = 'https://www.ratebeer.com' + beerlink;
  $.get(url, function(data) {
    var style = '';
    var overall = $(data).find('#container').find('.ratingValue').text();
    console.log(overall);
    $(data).find('#container').find('[itemprop=ratingValue]').find('span').each(function () {
      if($(this).text() === 'overall')
      {
        console.log($(this).next().next().text());
        overall = $(this).next().next().text();
      }
      else if($(this).text() === 'style')
      {
        console.log($(this).prev().prev().text());
        style = $(this).prev().prev().text();
      }
    });
    if(overall === '')
    {
      overall = 'No rate';

    }

    console.log(beername, overall, style, url);
    postBeerInfo(beername, overall, style, url)
  });
}

//Search for the beer on ratebeer(result is webscraped)
function searchBeer(beername) {
  var input = {BeerName : beername};
  var firstHit = '';
  var link = '';
  var foundPerfectMatch = false;
  $.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded;',
    url: 'https://www.ratebeer.com/findbeer.asp',
    data: input,
    dataType: 'html',
    success: function(data) {
      var error = false;
      $(data).find('#container').find('b').each(function() {
        if($(this).text().includes('0 beers'))
        {
          console.log("errors")
          error = true;
        }
      });
      if(error)
        return;
      $(data).find('table').find('a').each(function() {
        var dummy = ($(this).attr('title'));

        if($(this).attr('title').includes('View more info on'))
        {

          var resultBeer =($(this).text());
          console.log("found: " + resultBeer);
          if(firstHit === '')
          {
            firstHit = resultBeer;
            link = ($(this).attr('href'));
            console.log('fistlink' + link);
          }
          if(beername === resultBeer)
          {
            foundPerfectMatch = true;
            link = ($(this).attr('href'));
            console.log('Perfect Match!\n Getting beer info for ' + resultBeer);
            getBeerInfo(resultBeer, link);
          }


        }
      });

      if(!foundPerfectMatch)
      {
        console.log('Getting beer info for first hit, ' + firstHit );
        getBeerInfo(firstHit, link);
      }

    }
  });
}

function removespecials(beer)
{
  var strippedBeer = beer.replace(/å/g, "a").replace(/ä/g, 'a').replace(/ö/g, 'o')
                         .replace(/Å/g, 'A').replace(/Ä/g, 'A').replace(/Ö/g, 'O')
                         .replace(/Ø/g, 'O').replace(/æ/g, 'a').replace(/&/g, '').replace(/-/g, '');
  return strippedBeer;
}


var systemBeer  = $('h1.product-name').text();
var systemSubTitle = $('span.underlined-heading').text();

var beer = $.trim(systemBeer) + " " + $.trim(systemSubTitle);
console.log("found: " + systemBeer);
console.log("found: " + systemSubTitle);
console.log("found: " + beer);


//Start search
searchBeer(removespecials(systemBeer));
