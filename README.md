# SillyTavern-LocalImage

**Tired of being limited to AI-generated images? Now use your own images—locations, objects, outfits, scenes, anything—with custom descriptors that the AI can choose from contextually.**

LocalImage lets you upload your own images for each character and assign memorable names to them. Show the character's bedroom, their favorite weapon, a map of their kingdom, or their various outfits. The AI can then display these images in chat by using simple tags—creating a more personalized and immersive roleplay experience.

![Gallery Preview](https://img.shields.io/badge/SillyTavern-Extension-purple)

## Features

- **Per-Character Image Galleries** - Each character has their own image library
- **Persona/User Images** - Your persona can also have images (use `::img YourName pic::` or `::img {{user}} pic::`)
- **Any Type of Image** - Locations (bedroom, throne room), objects (weapons, artifacts), outfits, scenes, expressions—anything!
- **Custom Image Names & Descriptions** - Assign names like "bedroom", "enchanted_sword", or "armor" with descriptions to help the AI choose contextually
- **Auto-Assign on Upload** - Images automatically get their filename as the default name and description (editable by clicking the image)
- **Custom Injection Prompts** - Create, edit, and delete custom prompt templates with `{{char}}` placeholder support
- **Prompt Preview** - See exactly what will be injected into the AI prompt, including your full image list
- **Automatic Prompt Injection** - Optionally inject your image list directly into the prompt (no manual character card editing needed!)
- **AI-Driven Image Display** - The AI chooses which image to show based on context
- **Hidden from AI** - Image tags are automatically stripped from messages sent to the AI, so it only sees the rendered result
- **Simple Tag Syntax** - `::img CharacterName imagename::` or `::img {{user}} imagename::`
- **Group Chat Support** - Coming soon!
- **Mobile Friendly** - Access via SillyTavern's web interface on any device
- **Drag & Drop Upload** - Easy batch image management

## Installation

### From URL (Recommended)
1. Open SillyTavern
2. Go to **Extensions** > **Install Extension**
3. Enter: `https://github.com/mechamarmot/SillyTavern-LocalImage`
4. Click Install

### Manual Installation
1. Download or clone this repository
2. Copy the folder to `SillyTavern/data/<user>/extensions/`
3. Restart SillyTavern

## Quick Start

### 1. Upload Images

**For Characters:**
- Select a character
- Click the **gallery icon** in the character panel (next to the export button)
- Upload images via drag & drop or the upload button
- Images are automatically named after their filename
- Click any image to edit its **name** and **description**

**For Your Persona:**
- Open the **Persona Management** panel (click your name/avatar at top)
- Click the **gallery icon** in the persona controls row
- Same upload and assignment process as characters

### 2. Enable Automatic Prompt Injection (Recommended)
- In the gallery, click the **gear icon** to open settings
- Enable **"Inject image list into prompt"**
- Optionally select or create a custom prompt template
- Preview shows exactly what will be sent to the AI
- The extension will automatically tell the AI about your available images!

**OR** manually add instructions to your character card (see [Manual Instructions](#where-to-put-ai-instructions) below).

### 3. Let the AI Choose
The AI will now include image tags in its responses based on context:

> *She couldn't help but smile at your joke.* ::img Seraphina happy::
>
> "That's the funniest thing I've heard all day!"

The tag is automatically replaced with the actual image in the chat.

## Tag Syntax

```
::img CharacterName imagename::
```

- **CharacterName** - The exact name of the character (case-sensitive), or use `{{char}}` or `{{user}}` macros
- **imagename** - The name you assigned to the image (case-sensitive, no spaces)

### Examples
| Tag | Description |
|-----|-------------|
| `::img Seraphina bedroom::` | Shows Seraphina's bedroom |
| `::img Seraphina sword::` | Shows Seraphina's sword |
| `::img Alice throne_room::` | Shows Alice's throne room |
| `::img {{char}} angry::` | Uses the current character's name (useful in character cards) |
| `::img {{user}} photo::` | Shows the user/persona's image named "photo" |
| `::img John my_car::` | Shows persona John's car image |

## Custom Prompt Templates

The settings panel lets you create custom prompts for how your image list is presented to the AI:

1. Click the **gear icon** in the gallery
2. Use the dropdown to select "Default" or any custom prompt
3. Click **Add** to create a new template, **Edit** to modify, or **Delete** to remove
4. Use `{{char}}` in your template - it will be replaced with the character/persona name
5. The **Preview** shows the full prompt that will be injected, including your image list

**Example custom template:**
```
{{char}} can display the following images when contextually appropriate:
```

## Best Practices

### Naming Your Images

The AI can't see your images—it only knows the names and descriptions you assign. **Good names and descriptions help the AI choose appropriately.**

| Less Helpful | More Helpful |
|----------------|-----------------|
| img1, img2, img3 | bedroom, kitchen, garden |
| pic_a, pic_b | sword, spellbook, armor |
| 001, 002 | casual_outfit, battle_armor, evening_gown |
| test, new | throne_room, dungeon, marketplace |

**Note:** Image names cannot contain spaces. Use underscores instead: `throne_room`, `battle_armor`

### Writing Descriptions

Descriptions appear in the prompt to help the AI understand when to use each image. Be specific:

| Name | Good Description |
|------|------------------|
| bedroom | cozy room with four-poster bed and moonlight through window |
| sword | ancient enchanted blade with glowing runes |
| throne_room | ornate golden throne in a grand marble hall |
| angry | fierce glare with clenched fists, ready to fight |
| tavern | crowded inn with roaring fireplace and wooden tables |

### Where to Put AI Instructions

> **Note:** If you enable "Inject image list into prompt" in settings, you don't need to manually add instructions! The extension handles it automatically.

For manual setup:

**Character Card (Description/Personality)** - Best for character-specific images:
```
You can display images using ::img {{char}} imagename:: tags.

Available images:
- bedroom: my private chambers with canopy bed
- sword: my enchanted blade, Moonfire
- happy: bright smile
- angry: fierce battle-ready glare

Use these naturally when the scene or mood matches.
```

**Author's Note** - Good for global instructions across all chats:
```
[Display character images using ::img CharName imagename:: to show locations, objects, or expressions when contextually appropriate. Don't overuse - max one image per response.]
```

### Using {{user}} for Persona Images

To let the AI show YOUR images (persona), add instructions like:

**In Character Card or Author's Note:**
```
{{user}} can also display images using ::img {{user}} imagename:: tags.
Available images for {{user}}:
- my_room: the user's messy apartment
- my_car: red sports car
```

The `{{user}}` macro will be replaced with your persona name. So if your persona is "John", the AI will output `::img John my_car::` which displays your image.

### Group Chats

**Group chat gallery support is coming soon!** Individual character images still work in group chats - each character can display their own images using `::img CharacterName imagename::` syntax.

## Troubleshooting

### Images not displaying?

1. **Check "Forbid External Media"** - Go to User Settings and make sure this is **unchecked**
2. **Verify the image name** - Names are case-sensitive. "Happy" ≠ "happy"
3. **Check character name** - Must match exactly, including spaces
4. **No spaces in image names** - Use underscores: `throne_room` not `throne room`
5. **Refresh the page** - Sometimes a refresh helps after uploading new images

### Gallery button not appearing?

- Make sure you have a character selected (not in the main menu)
- Group chat gallery is coming soon - button only appears in 1-on-1 chats currently
- Try refreshing the page
- Check the browser console for errors (F12)

### Images showing as broken?

- The image may have been deleted from the server
- Try re-uploading the image and reassigning the name

## How It Works

1. Images are stored in `SillyTavern/data/<user>/images/<CharacterName>/`
2. Name assignments and settings are saved in extension settings
3. When enabled, the image list is injected into the AI prompt before generation
4. When a message renders, the extension scans for `::img X Y::` tags
5. Matching tags are replaced with the actual image
6. Tags are stripped from messages sent to the AI (so it doesn't see raw tags in chat history)

## Compatibility

- **SillyTavern**: 1.12.0+
- **Works with**: STLE and most other extensions
- **Mobile**: Fully functional via web browser

## Development

### Prerequisites
- Node.js 18+
- npm

### Build
```bash
npm install
npm run build
```

The compiled extension outputs to `dist/`.

## License

MIT License - Feel free to modify and share!

## Credits

Created by [mechamarmot](https://github.com/mechamarmot)

---

**Enjoy more immersive roleplays with your own custom images!**
