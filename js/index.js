/*
 * Created by Stefan Korecko, 2021
 */

import Router from "./paramHashRouter.js";
import Routes from "./routes.js";
import OpinionsHandlerMustache from "./opinionsHandlerMustache.js";
import DropdownMenuControl from "./dropdownMenuControl.js";

let global = "";
function handleCredentialResponse(response) {
    token = response.credential;
    token = token.split(".");
    payload = JSON.parse(atob(token[1]));
    global = payload.given_name + " " + payload.family_name;
    console.log(global);
}


window.drMenuCntrl = new DropdownMenuControl("menuIts", "menuTitle", "mnShow");

window.router = new Router(Routes,"welcome");
