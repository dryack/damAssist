// ==UserScript==
// @name         DAM - Assist
// @namespace    dekleinekobini.dam.assist
// @version      4.1
// @description  Send an assist request to discord.
// @author       DeKleineKobini [2114440] / lamashtu [2001015] ( >= 1.1 )
// @match        https://www.torn.com/loader.php?sid=attack*
// @downloadURL https://github.com/dryack/damAssist/raw/main/userscript-4.js
// @updateURL   https://github.com/dryack/damAssist/raw/main/userscript-4.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Check if REQ_URL_STORAGE object exists in local storage
const storedUrls = getObject('REQ_URL_STORAGE');
const REQ_URL_STORAGE = storedUrls !== null ? storedUrls : {
    '(Alliance) Joint Operations': "http://wait-wtf.com:8399/assist"
};

const DEFAULT_REQUEST_URL = '(Alliance) Joint Operations';

let REQUEST_URL;
let storedUrl = getObject('ROD_assist_savedUrl');
if (storedUrl === null) {
    REQUEST_URL = REQ_URL_STORAGE[DEFAULT_REQUEST_URL];
    setObject('ROD_assist_savedUrl', REQUEST_URL)
} else {
    REQUEST_URL = storedUrl
}

let assistSubmitButtonTimeout = null;

function setObject(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getObject(key) {
    let value = localStorage.getItem(key);
    try {
        return JSON.parse(value);
    } catch (error) {
        return null;
    }
    //return value && JSON.parse(value);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


// Define a function to handle form submission
function handleSubmit(selectElement) {
    return function(event) {
        event.preventDefault();

        // Get the input values from the form
        const nameInput = document.getElementById('nameInput');
        const urlInput = document.getElementById('urlInput');
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();

        // Check if name is not empty and does not already exist in REQ_URL_STORAGE
        if (name !== "" && name !== null && name in REQ_URL_STORAGE) {
            // Update the url for an existing entry in REQ_URL_STORAGE
            REQ_URL_STORAGE[name] = url;
            setObject('REQ_URL_STORAGE', REQ_URL_STORAGE);

            // Update the dropdown menu with the new url for the existing entry
            const options = selectElement.find('option');
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === name) {
                    $(options[i]).text(name).attr("value", url);
                    break;
                }
            }

            // Reset the form inputs
            nameInput.value = '';
            urlInput.value = '';
        } else if (name !== "" && name !== null && !REQ_URL_STORAGE.hasOwnProperty(name)) {
            // Add a new entry to REQ_URL_STORAGE
            REQ_URL_STORAGE[name] = url;
            setObject('REQ_URL_STORAGE', REQ_URL_STORAGE);

            // Add the new entry to the dropdown menu
            const option = $("<option></option>").attr("value", url).text(name);
            selectElement.append(option);

            // Reset the form inputs
            nameInput.value = '';
            urlInput.value = '';
        }
    }
}

GM_addStyle(`
    h4[class*="title___"] {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .topSection___U7sVi {
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
        -webkit-box-align: center;
        -ms-flex-align: center;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        -webkit-box-align: end;
        -ms-flex-align: end;
        align-items: center;
        align-items: flex-end;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: row;
        flex-direction: row;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        height: 60px !important;
        justify-content: space-between;
        margin-bottom: 15px;
    }
    .titleContainer___QrlWP {
      -webkit-box-flex: 2;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -webkit-box-align: center;
      -ms-flex-align: center;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      align-items: center;
      color: #333;
      color: var(--appheader-title-color);
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -ms-flex: 2;
      flex: 2;
      -ms-flex-direction: row;
      flex-direction: row;
      font-weight: 700;
      height: 132%;
      justify-content: space-between;
      overflow: hidden;
    }
    #hr.delimiter___zFh2E {
      border-bottom: 1px solid #ebebeb;
      border-bottom: var(--appheader-delimiter-bottom-border);
      border-left: none;
      border-right: none;
      border-top: 1px solid #999;
      border-top: var(--appheader-delimiter-top-border);
    }
    #dam-container {
      display: flex;
      justify-content: space-around;
    }

    #dam-select-container {
        margin-top: 3%;
        padding-right: 4%;
    }
    #dam-request-container {
        margin-top: 2%;
        padding-right: 4%;
        padding-left: 0%;
    }
    #dam-submit-container {
      padding-left: 0%;
      padding-right: 12%;
      margin-top: 5%;
    }
    .dam-smokes {
      font-size: small;
      margin-top: -3%;
      padding-bottom: 1%;
    }
    .dam-tears {
      font-size: small;
      margin-top: -5%;
    }
    .topWrapper {
      margin-bottom: -8px;
    }
    .dam-text-tears {
        font-size: small;
        margin-bottom: 5px;
        margin-left: 5%;
    }

    .dam-smokes-request {
        margin-left: 4px;
        background: #ddd;
        border-radius: 5px;
        padding: 1px 4px;
        font-size: small;
        cursor: pointer;
    }
    .dam-tears-request {
        margin-left: 4px;
        background: #ddd;
        border-radius: 5px;
        padding: 1px 4px;
        font-size: small;
        cursor: pointer;
    }

    .dam-smokes-request:hover {
        color: #555;
        box-shadow: 0 0 8px #f0f;
    }
    .dam-tears-request:hover {
        color: #555;
        box-shadow: 0 0 8px #00f;
    }

    #dam-message {
        position: absolute;
        max-width: 260px;
        display: none;
        font-size: 10px;
        margin-top: -2px;
    }

    #dam-message.error {
        display: block;
        color: red;
    }

    #dam-message.success {
        display: block;
        color: green;
    }

    #dam-message.warning {
        display: block;
        color: orange;
    }

    #dam-select {
      border: 5px solid var(--select-border);
      border-radius: 0.25em;
      padding: 0px 0px;
      font-size: 0.75rem;
      cursor: pointer;
      line-height: 1.1;
      background-color: #eee;
      background-image: linear-gradient(to top, #f9f9f9, #eee 33%);

    }
    #dam-form-container {
      margin-top: 5px;
      display: -webkit-inline-box;
    }
    #dam-urlForm {
      margin-left: 12px;
      display: inline-flex;
      vertical-align: -webkit-baseline-middle;
      align-content: space-between;
      align-items: flex-start;
    }
    label {
      margin-bottom: -8px;
      display: block;
      font-size: small;
    }
    button#dam-toggle-button {
      background-color: #6c757d;
      border: none;
      color: white;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin: 4px 2px;
      cursor: pointer;
    }
    button#dam-assist-submit {
      margin-top: auto;
      border: none;
      color: #870d0d;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 15px;
      cursor: pointer;
      font-family: fantasy;
      font-weight: 100;
    }
    button#dam-assist-submit.disabled {
      background-color: #cccccc;
      color: #cccccc;
      cursor: not-allowed;
    }
    #dam-smk-btn-1 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-smk-btn-2 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-smk-btn-3 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-smk-btn-4 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-smk-btn-5 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-tear-btn-1 {
          line-height: normal;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-tear-btn-1 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-tear-btn-2 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-tear-btn-3 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-tear-btn-4 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }
    #dam-tear-btn-5 {
          line-height: unset;
          width: auto;
          text-align: center;
          height: auto;
        }

    .selected {
      background: transparent linear-gradient(180deg,#CCCCCC 0%,#454669 60%,#666666 100%) 0 0 no-repeat;
    }
    .smk-selected {
      background: transparent linear-gradient(180deg,#5ea121 0%,#104606 60%,#0ea712 100%) 0 0 no-repeat;
      color: darkkhaki;
    }
    .tear-selected {
      background: transparent linear-gradient(180deg,#1952a9 0%,#333462 60%,#98a3f1 100%) 0 0 no-repeat;
      color: darkkhaki;
    }
`);

(async function () {
    "use strict";
    const res = await fetch(`https://www.torn.com/loader.php?sid=attackData&mode=json&step=poll&user2ID=${window.location.href.match(/user2ID=(\d+)/)[1]}&rfcv=${document.cookie.split("; ").map(c=>c.split("=")).find(([k])=>k==="rfc_v")?.[1]}`, {"headers":{"X-Requested-With": "XMLHttpRequest"}});
    const obj = await res.json();
    const defenderFaction = obj.DB.defenderUser.factionID;
    const defenderName = obj.DB.defenderUser.playername;
    const defenderID = obj.DB.defenderUser.userID;
    const attackerFaction = obj.DB.attackerUser.factionID;
    const attackerName = obj.DB.attackerUser.playername;
    const attackerID = obj.DB.attackerUser.userID;

    //console.log(obj);

    let smokesNeeded = 0;
    let tearsNeeded = 0;


    const container = $("<div id='dam-container'></div>").appendTo("#react-root h4");
    const selectContainer = $("<div id='dam-select-container'></div>").appendTo(container);
    const requestContainer = $("<div id='dam-request-container'></div>").appendTo(container);
    const submitContainer = $("<div id='dam-submit-container'></div>").appendTo(container);

    let wrapper = $("<div class='dam-smokes'><span class='dam-text-smokes'>Smokes Needed: </span></div>").appendTo(requestContainer);
    let wrapper2 = $("<div class='dam-tears'><span class='dam-text-tears'>Tears Needed: </span></div>").appendTo(requestContainer);
    const alertText = $("<span id='dam-message'></span>").appendTo(requestContainer);
    // assist button is initially hidden
    let assistSubmitButton = $("<button id='dam-assist-submit' class='torn-btn btn___RxE8_ undefined silver disabled'>Assist Me</button>").appendTo(submitContainer).click(function() {
        // if the button has the "disabled" class, do nothing when clicked
        if ($(this).hasClass("disabled")) return;
        $('.torn-btn.selected').removeClass('selected');
        requestAssist(defenderName, defenderID, defenderFaction, attackerName, attackerID, attackerFaction);
    });

    let selectWrapper = $("<div></div>").appendTo(selectContainer);

    let lastClickedSmoke = null;
    let lastClickedTear = null;
    for (const amount of [1, 2, 3, 4, 5]) {
        $(`<span id='dam-smk-btn-${amount}' class='torn-btn btn___RxE8_ undefined silver'>${amount}</span>`).appendTo(wrapper).click(function() {
            if (lastClickedSmoke) {
                lastClickedSmoke.removeClass('smk-selected');
            }
            $(this).toggleClass('smk-selected');
            lastClickedSmoke = $(this);
            smokesNeeded = amount;
            updateSmokes(amount);
        });
    }
    $("<br>").appendTo(wrapper);
    for (const amount of [1, 2, 3, 4, 5]) {
        $(`<span id='dam-tear-btn-${amount}' class='torn-btn btn___RxE8_ undefined silver'>${amount}</span>`).appendTo(wrapper2).click(function() {
            if (lastClickedTear) {
                lastClickedTear.removeClass('tear-selected');
            }
            $(this).toggleClass('tear-selected');
            lastClickedTear = $(this);
            tearsNeeded = amount;
            updateTears(amount);
        });
    }

    // Create the dropdown element
    const selectLabelElememnt = $("<label for='dam-select'>Seek Assists From:</label>").appendTo(selectWrapper);
    const selectElement = $("<select id='dam-select'></select>").appendTo(selectWrapper);


    for (const [key, value] of Object.entries(REQ_URL_STORAGE)) {
        const option = $("<option></option>").attr("value", key).text(key);
        if (value === REQUEST_URL) {
            option.attr("selected", true);
            setObject('ROD_assist_savedUrl', REQUEST_URL)
        }
        selectElement.append(option);
    }

    selectElement.change(() => {
        // Update the REQUEST_URL when the user selects a different option
        const REQUEST_URL = REQ_URL_STORAGE[selectElement.val()];
        setObject('ROD_assist_savedUrl', REQUEST_URL)
    });


    // Adding and updating existing entries (at the bottom of the page)
    //
    // Create the form element
    const formContainer = $("<div id='dam-form-container'></div>").appendTo(document.querySelector("#react-root > div"));
    const editUrlsButton = $("<button id='dam-toggle-button'>Edit URLs</button>").appendTo(formContainer);
    editUrlsButton.click(() => {
        formElement.toggle();
    });

    const formElement = $("<form id='dam-urlForm'></form>").appendTo(formContainer);


    // Add form inputs for name and URL
    const nameLabel = $("<label for='nameInput'>Name:</label>").appendTo(formElement);
    const nameInput = $("<input type='text' id='nameInput' name='name'>").appendTo(formElement);
    const urlLabel = $("<label for='urlInput'>URL:</label>").appendTo(formElement);
    const urlInput = $("<input type='text' id='urlInput' name='url'>").appendTo(formElement);

    // Add a submit button to the form
    const submitButton = $("<button type='submit'>Save</button>").appendTo(formElement);
    const delSelectElement = $("<select id='dam-urlSelect'></select>").appendTo(formElement);
    const deleteButton = $("<button>Delete URL</button>").appendTo(formElement);
    $("<br>").appendTo(formElement);

    // Add an option for each saved URL fpr the list of assist server to delete
    for (const name in REQ_URL_STORAGE) {
        const option = $("<option></option>").attr("value", name).text(name);
        delSelectElement.append(option);
    }
    // Add an event listener to the delete button
    deleteButton.click(() => {
        // Get the name of the URL to delete
        const selectedName = delSelectElement.val();

        // Remove the URL from the REQ_URL_STORAGE object
        delete REQ_URL_STORAGE[selectedName];

        // Update the REQ_URL_STORAGE object in local storage
        setObject('REQ_URL_STORAGE', REQ_URL_STORAGE);

        // Remove the corresponding option from the select element
        delSelectElement.find(`option[value="${selectedName}"]`).remove();
        selectElement.find(`option[value="${selectedName}"]`).remove();
    });



    // Add an event listener to the form
    formElement.submit(handleSubmit(selectElement));
    // Set the default display style of the form to 'none'
    formElement.css("display", "none");

    function updateSmokes(amount) {
        smokesNeeded = amount;
        if (isValidSelection() && assistSubmitButtonTimeout === null) {
            assistSubmitButton.removeClass('disabled');
        } else {
            assistSubmitButton.addClass('disabled');
        }
    }

    function updateTears(amount) {
        tearsNeeded = amount;
        if (isValidSelection() && assistSubmitButtonTimeout === null) {
            assistSubmitButton.removeClass('disabled');
        } else {
            assistSubmitButton.addClass('disabled');
        }
    }

    function isValidSelection() {
        return smokesNeeded > 0 || tearsNeeded > 0;
    }

    //let assistButton = document.querySelector("#dam-assist-submit"); // Replace with your button's selector
    function requestAssist(defenderName, defenderID, defenderFaction, attackerName, attackerID, attackerFaction) {
        if (smokesNeeded === 0 && tearsNeeded === 0) {return};
        if (assistSubmitButtonTimeout) {
            return; // Exit function if timeout is active
        }

        let smkButtons = document.getElementsByClassName('smk-selected');
        let tearButtons = document.getElementsByClassName('tear-selected');

        const target = defenderName;
        const targetFaction = defenderFaction;
        const targetID = defenderID;
        //const target = new URLSearchParams(location.search).get("user2ID");
        //const targetName = document.querySelector('#defender .userName___loAWK').textContent;
        //const script = $("script[src*='/builds/chat/']");
        //const requester = `${script.attr("name")} [${script.attr("uid")}]`;
        const requester = attackerName;
        const requesterFaction = attackerFaction;
        const requesterID = attackerID
        const requestUrl = getObject('ROD_assist_savedUrl');
        const uuid = uuidv4();
        const payload = JSON.stringify({target, targetID, targetFaction, smokesNeeded, tearsNeeded, requester, requesterID, requesterFaction, uuid});
        console.log(payload);

        GM_xmlhttpRequest({
            method: "POST",
            url: requestUrl,
            data: payload,
            headers: {"Content-Type": "application/json"},
            onload: (response) => {
                console.log([
                    response.status,
                    response.statusText,
                    response.readyState,
                    response.responseHeaders,
                    response.responseText,
                    response.finalUrl
                ].join("\n"));
                switch (response.status) {
                    case 200:
                        setMessage("success", "Assist requested!");
                        break;
                    case 500:
                        setMessage("error", "Something went wrong.");
                        break;
                    default:
                        setMessage("warning", "Unknown response.");
                        break;
                }

            },
            ontimeout: () => setMessage("error", "Request has timed out."),
            onerror: () => setMessage("error", "Unknown error has occurred when trying to send the data."),
            onabort: () => setMessage("error", "Upon sending the data, the request was canceled.")
        });
        // Disable the button and set a timeout to enable it after 5 seconds
        assistSubmitButton.addClass('disabled');
        assistSubmitButtonTimeout = setTimeout(function() {
            assistSubmitButton.removeClass('disabled');
            assistSubmitButtonTimeout = null; // Clear timeout
        }, 5000); // Time is in milliseconds (5000 ms = 5 s)
        //assistSubmitButton.hide(); // Hide the button again after a request is made


        // loop over all smkButtons and remove the class 'smk-selected'
        for (let i = 0; i < smkButtons.length; i++) {
            smkButtons[i].classList.remove('smk-selected');
        }

        // loop over all tearButtons and remove the class 'tear-selected'
        for (let i = 0; i < tearButtons.length; i++) {
            tearButtons[i].classList.remove('tear-selected');
        }
        smokesNeeded = 0;
        tearsNeeded = 0;
    }

    function setMessage(type, message) {
        alertText
            .text(message)
            .attr("class", type);
        setTimeout(() => {
            alertText
                .text("")
                .attr("class", "");
        }, 5000);
    }
})();
