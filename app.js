require([
    "esri/layers/FeatureLayer",
    "esri/rest/support/AttachmentQuery",
    "esri/rest/support/Query"
], function(FeatureLayer, AttachmentQuery, Query) {

    // ADD THESE LINES AT THE VERY TOP (before state management)
    // Configure trusted servers for CORS
    esriConfig.request.trustedServers.push("https://services.arcgis.com");
    esriConfig.request.trustedServers.push("https://www.arcgis.com");
    esriConfig.request.trustedServers.push("https://services1.arcgis.com");
    esriConfig.request.trustedServers.push("https://services2.arcgis.com");
    esriConfig.request.trustedServers.push("https://services3.arcgis.com");
    // Add your organization's ArcGIS Online URL if different
    esriConfig.request.trustedServers.push("https://maps.srk.com");

    
    // State management
    let currentFeatureId = null;
    let currentAttachment = null;
    let featureLayer = null;
    
    // DOM elements
    const containers = {
        loading: document.getElementById('loading-container'),
        noSelection: document.getElementById('no-selection-container'),
        error: document.getElementById('error-container'),
        attachment: document.getElementById('attachment-container')
    };
    
    const attachmentImage = document.getElementById('attachment-image');
    const caption = document.getElementById('caption');
    const errorMessage = document.getElementById('error-message');
    
    // Modal elements
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.querySelector('.modal-close');
    
    // Initialize the application
    function init() {
        console.log('Initializing Dashboard Attachment Viewer');
        console.log('Config:', config);
        
        // Set up feature layer
        if (config.serviceUrl) {
            const layerUrl = config.layerId !== null 
                ? `${config.serviceUrl}/${config.layerId}`
                : config.serviceUrl;
                
            featureLayer = new FeatureLayer({
                url: layerUrl
            });
            
            console.log('Feature layer initialized:', layerUrl);
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Listen for feature selection from parent window (Dashboard)
        window.addEventListener('message', handleMessage);
        
        // Show initial state
        showState('noSelection');
        
        // Check for initial feature ID in URL
        if (config.featureId) {
            selectFeature(config.featureId);
        }
    }
    
    // Handle messages from parent window
    function handleMessage(event) {
        console.log('Received message:', event.data);
        
        // Verify origin if needed
        // if (event.origin !== 'https://your-arcgis-domain.com') return;
        
        if (event.data && event.data.type === 'feature-selected') {
            const featureId = event.data.featureId || event.data.objectId;
            if (featureId) {
                selectFeature(featureId);
            }
        } else if (event.data && event.data.type === 'selection-cleared') {
            clearSelection();
        }
    }
    
    // Select a feature and load its attachments
    function selectFeature(featureId) {
        console.log('Selecting feature:', featureId);
        currentFeatureId = featureId;
        loadAttachments(featureId);
    }
    
    // Clear selection
    function clearSelection() {
        console.log('Clearing selection');
        currentFeatureId = null;
        currentAttachment = null;
        showState('noSelection');
    }
    
    // Load attachments for a feature
    async function loadAttachments(featureId) {
        if (!featureLayer) {
            showError('Feature layer not configured');
            return;
        }
        
        showState('loading');
        
        try {
            // Query attachments
            const attachmentQuery = new AttachmentQuery({
                objectIds: [featureId]
            });
            
            const attachmentResponse = await featureLayer.queryAttachments(attachmentQuery);
            console.log('Attachment response:', attachmentResponse);
            
            if (attachmentResponse && attachmentResponse[featureId]) {
                const attachments = attachmentResponse[featureId];
                console.log('Found attachments:', attachments);
                
                // Filter attachments based on configuration
                const filteredAttachment = filterAttachments(attachments);
                
                if (filteredAttachment) {
                    displayAttachment(filteredAttachment);
                } else {
                    showError(config.noAttachmentMessage || 'No matching attachment found');
                }
            } else {
                showError(config.noAttachmentMessage || 'No attachments found');
            }
        } catch (error) {
            console.error('Error loading attachments:', error);
            showError('Error loading attachment: ' + error.message);
        }
    }
    
    // Filter attachments based on configuration
    function filterAttachments(attachments) {
        if (!attachments || attachments.length === 0) return null;
        
        console.log('Filtering attachments:', attachments);
        console.log('Filter method:', config.filterMethod);
        console.log('Filter value:', config.filterValue);
        
        switch (config.filterMethod) {
            case 'index':
                const index = parseInt(config.filterValue, 10);
                return attachments[index] || null;
                
            case 'pattern':
                try {
                    const pattern = new RegExp(config.filterValue, 'i');
                    return attachments.find(att => pattern.test(att.name)) || null;
                } catch (e) {
                    console.error('Invalid regex pattern:', e);
                    return attachments[0];
                }
                
            case 'suffix':
                return attachments.find(att => 
                    att.name.toLowerCase().endsWith(config.filterValue.toLowerCase())
                ) || null;
                
            default:
                return attachments[0];
        }
    }
    
    // Display an attachment
    function displayAttachment(attachment) {
        console.log('Displaying attachment:', attachment);
        currentAttachment = attachment;
        
        // Set image source
        attachmentImage.src = attachment.url;
        attachmentImage.alt = attachment.name;
        
        // Set caption
        if (config.showCaption) {
            const captionText = config.simplifyCaption 
                ? attachment.name.replace(/_/g, ' ').replace(/\.[^.]+$/, '')
                : attachment.name;
            caption.textContent = captionText;
            caption.style.display = 'inline-block';
        } else {
            caption.style.display = 'none';
        }
        
        // Set image fit
        attachmentImage.style.objectFit = config.imageFit || 'contain';
        
        showState('attachment');
    }
    
    // Show/hide state containers
    function showState(state) {
        Object.keys(containers).forEach(key => {
            containers[key].style.display = key === state ? 'flex' : 'none';
        });
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        showState('error');
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Click on image to open modal
        attachmentImage.addEventListener('click', () => {
            if (currentAttachment) {
                openModal();
            }
        });
        
        // Close modal
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Handle image load errors
        attachmentImage.addEventListener('error', () => {
            showError('Failed to load image');
        });
    }
    
    // Open modal with enlarged image
    function openModal() {
        if (!currentAttachment) return;
        
        modalImage.src = currentAttachment.url;
        modalTitle.textContent = currentAttachment.name;
        modal.style.display = 'flex';
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    // Listen for URL parameter changes from Dashboard
    window.addEventListener('hashchange', function() {
        console.log('Hash changed:', window.location.hash);
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const featureId = params.get('objectid') || params.get('OBJECTID') || params.get('FID');
        if (featureId) {
          selectFeature(parseInt(featureId, 10));
        }
    });
    
    // Also check on initial load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const featureId = params.get('objectid') || params.get('OBJECTID') || params.get('FID');
        if (featureId) {
          selectFeature(parseInt(featureId, 10));
        }
    }
});
