require([
  "esri/portal/Portal",
  "esri/identity/OAuthInfo",
  "esri/identity/IdentityManager",
  "esri/portal/PortalQueryParams"
], function(Portal, OAuthInfo, esriId, PortalQueryParams) {

  const infoPanel = document.getElementById("info-panel");
  const attachmentContainer = document.getElementById("attachment-container");
  let targetLayer = null;

  // Check for URL parameters for configuration
  const urlParams = new URLSearchParams(window.location.search);
  const webmapId = urlParams.get('webmapId');
  const layerTitle = urlParams.get('layerTitle');

  if (!webmapId || !layerTitle) {
      infoPanel.innerHTML = `<calcite-label status="invalid">Configuration Error: webmapId and layerTitle URL parameters are required.</calcite-a>`;
      return;
  }

  // Authenticate with ArcGIS Online
  const info = new OAuthInfo({
      appId: "your-app-id", // Replace with your App ID
      popup: false
  });
  esriId.registerOAuthInfos([info]);

  esriId.getCredential(info.portalUrl + "/sharing")
      .then(() => {
          initialize();
      })
      .catch(error => {
          console.error("Authentication failed: ", error);
          infoPanel.innerHTML = `<calcite-label status="invalid">Authentication failed. Please ensure you are logged into ArcGIS.</calcite-label>`;
      });


  function initialize() {
      const portal = new Portal();
      portal.load().then(() => {
          const params = new PortalQueryParams({ query: `id: ${webmapId}` });
          portal.queryItems(params).then(result => {
              if (result.results.length > 0) {
                  const webmapItem = result.results[0];
                  webmapItem.load().then(() => {
                      webmapItem.fetchData().then(data => {
                          const map = new esri.WebMap({
                              portalItem: webmapItem
                          });
                          map.load().then(() => {
                              targetLayer = map.layers.find(l => l.title === layerTitle);
                              if (targetLayer) {
                                  listenForSelectionChanges();
                                  infoPanel.innerHTML = `<calcite-label>Ready. Select a feature from the '${layerTitle}' layer.</calcite-label>`;
                              } else {
                                  infoPanel.innerHTML = `<calcite-label status="invalid">Error: Layer '${layerTitle}' not found in the web map.</calcite-label>`;
                              }
                          });
                      });
                  });
              } else {
                  infoPanel.innerHTML = `<calcite-label status="invalid">Error: Web map with ID '${webmapId}' not found.</calcite-label>`;
              }
          });
      });
  }

  function listenForSelectionChanges() {
      // In a real dashboard, you would listen for selection change events.
      // For testing, we will simulate a selection after 2 seconds.
      setTimeout(() => {
          const mockSelection = {
              added: [{ attributes: { OBJECTID: 1 } }] // Replace with a valid OBJECTID from your layer
          };
          handleSelectionChange(mockSelection);
      }, 2000);

      // The actual dashboard event listener would look something like this:
      // arcgisDashboards.getMap().then(map => { 
      //     const layer = map.layers.find(l => l.id === targetLayer.id);
      //     layer.on("selection-change", handleSelectionChange);
      // });
  }

  function handleSelectionChange(event) {
      attachmentContainer.innerHTML = "";
      if (event.added && event.added.length > 0) {
          const selectedFeature = event.added[0];
          const objectId = selectedFeature.attributes.OBJECTID;
          infoPanel.innerHTML = `<calcite-label>Querying attachments for OBJECTID: ${objectId}</calcite-label>`;
          queryAndDisplayAttachments(objectId);
      } else {
          infoPanel.innerHTML = `<calcite-label>Selection cleared. Select a feature to see attachments.</calcite-label>`;
      }
  }

  function queryAndDisplayAttachments(objectId) {
      attachmentContainer.innerHTML = `<calcite-progress type="indeterminate"></calcite-progress>`;
      targetLayer.queryAttachments({ objectIds: [objectId] })
          .then(attachments => {
              attachmentContainer.innerHTML = "";
              const attachmentsForFeature = attachments[objectId];
              if (attachmentsForFeature && attachmentsForFeature.length > 0) {
                  attachmentsForFeature.forEach(att => {
                      const item = document.createElement('div');
                      item.className = 'attachment-item';
                      if (att.contentType.includes('image')) {
                          item.innerHTML = `<img src="${att.url}" alt="${att.name}" /><a href="${att.url}" target="_blank">${att.name}</a>`;
                      } else {
                          item.innerHTML = `<a href="${att.url}" target="_blank">${att.name} (Open)</a>`;
                      }
                      attachmentContainer.appendChild(item);
                  });
              } else {
                  infoPanel.innerHTML = `<calcite-label>No attachments found for the selected feature.</calcite-label>`;
              }
          })
          .catch(error => {
              console.error("Error querying attachments: ", error);
              infoPanel.innerHTML = `<calcite-label status="invalid">Error loading attachments.</calcite-label>`;
          });
  }
});
