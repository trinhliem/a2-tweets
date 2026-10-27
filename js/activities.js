function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	const completedEvents = tweet_array.filter(tweet => tweet.source === 'completed_event');
	const activityStats = {};

	completedEvents.forEach(tweet => {
		const activity = tweet.activityType;
		const distance = tweet.distance;

		if (activityStats[activity]) {
			activityStats[activity].totalDistance += distance;
			activityStats[activity].count++;
		} else {
			activityStats[activity] = { totalDistance: distance, count: 1 };
		}
	});

	// array that sorts by count
	const activityArray = Object.entries(activityStats)
		.sort((a, b) => b[1].count - a[1].count);

	const sortedTop3ByDistance = sortByAvgDistance(activityArray.slice(0, 3));

	const longestActivityType = sortedTop3ByDistance.at(0)[0];
	const shortestActivityType = sortedTop3ByDistance.at(-1)[0];

	//determining whether weekday or weekend has higher distance
	let weekdayCount = 0;
	let weekdayTotalDist = 0;
	let weekendCount = 0;
	let weekendTotalDist = 0;

	completedEvents.filter(tweet => tweet.activityType === longestActivityType).forEach(tweet => {
		const dayOfWeek = tweet.time.getDay();
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			weekendCount++;
			weekendTotalDist += tweet.distance;
		} else {
			weekdayCount++;
			weekdayTotalDist += tweet.distance;
		}
	})

	const avgWeekday = weekdayCount > 0 ? weekdayTotalDist / weekdayCount : 0;
	const avgWeekend = weekendCount > 0 ? weekendTotalDist / weekendCount : 0;

	document.getElementById('numberActivities').innerText = completedEvents.length;
	document.getElementById('firstMost').innerText = activityArray[0][0];
	document.getElementById('secondMost').innerText = activityArray[1][0];
	document.getElementById('thirdMost').innerText = activityArray[2][0];


	document.getElementById('longestActivityType').innerText = longestActivityType;
	document.getElementById('shortestActivityType').innerText = shortestActivityType;

	if (avgWeekend > avgWeekday) {
		document.getElementById('weekdayOrWeekendLonger').innerText = "weekends";
	} else {
		document.getElementById('weekdayOrWeekendLonger').innerText = "weekdays";
	}


	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": tweet_array
	  },
		"mark": "bar",
		"encoding": {
		  "x": {
			  field: "activityType",
			  "type": "nominal",
			  "axis": {"title": "Activity Type"}
		  },
			"y": {
			  "aggregate": "count",
			  "type": "quantitative",
				"axis": {"title": "Number of Tweets"}
			}
		}
	};

	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const top3Names = [sortedTop3ByDistance[0][0], sortedTop3ByDistance[1][0], sortedTop3ByDistance[2][0]];

	const top3Tweets = tweet_array.filter(tweet => top3Names.includes(tweet.activityType));

	const vegaDistance = top3Tweets.map(tweet => {
		return {
			time: tweet.time,
			activityType: tweet.activityType,
			distance: tweet.distance
		};
	});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	const distance_by_day_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Average distance of the top 3 activities by day of the week",
		"data": {
			"values": vegaDistance
		},
		"params": [{ "name": "showMeans", "value": false }],
		"encoding": {
			"x": {
				"field": "time",
				"timeUnit": "day",
				"type": "ordinal",
				"axis": { "title": "Day of the Week" }
			},
			"color": {
				"field": "activityType",
				"type": "nominal",
				"legend": { "title": "Activity Type" }
			}
		},
		"layer": [
			{
				"transform": [
					{ "filter": "showMeans == false" }
				],
				"mark": "point",
				"encoding": {
					"y": {
						"field": "distance",
						"type": "quantitative",
						"axis": {
							"title": "Distance (miles)" }
					},
				}
			},
			{
				"transform": [  // erase all points and start over (helps scale the axis nicely)
					{ "filter": "showMeans == true" }
				],
				"mark": "point",
				"encoding": {
					"y": {
						"field": "distance",
						"aggregate": "mean",
						"type": "quantitative",
						"axis": {
							"title": "Average Distance (miles)" }
					},
				}
			}
		]
	};

	let chartView;

	vegaEmbed('#distanceVis', distance_by_day_spec, {actions: false}).then(result => {
		chartView = result.view;
	});

	const toggleButton = document.getElementById('aggregate');
	let isShowingMeans = false;

	toggleButton.addEventListener('click', function() {
		isShowingMeans = !isShowingMeans;

		if (isShowingMeans) {
			toggleButton.innerText = "Show all activities";
		} else {
			toggleButton.innerText = "Show means";
		}

		if (chartView) {
			chartView.signal('showMeans', isShowingMeans).run();
		}
	})
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});


// helper function
function sortByAvgDistance(activities) {
	return activities.map(item => {
		const activityName = item[0];
		const stats = item[1];
		const average = stats.totalDistance / stats.count;
		return [activityName, average];
	})
		.sort((a, b) => b[1] - a[1]);
}