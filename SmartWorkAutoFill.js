
/**
 * Fields handlers
 */
let timeFromHandler = document.querySelector("#work\\.\\.DateBox\\.\\.timeFrom > input");
let timeToHandler = document.querySelector("#work\\.\\.DateBox\\.\\.timeTo > input");
let sendButtonHandler = document.querySelector("#work\\.\\.Button\\.\\._workflow_workflowStatusChange\\$\\$1 > span");
let confirmButtonHandler = document.querySelector("#work\\.\\.Button\\.\\.ok > span");

/**
 * Fill hours and click send button in case of confirmation click confirm button
 */
if (confirmButtonHandler === null) {
	timeFromHandler.value = "08:00";
	timeToHandler.value = "16:00";
	sendButtonHandler.click();
} else {
	confirmButtonHandler.click();
}