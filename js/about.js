function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const dateFormat = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const timeArray = tweet_array.map(tweet => tweet.time.getTime());

	const firstDate = new Date(Math.min(...timeArray)).toLocaleDateString('en-US', dateFormat)
	const lastDate = new Date(Math.max(...timeArray)).toLocaleDateString('en-US', dateFormat)

	// filter the tweet array by source
	const completedEvents = tweet_array.filter(tweet => tweet.source === 'completed_event');
	const liveEvents = tweet_array.filter(tweet => tweet.source === 'live_event');
	const achievements = tweet_array.filter(tweet => tweet.source === 'achievement');
	const miscEvents = tweet_array.filter(tweet => tweet.source === 'miscellaneous');
	const totalTweets = tweet_array.length



	const numberWritten = completedEvents.filter(tweet => tweet.written).length;

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = totalTweets;
	document.getElementById('firstDate').innerText = firstDate;
	document.getElementById('lastDate').innerText = lastDate;

	// there are multiple instances of the class completedEvents, so we use querySelectorAll
	document.querySelectorAll('.completedEvents').forEach(element => element.innerText = completedEvents.length);
	document.querySelector('.liveEvents').innerText = liveEvents.length;
	document.querySelector('.achievements').innerText = achievements.length;
	document.querySelector('.miscellaneous').innerText = miscEvents.length;

	document.querySelector('.completedEventsPct').innerText = ((completedEvents.length / totalTweets) * 100).toFixed(2) + '%';
	document.querySelector('.liveEventsPct').innerText = ((liveEvents.length / totalTweets) * 100).toFixed(2)+ '%';
	document.querySelector('.achievementsPct').innerText = ((achievements.length / totalTweets) * 100).toFixed(2) + '%';
	document.querySelector('.miscellaneousPct').innerText = ((miscEvents.length / totalTweets) * 100).toFixed(2) + '%';

	document.querySelector('.written').innerText = numberWritten;
	document.querySelector('.writtenPct').innerText = ((numberWritten / completedEvents.length ) * 100).toFixed(2) + '%';

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});

