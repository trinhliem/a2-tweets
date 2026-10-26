class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const textLower = this.text.toLowerCase(); // convert to lowercase
        if (textLower.startsWith("just completed") || textLower.includes("completed")) {
            return "completed_event";
        }

        if (textLower.startsWith("achieved a new personal record") ) {
            return "achievement";
        }

        if (textLower.startsWith("watch my run")) {
            return "live_event";
        }

        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return this.writtenText.length > 0;

    }

    get writtenText():string {
        //TODO: parse the written text from the tweet
        const textLower = this.text.toLowerCase();

        const hashTag = /#runkeeper/g;
        const linkText = /https:\/\/t\.co\/\S+/g;

        let textStripped = textLower.replace(hashTag, "").replace(linkText, "");

        const completedPostedRegex = /just (?:completed|posted) a [\s\S]+? (?:with @runkeeper\. check it out!|-)/i;
        const liveRegex = /watch my .+? right now with @runkeepeer live /i;
        const achievementRegex = /achieved a .+? with #runkeeer:/i;
        textStripped = textStripped.replace(completedPostedRegex, "")
            .replace(liveRegex, "")
            .replace(achievementRegex,"")
            .replace(/^-|-$/g, "").trim();
        console.log(textStripped);
        return textStripped;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const activityRegex =  /Just (?:completed|posted) a (.+?) (?:with @Runkeeper\. Check it out!| - )/i;
        const matchArray = this.text.match(activityRegex);
        if (matchArray) {
            return matchArray[1];
        }
        return "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const distanceRegex = /(\d+\.\d+)\s+(mi|km)/i;

        const matchArray = this.text.match(distanceRegex);

        if (matchArray) {
            let distanceNumber = parseFloat(matchArray[1]);
            const distanceUnit = matchArray[2];
            if (distanceUnit === "km") distanceNumber = distanceNumber / 1.609 // Converts to miles
            return distanceNumber;
        }
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const activity = this.activityType
        const clickableText = this.text.replace(/https:\/\/t\.co\/\S+/g, "<a href='$&'>$&</a>");

        return `<tr>
            <td>${rowNumber}</td>
            <td>${activity}</td>
            <td>${clickableText}</td>`;
    }
}