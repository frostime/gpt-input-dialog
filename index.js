function createTextInputDialog() {
    // Create the floating button
    const floatingButton = document.createElement('button');
    floatingButton.id = 'floating-button';
    floatingButton.textContent = 'Open Dialog';
    floatingButton.style.position = 'fixed';
    floatingButton.style.bottom = '20px';
    floatingButton.style.right = '20px';
    floatingButton.style.padding = '10px 20px';
    floatingButton.style.backgroundColor = '#007bff';
    floatingButton.style.color = '#fff';
    floatingButton.style.border = 'none';
    floatingButton.style.borderRadius = '4px';
    floatingButton.style.cursor = 'pointer';
    document.body.appendChild(floatingButton);

    // Create the overlay
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'none';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';

    // Create the dialog
    const dialog = document.createElement('div');
    dialog.id = 'dialog';
    dialog.style.backgroundColor = '#fff';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
    dialog.style.display = 'flex';
    dialog.style.width = '50%';
    dialog.style.flexDirection = 'column';
    dialog.style.maxWidth = '900px';
    dialog.style.minWidth = '400px';
    dialog.style.height = '600px';

    // Create the text input area
    const textInput = document.createElement('div');
    // textInput.className = 'GrowingTextArea_growWrap__im5W3 ChatMessageInputContainer_textArea__fNi6E';
    textInput.dataset.replicatedValue = '';
    textInput.style.border = '1px solid #ccc';
    textInput.style.borderRadius = '4px';
    textInput.style.padding = '8px';
    textInput.style.flexGrow = '1'; // Allow the text input area to grow
    textInput.style.display = 'flex'; // Make the text input area a flex container
    textInput.style.flexDirection = 'column'; // Stack child elements vertically

    const textarea = document.createElement('textarea');
    textarea.className = 'GrowingTextArea_textArea__ZWQbP';
    textarea.rows = 5;
    textarea.placeholder = 'Talk to Claude-3-Sonnet';
    textarea.style.width = '100%';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.fontSize = '22px';
    textarea.style.lineHeight = '1.5';
    textarea.style.fontFamily = 'HarmonyOS Sans';
    textarea.style.flexGrow = '1'; // Allow the textarea to grow vertically
    textInput.appendChild(textarea);

    // Handle tab and enter key events
    textarea.addEventListener('keydown', (event) => {
        const { key, shiftKey } = event;

        // Handle tab key
        if (key === 'Tab') {
            event.preventDefault(); // Prevent the default tab behavior
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(end);
            textarea.value = `${textBeforeCursor}    ${textAfterCursor}`; // Insert 4 spaces
            textarea.selectionStart = textarea.selectionEnd = start + 4; // Move the cursor 4 positions forward
        }

        // Handle enter key
        if (key === 'Enter' && !shiftKey) {
            event.preventDefault(); // Prevent the default enter behavior
            const start = textarea.selectionStart;
            const lines = textarea.value.split('\n');
            const currentLine = lines[lines.length - 1];
            const whiteSpaceMatch = currentLine.match(/^\s*/);
            const whiteSpace = whiteSpaceMatch ? whiteSpaceMatch[0] : ''; // Get the whitespace before the current line
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(textarea.selectionEnd);
            textarea.value = `${textBeforeCursor}\n${whiteSpace}${textAfterCursor}`; // Insert a new line with the same whitespace
            textarea.selectionStart = textarea.selectionEnd = start + whiteSpace.length + 1; // Move the cursor after the whitespace
        }
    });

    // Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '16px';

    // Create the cancel button
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginRight = '8px';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#f2f2f2';
    cancelButton.style.border = '1px solid #ccc';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';

    // Create the confirm button
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirm-button';
    confirmButton.textContent = 'Confirm';
    confirmButton.style.padding = '8px 16px';
    confirmButton.style.backgroundColor = '#007bff';
    confirmButton.style.color = '#fff';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '4px';
    confirmButton.style.cursor = 'pointer';

    // Append buttons to the button container
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);

    // Append text input and button container to the dialog
    dialog.appendChild(textInput);
    dialog.appendChild(buttonContainer);

    // Append dialog to the overlay
    overlay.appendChild(dialog);

    // Append overlay to the document body
    document.body.appendChild(overlay);

    // Add event listeners
    floatingButton.addEventListener('click', () => {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    cancelButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    confirmButton.addEventListener('click', () => {
        globalThis.inputText = textarea.value;
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Call the function to create the text input dialog
createTextInputDialog();
