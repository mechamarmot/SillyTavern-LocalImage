# SillyTavern-LocalImage

**Tired of being limited to AI-generated images? Now use your own images—locations, objects, outfits, scenes, anything—with custom descriptors that the AI can choose from contextually.**

LocalImage lets you upload your own images for each character and assign memorable names to them. Show the character's bedroom, their favorite weapon, a map of their kingdom, or their various outfits. The AI can then display these images in chat by using simple tags—creating a more personalized and immersive roleplay experience.

![Gallery Preview](https://img.shields.io/badge/SillyTavern-Extension-purple)

## Features

- **Per-Character Image Galleries** - Each character has their own image library
- **Persona/User Images Too** - Your persona can also have images (use `::img YourName pic::` or `::img {{user}} pic::`)
- **Any Type of Image** - Locations (bedroom, throne room), objects (weapons, artifacts), outfits, scenes, expressions—anything!
- **Custom Image Names & Descriptions** - Assign names like "bedroom", "enchanted_sword", or "armor" with descriptions to help the AI choose
- **Automatic Prompt Injection** - Optionally inject your image list directly into the prompt (no manual character card editing needed!)
- **AI-Driven Image Display** - The AI chooses which image to show based on context
- **Simple Tag Syntax** - `::img CharacterName imagename::` or `::img {{user}} imagename::`
- **Works in Group Chats** - Each character can display their own images
- **Mobile Friendly** - Access via SillyTavern's web interface on any device
- **Drag & Drop Upload** - Easy image management

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
- Assign a **name** and **description** to each image when prompted

**For Your Persona:**
- Open the **Persona Management** panel (click your name/avatar at top)
- Click the **gallery icon** in the persona controls row
- Same upload and assignment process as characters

### 2. Enable Automatic Prompt Injection (Recommended)
- In the gallery, click the **gear icon** to open settings
- Enable **"Inject image list into prompt"**
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

- **CharacterName** - The exact name of the character (case-sensitive)
- **imagename** - The name you assigned to the image (case-sensitive)

### Examples
| Tag | Description |
|-----|-------------|
| `::img Seraphina bedroom::` | Shows Seraphina's bedroom |
| `::img Seraphina sword::` | Shows Seraphina's sword |
| `::img Alice throne_room::` | Shows Alice's throne room |
| `::img {{char}} angry::` | Uses the current character's name (useful in character cards) |
| `::img {{user}} photo::` | Shows the user/persona's image named "photo" |
| `::img John my_car::` | Shows persona John's car image |

## Best Practices

### Naming Your Images

The AI can't see your images—it only knows the names and descriptions you assign. **Good names and descriptions help the AI choose appropriately.**

| ❌ Less Helpful | ✅ More Helpful |
|----------------|-----------------|
| img1, img2, img3 | bedroom, kitchen, garden |
| pic_a, pic_b | sword, spellbook, armor |
| 001, 002 | casual_outfit, battle_armor, evening_gown |
| test, new | throne_room, dungeon, marketplace |

### Writing Descriptions

Descriptions appear in the prompt to help the AI understand when to use each image. Be specific:

| Name | Good Description |
|------|------------------|
| bedroom | cozy room with four-poster bed and moonlight through window |
| sword | ancient enchanted blade with glowing runes |
| throne_room | ornate golden throne in a grand marble hall |
| angry | fierce glare with clenched fists, ready to fight |
| tavern | crowded inn with roaring fireplace and wooden tables |

### Custom Prefix (Optional)

In the settings panel, you can customize how the image list is presented to the AI:

**Default:**
```
[Available images for Seraphina (use ::img Seraphina name:: to display):
- bedroom: cozy room with four-poster bed
- sword: ancient enchanted blade with glowing runes
- angry: fierce glare, ready to fight]
```

**Custom prefix example:**
```
When appropriate, show one of these images:
```

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

Each character in a group can have their own image library and settings. With automatic prompt injection enabled for each character, the AI will know about everyone's available images.

For manual setup, add instructions to each character's card:

**Alice's card:**
```
Your available images: ::img Alice throne_room::, ::img Alice sword::, ::img Alice happy::, ::img Alice serious::
Use these tags when showing locations, objects, or expressions.
```

**Bob's card:**
```
Your available images: ::img Bob workshop::, ::img Bob invention::, ::img Bob confident::, ::img Bob nervous::
Use these tags when showing locations, objects, or expressions.
```

## Troubleshooting

### Images not displaying?

1. **Check "Forbid External Media"** - Go to User Settings and make sure this is **unchecked**
2. **Verify the image name** - Names are case-sensitive. "Happy" ≠ "happy"
3. **Check character name** - Must match exactly, including spaces
4. **Refresh the page** - Sometimes a refresh helps after uploading new images

### Gallery button not appearing?

- Make sure you have a character selected (not in the main menu)
- Try refreshing the page
- Check the browser console for errors (F12)

### Images showing as broken?

- The image may have been deleted from the server
- Try re-uploading the image and reassigning the name

## How It Works

1. Images are stored in `SillyTavern/data/<user>/images/<CharacterName>/`
2. Name assignments are saved in extension settings
3. When a message renders, the extension scans for `::img X Y::` tags
4. Matching tags are replaced with the actual image

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
