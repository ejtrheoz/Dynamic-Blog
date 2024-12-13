/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import articleFormsHandler from "./articleFormsHandler.js";

//an array, defining the routes
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"welcome",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: artWelcome
            
    },
    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"opinions",
        target:"router-view",
        // getTemplate: (targetElm) => document.getElementById(targetElm).innerHTML = document.getElementById("template-opinions").innerHTML
        getTemplate: createHtml4opinions
    },
    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: (targetElm) =>{
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
            document.getElementById("opnFrm").onsubmit=processOpnFrmData;
            document.getElementById("name-input").value = localStorage.getItem("user");
        }
    },
    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },
    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: deleteArticle
    },
    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: insertArticle
    },
    {
        hash:"menuTitle",
        target:"router-view",
        getTemplate: artTop
    }

];

function artWelcome(targetElm){

    
    document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML;

    const dialog = document.getElementById('dialog');
    const dialogBtn = document.getElementById('authButton');


    dialogBtn.addEventListener("click", function() {
        dialog.showModal();
        if (localStorage.getItem("user") != null)
            {
                document.getElementById('sign-out-button').style.display = 'block';
                document.getElementById("loginButton").classList.add("hidden");
            } else {
                document.getElementById('sign-out-button').style.display = 'none';
                document.getElementById("loginButton").classList.remove("hidden");
            }
    });

    if (localStorage.getItem("user") != null)
    {
        document.getElementById("sign-out-button").classList.remove("hidden");
    }
    else {
        
        document.getElementById("authButton").classList.remove("hidden");
    }

    function clearSkipPromptCookie() {
        const cookies = document.cookie.split(";");
        cookies.forEach(cookie => {
            const cookieName = cookie.split("=")[0].trim();
    
            if (cookieName === "data-skip_prompt_cookie") {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
                console.log("data-skip_prompt_cookie cleared.");
            }
        });
        }
    
    function signOut() {
        google.accounts.id.disableAutoSelect();
        clearSkipPromptCookie();

        document.getElementById("sign-out-button").classList.add("hidden");
        document.getElementById("authButton").classList.remove("hidden");

        localStorage.removeItem("user");
    }
    
    document.getElementById('sign-out-button').addEventListener('click', signOut);
}

function artTop(){
    window.scrollTo(0, 0);
    window.location.hash = lastArticleLocation;
}

function insertArticle(targetElm)
{
    document.getElementById(targetElm).innerHTML = document.getElementById("template-article-form-add").innerHTML;

    if (localStorage.getItem("user") != null)
    {
        document.getElementById("author").value = localStorage.getItem("user");
    }

    if(!window.artFrmHandler){
        window.artFrmHandler= new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
    }
    window.artFrmHandler.assignFormAndArticleForInsert("articleForm","hiddenElm");

}


function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myTreesComments;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
            opinion.willReturn = 
              opinion.willReturn?"I will return to this page.":"Sorry, one visit was enough.";
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
        );
}       



// function getTotalCount()
// {
//     const xhr = new XMLHttpRequest();
//     xhr.open("GET", "https://wt.kpi.fei.tuke.sk/api/article", false);
//     xhr.send();

//     if (xhr.status === 200) {
//         const data = JSON.parse(xhr.responseText);
//         return data["meta"]["totalCount"];
//     } else {
//         throw new Error("Network Error: " + xhr.status);
//     }
// }


function getTotalCount()
{
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://wt.kpi.fei.tuke.sk/api/article?tag=travelblog", false);
    xhr.send();

    if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        return data["meta"]["totalCount"];
    } else {
        throw new Error("Network Error: " + xhr.status);
    }
}


function fetchArticleContent(articleId) {
    return new Promise((resolve, reject) => {
        const url = `http://wt.kpi.fei.tuke.sk/api/article/${articleId}`;
        const ajax = new XMLHttpRequest();
        ajax.addEventListener("load", function () {
            if (this.status === 200) {
                const responseJSON = JSON.parse(this.responseText);
                resolve(responseJSON);
            } else {
                reject(new Error(`Failed to fetch article with id ${articleId}`));
            }
        });
        ajax.open("GET", url, true);
        ajax.send();
    });
}

function removeTags(input) {
    return input.replace(/<\/?[^>]+(>|$)/g, "");
}

let currentPage = 1;
const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

function fetchAndDisplayArticles(targetElm, offsetFromHash) {
    const offset = isNaN(Number(offsetFromHash)) ? 0 : Number(offsetFromHash);

    currentPage = offset == 0 ? 1 : currentPage;
    // let urlQuery = offset ? `?offset=${offset}&max=${articlesPerPage}` : `?max=${articlesPerPage}`;
    let urlQuery = offset ? `?offset=${offset}&max=${articlesPerPage}&tag=travelblog` : `?max=${articlesPerPage}&tag=travelblog`;


    
    const url = `${urlBase}/article${urlQuery}`;

    function reqListener() {
        if (this.status === 200) {
            let responseJSON = JSON.parse(this.responseText);
            let articles = responseJSON.articles;

            const articlePromises = articles.map(article => {
                return fetchArticleContent(article.id).then(articleDetail => {
                    return {
                        ...article,
                        content: removeTags(articleDetail.content).trim().split(' ').slice(0, 40).join(" ") + "...."
                    };
                }).catch(error => {
                    console.error(error.message);
                    return article;
                });
            });

            Promise.all(articlePromises).then(updatedArticles => {
                responseJSON.articles = updatedArticles;

                addArtDetailLink2ResponseJson(responseJSON);
                document.getElementById(targetElm).innerHTML = Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    responseJSON
                );


                document.getElementById(targetElm).innerHTML += `
                    <div id="articleButtons">
                        <button id="previousBtn">Previous</button>
                        <button id="nextBtn">Next</button>
                    </div>`;

                document.getElementById("previousBtn").addEventListener("click", function () {
                    if (currentPage > 1) {
                        currentPage--;
                        fetchAndDisplayArticles(targetElm, (currentPage - 1) * 20);
                    }
                });

                document.getElementById("nextBtn").addEventListener("click", function () {
                    currentPage++;
                    fetchAndDisplayArticles(targetElm, (currentPage - 1) * 20);
                });

                const previousBtn = document.getElementById("previousBtn");
                const nextBtn = document.getElementById("nextBtn");

                if (offset == 0) {
                    previousBtn.style.display = "none";
                } else {
                    previousBtn.style.display = "block-inline";
                }

                if (offset + articlesPerPage > getTotalCount()) {
                    nextBtn.style.display = "none";
                } else {
                    nextBtn.style.display = "block-inline";
                }
            });

        } else {
            const errMsgObj = { errMessage: this.responseText };
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
        }
    }

    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
}

// function fetchAndDisplayArticles(targetElm, offsetFromHash) {
//     const offset = isNaN(Number(offsetFromHash)) ? 0 : Number(offsetFromHash);

//     currentPage = offset == 0 ? 1 : currentPage;

//     // Updated query to include filtering by tag travelblog
//     let urlQuery = offset ? `?offset=${offset}&max=${articlesPerPage}&tag=travelblog` : `?max=${articlesPerPage}&tag=travelblog`;

//     const url = `${urlBase}/article${urlQuery}`;

//     function reqListener() {
//         if (this.status === 200) {
//             let responseJSON = JSON.parse(this.responseText);
//             let articles = responseJSON.articles;

//             // Filter articles that contain the tag 'travelblog'
//             articles = articles.filter(article => article.tags && article.tags.includes('travelblog'));

//             // Map through the filtered articles to fetch details
//             const articlePromises = articles.map(article => {
//                 return fetchArticleContent(article.id).then(articleDetail => {
//                     return {
//                         ...article,
//                         content: removeTags(articleDetail.content).trim().split(' ').slice(0, 40).join(" ") + "...."
//                     };
//                 }).catch(error => {
//                     console.error(error.message);
//                     return article;
//                 });
//             });

//             Promise.all(articlePromises).then(updatedArticles => {
//                 responseJSON.articles = updatedArticles;

//                 addArtDetailLink2ResponseJson(responseJSON);
//                 document.getElementById(targetElm).innerHTML = Mustache.render(
//                     document.getElementById("template-articles").innerHTML,
//                     responseJSON
//                 );

//                 // Add navigation buttons for pagination
//                 document.getElementById(targetElm).innerHTML += `
//                     <div id="articleButtons">
//                         <button id="previousBtn">Previous</button>
//                         <button id="nextBtn">Next</button>
//                     </div>`;

//                 document.getElementById("previousBtn").addEventListener("click", function () {
//                     if (currentPage > 1) {
//                         currentPage--;
//                         fetchAndDisplayArticles(targetElm, (currentPage - 1) * articlesPerPage);
//                     }
//                 });

//                 document.getElementById("nextBtn").addEventListener("click", function () {
//                     currentPage++;
//                     fetchAndDisplayArticles(targetElm, (currentPage - 1) * articlesPerPage);
//                 });

//                 const previousBtn = document.getElementById("previousBtn");
//                 const nextBtn = document.getElementById("nextBtn");

//                 // Handle the visibility of pagination buttons
//                 if (offset === 0) {
//                     previousBtn.style.display = "none";
//                 } else {
//                     previousBtn.style.display = "inline-block";
//                 }

//                 if (offset + articlesPerPage > getTotalCount()) {
//                     nextBtn.style.display = "none";
//                 } else {
//                     nextBtn.style.display = "inline-block";
//                 }
//             });

//         } else {
//             const errMsgObj = { errMessage: this.responseText };
//             document.getElementById(targetElm).innerHTML = Mustache.render(
//                 document.getElementById("template-articles-error").innerHTML,
//                 errMsgObj
//             );
//         }
//     }

//     var ajax = new XMLHttpRequest();
//     ajax.addEventListener("load", reqListener);
//     ajax.open("GET", url, true);
//     ajax.send();
// }



function addArtDetailLink2ResponseJson(responseJSON){
    responseJSON.articles = responseJSON.articles.map(
      article =>(
       {
         ...article,
         detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
       }
      )
    );
} 



function fetchAndDisplayArticleDetail(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash) {
    fetchAndProcessArticle(...arguments,false);
}                   


function fetchArticleComments(articleId, offset = 0, max = 10) {
    return new Promise((resolve, reject) => {
        const url = `http://wt.kpi.fei.tuke.sk/api/article/${articleId}/comment?max=${max}&offset=${offset}`;
        const ajax = new XMLHttpRequest();
        ajax.addEventListener("load", function () {
            if (this.status === 200) {
                const responseJSON = JSON.parse(this.responseText);
                resolve(responseJSON);
            } else {
                reject(new Error(`Failed to fetch comments for article with id ${articleId}`));
            }
        });
        ajax.open("GET", url, true);
        ajax.send();
    });
}

let lastArticleLocation = "";

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, forEdit) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    
    function reqListener() {
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText);
            
            if (forEdit) {
                // Handle article editing
                responseJSON.formTitle = "Article Edit";
                responseJSON.submitBtTitle = "Save article";
                responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
                
                    if (localStorage.getItem("user") != null)
                    {
                        document.getElementById("author").value = localStorage.getItem("user");
                    }

                if (!window.artFrmHandler) {
                    window.artFrmHandler = new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
                }
                window.artFrmHandler.assignFormAndArticle("articleForm", "hiddenElm", artIdFromHash, offsetFromHash, totalCountFromHash);
            } else {
                // Handle article display
                responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                lastArticleLocation = window.location.hash;
                document.getElementById("artEdit").href = responseJSON.editLink;
                document.getElementById("artDelete").href = responseJSON.deleteLink;


                let currentOffset = 0;
                const maxComments = 10;

                function loadComments(offset) {
                    fetchArticleComments(responseJSON.id, offset, maxComments)
                        .then(articleComments => {
                            articleComments.comments = articleComments.comments.map(comment => { comment.dateCreated = new Date(comment.dateCreated).toDateString(); return comment;
                            });
                            responseJSON.comments = articleComments.comments;
                            responseJSON.dateCreated = new Date(responseJSON.dateCreated).toDateString();

                            

                            // Render the article with the comments
                            document.getElementById(targetElm).innerHTML = Mustache.render(
                                document.getElementById("template-article").innerHTML,
                                responseJSON
                            );


                            if (responseJSON.comments.length == 0) {
                                document.getElementById("commentTitle").classList.add("hidden");
                            }
                            

                            // Render Add Comment form
                            const formComment = document.getElementById("formAddComment");
                            formComment.innerHTML = `

                                <button id="showForm">Add a Comment</button>
                                <form id="commentForm" class="hidden">
                                    <h3>Add a Comment</h3>
                                    <label for="commentAuthor">Author:</label>
                                    <br>
                                    <input type="text" id="commentAuthor" class="styled-input" name="commentAuthor" required><br>
                                    <label for="commentText">Comment:</label>
                                    <br>
                                    <textarea class="styled-input" id="commentText" name="commentText" required></textarea><br>
                                    <div>
                                        <button type="submit">Submit Comment</button>
                                        <button id="cancelButton">Cancel</button>
                                    </div>
                            </form>`;
                            
                            if (localStorage.getItem("user") != null)
                            {
                                document.getElementById("commentAuthor").value = localStorage.getItem("user");
                            }

                            document.getElementById("upButton").addEventListener("click", function () {
                                window.scrollTo(0, 0);
                                document.getElementById("upButton").classList.add("hidden");
                            });

                            window.onscroll = function () {
                                const upButton = document.getElementById("upButton");
                                if (upButton) {

                                    if (document.documentElement.scrollTop > 100) {
                                        document.getElementById("upButton").classList.remove("hidden");
                                    } else {
                                        document.getElementById("upButton").classList.add("hidden");
                                    }
                                }
                            };


                            // Select the button and form elements
                            const addCommentButton = document.getElementById("showForm");
                            const commentForm = document.getElementById("commentForm");
                            const cancelButton = document.getElementById("cancelButton");

                            // Add an event listener to the button to show the form when clicked
                            addCommentButton.addEventListener("click", function () {
                                addCommentButton.classList.add("hidden");
                                commentForm.classList.remove("hidden");
                            });

                            // Cancel button hides the form
                            cancelButton.addEventListener("click", function (event) {
                                event.preventDefault();
                                addCommentButton.classList.remove("hidden");
                                commentForm.classList.add("hidden");
                            });

                            // Add an event listener for form submission
                            commentForm.addEventListener("submit", function (event) {
                                event.preventDefault();

                                const author = document.getElementById("commentAuthor").value;
                                const text = document.getElementById("commentText").value;

                                if (author && text) {
                                    const commentData = { text: text, author: author };

                                    const postReqSettings = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json;charset=utf-8',
                                        },
                                        body: JSON.stringify(commentData)
                                    };

                                    fetch(`https://wt.kpi.fei.tuke.sk/api/article/${responseJSON.id}/comment`, postReqSettings)
                                        .then(response => {
                                            if (response.status == 201) {
                                                return response.json();
                                            } else {
                                                throw new Error('Failed to add comment: ' + response.status);
                                            }
                                        })
                                        .then(data => {
                                            alert("Comment was added to the article");
                                            loadComments(currentOffset);
                                            addCommentButton.classList.remove("hidden");
                                            commentForm.classList.add("hidden");
                                        });
                                }
                            });

                            // Pagination buttons for comments
                            const paginationDiv = document.createElement('div');
                            paginationDiv.className = "pagination";

                            // Create Previous button
                            if (currentOffset > 0) {
                                const prevButton = document.createElement('button');
                                prevButton.textContent = "Previous Comments";
                                prevButton.addEventListener("click", function () {
                                    currentOffset -= maxComments;
                                    loadComments(currentOffset);
                                });
                                paginationDiv.appendChild(prevButton);
                            }

                            // Create Next button
                            if (articleComments.meta.totalCount > currentOffset + maxComments) {
                                const nextButton = document.createElement('button');
                                nextButton.textContent = "Next Comments";
                                nextButton.addEventListener("click", function () {
                                    currentOffset += maxComments;
                                    loadComments(currentOffset);
                                });
                                paginationDiv.appendChild(nextButton);
                            }

                            // Insert pagination buttons above the links div
                            const links = document.getElementById("links");
                            links.insertAdjacentElement("beforebegin", paginationDiv);

                            // Render links section
                            
                        })
                        .catch(error => console.log(error));
                }

                loadComments(currentOffset);
            }
        } else {
            const errMsgObj = { errMessage: this.responseText };
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
        }
    }

    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
}






function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments,true);
} 

function deleteArticle(){
    let articleID =  location.hash.split('/')[1];
    const url = `https://wt.kpi.fei.tuke.sk/api/article/${articleID}`;

    fetch(url, {
        method: 'DELETE', // Specify the HTTP method as DELETE
        headers: {
            'Content-Type': 'application/json', // Optional, depends on API requirements
            // Add other headers if needed, like Authorization
        }
    })

    location.hash = "#welcome"
}