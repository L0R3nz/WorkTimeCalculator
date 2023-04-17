
/**
 * Fields handlers
 */
const timeFromHandler = document.querySelector("#work\\.\\.DateBox\\.\\.timeFrom > input");
const timeToHandler = document.querySelector("#work\\.\\.DateBox\\.\\.timeTo > input");
const sendButtonHandler = document.querySelector("#work\\.\\.Button\\.\\._workflow_workflowStatusChange\\$\\$1 > span");
const confirmButtonHandler = document.querySelector("#work\\.\\.Button\\.\\.ok > span");

const fromValue = "08:00";
const ToValue = "16:00";

/**
 * Fill hours and click send button in case of confirmation click confirm button
 */
if (confirmButtonHandler === null) {
	timeFromHandler.value = fromValue;
	timeToHandler.value = ToValue;
	sendButtonHandler.click();
} else {
	confirmButtonHandler.click();
}