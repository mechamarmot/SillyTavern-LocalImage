/* global SillyTavern */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Get request headers for ST API calls
 */
function getRequestHeaders() {
    return SillyTavern.getContext().getRequestHeaders();
}

/**
 * Image Options Menu Component
 */
function ImageOptionsMenu({ image, position, onClose, onView, onAssign, onEditDescription, onRename, onDelete, assignmentName, assignmentDescription }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="local-image-options-menu"
            style={{
                top: position.y,
                left: position.x,
            }}
        >
            <div className="options-menu-item" onClick={() => { onView(); onClose(); }}>
                <i className="fa-solid fa-expand"></i> View Full Size
            </div>
            <div className="options-menu-item" onClick={() => { onAssign(); onClose(); }}>
                <i className="fa-solid fa-tag"></i> {assignmentName ? 'Change Name' : 'Assign Name'}
            </div>
            {assignmentName && (
                <div className="options-menu-item" onClick={() => { onEditDescription(); onClose(); }}>
                    <i className="fa-solid fa-align-left"></i> {assignmentDescription ? 'Edit Description' : 'Add Description'}
                </div>
            )}
            {assignmentName && (
                <div className="options-menu-item" onClick={() => { onRename(); onClose(); }}>
                    <i className="fa-solid fa-xmark"></i> Remove Assignment
                </div>
            )}
            <div className="options-menu-item options-menu-item-danger" onClick={() => { onDelete(); onClose(); }}>
                <i className="fa-solid fa-trash"></i> Delete
            </div>
        </div>
    );
}

/**
 * Settings Panel Component
 */
function SettingsPanel({ characterName, settings, customPrompts, assignments, onSave, onAddPrompt, onEditPrompt, onDeletePrompt }) {
    const [injectPrompt, setInjectPrompt] = useState(settings.injectPrompt || false);
    const [selectedPromptId, setSelectedPromptId] = useState(settings.selectedPromptId || 'default');
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [promptName, setPromptName] = useState('');
    const [promptTemplate, setPromptTemplate] = useState('');

    const defaultTemplate = `Available images for ${characterName} (use ::img ${characterName} name:: to display):`;

    // Generate the full preview with image list
    const generatePreview = (template) => {
        const prefix = template.replace(/\{\{char\}\}/gi, characterName);
        const imageNames = Object.keys(assignments || {});
        if (imageNames.length === 0) {
            return `[${prefix}\n(no images assigned yet)]`;
        }
        const lines = imageNames.map(name => {
            const assignment = assignments[name];
            const desc = typeof assignment === 'object' ? assignment.description : '';
            return desc ? `- ${name}: ${desc}` : `- ${name}`;
        });
        return `[${prefix}\n${lines.join('\n')}]`;
    };

    const handlePromptChange = (e) => {
        const newId = e.target.value;
        setSelectedPromptId(newId);
        onSave({ injectPrompt, selectedPromptId: newId });
    };

    const handleAddNew = () => {
        setEditingPrompt(null);
        setPromptName('');
        setPromptTemplate(defaultTemplate);
        setShowPromptEditor(true);
    };

    const handleEdit = () => {
        if (selectedPromptId === 'default') return;
        const prompt = customPrompts.find(p => p.id === selectedPromptId);
        if (prompt) {
            setEditingPrompt(prompt);
            setPromptName(prompt.name);
            setPromptTemplate(prompt.template);
            setShowPromptEditor(true);
        }
    };

    const handleDelete = () => {
        if (selectedPromptId === 'default') return;
        if (confirm('Delete this prompt template?')) {
            onDeletePrompt(selectedPromptId);
            setSelectedPromptId('default');
            onSave({ injectPrompt, selectedPromptId: 'default' });
        }
    };

    const handleSavePrompt = () => {
        if (!promptName.trim() || !promptTemplate.trim()) return;

        if (editingPrompt) {
            onEditPrompt(editingPrompt.id, promptName.trim(), promptTemplate.trim());
        } else {
            const newId = onAddPrompt(promptName.trim(), promptTemplate.trim());
            setSelectedPromptId(newId);
            onSave({ injectPrompt, selectedPromptId: newId });
        }
        setShowPromptEditor(false);
    };

    const handleCancelEdit = () => {
        setShowPromptEditor(false);
        setEditingPrompt(null);
        setPromptName('');
        setPromptTemplate('');
    };

    return (
        <div className="local-image-settings">
            <div className="settings-row">
                <label className="settings-checkbox">
                    <input
                        type="checkbox"
                        checked={injectPrompt}
                        onChange={(e) => {
                            setInjectPrompt(e.target.checked);
                            onSave({ injectPrompt: e.target.checked, selectedPromptId });
                        }}
                    />
                    <span>Inject image list into prompt</span>
                </label>
            </div>
            {injectPrompt && !showPromptEditor && (
                <div className="settings-row">
                    <label className="settings-label">Prompt template:</label>
                    <div className="settings-prompt-row">
                        <select
                            className="settings-select"
                            value={selectedPromptId}
                            onChange={handlePromptChange}
                        >
                            <option value="default">Default</option>
                            {customPrompts.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button className="settings-btn" onClick={handleAddNew} title="Add new">
                            <i className="fa-solid fa-plus"></i>
                        </button>
                        <button
                            className="settings-btn"
                            onClick={handleEdit}
                            disabled={selectedPromptId === 'default'}
                            title="Edit"
                        >
                            <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                            className="settings-btn settings-btn-danger"
                            onClick={handleDelete}
                            disabled={selectedPromptId === 'default'}
                            title="Delete"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    <div className="settings-preview">
                        <span className="settings-preview-label">Preview (what gets injected into prompt):</span>
                        <pre className="settings-preview-text">
                            {generatePreview(
                                selectedPromptId === 'default'
                                    ? defaultTemplate
                                    : customPrompts.find(p => p.id === selectedPromptId)?.template || defaultTemplate
                            )}
                        </pre>
                    </div>
                </div>
            )}
            {injectPrompt && showPromptEditor && (
                <div className="settings-row settings-editor">
                    <label className="settings-label">
                        {editingPrompt ? 'Edit Prompt Template' : 'New Prompt Template'}
                    </label>
                    <input
                        type="text"
                        className="settings-input"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                        placeholder="Template name"
                    />
                    <textarea
                        className="settings-textarea"
                        value={promptTemplate}
                        onChange={(e) => setPromptTemplate(e.target.value)}
                        placeholder="Template text (use {{char}} for character name)"
                        rows={3}
                    />
                    <div className="settings-editor-hint">
                        Use <code>{'{{char}}'}</code> to insert the character name
                    </div>
                    <div className="settings-editor-actions">
                        <button className="settings-btn settings-btn-primary" onClick={handleSavePrompt}>
                            Save
                        </button>
                        <button className="settings-btn" onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Gallery Modal Component
 */
function Gallery({ characterName, onClose, assignments, characterSettings, customPrompts, onAssign, onUnassign, onUpdateDescription, onSaveSettings, onAddPrompt, onEditPrompt, onDeletePrompt, isPersona = false }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [optionsMenu, setOptionsMenu] = useState(null);
    const [error, setError] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const fileInputRef = useRef(null);

    const folder = characterName;
    const entityType = isPersona ? 'Persona' : 'Character';
    const tagExample = `::img ${characterName} name::`;

    /**
     * Fetch images from the server
     */
    const fetchImages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/images/list', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    folder: folder,
                    sortField: 'date',
                    sortOrder: 'desc',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const imageList = data.map((file) => ({
                    name: file,
                    src: `user/images/${folder}/${file}`,
                }));
                setImages(imageList);
            } else {
                setImages([]);
            }
        } catch (e) {
            console.error('Failed to fetch images:', e);
            setError('Failed to load images');
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, [folder]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    /**
     * Handle file upload
     */
    const handleUpload = useCallback(async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        const uploadedImages = [];

        for (const file of files) {
            try {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result;
                        const base64Data = result.split(',')[1];
                        resolve(base64Data);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const ext = file.name.split('.').pop().toLowerCase();
                const filename = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_');

                const response = await fetch('/api/images/upload', {
                    method: 'POST',
                    headers: getRequestHeaders(),
                    body: JSON.stringify({
                        image: base64,
                        ch_name: folder,
                        filename: filename,
                        format: ext,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
                }

                const uploadedPath = `user/images/${folder}/${filename}.${ext}`;
                uploadedImages.push({ filename: `${filename}.${ext}`, path: uploadedPath });
            } catch (e) {
                console.error('Failed to upload image:', e);
                setError(`Failed to upload ${file.name}: ${e.message}`);
            }
        }

        setUploading(false);
        await fetchImages();

        // Auto-assign filename (without extension) as both name and description
        for (const img of uploadedImages) {
            // Remove extension and replace spaces with underscores
            const nameFromFile = img.filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
            onAssign(nameFromFile, img.path, nameFromFile);
        }
    }, [folder, fetchImages, onAssign]);

    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files);
        handleUpload(files);
        e.target.value = '';
    }, [handleUpload]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        handleUpload(files);
    }, [handleUpload]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    /**
     * Handle image delete
     */
    const handleDelete = useCallback(async (image) => {
        if (!confirm(`Delete ${image.name}?`)) return;

        try {
            const response = await fetch('/api/images/delete', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    path: image.src,
                }),
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            // Remove any assignments for this image
            const assignmentName = Object.keys(assignments || {}).find(key => {
                const val = assignments[key];
                const path = typeof val === 'string' ? val : val?.path;
                return path === image.src;
            });
            if (assignmentName) {
                onUnassign(assignmentName);
            }

            fetchImages();
        } catch (e) {
            console.error('Failed to delete image:', e);
            setError('Failed to delete image');
        }
    }, [fetchImages, assignments, onUnassign]);

    /**
     * Handle assigning a name to an image
     */
    const handleAssign = useCallback((image) => {
        const currentName = Object.keys(assignments || {}).find(key => {
            const val = assignments[key];
            const path = typeof val === 'string' ? val : val?.path;
            return path === image.src;
        });
        const currentAssignment = currentName ? assignments[currentName] : null;
        const currentDesc = currentAssignment && typeof currentAssignment === 'object' ? currentAssignment.description : '';

        let name = prompt(`Enter a name for this image (used in ::img ${characterName} name:: tag):`, currentName || '');
        if (name && name.trim()) {
            // Replace spaces with underscores (image names cannot have spaces)
            name = name.trim().replace(/\s+/g, '_');
            // Remove old assignment if name changed
            if (currentName && currentName !== name) {
                onUnassign(currentName);
            }
            // Prompt for description if new assignment
            let description = currentDesc;
            if (!currentName) {
                description = prompt('Enter a description (helps AI choose when to use this image):') || '';
            }
            onAssign(name, image.src, description);
        }
    }, [assignments, onAssign, onUnassign]);

    /**
     * Handle editing description
     */
    const handleEditDescription = useCallback((image) => {
        const currentName = Object.keys(assignments || {}).find(key => {
            const val = assignments[key];
            const path = typeof val === 'string' ? val : val?.path;
            return path === image.src;
        });
        if (!currentName) return;

        const currentAssignment = assignments[currentName];
        const currentDesc = typeof currentAssignment === 'object' ? currentAssignment.description : '';

        const description = prompt('Enter a description (helps AI choose when to use this image):', currentDesc);
        if (description !== null) {
            onUpdateDescription(currentName, description.trim());
        }
    }, [assignments, onUpdateDescription]);

    /**
     * Get assignment info for an image
     */
    const getAssignmentInfo = useCallback((imageSrc) => {
        if (!assignments) return { name: null, description: '' };
        const name = Object.keys(assignments).find(key => {
            const val = assignments[key];
            const path = typeof val === 'string' ? val : val?.path;
            return path === imageSrc;
        });
        if (!name) return { name: null, description: '' };
        const assignment = assignments[name];
        const description = typeof assignment === 'object' ? assignment.description : '';
        return { name, description };
    }, [assignments]);

    /**
     * Handle image click - show options menu
     */
    const handleImageClick = useCallback((e, image) => {
        e.preventDefault();
        e.stopPropagation();

        const menuWidth = 180;
        const menuHeight = 200;

        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        setOptionsMenu({
            image,
            position: { x, y }
        });
    }, []);

    /**
     * Handle backdrop click to close
     */
    const handleBackdropClick = useCallback((e) => {
        if (e.target.classList.contains('local-image-modal-backdrop')) {
            onClose();
        }
    }, [onClose]);

    // Count assigned images
    const assignedCount = Object.keys(assignments || {}).length;

    return (
        <div
            className="local-image-modal-backdrop"
            onClick={handleBackdropClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="local-image-modal" onClick={() => setOptionsMenu(null)}>
                <div className="local-image-modal-header">
                    <h3>{isPersona ? 'My Images' : 'Local Images'} - {characterName}</h3>
                    <div className="local-image-modal-actions">
                        <button
                            className={`menu_button ${showSettings ? 'menu_button_active' : ''}`}
                            onClick={() => setShowSettings(!showSettings)}
                            title="Settings"
                        >
                            <i className="fa-solid fa-gear"></i>
                        </button>
                        <button
                            className="menu_button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            title="Upload Images"
                        >
                            <i className="fa-solid fa-upload"></i>
                        </button>
                        <button className="menu_button" onClick={onClose} title="Close">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>

                {showSettings && (
                    <SettingsPanel
                        characterName={characterName}
                        settings={characterSettings}
                        customPrompts={customPrompts}
                        assignments={assignments}
                        onSave={onSaveSettings}
                        onAddPrompt={onAddPrompt}
                        onEditPrompt={onEditPrompt}
                        onDeletePrompt={onDeletePrompt}
                    />
                )}

                {error && (
                    <div className="local-image-error">
                        {error}
                    </div>
                )}

                <div className="local-image-info">
                    <span>Use <code>{'::img ' + characterName + ' name::'}</code> in messages.</span>
                    {assignedCount > 0 && (
                        <span className="assigned-count">{assignedCount} image{assignedCount !== 1 ? 's' : ''} assigned</span>
                    )}
                </div>

                <div className="local-image-modal-content">
                    {loading ? (
                        <div className="local-image-loading">Loading...</div>
                    ) : images.length === 0 ? (
                        <div className="local-image-empty">
                            <p>No images yet</p>
                            <p>Drag and drop images here or click upload</p>
                        </div>
                    ) : (
                        <div className="local-image-grid">
                            {images.map((image, index) => {
                                const { name: assignmentName, description } = getAssignmentInfo(image.src);
                                return (
                                    <div
                                        key={index}
                                        className={`local-image-item ${assignmentName ? 'assigned' : ''}`}
                                        onClick={(e) => handleImageClick(e, image)}
                                        title={description || assignmentName || image.name}
                                    >
                                        <img src={image.src} alt={image.name} loading="lazy" />
                                        {assignmentName && (
                                            <div className="assignment-label">
                                                <span className="assignment-name">{assignmentName}</span>
                                                {description && <span className="assignment-desc">{description}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {uploading && (
                    <div className="local-image-uploading">
                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                    </div>
                )}
            </div>

            {optionsMenu && (
                <ImageOptionsMenu
                    image={optionsMenu.image}
                    position={optionsMenu.position}
                    assignmentName={getAssignmentInfo(optionsMenu.image.src).name}
                    assignmentDescription={getAssignmentInfo(optionsMenu.image.src).description}
                    onClose={() => setOptionsMenu(null)}
                    onView={() => setSelectedImage(optionsMenu.image)}
                    onAssign={() => handleAssign(optionsMenu.image)}
                    onEditDescription={() => handleEditDescription(optionsMenu.image)}
                    onRename={() => {
                        const name = getAssignmentInfo(optionsMenu.image.src).name;
                        if (name) onUnassign(name);
                    }}
                    onDelete={() => handleDelete(optionsMenu.image)}
                />
            )}

            {selectedImage && (
                <div
                    className="local-image-lightbox"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage.src} alt={selectedImage.name} />
                    <button
                        className="lightbox-close"
                        onClick={() => setSelectedImage(null)}
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Gallery;
