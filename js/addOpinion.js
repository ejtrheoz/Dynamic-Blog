/*
 * Created by Stefan Korecko, 2020-21
 * Opinions form processing functionality
 */

/*
This function works with the form:

<form id="opnFrm">
    <label for="nameElm">Your name:</label>
    <input type="text" name="login" id="nameElm" size="20" maxlength="50" placeholder="Enter your name here" required />
    <br><br>
    <label for="opnElm">Your opinion:</label>
    <textarea name="comment" id="opnElm" cols="50" rows="3" placeholder="Express your opinion here" required></textarea>
    <br><br>
    <input type="checkbox" id="willReturnElm" />
    <label for="willReturnElm">I will definitely return to this page.</label>
    <br><br>
    <button type="submit">Send</button>
</form>

 */
export default function processOpnFrmData(event) {
        event.preventDefault();

        const nopName = document.getElementById("name-input").value.trim();
        const nopEmail = document.getElementById("email-input").value.trim();
        const imageOpn = document.getElementById("image-input").value.trim();
        const nopOpn = document.getElementById("comment").value.trim();
        const nopKeywords = document.getElementById("keywords").value.trim();
        const nopWillAllowSentiment = document.getElementById("allowSentiment").checked;
        const nopGoodSentimentValue = document.getElementById("goodReview").checked;
        const nopBadSentimentValue = document.getElementById("badReview").checked;
        let nopSentiment = "";

        if (nopWillAllowSentiment && nopGoodSentimentValue)
        {
            nopSentiment = "The comment was positive";
        }
        if (nopWillAllowSentiment && nopBadSentimentValue)
        {
            nopSentiment = "The comment was negative";
        }
        

        const date = new Date();

        if (nopName == "" || nopOpn == "") {
            window.alert("Please, enter both your name and opinion");
            return;
        }

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        
        const newOpinion = {
            name: nopName,
            email: nopEmail,
            comment: nopOpn,
            allowSentiment: nopWillAllowSentiment,
            sentiment: nopSentiment,
            image: imageOpn,
            keywords: nopKeywords,
            created: date.toISOString().slice(0, 10)
            
            // const formattedDate = date.toLocaleDateString('en-US', options); // "MM/DD/YYYY"
            // created: format(new Date(), 'yyyy-MM-dd')
        };

        let opinions = [];
        

        if(localStorage.myTreesComments){
            opinions=JSON.parse(localStorage.myTreesComments);
        }

        opinions.push(newOpinion);
        localStorage.myTreesComments = JSON.stringify(opinions);


        //5. Go to the opinions
        window.location.hash="#opinions";
    }