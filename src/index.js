/* global SillyTavern */
import { createRoot } from 'react-dom/client';
import Gallery from './Gallery';
import GroupGallery from './GroupGallery';

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
 * Check if currently in a group chat
 * @returns {boolean} True if in group chat
 */
function isGroupChat() {
    const context = SillyTavern.getContext();
    const result = context.groupId !== null && context.groupId !== undefined;
    console.log(`[${EXTENSION_NAME}] isGroupChat() - groupId: ${context.groupId}, result: ${result}`);
    return result;
}

/**
 * Get current group info
 * @returns {Object|null} Group object with id, name, members, or null
 */
function getCurrentGroup() {
    const context = SillyTavern.getContext();
    if (!isGroupChat()) return null;

    const group = context.groups?.find(g => g.id === context.groupId);
    if (!group) return null;

    return {
        id: group.id,
        name: group.name || `Group ${group.id}`,
        members: group.members || []
    };
}

/**
 * Get character names for group members
 * @param {Array} memberIds - Array of member avatar identifiers
 * @returns {Array} Array of character names
 */
function getGroupMemberNames(memberIds) {
    const context = SillyTavern.getContext();
    const names = [];

    for (const memberId of memberIds) {
        const char = context.characters.find(c => c.avatar === memberId);
        if (char) {
            names.push(char.name);
        }
    }

    return names;
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

/**
 * Strip ::img:: tags from text (for hiding from AI)
 * @param {string} text - Text to process
 * @returns {string} Text with image tags removed
 */
function stripImageTags(text) {
    if (!text) return text;
    // Match ::img CharName imagename:: pattern and remove entirely
    return text.replace(/::img\s+[^\s]+\s+[^:]+::/gi, '').replace(/\s{2,}/g, ' ').trim();
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
 * Open the group gallery modal
 */
function openGroupGallery() {
    const group = getCurrentGroup();
    if (!group) {
        console.warn(`[${EXTENSION_NAME}] No group selected`);
        return;
    }

    // Create container if not exists
    if (!galleryContainer) {
        galleryContainer = document.createElement('div');
        galleryContainer.id = 'local-image-gallery-root';
        document.body.appendChild(galleryContainer);
        galleryRoot = createRoot(galleryContainer);
    }

    const memberNames = getGroupMemberNames(group.members);

    // Gather all member assignments
    const memberAssignments = {};
    for (const memberName of memberNames) {
        memberAssignments[memberName] = getCharacterAssignments(memberName);
    }

    // Group assignments use the group name as the key
    const groupAssignments = getCharacterAssignments(group.name);
    const groupSettings = getCharacterSettings(group.name);

    // Render group gallery
    galleryRoot.render(
        <GroupGallery
            groupName={group.name}
            groupId={group.id}
            memberNames={memberNames}
            memberAssignments={memberAssignments}
            groupAssignments={groupAssignments}
            groupSettings={groupSettings}
            onClose={closeGallery}
            onAssignGroup={(name, path, description) => {
                assignImage(group.name, name, path, description);
                openGroupGallery();
            }}
            onUnassignGroup={(name) => {
                unassignImage(group.name, name);
                openGroupGallery();
            }}
            onUpdateGroupDescription={(name, description) => {
                updateImageDescription(group.name, name, description);
                openGroupGallery();
            }}
            onSaveGroupSettings={(settings) => {
                saveCharacterSettings(group.name, settings);
                openGroupGallery();
            }}
        />
    );
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

    // Find the persona controls buttons block (in persona management panel)
    const personaButtonsBlock = document.querySelector('.persona_controls_buttons_block');
    if (!personaButtonsBlock) {
        // Retry after a short delay
        setTimeout(addPersonaGalleryButton, 1000);
        return;
    }

    // Create the button
    const button = document.createElement('div');
    button.id = PERSONA_BUTTON_ID;
    button.className = 'menu_button fa-solid fa-images';
    button.title = 'Persona Images';
    button.setAttribute('data-i18n', '[title]Persona Images');

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPersonaGallery();
    });

    // Add to persona controls
    personaButtonsBlock.appendChild(button);

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
 * Handle character/group selection change
 */
function onChatChanged() {
    const inGroup = isGroupChat();
    console.log(`[${EXTENSION_NAME}] onChatChanged called, isGroupChat: ${inGroup}`);

    // Remove existing button
    const existingButton = document.getElementById(BUTTON_ID);
    if (existingButton) {
        existingButton.remove();
    }

    // Create the button
    const button = document.createElement('div');
    button.id = BUTTON_ID;
    button.className = 'menu_button fa-solid fa-images interactable';

    if (inGroup) {
        const group = getCurrentGroup();
        console.log(`[${EXTENSION_NAME}] Group info:`, group);

        if (!group) {
            console.log(`[${EXTENSION_NAME}] No group found, will retry`);
            setTimeout(onChatChanged, 500);
            return;
        }

        button.title = 'Group Images';
        button.setAttribute('data-i18n', '[title]Group Images');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openGroupGallery();
        });

        // For groups, place next to the send button area
        // Try #rightSendForm first (common location for action buttons)
        const rightSendForm = document.getElementById('rightSendForm');
        const sendButSheld = document.getElementById('send_but_sheld');
        const formSheld = document.getElementById('form_sheld');

        console.log(`[${EXTENSION_NAME}] DOM elements - rightSendForm:`, !!rightSendForm, 'sendButSheld:', !!sendButSheld, 'formSheld:', !!formSheld);

        if (rightSendForm) {
            // Insert at the beginning of rightSendForm
            rightSendForm.insertBefore(button, rightSendForm.firstChild);
            console.log(`[${EXTENSION_NAME}] Gallery button added to #rightSendForm`);
        } else if (sendButSheld) {
            sendButSheld.insertBefore(button, sendButSheld.firstChild);
            console.log(`[${EXTENSION_NAME}] Gallery button added to #send_but_sheld`);
        } else if (formSheld) {
            formSheld.appendChild(button);
            console.log(`[${EXTENSION_NAME}] Gallery button added to #form_sheld`);
        } else {
            // Fallback: add as floating button near bottom right
            button.style.cssText = 'position: fixed; bottom: 80px; right: 20px; z-index: 9999; padding: 10px 15px; background: var(--SmartThemeBlurTintColor); border: 1px solid var(--SmartThemeBorderColor); border-radius: 5px;';
            document.body.appendChild(button);
            console.log(`[${EXTENSION_NAME}] Gallery button added as floating button`);
        }
    } else {
        // Single character chat - find the export button
        const exportButton = document.getElementById('export_button');
        if (!exportButton || !exportButton.parentElement) {
            // Retry after a short delay
            setTimeout(onChatChanged, 500);
            return;
        }

        const charName = getCurrentCharacterName();
        if (!charName) return; // No character selected

        button.title = 'Local Images';
        button.setAttribute('data-i18n', '[title]Local Images');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openGallery();
        });

        // Insert after the export button
        const buttonContainer = exportButton.parentElement;
        if (exportButton.nextSibling) {
            buttonContainer.insertBefore(button, exportButton.nextSibling);
        } else {
            buttonContainer.appendChild(button);
        }
        console.log(`[${EXTENSION_NAME}] Gallery button added (character mode)`);
    }
}


/**
 * Initialize the extension
 */
function init() {
    initSettings();
    registerMessageHandler();

    const context = SillyTavern.getContext();

    // Subscribe to chat events
    console.log(`[${EXTENSION_NAME}] eventSource exists:`, !!context.eventSource, 'eventTypes exists:', !!context.eventTypes);
    if (context.eventSource && context.eventTypes) {
        // Regular chat changed
        context.eventSource.on(context.eventTypes.CHAT_CHANGED, () => {
            console.log(`[${EXTENSION_NAME}] CHAT_CHANGED event received`);
            onChatChanged();
            setTimeout(processAllMessages, 500);
        });

        // Group chat specific event
        if (context.eventTypes.GROUP_CHAT_CHANGED) {
            context.eventSource.on(context.eventTypes.GROUP_CHAT_CHANGED, () => {
                console.log(`[${EXTENSION_NAME}] GROUP_CHAT_CHANGED event received`);
                onChatChanged();
                setTimeout(processAllMessages, 500);
            });
        }

        // Also try listening to chatLoaded if available
        if (context.eventTypes.CHAT_LOADED) {
            context.eventSource.on(context.eventTypes.CHAT_LOADED, () => {
                console.log(`[${EXTENSION_NAME}] CHAT_LOADED event received`);
                onChatChanged();
                setTimeout(processAllMessages, 500);
            });
        }

        console.log(`[${EXTENSION_NAME}] Event subscriptions registered`);

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
                const prompts = [];

                // Handle group chats
                if (isGroupChat()) {
                    const group = getCurrentGroup();
                    if (group) {
                        const groupSettings = getCharacterSettings(group.name);
                        if (groupSettings.injectPrompt) {
                            const groupPrompt = generateImageListPrompt(group.name);
                            if (groupPrompt) prompts.push(groupPrompt);
                        }

                        // Also inject member image lists if they have injectPrompt enabled
                        const memberNames = getGroupMemberNames(group.members);
                        for (const memberName of memberNames) {
                            const memberSettings = getCharacterSettings(memberName);
                            if (memberSettings.injectPrompt) {
                                const memberPrompt = generateImageListPrompt(memberName);
                                if (memberPrompt) prompts.push(memberPrompt);
                            }
                        }
                    }
                } else {
                    // Single character chat
                    const charName = getCurrentCharacterName();
                    if (charName) {
                        const charSettings = getCharacterSettings(charName);
                        if (charSettings.injectPrompt) {
                            const prompt = generateImageListPrompt(charName);
                            if (prompt) prompts.push(prompt);
                        }
                    }
                }

                if (prompts.length === 0) return;

                // Inject into extension prompt (Author's Note style)
                const combinedPrompt = prompts.join('\n\n');
                const extensionPrompt = context.extensionPrompts?.['LocalImage'];
                if (extensionPrompt === undefined) {
                    // Register our extension prompt
                    context.setExtensionPrompt(EXTENSION_NAME, combinedPrompt, 1, 0); // position 1 = after main prompt, depth 0
                }
            });
        }

        // Strip ::img:: tags from chat messages before sending to AI
        // This ensures tags are hidden from the AI while still rendering in the UI
        if (context.eventTypes.CHAT_COMPLETION_PROMPT_READY) {
            context.eventSource.on(context.eventTypes.CHAT_COMPLETION_PROMPT_READY, (data) => {
                if (!data || !data.messages) return;

                // Strip ::img:: tags from all message content
                for (const message of data.messages) {
                    if (message.content && typeof message.content === 'string') {
                        message.content = stripImageTags(message.content);
                    }
                    // Handle array content (for multimodal messages)
                    if (Array.isArray(message.content)) {
                        for (const part of message.content) {
                            if (part.type === 'text' && part.text) {
                                part.text = stripImageTags(part.text);
                            }
                        }
                    }
                }
                console.log(`[${EXTENSION_NAME}] Stripped ::img:: tags from prompt`);
            });
        }
    }

    // Add buttons if chat already active
    setTimeout(() => {
        onChatChanged();
        // Always try to add persona button
        addPersonaGalleryButton();
    }, 100);

    // Fallback: Use MutationObserver to detect chat changes
    // This helps when CHAT_CHANGED event doesn't fire for our extension
    let lastGroupId = null;
    let lastCharacterId = null;

    const checkAndUpdateButton = () => {
        try {
            const context = SillyTavern.getContext();
            const currentGroupId = context.groupId;
            const currentCharacterId = context.characterId;

            // Check if context changed
            if (currentGroupId !== lastGroupId || currentCharacterId !== lastCharacterId) {
                console.log(`[${EXTENSION_NAME}] Context changed - groupId: ${lastGroupId} -> ${currentGroupId}, characterId: ${lastCharacterId} -> ${currentCharacterId}`);
                lastGroupId = currentGroupId;
                lastCharacterId = currentCharacterId;
                onChatChanged();
            } else {
                // Also check if button is missing
                const existingButton = document.getElementById(BUTTON_ID);
                if (!existingButton) {
                    const chatElement = document.getElementById('chat');
                    if (chatElement && chatElement.children.length > 0) {
                        console.log(`[${EXTENSION_NAME}] Button missing, re-adding`);
                        onChatChanged();
                    }
                }
            }
        } catch (e) {
            console.error(`[${EXTENSION_NAME}] Error in checkAndUpdateButton:`, e);
        }
    };

    // Run immediately on init
    console.log(`[${EXTENSION_NAME}] Setting up polling and observers`);
    setTimeout(checkAndUpdateButton, 500);

    const chatObserver = new MutationObserver((mutations) => {
        checkAndUpdateButton();
    });

    // Observe the chat container for changes
    const chatContainer = document.getElementById('chat');
    if (chatContainer) {
        chatObserver.observe(chatContainer, { childList: true, subtree: false });
        console.log(`[${EXTENSION_NAME}] MutationObserver watching chat container`);
    }

    // Also observe the sheld container which changes when switching chat types
    const sheldContainer = document.getElementById('sheld');
    if (sheldContainer) {
        chatObserver.observe(sheldContainer, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        console.log(`[${EXTENSION_NAME}] MutationObserver watching sheld container`);
    }

    // Retry after DOM is more ready if containers weren't found
    setTimeout(() => {
        if (!chatContainer) {
            const delayedChat = document.getElementById('chat');
            if (delayedChat) {
                chatObserver.observe(delayedChat, { childList: true, subtree: false });
                console.log(`[${EXTENSION_NAME}] MutationObserver watching chat container (delayed)`);
            }
        }
        if (!sheldContainer) {
            const delayedSheld = document.getElementById('sheld');
            if (delayedSheld) {
                chatObserver.observe(delayedSheld, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
                console.log(`[${EXTENSION_NAME}] MutationObserver watching sheld container (delayed)`);
            }
        }
        // Do an initial check
        checkAndUpdateButton();
    }, 1000);

    // Also poll every 2 seconds as ultimate fallback
    setInterval(checkAndUpdateButton, 2000);

    console.log(`[${EXTENSION_NAME}] Extension initialized`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
