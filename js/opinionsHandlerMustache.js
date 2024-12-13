import OpinionsHandler from "./opinionsHandler.js";
import Mustache from "./mustache.js";


export default class OpinionsHandlerMustache extends OpinionsHandler{

    constructor(opinionsFormElmId, templateElmId) {

        //call the constructor from the superclass:
        super(opinionsFormElmId);

        //get the template:
        this.mustacheTemplate=document.getElementById(templateElmId).innerHTML;
    }

    opinion2html(opinion){
        //in the case of Mustache, we must prepare data beforehand:
        opinion.createdDate=(new Date(opinion.created)).toDateString();

        //use the Mustache:
        const htmlWOp = Mustache.render(this.mustacheTemplate,opinion);

        //delete the createdDate item as we created it only for the template rendering:
        delete(opinion.createdDate);

        //return the rendered HTML:
        return htmlWOp;
    }
}
	