export function displayErrorMessage(message: string) {
    const errorDisplay = document.getElementById("error");
    if (!errorDisplay) {
        console.error(message);
        return;
    }
    
    errorDisplay.innerText += message;
}