export default class OpinionsHandler {
    constructor(opinionsFormElmId) {
        this.opinions = [];
        this.opinionsFrmElm = document.getElementById(opinionsFormElmId);
    }

    init() {
        if (localStorage.myTreesComments) {
            this.opinions = JSON.parse(localStorage.myTreesComments);
        }
        this.opinionsFrmElm.addEventListener("submit", event => this.processOpnFrmData(event));
    }

    processOpnFrmData(event) {
        event.preventDefault();

        const nopName = this.opinionsFrmElm.elements["name-input"].value.trim();
        const nopEmail = this.opinionsFrmElm.elements["email-input"].value.trim();
        const imageOpn = this.opinionsFrmElm.elements["image-input"].value.trim();
        const nopOpn = this.opinionsFrmElm.elements["comment"].value.trim();
        const nopKeywords = this.opinionsFrmElm.elements["keywords"].value.trim();
        const nopWillAllowSentiment = this.opinionsFrmElm.elements["allowSentiment"].checked;
        const nopSentiment = this.opinionsFrmElm.elements["reviewSentiment"]?.value || "";
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

        this.opinions.push(newOpinion);
        localStorage.myTreesComments = JSON.stringify(this.opinions);
        this.opinionsFrmElm.reset();
    }

    opinion2html(opinion) {
        return `
            <section>
                <h3>${opinion.name} <i>(${new Date(opinion.created).toDateString()})</i></h3>
                <p>${opinion.comment}</p>
                ${opinion.email ? `<p>Contact: ${opinion.email}</p>` : ""}
                ${opinion.keywords ? `<p>Keywords: ${opinion.keywords}</p>` : ""}
                ${opinion.allowSentiment ? `<p>Sentiment: ${opinion.sentiment}</p>` : ""}
                ${opinion.image ? `<img src="${opinion.image}" alt="${opinion.name}'s image">` : ""}
            </section>`;
    }

    opinionArray2html(sourceData) {
        return sourceData.reduce((htmlWithOpinions, opn) => htmlWithOpinions + this.opinion2html(opn), "");
    }
}
