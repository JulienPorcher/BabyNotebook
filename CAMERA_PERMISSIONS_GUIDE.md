# Guide: Camera Access Authorization on Mobile Devices

This guide explains how to properly handle camera access authorization for QR code scanning on mobile devices in your React application.

## Overview

Camera access on mobile devices requires explicit user permission. The implementation includes:

1. **Permission State Management**: Track different permission states
2. **User-Friendly UI**: Clear instructions and fallback options
3. **Error Handling**: Comprehensive error handling for different scenarios
4. **Mobile Optimization**: Prefer back camera and handle mobile-specific issues

## Permission States

The camera permission can be in one of these states:

- `checking`: Initial state while checking permissions
- `granted`: Camera access is allowed
- `denied`: User explicitly denied camera access
- `prompt`: Ready to request permission
- `unsupported`: Device/browser doesn't support camera access

## Implementation

### 1. Using the Camera Permission Hook

```typescript
import { useCameraPermission } from '../hooks/useCameraPermission';

function MyQRScanner() {
  const { permission, isRetrying, requestPermission, error } = useCameraPermission();

  // Handle different permission states
  if (permission === 'denied') {
    return <PermissionDeniedUI onRetry={requestPermission} />;
  }
  
  if (permission === 'granted') {
    return <QRScanner />;
  }
  
  // ... other states
}
```

### 2. Permission Request Process

```typescript
const requestPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Prefer back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    // Stop stream immediately - we just wanted to check permission
    stream.getTracks().forEach(track => track.stop());
    setPermission('granted');
  } catch (err) {
    // Handle different error types
    if (err.name === 'NotAllowedError') {
      setPermission('denied');
    }
    // ... other error handling
  }
};
```

## Mobile-Specific Considerations

### 1. Camera Selection
- Use `facingMode: 'environment'` to prefer back camera
- Back camera is better for QR code scanning on mobile devices

### 2. Permission Prompts
- Mobile browsers show permission prompts differently
- Some browsers require user interaction to trigger permission requests
- Always provide clear instructions to users

### 3. Error Handling
Different error types require different handling:

```typescript
switch (err.name) {
  case 'NotAllowedError':
    // User denied permission
    break;
  case 'NotFoundError':
    // No camera found
    break;
  case 'NotReadableError':
    // Camera in use by another app
    break;
  case 'OverconstrainedError':
    // Camera constraints not supported
    break;
}
```

## User Experience Best Practices

### 1. Clear Instructions
Provide step-by-step instructions for users:

```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-left">
  <p className="font-medium text-blue-800 mb-2">Pour autoriser l'accès :</p>
  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
    <li>Cliquez sur l'icône de caméra dans la barre d'adresse</li>
    <li>Sélectionnez "Autoriser" ou "Allow"</li>
    <li>Actualisez la page</li>
  </ol>
</div>
```

### 2. Fallback Options
When camera access is denied, provide alternatives:

```jsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
  <p className="font-medium text-yellow-800 mb-1">Alternative :</p>
  <p className="text-yellow-700">
    Vous pouvez demander à la personne de vous envoyer le QR code par email.
  </p>
</div>
```

### 3. Visual Feedback
- Show loading states during permission checks
- Use clear icons and colors for different states
- Provide retry buttons for failed attempts

## Browser Compatibility

### Supported Browsers
- Chrome (Android/iOS)
- Firefox (Android/iOS)
- Safari (iOS 11+)
- Edge (Android/iOS)

### Limitations
- Some older browsers may not support the Permissions API
- iOS Safari has specific requirements for camera access
- Some browsers require HTTPS for camera access

## Testing on Mobile Devices

### 1. Real Device Testing
Always test on real mobile devices, not just desktop browsers.

### 2. Different Scenarios
Test these scenarios:
- First-time permission request
- Previously denied permission
- Camera already in use
- No camera available
- Network issues

### 3. Browser Testing
Test on different mobile browsers:
- Chrome Mobile
- Safari Mobile
- Firefox Mobile
- Samsung Internet

## Common Issues and Solutions

### Issue: Permission prompt doesn't appear
**Solution**: Ensure the permission request is triggered by user interaction (button click).

### Issue: Camera shows but doesn't scan QR codes
**Solution**: Check camera constraints and ensure proper video element setup.

### Issue: Works on desktop but not mobile
**Solution**: Verify HTTPS is enabled and test on actual mobile device.

### Issue: Permission denied but user wants to retry
**Solution**: Provide clear instructions on how to change browser settings.

## Security Considerations

1. **HTTPS Required**: Camera access requires secure context
2. **User Consent**: Always get explicit user permission
3. **Data Privacy**: Don't store camera data unnecessarily
4. **Permission Persistence**: Respect user's permission choices

## Example Implementation

See `src/components/ScanQr.tsx` for a complete implementation that handles all these scenarios with proper mobile optimization and user experience.

## Additional Resources

- [MDN MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [WebRTC Camera Selection](https://webrtc.org/getting-started/camera-selection)
