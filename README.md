# SillyTavern-LocalImage

**Use your own images in SillyTavern chats—locations, objects, outfits, expressions, anything you want!**

LocalImage lets you upload images for each character (and your persona) and assign memorable names to them. Show a character's bedroom, their favorite weapon, a map of their kingdom, or their various outfits. Display images instantly with a floating quick-send button, or let the AI choose which images to show based on context.

![Gallery Preview](https://img.shields.io/badge/SillyTavern-Extension-purple)

## Features

- **Per-Character Image Galleries** - Each character has their own image library
- **Persona/User Images** - Your persona can also have images (use `::img YourName pic::` or `::img {{user}} pic::`)
- **Quick Image Send** - Floating button for instant image sending without typing tags
- **Any Type of Image** - Locations, objects, outfits, scenes, expressions—anything!
- **Custom Image Names & Descriptions** - Assign names like "bedroom", "enchanted_sword", or "armor" with descriptions
- **AI-Driven Image Display** - The AI can choose which image to show based on context
- **Simple Tag Syntax** - `::img CharacterName imagename::` or `::img {{user}} imagename::`
- **Hidden from AI** - Image tags are automatically stripped from messages sent to the AI
- **Mobile Friendly** - Works on any device via SillyTavern's web interface
- **Drag & Drop Upload** - Easy batch image management

### Coming Soon
- **Group Chat Gallery** - Dedicated gallery for group chats
- **Automatic Prompt Injection** - Auto-inject image lists into AI prompts

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

### 2. Quick Send Images

The easiest way to send images:

1. Look for the **floating image button** in the bottom-right corner of the chat
2. Click it to open the **Quick Image Send** panel
3. Select an image from the dropdown for any character or your persona
4. Click the **send button** to instantly insert the image as a narrator message

This sends the image without triggering an AI response—perfect for setting scenes or showing something specific.

### 3. Let the AI Choose (Manual Setup)

Add instructions to your character card to let the AI display images contextually:

**In Character Card (Description/Personality):**
```
You can display images using ::img {{char}} imagename:: tags.

Available images:
- bedroom: my private chambers with canopy bed
- sword: my enchanted blade, Moonfire
- happy: bright smile
- angry: fierce battle-ready glare

Use these naturally when the scene or mood matches.
```

The AI will then include image tags in its responses:

> *She couldn't help but smile at your joke.* ::img Seraphina happy::
>
> "That's the funniest thing I've heard all day!"

The tag is automatically replaced with the actual image in the chat.

## Tag Syntax

```
::img CharacterName imagename::
```

- **CharacterName** - The exact name of the character (can include spaces), or use `{{char}}` or `{{user}}` macros
- **imagename** - The name you assigned to the image (no spaces—use underscores)

### Examples
| Tag | Description |
|-----|-------------|
| `::img Seraphina bedroom::` | Shows Seraphina's bedroom |
| `::img Seraphina sword::` | Shows Seraphina's sword |
| `::img Alice throne_room::` | Shows Alice's throne room |
| `::img {{char}} angry::` | Uses the current character's name |
| `::img {{user}} photo::` | Shows the user/persona's image |
| `::img John Smith my_car::` | Character names can have spaces |

## Best Practices

### Naming Your Images

The AI can't see your images—it only knows the names and descriptions you assign. **Good names and descriptions help the AI choose appropriately.**

| Less Helpful | More Helpful |
|----------------|-----------------|
| img1, img2, img3 | bedroom, kitchen, garden |
| pic_a, pic_b | sword, spellbook, armor |
| 001, 002 | casual_outfit, battle_armor |

**Note:** Image names cannot contain spaces. Use underscores instead: `throne_room`, `battle_armor`

### Writing Descriptions

Descriptions help the AI understand when to use each image:

| Name | Good Description |
|------|------------------|
| bedroom | cozy room with four-poster bed and moonlight |
| sword | ancient enchanted blade with glowing runes |
| angry | fierce glare with clenched fists |

### Using {{user}} for Persona Images

To let the AI show YOUR images, add instructions like:

```
{{user}} can also display images using ::img {{user}} imagename:: tags.
Available images for {{user}}:
- my_room: the user's apartment
- my_car: red sports car
```

The `{{user}}` macro will be replaced with your persona name.

## Troubleshooting

### Images not displaying?

1. **Check "Forbid External Media"** - Go to User Settings and make sure this is **unchecked**
2. **Verify the image name** - Names are case-sensitive. "Happy" ≠ "happy"
3. **Check character name** - Must match exactly, including spaces
4. **No spaces in image names** - Use underscores: `throne_room` not `throne room`
5. **Refresh the page** - Sometimes a refresh helps after uploading new images

### Gallery button not appearing?

- Make sure you have a character selected
- Group chat gallery is coming soon—button only appears in 1-on-1 chats currently
- Try refreshing the page
- Check the browser console for errors (F12)

### Quick Send button not visible?

- The floating button appears in the bottom-right corner of the chat area
- Make sure you're in a chat (not the main menu)
- Try refreshing the page

## How It Works

1. Images are stored in `SillyTavern/data/<user>/images/<CharacterName>/`
2. Name assignments and settings are saved in extension settings
3. When a message renders, the extension scans for `::img X Y::` tags
4. Matching tags are replaced with the actual image
5. Tags are stripped from messages sent to the AI

## Compatibility

- **SillyTavern**: 1.12.0+
- **Works with**: Most other extensions
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

Created by mechamarmot

---

**Enjoy more immersive roleplays with your own custom images!**
