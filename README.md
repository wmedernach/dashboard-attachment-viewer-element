# Dashboard Attachment Viewer

A custom web application for displaying feature attachments in ArcGIS Dashboards using the Embedded Content element. This application provides similar functionality to the Experience Builder multi-attachment-viewer widget but works within Dashboard's limitations.

## Features

- Display single attachment from selected features
- Filter attachments by index, pattern, or suffix
- Click-to-enlarge modal view
- Configurable image display (contain, cover, fill)
- Optional caption display with simplification
- Responsive design
- Dashboard theme compatibility

## Requirements

- Web server with HTTPS (required for Dashboard embedding)
- CORS enabled for ArcGIS Online/Enterprise access
- ArcGIS feature service with attachments enabled
- Modern web browser

## Installation

1. **Host the files** on a web server:
   ```
   dashboard-attachment-viewer/
   ├── index.html
   ├── app.js
   ├── config.js
   ├── styles.css
   └── README.md
   ```

2. **Enable CORS** on your web server to allow requests from ArcGIS Online/Enterprise

3. **Note the URL** to your hosted index.html file

## Dashboard Configuration

1. **Add an Embedded Content element** to your Dashboard
2. **Set the URL** with configuration parameters (see below)
3. **Configure element size** as needed
4. **Enable feature selection** actions from other Dashboard elements

## URL Parameters

All configuration is done via URL parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `serviceUrl` | string | required | Feature service URL |
| `layerId` | number | null | Layer index (defaults to /0) |
| `filterMethod` | string | 'index' | Filter method: 'index', 'pattern', or 'suffix' |
| `filterValue` | string/number | 0 | Filter criteria |
| `imageFit` | string | 'contain' | Image scaling: 'contain', 'cover', 'fill', 'none' |
| `showCaption` | boolean | true | Show attachment filename |
| `simplifyCaption` | boolean | false | Remove underscores and file extension |
| `noAttachmentMessage` | string | 'No attachment found' | Message when no attachment |
| `featureId` | number | null | Initial feature ID (for testing) |

## Example URLs

### Basic usage (shows first attachment):
```
https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer
```

### Filter by suffix (e.g., for attachment named "ID_Type_1.jpg"):
```
https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer&layerId=0&filterMethod=suffix&filterValue=_Type_1.jpg
```

### Show second attachment with simplified caption:
```
https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer&filterMethod=index&filterValue=1&showCaption=true&simplifyCaption=true
```

### Filter by pattern (regex):
```
https://your-domain.com/dashboard-attachment-viewer/?serviceUrl=https://services.arcgis.com/xxx/arcgis/rest/services/YourService/FeatureServer&filterMethod=pattern&filterValue=.*_Type_[13]\.jpg$
```

## Feature Selection Integration

The application listens for feature selection events from the parent Dashboard window. Configure your Dashboard elements (Map, List, etc.) to trigger selection actions that will be automatically detected by this viewer.

### Manual Testing
You can test with a specific feature by adding the `featureId` parameter:
```
...&featureId=123
```

## Styling

The application uses a clean, minimal design that complements Dashboard's default theme. The modal view provides a larger display for detailed viewing.

### Customization
Modify `styles.css` to match your organization's branding:
- Colors
- Fonts
- Spacing
- Modal appearance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### No attachments displaying
1. Verify feature service has attachments enabled
2. Check browser console for errors
3. Ensure CORS is properly configured
4. Verify serviceUrl parameter is correct

### Selection not working
1. Ensure Dashboard element actions are configured
2. Check browser console for selection events
3. Verify feature IDs match between services

### CORS errors
1. Enable CORS on your web server
2. Add ArcGIS Online/Enterprise domains to allowed origins
3. Include necessary CORS headers

## Security Considerations

- Use HTTPS for hosting
- Implement authentication if needed
- Validate URL parameters
- Consider token-based access for secured services

## License

This application is provided as-is for use with ArcGIS Dashboards.