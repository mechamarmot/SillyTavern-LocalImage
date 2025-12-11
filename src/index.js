/* global SillyTavern */
import { createRoot } from 'react-dom/client';
import Gallery from './Gallery';

const EXTENSION_NAME = 'SillyTavern-LocalImage';
const BUTTON_ID = 'local_image_button';

let galleryRoot = null;
let galleryContainer = null;

/**
 * Initialize extension settings
 */
function initSettings() {
    const context = SillyTavern.getContext();
    const defaultSettings = {
        enabled: true,
        // assignments: { characterName: { imageName: { path: "...", description: "..." } } }
        assignments: {},
        // characterSettings: { characterName: { injectPrompt: true, customPrefix: "..." } }
        characterSettings: {},
    };

    if (!context.extensionSettings[EXTENSION_NAME]) {
        context.extensionSettings[EXTENSION_NAME] = {};
    }

    Object.assign(context.extensionSettings[EXTENSION_NAME], {
        ...defaultSettings,
        ...context.extensionSettings[EXTENSION_NAME],
    });

    // Migrate old format (string paths) to new format (objects with path/description)
    const settings = context.extensionSettings[EXTENSION_NAME];
    if (settings.assignments) {
        for (const charName of Object.keys(settings.assignments)) {
            for (const imageName of Object.keys(settings.assignments[charName])) {
                const value = settings.assignments[charName][imageName];
                if (typeof value === 'string') {
                    settings.assignments[charName][imageName] = {
                        path: value,
                        description: ''
                    };
                }
            }
        }
    }

    return context.extensionSettings[EXTENSION_NAME];
}

/**
 * Get extension settings
 */
function getSettings() {
    const context = SillyTavern.getContext();
    return context.extensionSettings[EXTENSION_NAME] || {};
}

/**
 * Save extension settings
 */
function saveSettings() {
    const context = SillyTavern.getContext();
    context.saveSettingsDebounced();
}

/**
 * Get current character name
 * @returns {string|null} Character name or null
 */
function getCurrentCharacterName() {
    const context = SillyTavern.getContext();
    if (context.characterId !== undefined && context.characters[context.characterId]) {
        return context.characters[context.characterId].name;
    }
    return null;
}

/**
 * Get current persona/user name
 * @returns {string|null} Persona name or null
 */
function getCurrentPersonaName() {
    const context = SillyTavern.getContext();
    // ST stores persona name in name1
    return context.name1 || null;
}

/**
 * Resolve entity name from tag (handles {{user}}, {{char}} macros)
 * @param {string} entityName - Name from tag (could be actual name or macro)
 * @returns {string} Resolved entity name
 */
function resolveEntityName(entityName) {
    const lowerName = entityName.toLowerCase();

    // Handle {{user}} macro
    if (lowerName === '{{user}}' || lowerName === 'user') {
        return getCurrentPersonaName() || entityName;
    }

    // Handle {{char}} macro
    if (lowerName === '{{char}}' || lowerName === 'char') {
        return getCurrentCharacterName() || entityName;
    }

    return entityName;
}

/**
 * Get assignments for a character
 * @param {string} charName - Character name
 * @returns {Object} Assignments object { name: { path, description } }
 */
function getCharacterAssignments(charName) {
    const settings = getSettings();
    return settings.assignments?.[charName] || {};
}

/**
 * Get character-specific settings
 * @param {string} charName - Character name
 * @returns {Object} Settings object { injectPrompt, customPrefix }
 */
function getCharacterSettings(charName) {
    const settings = getSettings();
    return settings.characterSettings?.[charName] || { injectPrompt: false, customPrefix: '' };
}

/**
 * Save character-specific settings
 * @param {string} charName - Character name
 * @param {Object} charSettings - Settings to save
 */
function saveCharacterSettings(charName, charSettings) {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[EXTENSION_NAME];

    if (!settings.characterSettings) {
        settings.characterSettings = {};
    }
    settings.characterSettings[charName] = charSettings;
    saveSettings();
}

/**
 * Assign a name to an image for a character
 * @param {string} charName - Character name
 * @param {string} imageName - Name to assign
 * @param {string} imagePath - Path to the image
 * @param {string} description - Description of the image
 */
function assignImage(charName, imageName, imagePath, description = '') {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[EXTENSION_NAME];

    if (!settings.assignments) {
        settings.assignments = {};
    }
    if (!settings.assignments[charName]) {
        settings.assignments[charName] = {};
    }

    settings.assignments[charName][imageName] = {
        path: imagePath,
        description: description
    };
    saveSettings();
    console.log(`[${EXTENSION_NAME}] Assigned "${imageName}" to "${imagePath}" for ${charName}`);
}

/**
 * Update description for an existing assignment
 * @param {string} charName - Character name
 * @param {string} imageName - Image name
 * @param {string} description - New description
 */
function updateImageDescription(charName, imageName, description) {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[EXTENSION_NAME];

    if (settings.assignments?.[charName]?.[imageName]) {
        settings.assignments[charName][imageName].description = description;
        saveSettings();
    }
}

/**
 * Remove an assignment
 * @param {string} charName - Character name
 * @param {string} imageName - Name to unassign
 */
function unassignImage(charName, imageName) {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[EXTENSION_NAME];

    if (settings.assignments?.[charName]?.[imageName]) {
        delete settings.assignments[charName][imageName];
        saveSettings();
        console.log(`[${EXTENSION_NAME}] Unassigned "${imageName}" for ${charName}`);
    }
}

/**
 * Get image path by character and name
 * @param {string} charName - Character name
 * @param {string} imageName - Image name
 * @returns {string} Image path or empty string
 */
function getImagePath(charName, imageName) {
    const assignments = getCharacterAssignments(charName);
    const assignment = assignments[imageName];
    if (!assignment) return '';
    // Handle both old format (string) and new format (object)
    return typeof assignment === 'string' ? assignment : assignment.path || '';
}

/**
 * Generate the image list prompt for a character
 * @param {string} charName - Character name
 * @returns {string} Formatted prompt text
 */
function generateImageListPrompt(charName) {
    const assignments = getCharacterAssignments(charName);
    const charSettings = getCharacterSettings(charName);

    const imageNames = Object.keys(assignments);
    if (imageNames.length === 0) return '';

    const lines = imageNames.map(name => {
        const assignment = assignments[name];
        const desc = typeof assignment === 'object' ? assignment.description : '';
        return desc ? `- ${name}: ${desc}` : `- ${name}`;
    });

    const prefix = charSettings.customPrefix || `Available images for ${charName} (use ::img ${charName} name:: to display):`;

    return `[${prefix}\n${lines.join('\n')}]`;
}

/**
 * Replace ::img CharName imagename:: tags in text with actual images
 * @param {string} text - Text to process
 * @returns {string} Text with image tags replaced
 */
function replaceImageTags(text) {
    if (!text) return text;

    // Match ::img CharName imagename:: pattern
    const pattern = /::img\s+([^\s]+)\s+([^:]+)::/gi;

    return text.replace(pattern, (match, charName, imageName) => {
        const imagePath = getImagePath(charName.trim(), imageName.trim());
        if (imagePath) {
            return `![${imageName.trim()}](/${imagePath})`;
        }
        // If not found, try current character
        const currentChar = getCurrentCharacterName();
        if (currentChar) {
            const currentPath = getImagePath(currentChar, imageName.trim());
            if (currentPath) {
                return `![${imageName.trim()}](/${currentPath})`;
            }
        }
        return match; // Leave unchanged if not found
    });
}

// Track processed messages to avoid reprocessing
const processedMessages = new WeakSet();

/**
 * Process a single message element in the DOM
 */
function processMessageElement(mesElement) {
    // Skip if already processed
    if (processedMessages.has(mesElement)) return;

    // Try to find the content - check for STLE wrapper first
    let mesText = mesElement.querySelector('.mes_text .stle--content') || mesElement.querySelector('.mes_text');
    if (!mesText) return;

    const text = mesText.textContent || '';

    // Match ::img CharName imagename:: pattern
    const pattern = /::img\s+(\S+)\s+(\S+)::/gi;

    let match;
    const matches = [];
    while ((match = pattern.exec(text)) !== null) {
        matches.push({
            full: match[0],
            charName: match[1].trim(),
            imageName: match[2].trim()
        });
    }

    if (matches.length === 0) return;

    // Mark as processed BEFORE making changes
    processedMessages.add(mesElement);

    console.log(`[${EXTENSION_NAME}] Found ${matches.length} localimage tag(s) in message`);

    // Process each match - use textContent replacement to avoid HTML issues
    matches.forEach(m => {
        // Resolve entity name (handles {{user}}, {{char}} macros)
        const resolvedName = resolveEntityName(m.charName);
        console.log(`[${EXTENSION_NAME}] Processing tag: entity="${m.charName}" -> "${resolvedName}", name="${m.imageName}"`);

        let imagePath = getImagePath(resolvedName, m.imageName);

        // Fallback: try current character if not found
        if (!imagePath) {
            const currentChar = getCurrentCharacterName();
            if (currentChar && currentChar !== resolvedName) {
                imagePath = getImagePath(currentChar, m.imageName);
            }
        }

        // Fallback: try current persona if not found
        if (!imagePath) {
            const currentPersona = getCurrentPersonaName();
            if (currentPersona && currentPersona !== resolvedName) {
                imagePath = getImagePath(currentPersona, m.imageName);
            }
        }

        if (imagePath) {
            const imgHtml = `<img src="/${imagePath}" alt="${m.imageName}" class="localimage-inserted" style="max-width: 100%; border-radius: 8px; margin: 5px 0; display: block;">`;

            // Get message ID from the element
            const mesId = mesElement.getAttribute('mesid');

            // Update ST's chat data directly so STLE renders our change
            const context = SillyTavern.getContext();
            if (context.chat && mesId !== null) {
                const msgIndex = parseInt(mesId);
                if (context.chat[msgIndex]) {
                    const originalMes = context.chat[msgIndex].mes;
                    const newMes = originalMes.replace(m.full, imgHtml);
                    if (newMes !== originalMes) {
                        context.chat[msgIndex].mes = newMes;

                        // Force re-render of this message
                        const mesTextEl = mesElement.querySelector('.mes_text');
                        if (mesTextEl) {
                            mesTextEl.innerHTML = newMes;
                        }
                    }
                }
            }

            // Also try direct DOM replacement as fallback
            const paragraphs = mesText.querySelectorAll('p');
            for (const p of paragraphs) {
                const pText = p.textContent || '';
                if (pText.includes(m.full)) {
                    p.innerHTML = imgHtml;
                    break;
                }
            }
        }
    });
}

/**
 * Process all messages in the chat
 */
function processAllMessages() {
    const messages = document.querySelectorAll('#chat .mes');
    messages.forEach(processMessageElement);
}

/**
 * Register message handler (no MutationObserver to avoid conflicts)
 */
function registerMessageHandler() {
    const chatElement = document.getElementById('chat');
    if (!chatElement) {
        console.warn(`[${EXTENSION_NAME}] Chat element not found, retrying...`);
        setTimeout(registerMessageHandler, 1000);
        return;
    }

    // Process existing messages on load
    setTimeout(processAllMessages, 500);

    console.log(`[${EXTENSION_NAME}] Message handler registered`);
}


/**
 * Open the gallery modal
 */
function openGallery() {
    const charName = getCurrentCharacterName();
    if (!charName) {
        console.warn(`[${EXTENSION_NAME}] No character selected`);
        return;
    }

    // Create container if not exists
    if (!galleryContainer) {
        galleryContainer = document.createElement('div');
        galleryContainer.id = 'local-image-gallery-root';
        document.body.appendChild(galleryContainer);
        galleryRoot = createRoot(galleryContainer);
    }

    const assignments = getCharacterAssignments(charName);
    const charSettings = getCharacterSettings(charName);

    // Render gallery
    galleryRoot.render(
        <Gallery
            characterName={charName}
            onClose={closeGallery}
            assignments={assignments}
            characterSettings={charSettings}
            onAssign={(name, path, description) => {
                assignImage(charName, name, path, description);
                // Re-render to update assignments display
                openGallery();
            }}
            onUnassign={(name) => {
                unassignImage(charName, name);
                openGallery();
            }}
            onUpdateDescription={(name, description) => {
                updateImageDescription(charName, name, description);
                openGallery();
            }}
            onSaveSettings={(settings) => {
                saveCharacterSettings(charName, settings);
                openGallery();
            }}
        />
    );
}

/**
 * Open the gallery modal for persona/user
 */
function openPersonaGallery() {
    const personaName = getCurrentPersonaName();
    if (!personaName) {
        console.warn(`[${EXTENSION_NAME}] No persona selected`);
        return;
    }

    // Create container if not exists
    if (!galleryContainer) {
        galleryContainer = document.createElement('div');
        galleryContainer.id = 'local-image-gallery-root';
        document.body.appendChild(galleryContainer);
        galleryRoot = createRoot(galleryContainer);
    }

    const assignments = getCharacterAssignments(personaName);
    const charSettings = getCharacterSettings(personaName);

    // Render gallery
    galleryRoot.render(
        <Gallery
            characterName={personaName}
            onClose={closeGallery}
            assignments={assignments}
            characterSettings={charSettings}
            onAssign={(name, path, description) => {
                assignImage(personaName, name, path, description);
                openPersonaGallery();
            }}
            onUnassign={(name) => {
                unassignImage(personaName, name);
                openPersonaGallery();
            }}
            onUpdateDescription={(name, description) => {
                updateImageDescription(personaName, name, description);
                openPersonaGallery();
            }}
            onSaveSettings={(settings) => {
                saveCharacterSettings(personaName, settings);
                openPersonaGallery();
            }}
            isPersona={true}
        />
    );
}

/**
 * Close the gallery modal
 */
function closeGallery() {
    if (galleryRoot) {
        galleryRoot.render(null);
    }
}

/**
 * Add the gallery button to character panel
 */
function addGalleryButton() {
    // Remove existing button if any
    const existingButton = document.getElementById(BUTTON_ID);
    if (existingButton) {
        existingButton.remove();
    }

    // Find the export button directly and insert next to it
    const exportButton = document.getElementById('export_button');
    if (!exportButton || !exportButton.parentElement) {
        console.warn(`[${EXTENSION_NAME}] Export button not found, retrying...`);
        // Retry after a short delay
        setTimeout(addGalleryButton, 500);
        return;
    }

    const buttonContainer = exportButton.parentElement;

    // Create the button
    const button = document.createElement('div');
    button.id = BUTTON_ID;
    button.className = 'menu_button fa-solid fa-images';
    button.title = 'Local Images';
    button.setAttribute('data-i18n', '[title]Local Images');

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGallery();
    });

    // Insert after the export button
    if (exportButton.nextSibling) {
        buttonContainer.insertBefore(button, exportButton.nextSibling);
    } else {
        buttonContainer.appendChild(button);
    }

    console.log(`[${EXTENSION_NAME}] Gallery button added to character panel`);
}

/**
 * Remove the gallery button
 */
function removeGalleryButton() {
    const button = document.getElementById(BUTTON_ID);
    if (button) {
        button.remove();
    }
}

const PERSONA_BUTTON_ID = 'local_image_persona_button';

/**
 * Add the gallery button for persona
 */
function addPersonaGalleryButton() {
    // Remove existing button if any
    const existingButton = document.getElementById(PERSONA_BUTTON_ID);
    if (existingButton) {
        existingButton.remove();
    }

    // Find the user avatar/persona area - look for user_avatar_block
    const userAvatarBlock = document.getElementById('user_avatar_block');
    if (!userAvatarBlock) {
        // Retry after a short delay
        setTimeout(addPersonaGalleryButton, 1000);
        return;
    }

    // Create the button
    const button = document.createElement('div');
    button.id = PERSONA_BUTTON_ID;
    button.className = 'menu_button fa-solid fa-images';
    button.title = 'My Images (Persona)';
    button.style.cssText = 'position: absolute; bottom: 5px; right: 5px; font-size: 14px; padding: 5px; z-index: 10;';

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPersonaGallery();
    });

    // Add to user avatar block
    userAvatarBlock.style.position = 'relative';
    userAvatarBlock.appendChild(button);

    console.log(`[${EXTENSION_NAME}] Persona gallery button added`);
}

/**
 * Remove the persona gallery button
 */
function removePersonaGalleryButton() {
    const button = document.getElementById(PERSONA_BUTTON_ID);
    if (button) {
        button.remove();
    }
}

/**
 * Handle character selection change
 */
function onCharacterSelected() {
    const charName = getCurrentCharacterName();
    if (charName) {
        addGalleryButton();
    } else {
        removeGalleryButton();
    }
}


/**
 * Initialize the extension
 */
function init() {
    initSettings();
    registerMessageHandler();

    const context = SillyTavern.getContext();

    // Subscribe to character selection events
    if (context.eventSource && context.eventTypes) {
        context.eventSource.on(context.eventTypes.CHAT_CHANGED, () => {
            onCharacterSelected();
            // Process existing messages when chat loads
            setTimeout(processAllMessages, 500);
        });

        // Also listen for message rendered events
        if (context.eventTypes.MESSAGE_RENDERED) {
            context.eventSource.on(context.eventTypes.MESSAGE_RENDERED, (messageId) => {
                console.log(`[${EXTENSION_NAME}] MESSAGE_RENDERED event for message ${messageId}`);
                setTimeout(() => {
                    const mesElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
                    if (mesElement) {
                        processMessageElement(mesElement);
                    }
                }, 100);
            });
        }

        // Listen for user message events - use longer delay to let other extensions finish
        if (context.eventTypes.USER_MESSAGE_RENDERED) {
            context.eventSource.on(context.eventTypes.USER_MESSAGE_RENDERED, (messageId) => {
                console.log(`[${EXTENSION_NAME}] USER_MESSAGE_RENDERED event for message ${messageId}`);
                // Use multiple delays to catch after STLE finishes
                setTimeout(() => {
                    const mesElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
                    if (mesElement) {
                        processMessageElement(mesElement);
                    }
                }, 1000);
                // Also try again after 2 seconds in case STLE re-renders
                setTimeout(() => {
                    const mesElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
                    if (mesElement && !mesElement.querySelector('.localimage-inserted')) {
                        processedMessages.delete(mesElement);
                        processMessageElement(mesElement);
                    }
                }, 2000);
            });
        }

        // Listen for character message events
        if (context.eventTypes.CHARACTER_MESSAGE_RENDERED) {
            context.eventSource.on(context.eventTypes.CHARACTER_MESSAGE_RENDERED, (messageId) => {
                console.log(`[${EXTENSION_NAME}] CHARACTER_MESSAGE_RENDERED event for message ${messageId}`);
                setTimeout(() => {
                    const mesElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
                    if (mesElement) {
                        processMessageElement(mesElement);
                    }
                }, 500);
            });
        }

        // Listen for prompt generation to inject image list
        if (context.eventTypes.GENERATE_BEFORE_COMBINE_PROMPTS) {
            context.eventSource.on(context.eventTypes.GENERATE_BEFORE_COMBINE_PROMPTS, () => {
                const charName = getCurrentCharacterName();
                if (!charName) return;

                const charSettings = getCharacterSettings(charName);
                if (!charSettings.injectPrompt) return;

                const prompt = generateImageListPrompt(charName);
                if (!prompt) return;

                // Inject into extension prompt (Author's Note style)
                const extensionPrompt = context.extensionPrompts?.['LocalImage'];
                if (extensionPrompt === undefined) {
                    // Register our extension prompt
                    context.setExtensionPrompt(EXTENSION_NAME, prompt, 1, 0); // position 1 = after main prompt, depth 0
                }
            });
        }
    }

    // Add button if character already selected
    setTimeout(() => {
        if (getCurrentCharacterName()) {
            addGalleryButton();
        }
        // Always try to add persona button
        addPersonaGalleryButton();
    }, 100);

    console.log(`[${EXTENSION_NAME}] Extension initialized`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
