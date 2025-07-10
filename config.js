// Configuration handling for Dashboard Attachment Viewer
const config = (function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Default configuration
    const defaults = {
        serviceUrl: null,
        layerId: null,
        filterMethod: 'index',
        filterValue: 0,
        imageFit: 'contain',
        showCaption: true,
        simplifyCaption: false,
        noAttachmentMessage: 'No attachment found',
        featureId: null // For testing/initial selection
    };
    
    // Parse URL parameters
    const config = {};
    
    // Service URL (required)
    config.serviceUrl = urlParams.get('serviceUrl') || defaults.serviceUrl;
    
    // Layer ID (optional, defaults to layer 0)
    const layerIdParam = urlParams.get('layerId');
    config.layerId = layerIdParam !== null ? parseInt(layerIdParam, 10) : defaults.layerId;
    
    // Filter method: index, pattern, or suffix
    config.filterMethod = urlParams.get('filterMethod') || defaults.filterMethod;
    
    // Filter value
    const filterValueParam = urlParams.get('filterValue');
    if (config.filterMethod === 'index') {
        config.filterValue = filterValueParam !== null 
            ? parseInt(filterValueParam, 10) 
            : defaults.filterValue;
    } else {
        config.filterValue = filterValueParam || defaults.filterValue.toString();
    }
    
    // Image fit: contain, cover, fill, or none
    config.imageFit = urlParams.get('imageFit') || defaults.imageFit;
    
    // Show caption
    const showCaptionParam = urlParams.get('showCaption');
    config.showCaption = showCaptionParam !== null 
        ? showCaptionParam.toLowerCase() === 'true' 
        : defaults.showCaption;
    
    // Simplify caption (remove underscores and file extension)
    const simplifyCaptionParam = urlParams.get('simplifyCaption');
    config.simplifyCaption = simplifyCaptionParam !== null 
        ? simplifyCaptionParam.toLowerCase() === 'true' 
        : defaults.simplifyCaption;
    
    // No attachment message
    config.noAttachmentMessage = urlParams.get('noAttachmentMessage') || defaults.noAttachmentMessage;
    
    // Feature ID for testing
    const featureIdParam = urlParams.get('featureId');
    config.featureId = featureIdParam !== null ? parseInt(featureIdParam, 10) : defaults.featureId;
    
    // Validate configuration
    if (!config.serviceUrl) {
        console.warn('No service URL provided. Widget will not function properly.');
    }
    
    // Log configuration for debugging
    console.log('Dashboard Attachment Viewer Configuration:', config);
    
    return config;
})();

// Example URL patterns:
// Basic usage with all defaults:
// https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer

// With layer ID and filter:
// https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer&layerId=0&filterMethod=suffix&filterValue=_Type_1.jpg

// With all options:
// https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer&layerId=0&filterMethod=index&filterValue=1&imageFit=cover&showCaption=true&simplifyCaption=true&noAttachmentMessage=No%20image%20available

// For testing with a specific feature:
// https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer&layerId=0&featureId=123