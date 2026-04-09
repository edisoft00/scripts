// --- Configurations ---
const CONFIG = {
  buttonTextToClick: 'Retry', // Text of the button we want to find and click
  logPrefix: '[AntiRetry]'    // Prefix used for the console logs
};

// Target the body or the specific container if it always exists in the DOM
const targetNode = document.body;

// Configuration for the observer: watch for new child nodes and deep changes
const config = { childList: true, subtree: true };

// Helper function to click the button if it matches, to follow DRY principle
const processButtonMatch = (button, contextMsg) => {
  if (button.textContent.trim() === CONFIG.buttonTextToClick) {
    button.click();
    console.log(`${CONFIG.logPrefix} Clicked '${CONFIG.buttonTextToClick}' ${contextMsg}`);
    return true; // Return true to indicate successful click
  }
  return false;
};

// Callback function to execute when mutations are observed
const callback = (mutationsList, observer) => {
  // We use a label here so we can instantly break out of all loops once the button is clicked
  mutationLoop: for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // Check newly added nodes
      for (const node of mutation.addedNodes) {
        // Ensure the node is an HTML element
        if (node.nodeType === Node.ELEMENT_NODE) {

          // Check if the added node itself is the button, or search within it
          const buttons = node.tagName === 'BUTTON'
            ? [node]
            : node.querySelectorAll('button');

          // Iterate through found buttons
          for (const button of buttons) {
            if (processButtonMatch(button, '(Found via observer)')) {
              // We successfully clicked it. Stop processing all other mutations immediately!
              break mutationLoop;
            }
          }
        }
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

console.log(`${CONFIG.logPrefix} MutationObserver started. Waiting for the '${CONFIG.buttonTextToClick}' button to appear...`);

// --- Initial Check ---
// Check if the button is already present on the page when the script is injected
const existingButtons = targetNode.tagName === 'BUTTON' 
  ? [targetNode] 
  : targetNode.querySelectorAll('button');

for (const button of existingButtons) {
  if (processButtonMatch(button, '(Found on initial load)')) {
    break; // Stop searching if we already found and clicked it
  }
}
