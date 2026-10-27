function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweet_array = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));

	writtenTweets = tweet_array.filter(tweet => tweet.source === 'written'
		|| tweet.source !== 'completed_event')
}

function addEventHandlerForSearch() {
	const searchBox = document.getElementById('textFilter');
	const searchTextSpan = document.getElementById('searchText');
	const searchCountSpan = document.getElementById('searchCount');
	const tweetTable = document.getElementById('tweetTable');

	// let the default text be this format
	searchTextSpan.innerText = "";
	searchCountSpan.innerText = 0;

	searchBox.addEventListener('input', function() {  // updates as we input more letters
		const searchText = searchBox.value.toLowerCase();

		if (searchText === "") {
			searchTextSpan.innerText = "";
			searchCountSpan.innerText = 0;
			tweetTable.innerHTML = "";
		}

		const matchedTweets = writtenTweets.filter(tweet => {
			return tweet.text.toLowerCase().includes(searchText);
		});

		searchTextSpan.innerText = searchBox.value;
		searchCountSpan.innerText = matchedTweets.length;

		const tableHTML = matchedTweets.map((tweet, index) => {
			return tweet.getHTMLTableRow(index + 1);
		}).join('');
		tweetTable.innerHTML = tableHTML;
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});