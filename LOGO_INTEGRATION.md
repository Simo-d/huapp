# FPO Logo Integration Guide

## How to Add the FPO Logo

To add your FPO logo to the application, follow these simple steps:

### 1. Logo File Requirements

- **File name**: `fpo-logo.png` (or `fpo-logo.svg` for better quality)
- **Recommended size**: 200x200px minimum
- **Format**: PNG with transparent background or SVG
- **Location**: Place the file in the `public` folder

### 2. Adding the Logo

1. Navigate to your project folder:
   ```
   E:\GeniePot\aiprojects\huapp\public\
   ```

2. Copy your logo file here and name it `fpo-logo.png`

3. The application will automatically display it in:
   - The sidebar header
   - Login page
   - PDF documents (if configured)

### 3. Alternative Logo Locations

If you want to use a different filename or location, update these files:

#### In Layout.js (Sidebar Logo):
```javascript
// src/components/Layout.js
<img 
  src="/your-logo-name.png"  // Change this path
  alt="FPO Logo" 
  className="logo-image"
/>
```

#### In Login.js (Login Page Logo):
```javascript
// src/pages/Login.js
<img 
  src="/your-logo-name.png"  // Change this path
  alt="FPO Logo" 
  className="login-logo"
/>
```

### 4. Logo Styling

The logo automatically adapts to the black, white, and dark blue theme:

- **Default**: Grayscale filter for consistency
- **On hover**: Shows original colors
- **Size**: Automatically sized to fit the layout

### 5. Custom Styling (Optional)

To adjust logo appearance, modify in `src/components/Layout.css`:

```css
.logo-image {
  height: 56px;  /* Adjust height */
  width: auto;
  filter: grayscale(100%);  /* Remove for color logo */
}
```

### 6. Favicon

To update the browser tab icon:

1. Create a favicon version of your logo (16x16px or 32x32px)
2. Save as `favicon.ico` in the `public` folder
3. Update `public/index.html`:
```html
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
```

### 7. Logo for PDFs

To add logo to generated PDFs, place a copy in:
```
E:\GeniePot\aiprojects\huapp\server\assets\fpo-logo.png
```

Then update the PDF generator if needed.

## Logo Display Locations

The logo appears in these places:
1. **Sidebar Header** - Top of navigation menu
2. **Login Page** - Above the login form
3. **Generated PDFs** - Document headers (optional)
4. **Email Templates** - If email notifications are configured

## Troubleshooting

**Logo not showing?**
- Check file name matches exactly: `fpo-logo.png`
- Verify file is in the `public` folder
- Clear browser cache (Ctrl+F5)
- Check browser console for errors

**Logo looks distorted?**
- Use a square image (same width and height)
- Minimum recommended size: 200x200px
- Use PNG with transparent background

**Want to remove grayscale effect?**
- Remove `filter: grayscale(100%)` from `.logo-image` in Layout.css

## Theme Integration

The application uses a sophisticated black, white, and dark blue (#001f3f) color scheme:

- **Primary Dark Blue**: #001f3f (FPO brand color)
- **Black**: #000000 (High contrast text)
- **White**: #ffffff (Clean backgrounds)
- **Gray Scale**: Various shades for hierarchy

The logo automatically integrates with this theme through CSS filters and hover effects.
