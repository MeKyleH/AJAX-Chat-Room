// loads required files
var chatURL = "ajaxchat.php";
var getColorURL = "get_color.php";

// create AJAX objects for the messaging and color changing components
var xmlHttpGetMessages = createXmlHttpRequestObject();
var xmlHttpGetColor = createXmlHttpRequestObject();

//declare required variables
var updateInterval = 1000; // how long between server connections
var debugMode = true; // debug mode
var cache = new Array(); // message cache
var lastMessageID = -1;
var mouseX, mouseY;

// checks browser compatability and creates xmlHttp objects
function createXmlHttpRequestObject() {
	var xmlHttp;
	
	// Chrome and Firefox
	try {
		xmlHttp = new XMLHttpRequest();
	
	// tries to find any remaining browsers (IE)
	} catch(e) {
		var XmlHttpVersions = new Array("MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP");
		for (var i = 0; i < XmlHttpVersions.length && !xmlHttp; i++) {
			try {
				xmlHttp = new ActiveXObject(XmlHttpVersions[i]);
			} catch (e) {
				alert("Your browser is not supported");
			}
		}
	}
	
	// alerts if no browser object created
	if (!xmlHttp)
		alert("Error creating the XMLHttpRequest object.");
	else
		return xmlHttp;
}

// initializes chat
function init() {
	var oMessageBox = document.getElementById("messageBox"); // references text box
	oMessageBox.setAttribute("autocomplete", "off"); // prevents auto-fill
	var oSampleText = document.getElementById("sampleText"); // references sample color
	oSampleText.style.color = "black"; // sets default color
	checkUsername(); // creates random name for user
	requestNewMessages(); // checks for old messages
}

// creates random name
function checkUsername() {
	var oUser = document.getElementById("userName");
	if (oUser.value == "")
		oUser.value = "Guest" + Math.floor(Math.random() * 1000);
}

// sends messages
function sendMessage() {
	// saves message from text box and current color
	var oCurrentMessage = document.getElementById("messageBox");
	var currentUser = document.getElementById("userName").value;
	var currentColor = document.getElementById("color").value;

	// prevents empty messages from spacebar spammers, adds it to the database cache, and then clears the text box
	if (trim(oCurrentMessage.value) != "" && trim(currentUser) != "" && trim(currentColor) != "") {
		params = "mode=SendAndRetrieveNew" + "&id=" + encodeURIComponent(lastMessageID) + "&color=" + encodeURIComponent(currentColor) + "&name=" + encodeURIComponent(currentUser) + "&message=" + encodeURIComponent(oCurrentMessage.value);
		cache.push(params);
		oCurrentMessage.value = "";
	}
}

// deletes messages
function deleteMessages() {
	params = "mode=DeleteAndRetrieveNew";
	cache.push(params);
}

// allows send, delete, and update signals to be sent asynchronously
function requestNewMessages() {
	
	// saves message and color info
	var currentUser = document.getElementById("userName").value;
	var currentColor = document.getElementById("color").value;
	
	// only continue if xmlHttpGetMessages isn't void
	if (xmlHttpGetMessages) {
		try {

			// prevents multiple server requests at once
			if (xmlHttpGetMessages.readyState == 0 || xmlHttpGetMessages.readyState == 4) {
				var params = "";
			
				// loads oldest in cache first or checks for new messages
				if (cache.length > 0)
					params = cache.shift();
				else
					params = "mode=RetrieveNew" + "&id=" + lastMessageID;

				// sends info to server/database
				xmlHttpGetMessages.open("POST", chatURL, true);
				xmlHttpGetMessages.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xmlHttpGetMessages.onreadystatechange = handleReceivingMessages;
				xmlHttpGetMessages.send(params);

				// waits a second then checks if server is ready for an update
			} else {
				setTimeout("requestNewMessages();", updateInterval);
			}
		} catch(e) {
			displayError(e.toString());
		}
	}
}

// updates chat messages
function handleReceivingMessages() {

	// keeps checking if the server is ready and if so processes the server response
	if (xmlHttpGetMessages.readyState == 4) {
		if (xmlHttpGetMessages.status == 200) {
			try {
				readMessages();
			} catch(e) {
				displayError(e.toString());
			}
		} else {
			displayError(xmlHttpGetMessages.statusText);
		}
	}
}

// processes server response for new messages
function readMessages() {
	var response = xmlHttpGetMessages.responseText;

	// checks for server error
	if (response.indexOf("ERRNO") >= 0 || response.indexOf("error:") >= 0 || response.length == 0)
		throw (response.length == 0 ? "Void server response." : response);
	response = xmlHttpGetMessages.responseXML.documentElement;

	// clears chat window if not cleared
	clearChat = response.getElementsByTagName("clear").item(0).firstChild.data;
	
	// clear chat window and reset the id
	if (clearChat == "true") { 
		document.getElementById("chatWindow").innerHTML = "";
		lastMessageID = -1;
	}

	// retrieves info from server response
	idArray = response.getElementsByTagName("id");
	colorArray = response.getElementsByTagName("color");
	nameArray = response.getElementsByTagName("name");
	timeArray = response.getElementsByTagName("time");
	messageArray = response.getElementsByTagName("message");

	// adds new messages to chat room and stores last chat ID
	displayMessages(idArray, colorArray, nameArray, timeArray, messageArray);
	if (idArray.length > 0) {
		lastMessageID = idArray.item(idArray.length - 1).firstChild.data;
	}
	setTimeout("requestNewMessages();", updateInterval);
}

// adds new messages to message list
function displayMessages(idArray, colorArray, nameArray, timeArray, messageArray) {
	
	// gets messages and adds them
	for (var i = 0; i < idArray.length; i++) {
		var color = colorArray.item(i).firstChild.data.toString();
		var time = timeArray.item(i).firstChild.data.toString();
		var name = nameArray.item(i).firstChild.data.toString();
		var message = messageArray.item(i).firstChild.data.toString();

		// adds messages to screen
		var htmlMessage = "";
		htmlMessage += "<div class=\"item\" style=\"color:" + color + "\">";
		htmlMessage += "[" + time + "] " + name + " said: <br/>";
		htmlMessage += message.toString();
		htmlMessage += "</div>";
		displayMessage(htmlMessage);
	}
}

// displays messages on screen to chatWindow section
function displayMessage(message) {
	var oScroll = document.getElementById("chatWindow");
	var scrollDown = (oScroll.scrollHeight - oScroll.scrollTop <= oScroll.offsetHeight );
	oScroll.innerHTML += message;
	oScroll.scrollTop = scrollDown ? oScroll.scrollHeight : oScroll.scrollTop;
}

// for error handling
function displayError(message) {
	displayMessage("Error accessing the server! " + ( debugMode ? "<br/>" + message : ""));
}

// sends message if "enter" key pressed
function handleKey(e) {
	e = (!e) ? window.event : e;
	code = (e.charCode) ? e.charCode : ((e.keyCode) ? e.keyCode : ((e.which) ? e.which : 0));

	// if enter is pressed it sends message without the send button being clicked
	if (e.type == "keydown") {
		if (code == 13) {
			sendMessage();
		}
	}
}

// trims extra spaces in the message
function trim(s) {
	return s.replace(/(^\s+)|(\s+$)/g, "")
}

// finds mouse position for color selection
function getMouseXY(e) {

	// Chrome and Firefox
	if (!window.ActiveXObject) {
		mouseX = e.pageX;
		mouseY = e.pageY;

	// Internet Explorer
	} else {
		mouseX = window.event.x + document.body.scrollLeft;
		mouseY = window.event.y + document.body.scrollTop;
	}
}

// gets selected color
function getColor(e) {
	getMouseXY(e);

	// if a color is selected it gets the color
	if (xmlHttpGetColor) {
		var xOffset = mouseX;
		var yOffset = mouseY;
		var oPalette = document.getElementById("palette");
		var oTd = document.getElementById("colorpicker");
		if (!window.ActiveXObject) {
			xOffset -= oPalette.offsetLeft + oTd.offsetLeft;
			yOffset -= oPalette.offsetTop + oTd.offsetTop;
		} else {
			xOffset = window.event.xOffset;
			yOffset = window.event.yOffset;
		}

		// server call to check color
		try {
			if (xmlHttpGetColor.readyState == 4 || xmlHttpGetColor.readyState == 0) {
				params = "?xOffset=" + xOffset + "&yOffset=" + yOffset;
				xmlHttpGetColor.open("GET", getColorURL + params, true);
				xmlHttpGetColor.onreadystatechange = handleGettingColor;
				xmlHttpGetColor.send(null);
			}
		} catch(e) {
			displayError(xmlHttp.statusText);
		}
	}
}

// server response for color selection
function handleGettingColor() {

	// changes color if connection established
	if (xmlHttpGetColor.readyState == 4) {
		if (xmlHttpGetColor.status == 200) {
			try {
				changeColor();
			} catch(e) {
				displayError(xmlHttpGetColor.statusText);
			}
		} else {
			displayError(xmlHttpGetColor.statusText);
		}
	}
}

// actually changes the color
function changeColor() {
	response = xmlHttpGetColor.responseText;

	// checks for server error
	if (response.indexOf("ERRNO") >= 0 || response.indexOf("error:") >= 0 || response.length == 0)
		throw (response.length == 0 ? "Can't change color!" : response);

	// changes text color
	var oColor = document.getElementById("color");
	var oSampleText = document.getElementById("sampleText");
	oColor.value = response;
	oSampleText.style.color = response;
}

// changes chat window to a black background
function darkChat() {
	chatWindowChange = document.getElementById("chatWindow");
	chatWindow.className = "darkChat";
}

// changes chat window back to white background
function regularChat() {
	chatWindowChange = document.getElementById("chatWindow");
	chatWindow.className = "regularChat";
}
